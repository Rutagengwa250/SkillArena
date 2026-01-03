export const registerGameSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    // Join match room
    socket.on("joinMatch", ({ matchId, userId }) => {
      socket.join(`match_${matchId}`);
      console.log(`User ${userId} joined match ${matchId}`);
      
      // Notify others in the room
      socket.to(`match_${matchId}`).emit("playerJoined", { userId, matchId });
    });

    // Start game
    socket.on("startGame", ({ matchId }) => {
      io.to(`match_${matchId}`).emit("gameStarted", { matchId });
    });

    // Make move
    socket.on("makeMove", ({ matchId, position, symbol }) => {
      socket.to(`match_${matchId}`).emit("moveMade", { 
        position, 
        symbol,
        matchId 
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};