import type { Game } from "../game/game.type.js";
export type User = {
    id: number;
    created_at: Date;
    username: string;
    email: string;
    avatar?: string;
    num_wins: number;
    account_id: string;
    socketId: string;
};
export type Room = {
    id: string;
    hostId: string;
    name: string;
    users: User[];
    game: Game | null;
};
//# sourceMappingURL=room.type.d.ts.map