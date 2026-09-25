const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");


/* =========================================================
   ENVIRONMENT VARIABLES
========================================================= */

const R2_ACCOUNT_ID =
    process.env.R2_ACCOUNT_ID;

const R2_ACCESS_KEY_ID =
    process.env.R2_ACCESS_KEY_ID;

const R2_SECRET_ACCESS_KEY =
    process.env.R2_SECRET_ACCESS_KEY;

const R2_BUCKET_NAME =
    process.env.R2_BUCKET_NAME;

const R2_REGION =
    process.env.R2_REGION || "auto";

const R2_ENDPOINT =
    process.env.R2_ENDPOINT ||
    (
        R2_ACCOUNT_ID
            ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
            : ""
    );

const R2_PUBLIC_URL =
    process.env.R2_PUBLIC_URL;


/* =========================================================
   CONFIGURATION CHECK
========================================================= */

const requiredEnvironmentVariables = [
    ["R2_ACCOUNT_ID", R2_ACCOUNT_ID],
    ["R2_ACCESS_KEY_ID", R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", R2_SECRET_ACCESS_KEY],
    ["R2_BUCKET_NAME", R2_BUCKET_NAME],
    ["R2_ENDPOINT", R2_ENDPOINT],
    ["R2_PUBLIC_URL", R2_PUBLIC_URL]
];


const missingEnvironmentVariables =
    requiredEnvironmentVariables
        .filter(([, value]) => !value)
        .map(([name]) => name);


if (missingEnvironmentVariables.length > 0) {

    console.warn(
        "[R2] Missing environment variable(s):",
        missingEnvironmentVariables.join(", ")
    );

}


/* =========================================================
   R2 CLIENT
========================================================= */

const r2Client =
    (
        R2_ACCESS_KEY_ID &&
        R2_SECRET_ACCESS_KEY &&
        R2_ENDPOINT
    )
        ? new S3Client({

            region: R2_REGION,

            endpoint: R2_ENDPOINT,

            credentials: {

                accessKeyId:
                    R2_ACCESS_KEY_ID,

                secretAccessKey:
                    R2_SECRET_ACCESS_KEY

            }

        })
        : null;


/* =========================================================
   ASSERT CONFIGURATION
========================================================= */

function assertConfigured() {

    if (!r2Client) {

        throw new Error(
            "Cloudflare R2 is not configured. " +
            "Please configure R2_ACCOUNT_ID, " +
            "R2_ACCESS_KEY_ID, " +
            "R2_SECRET_ACCESS_KEY, " +
            "R2_BUCKET_NAME, " +
            "R2_ENDPOINT and " +
            "R2_PUBLIC_URL."
        );

    }


    if (!R2_BUCKET_NAME) {

        throw new Error(
            "R2_BUCKET_NAME is missing."
        );

    }


    if (!R2_PUBLIC_URL) {

        throw new Error(
            "R2_PUBLIC_URL is missing."
        );

    }

}


/* =========================================================
   NORMALIZE R2 KEY
========================================================= */

function normalizeKey(key) {

    if (!key) {
        throw new Error("R2 object key is required.");
    }


    return String(key)
        .replace(/^\/+/, "")
        .replace(/\\/g, "/");

}


/* =========================================================
   GET PUBLIC R2 URL
========================================================= */

function getR2PublicUrl(key) {

    const normalizedKey =
        normalizeKey(key);


    return `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${normalizedKey}`;
}


/* =========================================================
   UPLOAD FILE TO R2
========================================================= */

async function uploadToR2({
    key,
    buffer,
    contentType,
    cacheControl
}) {

    assertConfigured();


    if (!Buffer.isBuffer(buffer)) {

        throw new Error(
            "R2 upload requires a Buffer."
        );

    }


    const normalizedKey =
        normalizeKey(key);


    const command =
        new PutObjectCommand({

            Bucket:
                R2_BUCKET_NAME,

            Key:
                normalizedKey,

            Body:
                buffer,

            ContentType:
                contentType ||
                "application/octet-stream",

            CacheControl:
                cacheControl ||
                "public, max-age=31536000, immutable"

        });


    await r2Client.send(
        command
    );


    return {

        key:
            normalizedKey,

        url:
            getR2PublicUrl(
                normalizedKey
            )

    };

}


/* =========================================================
   DELETE FILE FROM R2
========================================================= */

async function deleteFromR2(key) {

    if (!key) {
        return;
    }


    assertConfigured();


    const normalizedKey =
        normalizeKey(key);


    const command =
        new DeleteObjectCommand({

            Bucket:
                R2_BUCKET_NAME,

            Key:
                normalizedKey

        });


    await r2Client.send(
        command
    );


    return {

        key:
            normalizedKey

    };

}


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    r2Client,

    R2_PUBLIC_URL,

    R2_BUCKET_NAME,

    normalizeKey,

    getR2PublicUrl,

    uploadToR2,

    deleteFromR2

};