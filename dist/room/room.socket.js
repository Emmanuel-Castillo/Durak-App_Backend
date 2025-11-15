// room.socket.ts
import { Server, Socket } from "socket.io";
import { createRoom, fetchUserIdAndRoom, findUserInRoom, joinRoom, removeUserFromRoom, resetRoomStates, } from "./room.service.js";
import { rooms } from "./room.state.js";
export function registerRoomHandlers(io, socket) {
    socket.on("createRoom", ({ user, roomName }) => {
        const newRoom = createRoom(user, roomName, socket.id);
        socket.join(newRoom.id);
        emitUpdatedRoom(io, newRoom);
    });
    socket.on("joinRoom", ({ user, roomId }) => {
        console.log("socket received joinRoom");
        const room = joinRoom(user, roomId, socket.id);
        if (!room)
            return;
        socket.join(room.id);
        emitUpdatedRoom(io, room);
    });
    socket.on("disconnect", () => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        if (room.hostId === userId) {
            // Force disconnection to all players in room + delete room
            socket.to(room.id).emit("forceDisconnection");
            const idx = rooms.findIndex((r) => r.id === room.id);
            if (idx >= 0)
                rooms.splice(idx, 1);
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
}
//# sourceMappingURL=room.socket.js.map