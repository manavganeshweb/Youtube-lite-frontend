import dotenv from "dotenv";
import app from "./app.js";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

app.listen( () => console.log(`🚀 Server running on https://youtube-lite-35l5.onrender.com`));
