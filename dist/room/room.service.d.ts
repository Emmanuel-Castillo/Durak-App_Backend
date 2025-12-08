import type { Room, User } from "./room.type.js";
export declare function createRoom(user: User, roomName: string, socketId: string): Room;
export declare function joinRoom(user: User, roomName: string, socketId: string): Room | null;
export declare function fetchUserIdAndRoom(socketId: string): {
    room: Room | undefined;
    userId: string | undefined;
};
export declare function resetRoomStates(socketId: string): void;
export declare function findUserInRoom(room: Room, userId: string): User | undefined;
export declare function removeUserFromRoom(room: Room, userId: string): void;
//# sourceMappingURL=room.service.d.ts.map