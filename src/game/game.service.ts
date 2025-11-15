import type { Room } from "../room/room.type.js";
import { createShuffledDeck, HIGHEST_RANK } from "./game.deck.js";
import type { Game } from "./game.type.js";

export function startGame(room: Room) {
    const newGame : Game = {
        deck: [],
        tsarCard: {
            value: "",
            suit: "hearts",
            rank: 0
        },
        players: [],
        attackingCards: [],
        counteredCards: []
    }
  // 1. Create and shuffle the deck
  const deck = createShuffledDeck();
  newGame.deck = deck;

  // 2. Deal 6 cards to the connected player
  room.users.forEach((u) => {
    newGame.players.push({
        user: u,
        hand: newGame.deck.slice(0, 6),
        role: "FirstAttacker",
        nextPlayerUserId: ""
    })
    newGame.deck = newGame.deck.slice(6);
  });

  // 3. Determine tsarCard
  newGame.tsarCard = newGame.deck.pop()!;
  newGame.deck.push(newGame.tsarCard);

  // 4. Choose starting defender (first game impl)
  // Find player with lowest card of tsar suit in hand
  var maxRank = HIGHEST_RANK;
  var firstAttackerIndex = 0;
  newGame.players.forEach((player, index) => {
    player.hand.forEach((card) => {
      if (card.suit === newGame.tsarCard.suit) {
        if (card.rank < maxRank) {
          maxRank = card.rank;
          firstAttackerIndex = index;
        }
      }
    });
  });

  // 5. Assign starting roles for each player 
  newGame.players.forEach((player, index) => {
    const nextPlayerUserId = (firstAttackerIndex + 1) % newGame.players.length
    if (index === firstAttackerIndex) {
      player.role = "FirstAttacker";
    } else if (index === nextPlayerUserId) {
      player.role = "Defender";
    } else {
      player.role = "Attacker";
    }
    player.nextPlayerUserId = nextPlayerUserId
  });

  room.game = newGame
  return room.game;
}
