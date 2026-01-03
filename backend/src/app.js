import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import matchRoutes from "./modules/matchmaking/match.routes.js";
import gameRoutes from "./modules/game/game.routes.js";
import authRoutes from "./routes/auth.routes.js";
import payoutRoutes from "./modules/payout/payout.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/payout", payoutRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/auth", authRoutes);

export default app;
