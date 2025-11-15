import { Server, Socket } from "socket.io";
import type { Room } from "./room.type.js";
export declare function registerRoomHandlers(io: Server, socket: Socket): void;
export declare function emitUpdatedRoom(io: Server, room: Room): void;
//# sourceMappingURL=room.socket.d.ts.map