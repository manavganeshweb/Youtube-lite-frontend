import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import pkg from "pg";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
// ------------ Upload Video --------------
router.post(
  "/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token" });

      const user = jwt.verify(token, process.env.JWT_SECRET);

      
      if (!req.files || !req.files.file) {
        return res.status(400).json({ message: "Video file is required" });
      }

      const videoFile = req.files.file[0];
      const videoRes = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: "video",
        folder: "youtube_ai/videos",
      });

      let thumbnailUrl = videoRes.secure_url
        .replace("/video/upload/", "/video/upload/so_2,w_400,h_225,c_fill/")
        .replace(".mp4", ".jpg");

      if (req.files.thumbnail) {
        const thumbFile = req.files.thumbnail[0];

        const thumbRes = await cloudinary.uploader.upload(thumbFile.path, {
          folder: "youtube_ai/thumbnails",
        });

        thumbnailUrl = thumbRes.secure_url;

        fs.unlinkSync(thumbFile.path);
      }

      const q = `
        INSERT INTO videos (title, description, video_url, thumbnail_url, user_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      const params = [
        req.body.title,
        req.body.description,
        videoRes.secure_url,
        thumbnailUrl,
        user.id,
      ];

      const result = await pool.query(q, params);

      fs.unlinkSync(videoFile.path);

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

router.post("/profile-image", auth, upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "youtube_ai/profile",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    });

    fs.unlinkSync(req.file.path);

    const r = await pool.query(
      "UPDATE users SET picture=$1 WHERE id=$2 RETURNING id, name, email, picture",
      [result.secure_url, req.user.id]
    );

    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM videos WHERE id=$1", [req.params.id]);
    const video = r.rows[0];
    if (!video) return res.status(404).json({ message: "Not found" });
    if (String(video.uploader_id) !== String(req.user.id))
      return res.status(403).json({ message: "Not allowed" });

    await pool.query("DELETE FROM videos WHERE id=$1", [req.params.id]);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});



export default router;
