// game.service.ts
import { rooms, socketRoomMap, socketUserMap } from "./room.state.js";
import { v4 as uuidv4 } from "uuid";
export function createRoom(user, roomName, socketId) {
    const roomId = uuidv4();
    const newUser = {
        ...user,
        socketId,
    };
    const newRoom = {
        id: roomId,
        hostId: user.account_id,
        name: roomName,
        users: [newUser],
        game: null
    };
    rooms.push(newRoom);
    setRoomStates(socketId, newUser.account_id, newRoom.id);
    return newRoom;
}
export function joinRoom(user, roomName, socketId) {
    let room = rooms.find((r) => r.name === roomName);
    if (room && room.users.length >= 4) {
        room = rooms.find((r) => r.users.length < 4);
    }
    if (!room)
        return null;
    room.users.push({
        ...user,
        socketId,
    });
    setRoomStates(socketId, user.account_id, room.id);
    return room;
}
// Utility functions
export function fetchUserIdAndRoom(socketId) {
    const userId = socketUserMap.get(socketId);
    const roomId = socketRoomMap.get(socketId);
    const room = rooms.find((r) => r.id === roomId);
    return { room, userId };
}
function setRoomStates(socketId, playerId, roomId) {
    socketRoomMap.set(socketId, roomId);
    socketUserMap.set(socketId, playerId);
}
export function resetRoomStates(socketId) {
    socketUserMap.delete(socketId);
    socketRoomMap.delete(socketId);
}
export function findUserInRoom(room, userId) {
    return room.users.find((u) => u.account_id === userId);
}
export function removeUserFromRoom(room, userId) {
    room.users = room.users.filter((u) => u.account_id !== userId);
}
//# sourceMappingURL=room.service.js.map