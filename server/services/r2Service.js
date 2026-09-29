const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

/* ============================================================
   CLOUDFLARE R2 CONFIGURATION
============================================================ */

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

const R2_ENDPOINT =
    process.env.R2_ENDPOINT?.trim() ||
    (
        R2_ACCOUNT_ID
            ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
            : ""
    );

const R2_PUBLIC_URL =
    process.env.R2_PUBLIC_URL?.trim().replace(/\/+$/, "");


/* ============================================================
   REQUIRED ENVIRONMENT VARIABLES
============================================================ */

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


/* ============================================================
   R2 CLIENT
============================================================ */

const r2Client =
    (
        R2_ACCESS_KEY_ID &&
        R2_SECRET_ACCESS_KEY &&
        R2_ENDPOINT
    )
        ? new S3Client({
            region: R2_REGION,
            endpoint: R2_ENDPOINT,
            forcePathStyle: false,
            credentials: {
                accessKeyId: R2_ACCESS_KEY_ID,
                secretAccessKey: R2_SECRET_ACCESS_KEY
            }
        })
        : null;


/* ============================================================
   CHECK R2 CONFIGURATION
============================================================ */

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


/* ============================================================
   NORMALIZE R2 OBJECT KEY
============================================================ */

function normalizeKey(key) {

    if (!key) {
        throw new Error(
            "R2 object key is required."
        );
    }

    return String(key)
        .trim()
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
}


/* ============================================================
   GET PUBLIC R2 URL
============================================================ */

function getR2PublicUrl(key) {

    const normalizedKey =
        normalizeKey(key);

    if (!R2_PUBLIC_URL) {
        throw new Error(
            "R2_PUBLIC_URL is missing."
        );
    }

    return `${R2_PUBLIC_URL}/${normalizedKey}`;
}


/* ============================================================
   EXTRACT R2 KEY FROM URL OR OBJECT
============================================================ */

function getR2Key(value) {

    if (!value) {
        return null;
    }

    /* Object format */
    if (typeof value === "object") {

        value =
            value.r2Key ||
            value.key ||
            value.location ||
            value.url ||
            value.path ||
            value.filename;
    }

    if (!value) {
        return null;
    }

    let stringValue =
        String(value).trim();

    if (!stringValue) {
        return null;
    }

    /*
     * If this is a URL belonging to our R2
     * public domain, extract the object key.
     */
    if (
        stringValue.startsWith("http://") ||
        stringValue.startsWith("https://")
    ) {

        if (
            R2_PUBLIC_URL &&
            stringValue.startsWith(R2_PUBLIC_URL)
        ) {

            const pathname =
                stringValue
                    .substring(R2_PUBLIC_URL.length)
                    .replace(/^\/+/, "");

            return decodeURIComponent(pathname);
        }

        /*
         * External URL.
         * We do not treat it as an R2 object.
         */
        return null;
    }

    stringValue =
        normalizeKey(stringValue);

    /*
     * Only store objects inside
     * uploads/stores/.
     */
    if (
        stringValue.startsWith(
            "uploads/stores/"
        )
    ) {
        return stringValue;
    }

    return null;
}


/* ============================================================
   UPLOAD FILE TO R2
============================================================ */

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

    console.log(
        "[R2] Uploading:",
        normalizedKey
    );

    const command =
        new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,

            Key: normalizedKey,

            Body: buffer,

            ContentType:
                contentType ||
                "application/octet-stream",

            CacheControl:
                cacheControl ||
                "public, max-age=31536000, immutable"
        });

    await r2Client.send(command);

    const publicUrl =
        getR2PublicUrl(normalizedKey);

    console.log(
        "[R2] Upload successful:",
        publicUrl
    );

    return {
        key: normalizedKey,
        url: publicUrl
    };
}


/* ============================================================
   DELETE FILE FROM R2
============================================================ */

async function deleteFromR2(key) {

    if (!key) {
        return null;
    }

    assertConfigured();

    const normalizedKey =
        getR2Key(key);

    /*
     * Do not delete external URLs or
     * unrelated files.
     */
    if (!normalizedKey) {

        console.warn(
            "[R2] Skipping delete. " +
            "Could not determine R2 key:",
            key
        );

        return null;
    }

    console.log(
        "[R2] Deleting:",
        normalizedKey
    );

    const command =
        new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: normalizedKey
        });

    await r2Client.send(command);

    console.log(
        "[R2] Delete successful:",
        normalizedKey
    );

    return {
        key: normalizedKey
    };
}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {

    r2Client,

    R2_PUBLIC_URL,

    R2_BUCKET_NAME,

    R2_ENDPOINT,

    normalizeKey,

    getR2PublicUrl,

    getR2Key,

    uploadToR2,

    deleteFromR2
};