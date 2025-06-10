import Agent from "../models/Agent.js";

// Generate a 16-character alphanumeric ID
function generateBotId() {
  return [...Array(16)].map(() => Math.random().toString(36)[2]).join('');
}

// Create new agent
export const createAgent = async (req, res) => {
  try {
    const bot_id = generateBotId();
    // Destructure all possible fields from req.body
    const {
      prompt,
      welcome_message,
      system_prompt,
      model_name,
      llm_setting,
      name,
      agent_type,
      voice,
      language,
      template,
    } = req.body;

    // You can add validation here if needed

    const agent = await Agent.create({
      bot_id,
      prompt,
      welcome_message,
      system_prompt,
      model_name,
      llm_setting,
      name,
      agent_type,
      voice,
      language,
      template,
      created_by: req.user?._id,
    });

    res.status(201).json({ agent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get agent by bot_id
export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findOne({ bot_id: req.params.bot_id });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json({ agent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//List all agents for the current user
export const listAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ created_by: req.user?._id });
    res.json({ agents });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndUpdate(
      { bot_id: req.params.bot_id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json({ agent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete agent by bot_id
export const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({
      bot_id: req.params.bot_id,
      created_by: req.user?._id,
    });
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};