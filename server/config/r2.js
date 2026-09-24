const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

/* =========================================================
   CLOUDFLARE R2 CONFIGURATION
========================================================= */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim();

const R2_ACCESS_KEY_ID =
    process.env.R2_ACCESS_KEY_ID?.trim();

const R2_SECRET_ACCESS_KEY =
    process.env.R2_SECRET_ACCESS_KEY?.trim();

const R2_BUCKET_NAME =
    process.env.R2_BUCKET_NAME?.trim();

const R2_REGION =
    process.env.R2_REGION?.trim() || "auto";

const R2_ENDPOINT =
    process.env.R2_ENDPOINT?.trim() ||
    (
        R2_ACCOUNT_ID
            ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
            : null
    );

const R2_PUBLIC_URL =
    process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/, "") || "";


/* =========================================================
   ENVIRONMENT VALIDATION
========================================================= */

const REQUIRED_ENV = [
    ["R2_ACCOUNT_ID", R2_ACCOUNT_ID],
    ["R2_ACCESS_KEY_ID", R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", R2_SECRET_ACCESS_KEY],
    ["R2_BUCKET_NAME", R2_BUCKET_NAME],
    ["R2_ENDPOINT", R2_ENDPOINT],
    ["R2_PUBLIC_URL", R2_PUBLIC_URL]
];

for (const [name, value] of REQUIRED_ENV) {
    if (!value) {
        console.warn(`[R2] Missing environment variable: ${name}`);
    }
}


/* =========================================================
   R2 CLIENT
========================================================= */

const r2Client =
    R2_ENDPOINT &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
        ? new S3Client({
              region: R2_REGION,

              endpoint: R2_ENDPOINT,

              credentials: {
                  accessKeyId: R2_ACCESS_KEY_ID,
                  secretAccessKey: R2_SECRET_ACCESS_KEY
              },

              forcePathStyle: false
          })
        : null;


/* =========================================================
   CONFIGURATION CHECK
========================================================= */

function assertConfigured() {
    const missing = [];

    if (!R2_ACCOUNT_ID) {
        missing.push("R2_ACCOUNT_ID");
    }

    if (!R2_ACCESS_KEY_ID) {
        missing.push("R2_ACCESS_KEY_ID");
    }

    if (!R2_SECRET_ACCESS_KEY) {
        missing.push("R2_SECRET_ACCESS_KEY");
    }

    if (!R2_BUCKET_NAME) {
        missing.push("R2_BUCKET_NAME");
    }

    if (!R2_ENDPOINT) {
        missing.push("R2_ENDPOINT");
    }

    if (!R2_PUBLIC_URL) {
        missing.push("R2_PUBLIC_URL");
    }

    if (!r2Client || missing.length > 0) {
        throw new Error(
            `Cloudflare R2 is not fully configured. Missing: ${missing.join(", ")}`
        );
    }
}


/* =========================================================
   NORMALIZE R2 OBJECT KEY
========================================================= */

function normalizeKey(key) {
    if (!key) {
        return "";
    }

    return String(key)
        .trim()
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");
}


/* =========================================================
   PUBLIC R2 URL
========================================================= */

function getR2PublicUrl(key) {
    const normalizedKey = normalizeKey(key);

    if (!normalizedKey) {
        return null;
    }

    if (!R2_PUBLIC_URL) {
        return null;
    }

    return `${R2_PUBLIC_URL}/${normalizedKey
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
}


/* =========================================================
   UPLOAD TO R2
========================================================= */

async function uploadToR2({
    key,
    buffer,
    contentType,
    cacheControl =
        "public, max-age=31536000, immutable"
}) {
    assertConfigured();

    const normalizedKey = normalizeKey(key);

    if (!normalizedKey) {
        throw new Error(
            "Cloudflare R2 upload requires an object key."
        );
    }

    if (!Buffer.isBuffer(buffer)) {
        throw new Error(
            "Cloudflare R2 upload requires a Buffer."
        );
    }

    if (buffer.length === 0) {
        throw new Error(
            "Cloudflare R2 upload cannot upload an empty file."
        );
    }

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,

        Key: normalizedKey,

        Body: buffer,

        ContentType:
            contentType ||
            "application/octet-stream",

        CacheControl: cacheControl
    });

    await r2Client.send(command);

    return {
        key: normalizedKey,
        url: getR2PublicUrl(normalizedKey)
    };
}


/* =========================================================
   DELETE FROM R2
========================================================= */

async function deleteFromR2(key) {
    const normalizedKey = normalizeKey(key);

    if (!normalizedKey) {
        return;
    }

    assertConfigured();

    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,

        Key: normalizedKey
    });

    await r2Client.send(command);
}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    r2Client,

    R2_BUCKET_NAME,
    R2_ENDPOINT,
    R2_PUBLIC_URL,
    R2_REGION,

    uploadToR2,
    deleteFromR2,
    getR2PublicUrl,

    normalizeKey
};