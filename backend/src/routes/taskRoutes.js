import express from "express";
import { createTask, getTasksByProject, updateTask, deleteTask } from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/:projectId", protect, getTasksByProject);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

export default router;
