import mongoose from "mongoose";

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: { x: { type: Number, required: true }, y: { type: Number, required: true } },
  data: mongoose.Schema.Types.Mixed,
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: { type: String, required: false },
  targetHandle: { type: String, required: false },
  animated: { type: Boolean, default: false },
  label: { type: String, required: false },
}, { _id: false });

const FlowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  metadata: {
    voice: { type: String, default: "English" },
    language: { type: String, default: "English" },
    globalPrompt: { type: String, default: "" },
  },
  agentId: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Flow", FlowSchema);