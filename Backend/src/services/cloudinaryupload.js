
import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

export function cloudinaryUpload(buffer, folder = "pulseboard") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}
