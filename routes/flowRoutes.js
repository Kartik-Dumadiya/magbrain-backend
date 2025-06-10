import express from "express";
import {
  getFlow,
  createFlow,
  updateFlow,
  deleteFlow,
} from "../controllers/flowController.js";

const router = express.Router();

router.get("/:agentId", getFlow);
router.post("/", createFlow);
router.put("/:id", updateFlow);
router.delete("/:id", deleteFlow);

export default router;