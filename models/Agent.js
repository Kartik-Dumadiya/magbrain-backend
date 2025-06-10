import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
  bot_id: { type: String, unique: true, required: true },
  name: { type: String, default: "" },
  agent_type: { type: String, default: "single-prompt" },
  prompt: { type: String, default: "" },
  welcome_message: { type: String, default: "" },
  system_prompt: { type: String, default: "" },
  model_name: { type: String, default: "gpt-4.1" },
  llm_setting: { type: Object, default: {} },
  voice: { type: String, default: "cimo" },
  language: { type: String, default: "en" },
  template: { type: String, default: "" }, // For template key
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Agent = mongoose.model("Agent", agentSchema);
export default Agent;

