const crypto = require("crypto");
const fs = require("fs");

let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;

function base64Url(value) {
    return Buffer.from(value).toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function loadServiceAccount() {
    const raw = process.env.FCM_SERVICE_ACCOUNT_JSON;
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (error) {
            throw new Error("FCM_SERVICE_ACCOUNT_JSON must contain valid JSON: " + error.message);
        }
    }

    const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (filePath && fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    return null;
}

async function getGoogleAccessToken(serviceAccount) {
    if (cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt - 60000) {
        return cachedAccessToken;
    }

    const now = Math.floor(Date.now() / 1000);
    const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const claims = base64Url(JSON.stringify({
        iss: serviceAccount.client_email,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600
    }));
    const unsigned = `${header}.${claims}`;
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(unsigned);
    signer.end();
    const signature = base64Url(signer.sign(serviceAccount.private_key));
    const assertion = `${unsigned}.${signature}`;

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion
        })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.access_token) {
        throw new Error(result.error_description || result.error || "Google OAuth token exchange failed.");
    }

    cachedAccessToken = result.access_token;
    cachedAccessTokenExpiresAt = Date.now() + Number(result.expires_in || 3600) * 1000;
    return cachedAccessToken;
}

async function sendPushToUser(userId, { title, body, data = {} }) {
    try {
        const serviceAccount = loadServiceAccount();
        if (!serviceAccount) {
            console.warn("[FCM] Credentials not configured. Push notifications are disabled.");
            return { sent: 0 };
        }

        const { DeviceToken } = require("../models");
        const rows = await DeviceToken.findAll({
            where: { userId: Number(userId) },
            attributes: ["id", "token"]
        });
        if (!rows.length) return { sent: 0 };

        const accessToken = await getGoogleAccessToken(serviceAccount);
        const safeData = {};
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined && value !== null) safeData[String(key)] = String(value);
        }

        let sent = 0;
        for (const row of rows) {
            const payload = {
                message: {
                    token: row.token,
                    notification: {
                        title: String(title || "KAD Marketplace"),
                        body: String(body || "You have a new message.")
                    },
                    data: safeData,
                    android: {
                        priority: "HIGH",
                        notification: {
                            channel_id: "messages_channel",
                            sound: "default",
                            default_vibrate_timings: true
                        }
                    },
                    apns: {
                        headers: { "apns-priority": "10" },
                        payload: { aps: { sound: "default", badge: 1 } }
                    },
                    webpush: {
                        notification: {
                            title: String(title || "KAD Marketplace"),
                            body: String(body || "You have a new message."),
                            icon: "/icons/Icon-192.png",
                            vibrate: [200, 100, 200]
                        }
                    }
                }
            };

            const response = await fetch(
                `https://fcm.googleapis.com/v1/projects/${encodeURIComponent(serviceAccount.project_id)}/messages:send`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (response.ok) {
                sent++;
                continue;
            }

            const errorBody = await response.json().catch(() => ({}));
            const errorText = JSON.stringify(errorBody);
            if (response.status === 404 ||
                errorText.includes("UNREGISTERED") ||
                errorText.includes("INVALID_ARGUMENT")) {
                await row.destroy().catch(() => {});
            } else {
                console.warn("[FCM] Send failed:", response.status, errorText);
            }
        }

        return { sent };
    } catch (error) {
        console.error("[FCM] Push notification error:", error.message);
        return { sent: 0, error: error.message };
    }
}

module.exports = { sendPushToUser };
