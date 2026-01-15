import express from "express";
import passport from "../config/passportconfig.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pkg from "pg";
import dotenv from "dotenv";


dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CORS_ORIGIN}/login`, session: false }),
  (req, res) => {
    if (!req.user) return res.redirect(`${process.env.CORS_ORIGIN}/login`);


    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const safeUser = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture || null,
    };

    res.redirect(`${process.env.CORS_ORIGIN}/home?token=${token}&user=${encodeURIComponent(
        JSON.stringify(safeUser)
      )}`);
  }
);


router.post("/register", async (req, res) => {
  try {
    const { name , email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Username, Email and password required" });

    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, picture",
      [name, email, hashed]
    );

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// login
router.post("/login", async (req, res) => {


  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
    const safeUser = { id: user.id, name: user.name, email: user.email, picture: user.picture || null };

    res.status(200).json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error(" Login error:", err);
    res.status(500).json({ error: err.message });

  }
});

export default router;
