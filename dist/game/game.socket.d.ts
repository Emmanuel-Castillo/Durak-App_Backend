import { Server, Socket } from "socket.io";
import type { Game } from "./game.type.js";
import type { Room } from "../room/room.type.js";
export declare function registerGameHandlers(io: Server, socket: Socket): void;
export declare function emitUpdatedGame(io: Server, room: Room, game: Game | null): void;
export declare function emitCommentToRoom(io: Server, room: Room, comment: string): void;
export declare function emitErrorMessageToSocket(socket: Socket, errorMsg: string): void;
//# sourceMappingURL=game.socket.d.ts.map