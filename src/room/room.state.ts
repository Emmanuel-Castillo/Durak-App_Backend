import type { Room } from "./room.type.js";

export let rooms: Room[] = [];

// Test
export const testRoom : Room = {
  id: "testRoomId",
  hostId: "",
  name: "testRoom",
  users: [],
  game: null
}
rooms.push(testRoom)

export const socketRoomMap = new Map<string, string>();
export const socketUserMap = new Map<string, string>();
