import { Socket } from "socket.io";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
const app = express();
app.use(cors());
import { registerRoomHandlers } from "./room/room.socket.js";
import { registerGameHandlers } from "./game/game.socket.js";
const server = http.createServer(app);
export const io = new Server(server, {
    cors: { origin: "*" },
});
// Player joins a game room
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    // socket.on("createRoom", ({ user, roomName }) => {
    //   console.log(user)
    //   // Create room using player's id
    //   const roomId = uuidv4(); // Generates a standard UUID
    //   socket.join(roomId);
    //   const newPlayer : Player = {
    //     user: user,
    //     hand: [],
    //     role: null,
    //     socketId: socket.id
    //   }
    //   const newRoom : Room = {
    //     id: roomId,
    //     hostId: user.account_id,
    //     name: roomName,
    //     players: [newPlayer],
    //     deck: []
    //   };
    //   rooms.push(newRoom);
    //   io.to(roomId).emit("roomData", newRoom);
    //   // Track player and room ids in socket
    //   socketRoomMap.set(socket.id, roomId)
    //   socketPlayerMap.set(socket.id, user.account_id)
    // });
    // socket.on("joinRoom", ({ user, roomId }) => {
    //   let room = rooms.find((r) => r.name == roomId);
    //   if (room && room.players.length >= 4) {
    //     room = rooms.find((r) => r.players.length < 4)
    //   }
    //   if (!room) return
    //   // Join room and update room data to all players
    //   socket.join(room.id);
    //   const newPlayer : Player = {
    //     user: user,
    //     hand: [],
    //     role: null,
    //     socketId: socket.id
    //   }
    //   room.players.push(newPlayer);
    //   io.to(room.id).emit("roomData", room);
    //   // Track player and room ids in socket
    //   socketPlayerMap.set(socket.id, user.account_id)
    //   socketRoomMap.set(socket.id, room.id)
    // });
    // // Handle a move
    // socket.on("player-move", ({ roomId, move }) => {
    //   io.to(roomId).emit("update-game", move);
    // });
    // socket.on("disconnect", () => {
    //   // Update ids in socket
    //   const playerId = socketPlayerMap.get(socket.id);
    //   const roomId = socketRoomMap.get(socket.id);
    //   socketPlayerMap.set(socket.id, null)
    //   socketRoomMap.set(socket.id, null)
    //   const playerRoom = rooms.find((r) => r.id == roomId);
    //   if (playerRoom) {
    //     if (playerRoom.hostId === playerId) {
    //       // DELETE WHOLE ROOM if the host
    //       socket.to(playerRoom.id).emit("forceDisconnection");
    //       rooms = rooms.filter(r => r.id !== playerRoom.id)
    //     } else {
    //       // Remove player from room and update player list to room
    //       playerRoom.players = playerRoom.players.filter(
    //         (p) => p.user.account_id != playerId
    //       );
    //       socket.to(playerRoom.id).emit("roomData", playerRoom);
    //     }
    //   }
    //   console.log("User disconnected:", socket.id);
    // });
    // socket.on("removeFromRoom", ({playerId}) => {
    //   const roomId = socketRoomMap.get(socket.id)
    //   const ownPlayerId = socketPlayerMap.get(socket.id)
    //   const playerRoom = rooms.find((r) => r.id == roomId)
    //   if (!playerRoom) return
    //   if (ownPlayerId !== playerRoom.hostId) return // Validate host is socket
    //   const targetPlayer = playerRoom.players.find((p) => p.user.account_id == playerId)
    //   if (!targetPlayer) return
    //   playerRoom.players = playerRoom.players.filter((p) => p.user.account_id != playerId)
    //   socket.to(targetPlayer.socketId).emit("forceDisconnection")
    // })
});
server.listen(3000, () => console.log("Socket server running on port 3000"));
//# sourceMappingURL=index.js.map