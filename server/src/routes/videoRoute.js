import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();
const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const parts = h.split(" ");
  if (parts.length !== 2) return res.status(401).json({ message: "No token" });
  const token = parts[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

router.get("/uploader/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const r = await pool.query(
      `
      SELECT
        id,
        title,
        video_url AS url,
        thumbnail_url,
        views,
        created_at
      FROM videos
      WHERE user_id = $1
      ORDER BY id DESC
      `,
      [userId]
    );

    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  const mine = req.query.mine === "true";

  try {
    let userId = null;

    if (mine) {
      const h = (req.headers.authorization || "").trim();
      const parts = h.split(" ");
      if (parts.length !== 2) {
        return res.status(401).json({ message: "No token" });
      }

      try {
        const user = jwt.verify(parts[1], process.env.JWT_SECRET);
        userId = user.id;
      } catch {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    const query = `
      SELECT
        v.id,
        v.title,
        v.video_url AS url,
        v.thumbnail_url,
        v.user_id,
        v.views,
        u.name AS uploader,
        u.picture AS picture,
        v.created_at
      FROM videos v
      JOIN users u ON v.user_id = u.id
      ${mine ? "WHERE v.user_id = $1" : ""}
      ORDER BY v.id DESC
    `;

    const r = await pool.query(
      query,
      mine ? [userId] : []
    );

    res.json(r.rows);
  } catch (err) {
    console.error("Video fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const result = await pool.query(
      `
      SELECT id, title, description, video_url, thumbnail_url, created_at
      FROM videos
      WHERE LOWER(title) LIKE LOWER($1)
      ORDER BY created_at DESC
      `,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const r = await pool.query(
      `
  SELECT 
    v.id,
    v.title,
    v.video_url AS url,
    v.thumbnail_url,
    v.user_id,
    v.views,
    v.description,
    u.name AS uploader,
    u.picture AS picture,
    v.created_at
  FROM videos v
  JOIN users u ON v.user_id = u.id
  WHERE v.id = $1
  `,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ message: "Not found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE video (only uploader)
router.delete("/:id", auth, async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM videos WHERE id=$1", [req.params.id]);
    const video = r.rows[0];
    if (!video) return res.status(404).json({ message: "Not found" });
    if (String(video.user_id) !== String(req.user.id)) return res.status(403).json({ message: "Not allowed" });

    if (video.cloudinary_public_id) {
      try {
        await cloudinary.uploader.destroy(video.user_id, { resource_type: "video" });
      } catch (err) {
        console.warn("Cloudinary delete warning:", err);
      }
    }

    await pool.query("DELETE FROM videos WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
