import type { Room } from "../room/room.type.js";
import type { Card, Game, PlayedCards, Player } from "./game.type.js";
export declare function startGame(room: Room, durak?: Player): {
    success: boolean;
    game: Game;
    error: null;
    message: string;
} | {
    success: boolean;
    game: null;
    error: any;
    message: null;
};
export declare function firstMoveDealt(userId: string, atkCard: Card, game: Game): {
    success: boolean;
    game: Game;
    message: string;
    error: null;
} | {
    success: boolean;
    game: null;
    message: null;
    error: any;
};
export declare function attackMove(userId: string, atkCard: Card, game: Game): {
    success: boolean;
    game: Game;
    error: null;
    message: string;
} | {
    success: boolean;
    game: null;
    error: any;
    message: null;
};
export declare function endAttackerTurn(userId: string, game: Game): {
    success: boolean;
    game: Game;
    error: null;
    message: string;
} | {
    success: boolean;
    game: null;
    error: any;
    message: null;
};
export declare function defendMove(userId: string, defCard: Card, cardPair: PlayedCards, game: Game): {
    success: boolean;
    game: Game;
    error: null;
    message: string;
} | {
    success: boolean;
    game: null;
    error: any;
    message: null;
};
export declare function counterMove(userId: string, counterCard: Card, game: Game): {
    success: boolean;
    game: Game;
    error: null;
    message: string;
} | {
    success: boolean;
    game: null;
    error: any;
    message: null;
};
export declare function yieldTurn(userId: string, game: Game): {
    success: boolean;
    game: Game;
    error: null;
    message: string;
} | {
    success: boolean;
    game: null;
    error: any;
    message: null;
};
//# sourceMappingURL=game.service.d.ts.map