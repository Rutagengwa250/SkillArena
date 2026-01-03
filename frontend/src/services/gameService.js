// src/services/gameService.js
import api from "../utils/api.js";

export const getGameState = async (matchId) => {
  try {
    const response = await api.get(`/game/state/${matchId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting game state:", error);
    throw error;
  }
};

export const makeMove = async (matchId, position) => {
  try {
    const response = await api.post("/game/move", { matchId, position });
    return response.data;
  } catch (error) {
    console.error("Error making move:", error);
    throw error;
  }
};

export const startGame = async (matchId) => {
  try {
    const response = await api.post(`/game/start/${matchId}`);
    return response.data;
  } catch (error) {
    console.error("Error starting game:", error);
    throw error;
  }
};