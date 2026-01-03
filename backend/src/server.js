// server.js - Updated version
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma.js";
import { protect } from "./modules/auth/auth.middleware.js";
import matchRoutes from "./modules/matchmaking/match.routes.js";
import gameRoutes from "./modules/game/game.routes.js";
import authRoutes from "./routes/auth.routes.js";
import payoutRoutes from "./modules/payout/payout.routes.js";
import { registerGameSocket } from "./modules/game/game.socket.js";
import walletRoutes from './modules/wallet/wallet.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.66:5173', /\.local$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/payout", payoutRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO
registerGameSocket(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});