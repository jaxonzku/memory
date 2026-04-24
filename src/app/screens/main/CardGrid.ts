// src/app/screens/main/CardGrid.ts

import { Container } from "pixi.js";
import { Card } from "./Card";
import { engine } from "../../getEngine";

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
const IMAGE_PATHS = [
  "assets/preload/coookie_man.svg",
  "assets/preload/cup_cake.svg",
  "assets/preload/gift_pack.svg",
  "assets/preload/hang_socks.svg",
  "assets/preload/head_phone.svg",
  "assets/preload/pop_cone.svg",
  "assets/preload/shiny_ball.svg",
  "assets/preload/snow_man.svg",
  "assets/preload/xmas_bell.svg",
  "assets/preload/xmas_cards.svg",
  "assets/preload/xmas_hat.svg",
  "assets/preload/xmas_home.svg",
  "assets/preload/xmas_papa.svg",
  "assets/preload/xmas_tree.svg",
];

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export class CardGrid extends Container {
  private onTurnEnd?: (result: TurnResult) => void;
  private cards: Card[] = [];
  private selected: Card[] = [];
  private currentPlayer: Player = Player.Blue;
  private busy = false;

  constructor(
    pairs = 18,
    _cols = 6,
    _gap = 400,
    onTurnEnd?: (result: TurnResult) => void,
  ) {
    super();
    void _cols;
    void _gap;
    this.onTurnEnd = onTurnEnd;

    // create shuffled deck
    const ids = Array.from({ length: pairs }, (_, i) => i);
    const deck = shuffle([...ids, ...ids]);

    deck.forEach((id, index) => {
      const imagePath = IMAGE_PATHS[id];
      const card = new Card(100, imagePath, false);
      const rotationDeg = STATIC_ROTATIONS[index % STATIC_ROTATIONS.length];
      card.rotation = rotationDeg * (Math.PI / 180);
      card.id = id;
      card.setDebugInfo(id);
      card.eventMode = "static";
      card.cursor = "pointer";

      card.on("pointerdown", () => this.onCardClick(card));

      this.cards.push(card);
      this.addChild(card);
    });
    const ROW_LAYOUT = [3, 4, 4, 4, 4, 3];
    const CARD_SIZE = 80;
    const GAP = 50;
    const SIDE_COUNT = 3;
    const SIDE_OFFSET_X = 320;

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
        card.baseX = card.x; // ✅ ADD THIS

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
      card.baseX = card.x; // ✅ ADD THIS
      cardIndex++;
    }

    // RIGHT
    for (let i = 0; i < SIDE_COUNT; i++) {
      const card = this.cards[cardIndex];
      if (!card) break;

      card.x = SIDE_OFFSET_X;
      card.y = sideStartY + i * (CARD_SIZE + GAP);
      card.baseX = card.x; // ✅ ADD THIS
      cardIndex++;
    }
  }

  private onCardClick(card: Card) {
    if (this.busy) return;
    if (card.flipped || card.removed) return;

    engine().audio.sfx.play("main/sounds/card-flip.mp3");
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

    if (a.id === b.id) {
      engine().audio.sfx.play("main/sounds/score.mp3");
      a.animateRemove();
      b.animateRemove();
      this.onTurnEnd?.({ player, matched: true });
      // same player continues
    } else {
      engine().audio.sfx.play("main/sounds/wrong.mp3");
      a.shake();
      b.shake();

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
