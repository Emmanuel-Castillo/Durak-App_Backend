import type { Room } from "../room/room.type.js";
import { createShuffledDeck, HIGHEST_RANK } from "./game.deck.js";
import type { Card, Game, PlayedCards, Player } from "./game.type.js";

// GOOD
export function startGame(room: Room, durak?: Player) {
  try {
    const newGame: Game = {
      turn: 1,
      deck: [],
      tsarCard: {
        id: "",
        value: "",
        suit: "hearts",
        rank: 0,
      },
      players: [],
      playedCards: [],
      playersUserIdsEndedTurn: [],
      gameState: "FirstMove",
      winners: [],
    };
    // 1. Create and shuffle the deck
    const deck = createShuffledDeck();
    newGame.deck = deck;

    // 2. Deal 6 cards to the connected player
    room.users.forEach((u, index) => {
      newGame.players.push({
        user: u,
        hand: newGame.deck.slice(0, 6),
        startTurnRole: "FirstAttacker",
        role: "FirstAttacker",
        nextPlayerUserId:
          room.users[(index + 1) % room.users.length]!.account_id!,
      });
      newGame.deck = newGame.deck.slice(6);
    });

    // 3. Determine tsarCard
    newGame.tsarCard = newGame.deck.pop()!;
    newGame.deck.push(newGame.tsarCard);

    let firstAttacker: Player;
    if (durak) {
      const durakUserId = durak.user.account_id
      firstAttacker = newGame.players.find(p => p.nextPlayerUserId === durakUserId)!
    } else {
      // 4. Choose starting defender (first game impl)
      // Find player with lowest card of tsar suit in hand
      var maxRank = HIGHEST_RANK;
      newGame.players.forEach((player, index) => {
        player.hand.forEach((card) => {
          if (card.suit === newGame.tsarCard.suit) {
            if (card.rank < maxRank) {
              maxRank = card.rank;
              firstAttacker = player;
            }
          }
        });
      });
    }
    // 5. Assign starting roles for each player
    assignPlayerRoles(newGame, firstAttacker!.user.account_id);

    room.game = newGame;
    return {
      success: true,
      game: room.game,
      error: null,
      message: `Game started! ${
        firstAttacker!.user.username
      } has the first move...`,
    };
  } catch (error: any) {
    return { success: false, game: null, error: error, message: null };
  }
}

// GOOD
export function firstMoveDealt(userId: string, atkCard: Card, game: Game) {
  try {
    // Validate if game is in FirstMove state
    if (game.gameState !== "FirstMove")
      throw new Error(
        "firstMoveDealt(): Attempting to deal first move outside of FirstMove game state"
      );

    // Validate if first attacker was the one who invoked this move
    const firstAttackerPlayer = fetchPlayer(game, userId);
    if (!firstAttackerPlayer)
      throw new Error("firstMoveDealt(): Player does not exist!");
    if (firstAttackerPlayer.role !== "FirstAttacker")
      throw new Error("firstMoveDealt(): Player is not First Attacker");

    // Update game
    game.playedCards.push({
      attackingCard: atkCard,
      defendingCard: null,
      id: atkCard.id,
    });
    firstAttackerPlayer.hand = updateHand(firstAttackerPlayer, atkCard);
    firstAttackerPlayer.role = "Attacker";
    game.gameState = "Idle";

    // Check if player finished game + game ended
    if (hasPlayerFinishedGame(firstAttackerPlayer, game)) {
      const { gameEnded } = moveToWinnersList(firstAttackerPlayer, game);
      gameEnded && endGame(game);
    }

    return {
      success: true,
      game,
      message:
        "First Move:" +
        formatPlayerDealsCardMessage(firstAttackerPlayer, atkCard),
      error: null,
    };
  } catch (error: any) {
    return { success: false, game: null, message: null, error: error };
  }
}

// GOOD
export function attackMove(userId: string, atkCard: Card, game: Game) {
  try {
    // Validate if user is attacker
    const attackerPlayer = fetchPlayer(game, userId);
    if (!attackerPlayer) throw new Error("attackMove(): Player not found!");
    if (attackerPlayer.role !== "Attacker") {
      throw new Error("attackMove(): Player is NOT Attacker");
    }

    // Validate if playedCards.length < 6
    if (game.playedCards.length >= 6) {
      throw new Error(
        "attackMove(): playedCards has reached limit of 6 elements"
      );
    }

    // Validate if atkCard follows game rules!
    let atkCardMatchesValue = false;
    game.playedCards.forEach((p) => {
      if (
        p.attackingCard.value === atkCard.value ||
        p.defendingCard?.value === atkCard.value
      ) {
        atkCardMatchesValue = true;
      }
    });
    if (!atkCardMatchesValue) {
      throw new Error("attackMove(): atkCard does not satisfy play");
    }

    // Update game
    attackerPlayer.hand = updateHand(attackerPlayer, atkCard);
    game.playedCards.push({
      attackingCard: atkCard,
      defendingCard: null,
      id: atkCard.id,
    });

    // Check if attacker finished game / game ended
    if (hasPlayerFinishedGame(attackerPlayer, game)) {
      const { gameEnded } = moveToWinnersList(attackerPlayer, game);
      gameEnded && endGame(game);
    }

    return {
      success: true,
      game,
      error: null,
      message:
        "Attack: " + formatPlayerDealsCardMessage(attackerPlayer, atkCard),
    };
  } catch (error: any) {
    return { success: false, game: null, error: error, message: null };
  }
}

// GOOD
export function endAttackerTurn(userId: string, game: Game) {
  try {
    // Validate if user is attacker
    const attackerPlayer = fetchPlayer(game, userId);
    if (!attackerPlayer)
      throw new Error("endAttackerTurn(): Player not found!");
    if (attackerPlayer.role !== "Attacker")
      throw new Error("endAttackerTurn(): Player is NOT Attacker");

    // Update game
    game.playersUserIdsEndedTurn.push(attackerPlayer.user.account_id);

    let returningMessage = `Attacker ${attackerPlayer.user.username} has ended their turn.`;
    // Check if turn should end
    // 1. Check if all attackers have ended their turn
    // 2. All playedCards are filled
    let allAttackersEndedTurn = true;
    game.players.forEach((p) => {
      if (
        p.role === "Attacker" &&
        !game.playersUserIdsEndedTurn.includes(p.user.account_id)
      ) {
        allAttackersEndedTurn = false;
      }
    });
    if (allAttackersEndedTurn && arePlayedCardsFilled(game.playedCards)) {
      // END TURN
      // 1. Have ALL players draw till 6 cards
      dealCardsToPlayers(game);

      // 2. Shift roles so that current defender is now First Attacker, and their next player is now Defender
      const currentDefender = game.players.find((p) => p.role === "Defender");
      if (!currentDefender)
        throw new Error("endAttackerTurn(): Defender not found!");
      assignPlayerRoles(game, currentDefender.user.account_id);

      // 3. Update game data for next turn
      game.playedCards = [];
      game.gameState = "FirstMove";
      game.turn += 1;
    }

    return { success: true, game, error: null, message: returningMessage };
  } catch (error: any) {
    return { success: false, game: null, error: error, message: null };
  }
}

// GOOD
export function defendMove(
  userId: string,
  defCard: Card,
  cardPair: PlayedCards,
  game: Game
) {
  try {
    // Validate if user is defender
    const defenderPlayer = fetchPlayer(game, userId);
    if (!defenderPlayer) throw new Error("defendMove(): Player not found!");
    if (defenderPlayer.role !== "Defender")
      throw new Error("defendMove(): Player is NOT Defender!");

    // Find playedCard pair using atkCard
    const playedCard = game.playedCards.find((p) => p.id === cardPair.id);
    if (!playedCard)
      throw new Error("defendMove(): PlayedCard pair not found!");

    // Validate if defense follows game logic
    if (!doesDefCardDefend(defCard, playedCard, game.tsarCard))
      throw new Error(
        "defendMove(): Card can't defend against playedCard pair!"
      );

    // Update game
    defenderPlayer.hand = updateHand(defenderPlayer, defCard);
    playedCard.defendingCard = defCard;
    game.gameState = "Defending";

    // Check if defender finished game / game ended
    if (hasPlayerFinishedGame(defenderPlayer, game)) {
      const { gameEnded } = moveToWinnersList(defenderPlayer, game);
      gameEnded && endGame(game);
    }

    return {
      success: true,
      game,
      error: null,
      message:
        "Defend: " + formatPlayerDealsCardMessage(defenderPlayer, defCard),
    };
  } catch (error: any) {
    return { success: false, game: null, error: error, message: null };
  }
}

// GOOD
export function counterMove(userId: string, counterCard: Card, game: Game) {
  try {
    // Validate if user is defender
    const defenderPlayer = fetchPlayer(game, userId);
    if (!defenderPlayer) throw new Error("counterMove(): Player not found!");
    if (defenderPlayer.role !== "Defender")
      throw new Error("counterMove(): Player is NOT Defender!");

    // Validate if defender is able to counter:
    // 1. Game.gameState is not set to "Defending"
    // 2. Any element in game.playedCards does NOT contain a defendingCard
    if (game.gameState === "Defending")
      throw new Error("counterMove(): Game state set to 'Defending'");
    game.playedCards.forEach((p) => {
      if (p.defendingCard)
        throw new Error(
          "counterMove(): Player has already defended! Counter is invalid."
        );
    });

    // Update game
    // 1. Set defenderPlayer's next player role to "Defender"
    // 2. Set defenderPlayer role to "Attacker"
    // 3. Add counterCard to playedCards as attackingCard
    const nextPlayerUserId = defenderPlayer.nextPlayerUserId;
    const defPlayerNextPlayer = fetchPlayer(game, nextPlayerUserId);
    if (!defPlayerNextPlayer) throw new Error("Cannot fetch next player!");
    defPlayerNextPlayer.role = "Defender";
    defenderPlayer.role = "Attacker";
    game.playedCards.push({
      attackingCard: counterCard,
      defendingCard: null,
      id: counterCard.id,
    });

    // Check if defenderPlayer finshed in the game / game ended
    if (hasPlayerFinishedGame(defenderPlayer, game)) {
      const { gameEnded } = moveToWinnersList(defenderPlayer, game);
      gameEnded && endGame(game);
    }

    return {
      success: true,
      game,
      error: null,
      message:
        "Counter: " + formatPlayerDealsCardMessage(defenderPlayer, counterCard),
    };
  } catch (error: any) {
    return { success: false, game: null, error: error, message: null };
  }
}

// GOOD
export function yieldTurn(userId: string, game: Game) {
  try {
    // Validate if user is defender
    const defenderPlayer = fetchPlayer(game, userId);
    if (!defenderPlayer) throw new Error("yieldTurn(): Player not found!");
    if (defenderPlayer.role !== "Defender")
      throw new Error("yieldTurn(): Player is NOT Defender!");

    // Update game (END TURN)
    // 1. Give all playedCards to defender
    // 2. Have ALL players draw till 6 cards
    // 3. Set defender's nextPlayer to FirstAttacker
    // 4. Set firstAttacker's nextPlayer to Defender
    // 5. End turn: Set game's gameState to "FirstMove"
    game.playedCards.forEach((p) => {
      defenderPlayer.hand.push(p.attackingCard);
      p.defendingCard && defenderPlayer.hand.push(p.defendingCard);
    });
    game.playedCards = [];

    dealCardsToPlayers(game);

    const firstAttacker = assignPlayerRoles(game, defenderPlayer.nextPlayerUserId);
    if (!firstAttacker) throw new Error("yieldTurn(): Players' roles were not reassigned")

    game.turn += 1;
    game.gameState = "FirstMove";

    return {
      success: true,
      game,
      error: null,
      message: `Defender ${defenderPlayer.user.username} yielded! Next turn: ${firstAttacker.user.username} has the first move...`,
    };
  } catch (error: any) {
    console.error(error)
    return { success: false, game: null, error: error, message: null };
  }
}

// Utility functions
function fetchPlayer(game: Game, userId: string) {
  const player = game.players.find((p) => p.user.account_id === userId);
  return player;
}

function updateHand(player: Player, card: Card) {
  console.log("Player hand count (before): ", player.hand.length);
  player.hand = player.hand.filter((c) => c.id !== card.id);
  console.log("Player hand count (after): ", player.hand.length);
  return player.hand;
}

function arePlayedCardsFilled(playedCards: PlayedCards[]) {
  playedCards.forEach((p) => {
    if (!p.defendingCard) return false;
  });
  return true;
}

function hasPlayerFinishedGame(player: Player, game: Game) {
  return player.hand.length === 0 && game.deck.length === 0;
}

function moveToWinnersList(finishedPlayer: Player, game: Game) {
  game.winners.push(finishedPlayer);
  game.players = game.players.filter((p) => p !== finishedPlayer);

  // If one player remains, the game has ENDED
  if (game.players.length === 1) {
    return { gameEnded: true };
  }

  // Else, reorder players in list and update each's nextPlayerUserId
  game.players.forEach((p, index) => {
    const nextPlayerIndex = (index + 1) % game.players.length;
    const nextPlayer = game.players[nextPlayerIndex];
    p.nextPlayerUserId = nextPlayer!.user.account_id;
  });

  return { gameEnded: false };
}

function endGame(game: Game) {
  game.gameState = "Ended";
  return game;
}

function doesDefCardDefend(
  defCard: Card,
  playedCards: PlayedCards,
  tsarCard: Card
) {
  // Base cases :
  // - cardPair contains defendingCard -> NOT VALID
  // - defCard suit === tsarCard suit AND cardPair attackingCard !== tsarCard suit -> VALID
  // - defCard suit === cardPair attackingCard suit AND defCard value > attackingCard value -> VALID

  if (playedCards.defendingCard) return false;
  const atkCard = playedCards.attackingCard;

  // Def card suit matching tsarCard suit and not the pair's atk card will pass the defence auto
  if (defCard.suit === tsarCard.suit && atkCard.suit !== tsarCard.suit) {
    // DEFENCE VALID
    return true;
  }

  if (defCard.suit === atkCard.suit && defCard.rank > atkCard.rank) {
    // DEFENCE VALID
    return true;
  }

  return false;
}

function dealCardsToPlayers(game: Game) {
  const players = game.players;
  // Have player who has initially First Attacker draw from deck till they have 6 cards
  const startTurnFirstAttacker = players.find(
    (p) => p.startTurnRole === "FirstAttacker"
  );
  if (!startTurnFirstAttacker) return;
  let deckSliceOffset = Math.max(6 - startTurnFirstAttacker.hand.length, 0);
  startTurnFirstAttacker.hand = startTurnFirstAttacker.hand.concat(
    game.deck.slice(0, deckSliceOffset)
  );
  game.deck = game.deck.slice(deckSliceOffset);

  // Then, have current Attackers draw from deck till they have 6 cards
  game.players.forEach((p) => {
    if (p.role === "Attacker") {
      deckSliceOffset = Math.max(6 - p.hand.length, 0);
      p.hand = p.hand.concat(game.deck.slice(0, deckSliceOffset));
      game.deck = game.deck.slice(deckSliceOffset);
    }
  });

  // Finally, have current Defender draw till 6 cards
  const defenderPlayer = players.find((p) => p.role === "Defender");
  if (!defenderPlayer) return;
  deckSliceOffset = Math.max(6 - defenderPlayer.hand.length, 0);
  defenderPlayer.hand = defenderPlayer.hand.concat(
    game.deck.slice(0, deckSliceOffset)
  );
  game.deck = game.deck.slice(deckSliceOffset);
}

function formatPlayerDealsCardMessage(player: Player, card: Card) {
  return `${player.user.username} deals the ${card.value} of ${card.suit}`;
}

function assignPlayerRoles(game: Game, firstAttackerUserId: string) {
  let firstAttackerIndex = game.players.findIndex(
    (p) => p.user.account_id === firstAttackerUserId
  );
  if (firstAttackerIndex === -1) return false;
  const defenderIndex = (firstAttackerIndex + 1) % game.players.length;

  let firstAttacker: Player
  game.players.forEach((player, index) => {
    if (index === firstAttackerIndex) {
      firstAttacker = player
      player.startTurnRole = "FirstAttacker";
      player.role = "FirstAttacker";
    } else if (index === defenderIndex) {
      player.startTurnRole = "Defender";
      player.role = "Defender";
    } else {
      player.startTurnRole = "Attacker";
      player.role = "Attacker";
    }
  });

  return firstAttacker! ? firstAttacker : false
}
