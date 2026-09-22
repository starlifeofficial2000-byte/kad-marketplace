const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const requiredEnv = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME"
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        console.warn(`[R2] Missing environment variable: ${key}`);
    }
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const R2_ENDPOINT =
    process.env.R2_ENDPOINT ||
    (R2_ACCOUNT_ID
        ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
        : null);

const R2_REGION = process.env.R2_REGION || "auto";

const R2_PUBLIC_URL =
    process.env.R2_PUBLIC_URL || "";

const r2Client =
    R2_ENDPOINT &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY
        ? new S3Client({
              region: R2_REGION,
              endpoint: R2_ENDPOINT,
              credentials: {
                  accessKeyId: R2_ACCESS_KEY_ID,
                  secretAccessKey: R2_SECRET_ACCESS_KEY
              }
          })
        : null;


/**
 * Upload a file to Cloudflare R2
 */
const uploadToR2 = async ({
    key,
    buffer,
    contentType
}) => {
    if (!r2Client) {
        throw new Error(
            "Cloudflare R2 is not configured correctly."
        );
    }

    if (!key) {
        throw new Error("R2 upload requires an object key.");
    }

    if (!buffer) {
        throw new Error("R2 upload requires a file buffer.");
    }

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType
    });

    await r2Client.send(command);

    return {
        key,
        url: getR2PublicUrl(key)
    };
};


/**
 * Delete a file from Cloudflare R2
 */
const deleteFromR2 = async (key) => {
    if (!key) {
        return;
    }

    if (!r2Client) {
        throw new Error(
            "Cloudflare R2 is not configured correctly."
        );
    }

    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key
    });

    await r2Client.send(command);
};


/**
 * Convert an R2 object key into its public URL
 */
const getR2PublicUrl = (key) => {
    if (!key) {
        return null;
    }

    if (!R2_PUBLIC_URL) {
        return null;
    }

    return `${R2_PUBLIC_URL.replace(/\/+$/, "")}/${key
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
};


module.exports = {
    r2Client,
    R2_BUCKET_NAME,
    R2_ENDPOINT,
    R2_PUBLIC_URL,
    uploadToR2,
    deleteFromR2,
    getR2PublicUrl
};