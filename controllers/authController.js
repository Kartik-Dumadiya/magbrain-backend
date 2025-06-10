import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(user);

    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .status(201)
      .json({ message: "User created successfully", user: { name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken(user);
    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .status(200)
      .json({ message: "Login successful", token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  // Provide the same options as when you set the cookie
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  // If using session-based passport, uncomment next line
  // req.logout && req.logout();
  res.status(200).json({ message: "Logout successful" });
};

export const oauthSuccess = (req, res) => {
  if (!req.user) {
    return res.redirect("http://localhost:5173/signin?oauth=fail");
  }
  const token = generateToken(req.user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.redirect("http://localhost:5173/agents?oauth=success");
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    // Determine provider
    let provider = "local";
    if (user.googleId) provider = "google";
    else if (user.githubId) provider = "github";
    else if (user.dropboxId) provider = "dropbox";
    // Send provider in user object
    res.json({ user: { ...user.toObject(), provider } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, company } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, company },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "Fields are required" });

  try {
    const user = await User.findById(req.user.id);
    if (!user.password) return res.status(400).json({ error: "Password cannot be changed for social logins." });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Old password is incorrect." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};