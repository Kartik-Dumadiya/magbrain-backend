import Flow from "../models/Flow.js";

// Validate conversation node transitions
const validateConversationNode = (node) => {
  if (node.type === "conversation") {
    if (!node.data || typeof node.data !== "object") {
      return false;
    }
    if (!Array.isArray(node.data.transitions)) {
      return false;
    }
    return node.data.transitions.every((t) => 
      typeof t === "object" && 
      typeof t.label === "string" && 
      ["arrow", "minus"].includes(t.icon)
    );
  }
  return true;
};

// Validate edges
const validateEdge = (edge) => {
  return (
    typeof edge.id === "string" &&
    typeof edge.source === "string" &&
    typeof edge.target === "string" &&
    (edge.sourceHandle === null || typeof edge.sourceHandle === "string") &&
    (edge.targetHandle === null || typeof edge.targetHandle === "string") &&
    typeof edge.animated === "boolean"
  );
};

// GET /flows/:agentId
export const getFlow = async (req, res) => {
  try {
    const { agentId } = req.params;
    const flow = await Flow.findOne({ agentId });
    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }
    res.json({ flow });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
    console.error("Error in getFlow:", err);
  }
};

// POST /flows
export const createFlow = async (req, res) => {
  try {
    const { name, nodes, edges, metadata, agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ error: "agentId required" });
    }

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ error: "Nodes and edges must be arrays" });
    }

    // Validate conversation nodes
    const invalidNode = nodes.find((node) => !validateConversationNode(node));
    if (invalidNode) {
      return res.status(400).json({ error: "Invalid conversation node data" });
    }

    // Validate edges
    const invalidEdge = edges.find((edge) => !validateEdge(edge));
    if (invalidEdge) {
      return res.status(400).json({ error: "Invalid edge data" });
    }

    const flow = await Flow.create({ name, nodes, edges, metadata, agentId });
    res.status(201).json({ flow });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
    console.error("Error in createFlow:", err);
  }
};

// PUT /flows/:id
export const updateFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nodes, edges, metadata } = req.body;

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ error: "Nodes and edges must be arrays" });
    }

    // Validate conversation nodes
    const invalidNode = nodes.find((node) => !validateConversationNode(node));
    if (invalidNode) {
      return res.status(400).json({ error: "Invalid conversation node data" });
    }

    // Validate edges
    const invalidEdge = edges.find((edge) => !validateEdge(edge));
    if (invalidEdge) {
      return res.status(400).json({ error: "Invalid edge data" });
    }

    const flow = await Flow.findByIdAndUpdate(
      id,
      { name, nodes, edges, metadata },
      { new: true, runValidators: true }
    );
    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }
    res.json({ flow });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
    console.error("Error in updateFlow:", err);
  }
};

// DELETE /flows/:id
export const deleteFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await Flow.findByIdAndDelete(id);
    if (!flow) {
      return res.status(404).json({ error: "Flow not found" });
    }
    res.json({ message: "Flow deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
    console.error("Error in deleteFlow:", err);
  }
};