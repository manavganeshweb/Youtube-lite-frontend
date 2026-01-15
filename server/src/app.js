import express from "express";
import cors from "cors";
import passport from "./config/passportconfig.js";
import dotenv from "dotenv";
import uploadRoute from "./routes/uploadRoute.js";
import authRoute from "./routes/authRoute.js";
import videoRoute from "./routes/videoRoute.js";
import helmet from "helmet";

dotenv.config();
const app = express();

app.use(
  cors({
     origin: process.env.CORS_ORIGIN,
  })
);

app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use("/api/upload", uploadRoute);
app.use("/api/videos", videoRoute);
app.use("/api/auth", authRoute);

export default app;
