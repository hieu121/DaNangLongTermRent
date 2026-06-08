const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { PORT } = require("../config/env");

const UPLOAD_DIR = path.join(__dirname, "../../uploads/listings");
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${PORT}`;

const ensureUploadDir = () => {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
};

const saveDataUrlImage = (dataUrl) => {
  const match = dataUrl.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image format");
  }

  const mimeExt = match[1].toLowerCase();
  const ext = mimeExt === "jpeg" ? "jpg" : mimeExt.replace("svg+xml", "svg");
  const buffer = Buffer.from(match[2], "base64");

  ensureUploadDir();
  const filename = `${uuidv4()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

  return `${API_BASE_URL}/uploads/listings/${filename}`;
};

const persistImageUrl = (imageUrl) => {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    throw new Error("Invalid image URL");
  }

  if (imageUrl.startsWith("data:image/")) {
    return saveDataUrlImage(imageUrl);
  }

  return imageUrl;
};

const persistImageUrls = (imageUrls = []) => imageUrls.map(persistImageUrl);

module.exports = {
  persistImageUrls,
  UPLOAD_DIR
};
