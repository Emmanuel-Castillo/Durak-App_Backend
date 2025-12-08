// room.socket.ts
import { Server, Socket } from "socket.io";
import { createRoom, fetchUserIdAndRoom, findUserInRoom, joinRoom, removeUserFromRoom, resetRoomStates, } from "./room.service.js";
import { rooms } from "./room.state.js";
import { startGame } from "../game/game.service.js";
import { emitCommentToRoom, emitErrorMessageToSocket, emitUpdatedGame, } from "../game/game.socket.js";
export function registerRoomHandlers(io, socket) {
    socket.on("testGame", ({ user }) => {
        // Join a room
        const room = joinRoom(user, "testRoom", socket.id);
        if (!room) {
            console.error(`${user.username} can't connect to test room!`);
            return;
        }
        if (room.users.length === 1)
            room.hostId = user.account_id;
        socket.join(room.id);
        emitUpdatedRoom(io, room);
        // Set game in room
        if (room.users.length >= 2) {
            const { success, game, error, message } = startGame(room);
            if (success && game) {
                console.log("Emitting game...");
                game.gameState = "Ended";
                game.winners = game.players;
                emitUpdatedGame(io, room, game);
                message && emitCommentToRoom(io, room, message);
            }
            else {
                error && emitErrorMessageToSocket(socket, error);
            }
        }
    });
    socket.on("createRoom", ({ user, roomName }) => {
        const newRoom = createRoom(user, roomName, socket.id);
        socket.join(newRoom.id);
        emitUpdatedRoom(io, newRoom);
    });
    socket.on("joinRoom", ({ user, roomId }) => {
        const room = joinRoom(user, roomId, socket.id);
        if (!room)
            return;
        socket.join(room.id);
        emitUpdatedRoom(io, room);
    });
    socket.on("disconnect", () => {
        console.log("Disconnected: ", socket.id);
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        // If in middle of game, remove everyone from game
        if (room.game) {
            room.game = null;
            emitUpdatedGame(io, room, room.game);
        }
        // Force disconnection to all users in room if host disconnects OR if any user leaves test room
        if (room.hostId === userId || room.id === "testRoomId") {
            // Force disconnection to all players in room + delete room
            socket.to(room.id).emit("forceDisconnection");
            // Don't remove test room
            if (!(room.id === "testRoomId")) {
                const idx = rooms.findIndex((r) => r.id === room.id);
                if (idx >= 0)
                    rooms.splice(idx, 1);
            }
            else {
                room.users = [];
            }
        }
        else {
            // Remove player from players array
            removeUserFromRoom(room, userId);
            emitUpdatedRoom(io, room);
        }
        resetRoomStates(socket.id);
    });
    socket.on("removeFromRoom", ({ userId }) => {
        const { room } = fetchUserIdAndRoom(socket.id);
        if (!room)
            return;
        const targetUser = findUserInRoom(room, userId);
        if (!targetUser)
            return;
        socket.to(targetUser.socketId).emit("forceDisconnection");
        removeUserFromRoom(room, userId);
        emitUpdatedRoom(io, room);
    });
}
export function emitUpdatedRoom(io, room) {
    io.to(room.id).emit("roomData", room);
    console.log("Emitted room data...");
}
//# sourceMappingURL=room.socket.js.map