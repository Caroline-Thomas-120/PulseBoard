import { Router } from "express";
import upload from "../middleware/upload.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { cloudinaryUpload } from "../services/cloudinaryupload.js";

const router = Router();

router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image to upload.",
      });
    }

    const result = await cloudinaryUpload(
      req.file.buffer,
      "pulseboard/issues"
    );

    return res.status(201).json({
      message: "Image uploaded successfully.",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("Image upload failed:", error);

    return res.status(500).json({
      message: "Image upload failed. Please try again.",
    });
  }
});

export default router;