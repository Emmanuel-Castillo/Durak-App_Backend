import type { Room } from "../game/game.type.js";

export let rooms: Room[] = [];

export const socketRoomMap = new Map<string, string>();
export const socketUserMap = new Map<string, string>();
