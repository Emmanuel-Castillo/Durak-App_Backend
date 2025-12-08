import type { User } from "../room/room.type.js";

export type CardSuit = "hearts" | "clubs" | "diamonds" | "spades";

export type Card = {
  id: string;
  value: string;
  suit: CardSuit;
  rank: number;
};

export type PlayerRole = "FirstAttacker" | "Attacker" | "Defender"

export type Player = {
  user: User;
  hand: Card[];
  startTurnRole: PlayerRole
  role: PlayerRole
  nextPlayerUserId: string;
};

export type PlayedCards = {
  id: string;
  attackingCard: Card
  defendingCard: Card | null
}

export type Game = {
  turn: number;
  deck: Card[];
  tsarCard: Card;
  players: Player[];
  playedCards: PlayedCards[]
  gameState: "Idle" | "FirstMove" | "Counter" | "EndTurn" | "Defending" | "Ended"
  playersUserIdsEndedTurn: string[]
  winners: Player[]
};
