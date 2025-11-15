import type { User } from "../room/room.type.js";
export type CardSuit = "hearts" | "clubs" | "diamonds" | "spades";
export type Card = {
    value: string;
    suit: CardSuit;
    rank: number;
};
export type Player = {
    user: User;
    hand: Card[];
    role: "FirstAttacker" | "Attacker" | "Defender";
    nextPlayerUserId: string;
};
export type Game = {
    deck: Card[];
    tsarCard: Card;
    players: Player[];
    attackingCards: Card[];
    counteredCards: Card[];
};
//# sourceMappingURL=game.type.d.ts.map