// src/app/screens/main/CardGrid.ts

import { Container } from "pixi.js";
import { Card } from "./Card";
import { engine } from "../../getEngine";
import type { GameMode } from "../../gameMode";
import { waitFor } from "../../../engine/utils/waitFor";

const STATIC_ROTATIONS = [
  -8, -4, 3, 7, -6, 2, 6, -3, 4, -7, 1, 5, -5, 8, -2, 3, 6, -4, 7, -6,
];

type TurnResult = {
  player: "blue" | "red";
  matched: boolean;
  nextPlayer: "blue" | "red";
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
  private static readonly AI_KNOWN_PAIR_CHANCE = 0.45;
  private static readonly AI_SECOND_FLIP_MEMORY_CHANCE = 0.7;
  private static readonly AI_MEMORY_RETENTION_CHANCE = 0.75;

  private onTurnEnd?: (result: TurnResult) => void;
  private cards: Card[] = [];
  private selected: Card[] = [];
  private currentPlayer: Player = Player.Blue;
  private gameMode: GameMode;
  private rememberedCards = new Map<number, Set<Card>>();
  private bonusTurnPlayer: Player | null = null;
  private busy = false;

  constructor(
    pairs = 18,
    _cols = 6,
    _gap = 400,
    gameMode: GameMode = "two-player",
    onTurnEnd?: (result: TurnResult) => void,
  ) {
    super();
    void _cols;
    void _gap;
    this.gameMode = gameMode;
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
    if (
      this.gameMode === "single-player" &&
      this.currentPlayer === Player.Red
    ) {
      return;
    }
    if (card.flipped || card.removed) return;

    this.flipCard(card);
  }

  public canStartAutoFlip(player: TurnResult["player"]) {
    if (this.busy || this.selected.length > 0) return false;

    const currentTurnPlayer =
      this.currentPlayer === Player.Blue ? "blue" : "red";
    return currentTurnPlayer === player && this.getAvailableCards().length >= 2;
  }

  public async startAutoFlip(player: TurnResult["player"]) {
    if (!this.canStartAutoFlip(player)) return false;

    this.bonusTurnPlayer = player === "blue" ? Player.Blue : Player.Red;
    this.currentPlayer = this.bonusTurnPlayer;
    this.busy = true;

    await waitFor(0.35);

    for (let i = 0; i < 2; i++) {
      const card = this.pickRandomCard(this.getAvailableCards());
      if (!card) {
        this.busy = false;
        this.bonusTurnPlayer = null;
        return false;
      }

      this.flipCard(card);

      if (i === 0) {
        await waitFor(0.55);
      }
    }

    return true;
  }

  private flipCard(card: Card) {
    engine().audio.sfx.play("main/sounds/card-flip.mp3");
    card.reveal();
    this.rememberCard(card);
    this.selected.push(card);

    if (this.selected.length === 2) {
      this.busy = true;
      window.setTimeout(() => this.checkMatch(), 700);
    }
  }

  private checkMatch() {
    const [a, b] = this.selected;
    const player: TurnResult["player"] =
      this.currentPlayer === Player.Blue ? "blue" : "red";
    const matched = a.id === b.id;
    let nextPlayer: TurnResult["nextPlayer"] = player;
    const isBonusTurn = this.bonusTurnPlayer !== null;

    if (matched) {
      engine().audio.sfx.play("main/sounds/score.mp3");
      a.animateRemove();
      b.animateRemove();
      this.forgetCardId(a.id);
    } else {
      engine().audio.sfx.play("main/sounds/wrong.mp3");
      a.shake();
      b.shake();

      a.hide();
      b.hide();
    }

    if (isBonusTurn) {
      this.currentPlayer =
        this.bonusTurnPlayer === Player.Blue ? Player.Red : Player.Blue;
      nextPlayer = this.currentPlayer === Player.Blue ? "blue" : "red";
      this.bonusTurnPlayer = null;
    } else if (!matched) {
      this.switchPlayer();
      nextPlayer = this.currentPlayer === Player.Blue ? "blue" : "red";
    }

    this.selected = [];
    this.busy = false;
    this.onTurnEnd?.({ player, matched, nextPlayer });

    if (this.gameMode === "single-player" && nextPlayer === "red") {
      void this.startComputerTurn();
    }
  }

  private switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === Player.Blue ? Player.Red : Player.Blue;
  }

  private rememberCard(card: Card) {
    if (
      this.gameMode === "single-player" &&
      this.currentPlayer === Player.Red &&
      Math.random() > CardGrid.AI_MEMORY_RETENTION_CHANCE
    ) {
      return;
    }

    const knownCards = this.rememberedCards.get(card.id) ?? new Set<Card>();
    knownCards.add(card);
    this.rememberedCards.set(card.id, knownCards);
  }

  private forgetCardId(id: number) {
    this.rememberedCards.delete(id);
  }

  private getAvailableCards(excluded: Card[] = []) {
    return this.cards.filter(
      (card) =>
        !card.removed &&
        !card.flipped &&
        !excluded.includes(card) &&
        !this.selected.includes(card),
    );
  }

  private getUnknownCards(excluded: Card[] = []) {
    return this.getAvailableCards(excluded).filter(
      (card) => !this.rememberedCards.get(card.id)?.has(card),
    );
  }

  private pickRandomCard(cards: Card[]) {
    if (cards.length === 0) return null;
    const index = Math.floor(Math.random() * cards.length);
    return cards[index] ?? null;
  }

  private getKnownMatchFor(card: Card) {
    const matches = [...(this.rememberedCards.get(card.id) ?? [])].filter(
      (knownCard) =>
        knownCard !== card &&
        !knownCard.removed &&
        !knownCard.flipped &&
        !this.selected.includes(knownCard),
    );

    return matches[0] ?? null;
  }

  private getKnownPairStart() {
    for (const knownCards of this.rememberedCards.values()) {
      const availableCards = [...knownCards].filter(
        (card) =>
          !card.removed && !card.flipped && !this.selected.includes(card),
      );

      if (availableCards.length >= 2) {
        return availableCards[0] ?? null;
      }
    }

    return null;
  }

  private chooseComputerCard() {
    if (this.selected.length === 1) {
      const knownMatch = this.getKnownMatchFor(this.selected[0]);
      if (knownMatch && Math.random() < CardGrid.AI_SECOND_FLIP_MEMORY_CHANCE) {
        return knownMatch;
      }

      return (
        this.pickRandomCard(this.getUnknownCards(this.selected)) ??
        this.pickRandomCard(this.getAvailableCards(this.selected))
      );
    }

    const knownPairStart = this.getKnownPairStart();
    if (knownPairStart && Math.random() < CardGrid.AI_KNOWN_PAIR_CHANCE) {
      return knownPairStart;
    }

    return (
      this.pickRandomCard(this.getUnknownCards()) ??
      this.pickRandomCard(this.getAvailableCards())
    );
  }

  private async startComputerTurn() {
    if (this.busy || this.currentPlayer !== Player.Red) return;

    this.busy = true;
    await waitFor(0.6);

    while (this.currentPlayer === Player.Red && this.selected.length < 2) {
      const card = this.chooseComputerCard();
      if (!card) {
        this.busy = false;
        return;
      }

      this.flipCard(card);
      await waitFor(0.75);
    }
  }
}
