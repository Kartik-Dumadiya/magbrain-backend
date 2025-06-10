import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createAgent, getAgentById, listAgents, updateAgent, deleteAgent } from "../controllers/agentController.js";

const router = express.Router();

router.put("/:bot_id", requireAuth, updateAgent);
router.post("/", requireAuth, createAgent);
router.get("/:bot_id", requireAuth, getAgentById);
router.delete("/:bot_id", requireAuth, deleteAgent); 
router.get("/", requireAuth, listAgents);


export default router;


