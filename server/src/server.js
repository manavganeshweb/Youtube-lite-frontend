import dotenv from "dotenv";
import app from "./app.js";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
