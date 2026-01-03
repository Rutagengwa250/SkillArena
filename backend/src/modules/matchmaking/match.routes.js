// src/modules/matchmaking/match.routes.js
import express from "express";
import { protect } from "../auth/auth.middleware.js";
import {
  createMatchController,
  joinMatchController,
  listMatchesController,
} from "./match.controller.js";

const router = express.Router();

// Test route to verify routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Match routes are working" });
});

router.post("/create", protect, createMatchController);
router.post("/join", protect, joinMatchController);
router.get("/list", protect, listMatchesController);

export default router;