// game.service.ts
import { rooms, socketRoomMap, socketUserMap } from "./room.state.js";
import { v4 as uuidv4 } from "uuid";
import type { Room, User } from "./room.type.js";

export function createRoom(user: User, roomName: string, socketId: string) {
  const roomId = uuidv4();
  const newUser: User = {
    ...user,
    socketId,
  };
  const newRoom: Room = {
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

export function joinRoom(user: User, roomName: string, socketId: string) {
  let room: Room = rooms.find((r) => r.name === roomName);
  if (room && room.users.length >= 4) {
    room = rooms.find((r) => r.users.length < 4);
  }
  if (!room) return null;
  console.log(room.users.length)
  room.users.push({
    ...user,
    socketId,
  });
  console.log(room.users.length)

  setRoomStates(socketId, user.account_id, room.id);
  return room;
}

// Utility functions
export function fetchUserIdAndRoom(socketId: string) {
  const userId = socketUserMap.get(socketId);
  const roomId = socketRoomMap.get(socketId);
  const room: Room = rooms.find((r) => r.id === roomId);
  return { room, userId };
}

function setRoomStates(socketId: string, playerId: string, roomId: string) {
  socketRoomMap.set(socketId, roomId);
  socketUserMap.set(socketId, playerId);
}

export function resetRoomStates(socketId: string) {
  socketUserMap.delete(socketId);
  socketRoomMap.delete(socketId);
}

export function findUserInRoom(room: Room, userId: string) {
  return room.users.find((u) => u.account_id === userId);
}

export function removeUserFromRoom(room: Room, userId: string) {
  room.users = room.users.filter((u) => u.account_id !== userId);
}
