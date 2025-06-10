import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  company: { type: String }, // NEW
  googleId: { type: String },
  githubId: { type: String },
  dropboxId: { type: String },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;