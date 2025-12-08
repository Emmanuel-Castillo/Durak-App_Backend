import type { Card, CardSuit } from "./game.type.js";

const suits: CardSuit[] = ["hearts", "diamonds", "clubs", "spades"];
export const HIGHEST_RANK = 14
const values = [
  { value: "6", rank: 6 },
  { value: "7", rank: 7 },
  { value: "8", rank: 8 },
  { value: "9", rank: 9 },
  { value: "10", rank: 10 },
  { value: "J", rank: 11 },
  { value: "Q", rank: 12 },
  { value: "K", rank: 13 },
  { value: "A", rank: HIGHEST_RANK },
];

function createDeck()  {
  let deck: Card[] = [];
  for (let suit of suits) {
    for (let val of values) {
      const cardId = val.value + suit
      deck.push({ suit, value: val.value, rank: val.rank, id: cardId });
    }
  }
  return deck;
};

function shuffleDeck(deck: Card[]) {
    let currentIndex = deck.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    const temp = deck[currentIndex]!;
    deck[currentIndex] = deck[randomIndex]!;
    deck[randomIndex] = temp;
  }

  return deck
}

export function createShuffledDeck() {
    const deck = createDeck()
    return shuffleDeck(deck)
}
