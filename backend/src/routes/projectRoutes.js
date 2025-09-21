import express from "express";
import { createProject, getProjects, deleteProject } from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProject);
router.get("/", protect, getProjects);
router.delete("/:id", protect, deleteProject);

export default router;
