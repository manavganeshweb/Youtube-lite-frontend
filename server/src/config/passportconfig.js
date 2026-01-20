import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
  ssl: true,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
      const user = result.rows[0];
      if (!user) return done(null, false, { message: "User not found" });
        if (user.provider === "google") {
        return done(null, false, { message: "Use Google login" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: "Invalid password" });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `https://youtube-lite-35l5.onrender.com/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos[0]?.value;

  
        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        let user = result.rows[0];

        if (!user) {
          const insert = await pool.query(
            `INSERT INTO users (email, name, picture, provider)
             VALUES ($1, $2, $3, 'google')
             RETURNING *`,
            [email, name, picture]
          );
          user = insert.rows[0];
        }

        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);


passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
