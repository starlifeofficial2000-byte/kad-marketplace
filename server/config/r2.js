const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const REQUIRED_ENV = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME"
];

/*
|--------------------------------------------------------------------------
| Validate environment variables
|--------------------------------------------------------------------------
*/

for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
        console.warn(`[R2] Missing environment variable: ${key}`);
    }
}

/*
|--------------------------------------------------------------------------
| Environment
|--------------------------------------------------------------------------
*/

const R2_ACCOUNT_ID =
    process.env.R2_ACCOUNT_ID?.trim();

const R2_ACCESS_KEY_ID =
    process.env.R2_ACCESS_KEY_ID?.trim();

const R2_SECRET_ACCESS_KEY =
    process.env.R2_SECRET_ACCESS_KEY?.trim();

const R2_BUCKET_NAME =
    process.env.R2_BUCKET_NAME?.trim();

const R2_REGION =
    process.env.R2_REGION?.trim() || "auto";

/*
|--------------------------------------------------------------------------
| R2 S3 Endpoint
|--------------------------------------------------------------------------
*/

const R2_ENDPOINT =
    process.env.R2_ENDPOINT?.trim() ||
    (
        R2_ACCOUNT_ID
            ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
            : null
    );

/*
|--------------------------------------------------------------------------
| Public CDN URL
|--------------------------------------------------------------------------
|
| Production:
|
| R2_PUBLIC_URL=https://cdn.kadmarket.com
|
*/

const R2_PUBLIC_URL =
    process.env.R2_PUBLIC_URL
        ?.trim()
        .replace(/\/+$/, "") || "";

/*
|--------------------------------------------------------------------------
| R2 Client
|--------------------------------------------------------------------------
*/

const r2Client =
    R2_ENDPOINT &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
        ? new S3Client({
              region: R2_REGION,

              endpoint: R2_ENDPOINT,

              credentials: {
                  accessKeyId:
                      R2_ACCESS_KEY_ID,

                  secretAccessKey:
                      R2_SECRET_ACCESS_KEY
              },

              forcePathStyle: false
          })
        : null;

/*
|--------------------------------------------------------------------------
| Verify R2 configuration
|--------------------------------------------------------------------------
*/

function assertConfigured() {

    if (!r2Client) {

        throw new Error(
            "Cloudflare R2 is not configured. " +
            "Check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
            "R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME " +
            "and R2_ENDPOINT."
        );

    }

}

/*
|--------------------------------------------------------------------------
| Normalize object key
|--------------------------------------------------------------------------
*/

function normalizeKey(key) {

    return String(key || "")
        .trim()
        .replace(/^\/+/, "");

}

/*
|--------------------------------------------------------------------------
| Generate public R2 URL
|--------------------------------------------------------------------------
*/

function getR2PublicUrl(key) {

    const normalizedKey =
        normalizeKey(key);

    if (
        !normalizedKey ||
        !R2_PUBLIC_URL
    ) {
        return null;
    }

    return (
        `${R2_PUBLIC_URL}/` +
        normalizedKey
            .split("/")
            .map(
                encodeURIComponent
            )
            .join("/")
    );

}

/*
|--------------------------------------------------------------------------
| Upload object to R2
|--------------------------------------------------------------------------
*/

async function uploadToR2({
    key,
    buffer,
    contentType,
    cacheControl =
        "public, max-age=31536000, immutable"
}) {

    assertConfigured();

    const normalizedKey =
        normalizeKey(key);

    if (!normalizedKey) {

        throw new Error(
            "R2 upload requires an object key."
        );

    }

    if (
        !Buffer.isBuffer(buffer) ||
        buffer.length === 0
    ) {

        throw new Error(
            "R2 upload requires a non-empty file buffer."
        );

    }

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
                cacheControl

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

/*
|--------------------------------------------------------------------------
| Delete object from R2
|--------------------------------------------------------------------------
*/

async function deleteFromR2(key) {

    const normalizedKey =
        normalizeKey(key);

    if (!normalizedKey) {
        return;
    }

    assertConfigured();

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

}

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    r2Client,

    R2_BUCKET_NAME,

    R2_ENDPOINT,

    R2_PUBLIC_URL,

    R2_REGION,

    uploadToR2,

    deleteFromR2,

    getR2PublicUrl

};