import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
// import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by Google ID
        let user = await User.findOne({ googleId: profile.id });
        // If not found, try finding by email (for users who signed up locally or with another provider)
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : "",
            githubId: profile.id,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// // Dropbox OAuth2 Strategy
// passport.use(
//   "dropbox",
//   new OAuth2Strategy(
//     {
//       authorizationURL: "https://www.dropbox.com/oauth2/authorize",
//       tokenURL: "https://api.dropbox.com/oauth2/token",
//       clientID: process.env.DROPBOX_CLIENT_ID,
//       clientSecret: process.env.DROPBOX_CLIENT_SECRET,
//       callbackURL: "/auth/dropbox/callback",
//     },
//     async (accessToken, refreshToken, params, profile, done) => {
//       try {
//         const response = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//         });
//         const data = await response.json();
//         let user = await User.findOne({ dropboxId: data.account_id });
//         if (!user) {
//           user = await User.create({
//             name: data.name.display_name,
//             email: data.email,
//             dropboxId: data.account_id,
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

passport.serializeUser((user, done) => {
  done(null, user.id);
});
// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => done(err, user));
// });
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});