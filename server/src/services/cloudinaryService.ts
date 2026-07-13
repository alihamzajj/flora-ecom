import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let isCloudinaryConfigured = false;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  isCloudinaryConfigured = true;
} else {
  console.log("[CLOUDINARY] Credentials not fully configured. Using local uploads fallback.");
}

export async function uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.path,
        { folder: `lumea/${folder}` },
        (error, result) => {
          // Clean up temp file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          if (error) return reject(error);
          resolve(result!.secure_url);
        }
      );
    });
  } else {
    // Local fallback: move file to static uploads folder
    const targetDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const targetPath = path.join(targetDir, filename);

    fs.renameSync(file.path, targetPath);

    // Return URL path (assuming server serves public directory statically)
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${folder}/${filename}`;
  }
}
