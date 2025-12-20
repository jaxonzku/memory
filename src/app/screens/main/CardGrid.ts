// src/app/screens/main/CardGrid.ts

import { Container } from "pixi.js";
import { Card } from "./Card";

const STATIC_ROTATIONS = [
  -8, -4, 3, 7, -6, 2, 6, -3, 4, -7, 1, 5, -5, 8, -2, 3, 6, -4, 7, -6,
];

type TurnResult = {
  player: "blue" | "red";
  matched: boolean;
};

enum Player {
  Blue,
  Red,
}

function generateColor(id: number) {
  const hue = (id * 137.508) % 360;
  return hslToHex(hue, 70, 60);
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  return (
    (Math.round(255 * f(0)) << 16) |
    (Math.round(255 * f(8)) << 8) |
    Math.round(255 * f(4))
  );
}

export class CardGrid extends Container {
  private onTurnEnd?: (result: TurnResult) => void;
  private cards: Card[] = [];
  private selected: Card[] = [];
  private currentPlayer: Player = Player.Blue;
  private busy = false;

  constructor(
    pairs = 18,
    cols = 6,
    gap = 100,
    onTurnEnd?: (result: TurnResult) => void
  ) {
    super();
    this.onTurnEnd = onTurnEnd;

    // create shuffled deck
    const ids = Array.from({ length: pairs }, (_, i) => i);
    const deck = [...ids, ...ids].sort(() => Math.random() - 0.5);

    deck.forEach((id, index) => {
      const color = generateColor(id);

      const card = new Card(80, color, true);
      const rotationDeg = STATIC_ROTATIONS[index % STATIC_ROTATIONS.length];
      card.rotation = rotationDeg * (Math.PI / 180);
      card.id = id;
      card.setDebugInfo(id);
      const row = Math.floor(index / cols);
      const col = index % cols;

      card.x = col * gap;
      card.y = row * gap;
      card.eventMode = "static";
      card.cursor = "pointer";

      card.on("pointerdown", () => this.onCardClick(card));

      this.cards.push(card);
      this.addChild(card);
    });
    const ROW_LAYOUT = [3, 4, 4, 4, 4, 3];
    const CARD_SIZE = 80;
    const GAP = 30;
    const SIDE_COUNT = 3;
    const SIDE_OFFSET_X = 270;

    // Total height of center block
    const totalRows = ROW_LAYOUT.length;
    const totalHeight = totalRows * CARD_SIZE + (totalRows - 1) * GAP;

    // Because cards are CENTER-ANCHORed
    const startY = -totalHeight / 2 + CARD_SIZE / 2;

    let cardIndex = 0;

    // -------- CENTER BLOCK --------
    ROW_LAYOUT.forEach((count, row) => {
      const rowWidth = count * CARD_SIZE + (count - 1) * GAP;

      // center-based X
      const startX = -rowWidth / 2 + CARD_SIZE / 2;

      for (let i = 0; i < count; i++) {
        const card = this.cards[cardIndex];
        if (!card) return;

        card.x = startX + i * (CARD_SIZE + GAP);
        card.y = startY + row * (CARD_SIZE + GAP);

        cardIndex++;
      }
    });

    // -------- SIDE COLUMNS --------
    const sideTotalHeight = SIDE_COUNT * CARD_SIZE + (SIDE_COUNT - 1) * GAP;

    const sideStartY = -sideTotalHeight / 2 + CARD_SIZE / 2;

    // LEFT
    for (let i = 0; i < SIDE_COUNT; i++) {
      const card = this.cards[cardIndex];
      if (!card) break;

      card.x = -SIDE_OFFSET_X;
      card.y = sideStartY + i * (CARD_SIZE + GAP);

      cardIndex++;
    }

    // RIGHT
    for (let i = 0; i < SIDE_COUNT; i++) {
      const card = this.cards[cardIndex];
      if (!card) break;

      card.x = SIDE_OFFSET_X;
      card.y = sideStartY + i * (CARD_SIZE + GAP);

      cardIndex++;
    }
  }

  private onCardClick(card: Card) {
    if (this.busy) return;
    if (card.flipped || card.removed) return;

    card.reveal();
    this.selected.push(card);

    if (this.selected.length === 2) {
      this.busy = true;
      setTimeout(() => this.checkMatch(), 700);
    }
  }

  private checkMatch() {
    const [a, b] = this.selected;
    const player = this.currentPlayer === Player.Blue ? "blue" : "red";
    console.log("CHECK MATCH");
    console.log("Current player:", player);
    console.log("Card A id:", a.id);
    console.log("Card B id:", b.id);

    if (a.id === b.id) {
      console.log("MATCH ✅");

      a.remove();
      b.remove();
      this.onTurnEnd?.({ player, matched: true });
      // same player continues
    } else {
      console.log("NO MATCH ❌");

      a.hide();
      b.hide();
      this.onTurnEnd?.({ player, matched: false });
      this.switchPlayer();
    }

    this.selected = [];
    this.busy = false;
  }

  private switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === Player.Blue ? Player.Red : Player.Blue;
  }
}
