require("dotenv/config");
const crypto = require("crypto");
const sharp = require("sharp");
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sequelize = require("../config/database");
const Product = require("../models/Product");
const { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL, normalizeKey } = require("../config/r2");

const APPLY = process.argv.includes("--apply");

async function streamToBuffer(body) {
  const chunks = [];
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function imageKey(value) {
  if (!value || typeof value !== "string") return null;
  const clean = value.trim();
  if (clean.startsWith("uploads/")) return normalizeKey(clean);
  if (clean.startsWith("/uploads/")) return normalizeKey(clean);
  try {
    const url = new URL(clean);
    const pathname = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (R2_PUBLIC_URL && clean.startsWith(`${R2_PUBLIC_URL}/`)) return normalizeKey(pathname);
    if (url.hostname === "cdn.kadmarket.com" && pathname.startsWith("uploads/")) return normalizeKey(pathname);
  } catch (_) {}
  return null;
}

async function watermark(buffer) {
  const normalized = await sharp(buffer, { failOn: "none" }).rotate().toBuffer();
  const source = sharp(normalized, { failOn: "none" });
  const meta = await source.metadata();
  const width = Math.max(1, meta.width || 1200);
  const height = Math.max(42, Math.min(92, Math.round(width * 0.065)));
  const font = Math.max(18, Math.min(42, Math.round(width * 0.032)));
  const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#07152b" fill-opacity="0.42"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial,sans-serif" font-size="${font}" font-weight="700" letter-spacing="2" fill="#fff" fill-opacity="0.88">KAD MARKETPLACE</text></svg>`);
  return { buffer: await source.composite([{ input: svg, gravity: "south" }]).toBuffer(), format: meta.format };
}

async function main() {
  if (!r2Client || !R2_BUCKET_NAME) throw new Error("R2 environment configuration is missing.");
  await sequelize.authenticate();
  const products = await Product.findAll({ attributes: ["id", "images"] });
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    let images;
    try { images = typeof product.images === "string" ? JSON.parse(product.images) : product.images; }
    catch (_) { skipped++; continue; }
    if (!Array.isArray(images) || images.length === 0) continue;

    const nextImages = [];
    let changed = false;
    for (const image of images) {
      const key = imageKey(image);
      if (!key || key.startsWith("uploads/watermarked/")) {
        nextImages.push(image);
        skipped++;
        continue;
      }
      if (!APPLY) {
        nextImages.push(image);
        continue;
      }

      const object = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
      const original = await streamToBuffer(object.Body);
      const processed = await watermark(original);
      const extension = processed.format === "jpeg" ? ".jpg" : `.${processed.format || "png"}`;
      const newKey = `uploads/watermarked/${product.id}-${crypto.randomBytes(8).toString("hex")}${extension}`;
      const contentType = processed.format === "jpeg" ? "image/jpeg" : `image/${processed.format || "png"}`;
      await r2Client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: newKey,
        Body: processed.buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable"
      }));
      nextImages.push(newKey);
      changed = true;
    }

    if (APPLY && changed) {
      product.images = JSON.stringify(nextImages);
      await product.save({ fields: ["images"] });
      updated++;
    }
  }

  console.log(`${APPLY ? "UPDATED" : "DRY RUN"}: ${updated} product records changed; ${skipped} images skipped.`);
  await sequelize.close();
}

main().catch(async (error) => {
  console.error("Existing image watermark migration failed:", error);
  try { await sequelize.close(); } catch (_) {}
  process.exitCode = 1;
});
