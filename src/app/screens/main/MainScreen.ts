// src/app/screens/main/MainScreen.ts

import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { CardGrid } from "./CardGrid";
import { getGameMode, isSinglePlayerMode } from "../../gameMode";
import { engine } from "../../getEngine";
import { GameOverPopup } from "../../popups/GameOverPopup";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { gsap } from "gsap";
import {
  Container,
  Text,
  Sprite,
  Texture,
  Graphics,
  Rectangle,
  Assets,
} from "pixi.js";
import { AppColors } from "../../theme/colors";
import { AnimatedBackground } from "../../ui/AnimatedBackground";
import { Label } from "../../ui/Label";

/** The screen that holds the app */
export class MainScreen extends Container {
  public static assetBundles = ["main"];
  private static readonly TOTAL_PAIRS = 14;
  public mainContainer: Container;
  private grid!: CardGrid;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private blueScore = 0;
  private redScore = 0;
  // private turnText!: Text;
  private paused = false;
  private bgShapes: AnimatedBackground;
  private bgBlue!: Sprite;
  private bgRed!: Sprite;
  private blueScorePill!: Container;
  private redScorePill!: Container;
  private blueScoreLabel!: Text;
  private redScoreLabel!: Text;
  private gameOver = false;
  private blueTurnPill!: Container;
  private redTurnPill!: Container;
  private blueFreeFlip: FancyButton;
  private redFreeFlip: FancyButton;
  private freeFlipTooltip!: Container;
  private blueFlipUsed = false;
  private redFlipUsed = false;
  private bonusAdPending = false;
  private readonly gameMode = getGameMode();

  private createTurnPill(
    bgColor: number,
    text: string,
    side: "left" | "right",
  ): { container: Container; label: Text } {
    const container = new Container();
    const bg = new Graphics();

    const RADIUS = 170;
    const SIZE = RADIUS * 2;
    const TEXT_OFFSET = RADIUS * 0.4;

    // fix bounds
    container.hitArea = new Rectangle(0, 0, SIZE, SIZE);

    if (side === "left") {
      // TOP-LEFT quarter (faces inward)
      bg.beginFill(bgColor);
      bg.moveTo(0, 0);
      bg.arc(0, 0, RADIUS, 0, Math.PI / 2);
      bg.lineTo(0, 0);
      bg.endFill();
    } else {
      // TOP-RIGHT quarter (faces inward)
      bg.beginFill(bgColor);
      bg.moveTo(SIZE, 0);
      bg.arc(SIZE, 0, RADIUS, Math.PI / 2, Math.PI);
      bg.lineTo(SIZE, 0);
      bg.endFill();
    }

    const label = new Text({
      text,
      style: {
        fill: 0xffffff,
        fontSize: 22, // ⬅️ fits now
        fontWeight: "bold",
        fontFamily: "Arial Rounded MT Bold",
      },
    });

    label.anchor.set(0.5);

    if (side === "left") {
      label.x = TEXT_OFFSET;
      label.y = TEXT_OFFSET;
    } else {
      label.x = SIZE - TEXT_OFFSET;
      label.y = TEXT_OFFSET;
    }

    container.addChild(bg, label);
    container.visible = false;

    return { container, label };
  }
  private createScorePill(
    bgColor: number,
    textColor: number,
    side: "left" | "right",
  ): { container: Container; label: Text } {
    const container = new Container();
    const bg = new Graphics();

    const RADIUS = 170;
    const SIZE = RADIUS * 2;

    // IMPORTANT: force container bounds
    container.hitArea = new Rectangle(0, 0, SIZE, SIZE);
    if (side === "left") {
      bg.beginFill(bgColor);
      bg.moveTo(0, SIZE);
      bg.arc(0, SIZE, RADIUS, Math.PI * 1.5, Math.PI * 2);
      bg.lineTo(0, SIZE);
      bg.endFill();
      // bg.stroke({ width: 5, color: AppColors.panelBase });
    } else {
      bg.beginFill(bgColor);
      bg.moveTo(SIZE, SIZE);
      bg.arc(SIZE, SIZE, RADIUS, Math.PI, Math.PI * 1.5);
      bg.lineTo(SIZE, SIZE);
      bg.endFill();
      // bg.stroke({ width: 5, color: AppColors.panelBase });
    }

    const label = new Text({
      text: "0",

      style: {
        fill: textColor,
        fontSize: 45,
        fontWeight: "bold",
        fontFamily: "Arial Rounded MT Bold",
      },
    });

    label.anchor.set(0.5);

    const TEXT_OFFSET = RADIUS * 0.45;
    if (side === "left") {
      // bottom-left quarter
      label.x = TEXT_OFFSET;
      label.y = SIZE - TEXT_OFFSET;
    } else {
      // bottom-right quarter
      label.x = SIZE - TEXT_OFFSET;
      label.y = SIZE - TEXT_OFFSET;
    }

    container.addChild(bg, label);
    return { container, label };
  }

  private createFreeFlipTooltip() {
    const container = new Container();
    const bg = new Graphics();
    const label = new Label({
      text: "Watch an ad to auto-flip 2 cards.",
      style: {
        fill: 0xffffff,
        fontSize: 18,
      },
    });

    const paddingX = 22;
    const paddingY = 14;
    const bounds = label.getLocalBounds();
    const width = bounds.width + paddingX * 2;
    const height = bounds.height + paddingY * 2;

    bg.roundRect(-width / 2, -height / 2, width, height, 18)
      .fill({ color: 0x126a9b, alpha: 0.96 })
      .stroke({ width: 3, color: 0xffffff, alpha: 0.95 });

    container.visible = false;
    container.alpha = 0;
    container.addChild(bg, label);

    return { container, bg, label };
  }

  constructor() {
    super();
    this.bgBlue = new Sprite(Texture.WHITE);
    this.bgBlue.tint = AppColors.playerBlueBackground;
    this.bgBlue.alpha = 1;

    this.bgRed = new Sprite(Texture.WHITE);
    this.bgRed.tint = AppColors.playerRedBackground;
    this.bgRed.alpha = 0;

    this.addChild(this.bgBlue);
    this.addChild(this.bgRed);

    this.bgShapes = new AnimatedBackground({
      showBase: false,
      shapeAlpha: 0.12,
    });
    this.bgShapes.alpha = 1;
    this.addChild(this.bgShapes);

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // CARD GRID
    this.grid = new CardGrid(
      MainScreen.TOTAL_PAIRS,
      4,
      100,
      this.gameMode,
      ({ player, matched, nextPlayer }) => {
        if (this.gameOver) return;

        // update score
        if (matched) {
          if (player === "blue") {
            gsap.fromTo(
              this.blueScorePill.scale,
              { x: 1, y: 1 },
              { x: 1.15, y: 1.15, duration: 0.15, yoyo: true, repeat: 1 },
            );
            this.blueScore++;
            this.blueScoreLabel.text = String(this.blueScore);
          } else {
            gsap.fromTo(
              this.redScorePill.scale,
              { x: 1, y: 1 },
              { x: 1.15, y: 1.15, duration: 0.15, yoyo: true, repeat: 1 },
            );
            this.redScore++;
            this.redScoreLabel.text = String(this.redScore);
          }
        }

        // Game over when all pairs are found.
        if (this.blueScore + this.redScore >= MainScreen.TOTAL_PAIRS) {
          this.endGame();
          return;
        }

        // determine current turn AFTER move
        this.updateTurnDisplay(nextPlayer);
      },
    );
    const blueTurn = this.createTurnPill(
      AppColors.turnBlue,
      isSinglePlayerMode() ? "Your Turn" : "Blue's Turn",
      "left",
    );
    this.blueTurnPill = blueTurn.container;
    this.addChild(this.blueTurnPill);

    // Red → TOP-RIGHT
    const redTurn = this.createTurnPill(
      AppColors.turnRed,
      "Red's Turn",
      "right",
    );
    this.redTurnPill = redTurn.container;
    this.addChild(this.redTurnPill);

    // Blue starts
    this.updateTurnDisplay("blue", false);

    const blue = this.createScorePill(AppColors.turnBlue, 0xffffff, "left");
    this.blueScorePill = blue.container;
    this.blueScoreLabel = blue.label;
    this.addChild(this.blueScorePill);

    const red = this.createScorePill(AppColors.turnRed, 0xffffff, "right");
    this.redScorePill = red.container;
    this.redScoreLabel = red.label;
    this.addChild(this.redScorePill);

    // this.turnText = new Text({
    //   text: "Turn: Blue",
    //   style: { fill: AppColors.turnBlue, fontSize: 26, fontWeight: "bold" },
    // });
    // this.addChild(this.turnText);

    const bounds = this.grid.getLocalBounds();
    this.grid.pivot.set(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
    );
    this.mainContainer.addChild(this.grid);

    // BUTTON ANIMATIONS
    const buttonAnimations = {
      hover: {
        props: { scale: { x: 1.1, y: 1.1 } },
        duration: 100,
      },
      pressed: {
        props: { scale: { x: 0.9, y: 0.9 } },
        duration: 100,
      },
    };

    // PAUSE BUTTON
    this.pauseButton = new FancyButton({
      defaultView: "icon-pause.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.pauseButton.scale.set(1.7);

    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup),
    );
    this.addChild(this.pauseButton);

    // SETTINGS BUTTON
    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.scale.set(1.7);
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.addChild(this.settingsButton);

    this.blueFreeFlip = new FancyButton({
      defaultView: "blueFlipIcon.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.blueFreeFlip.onPress.connect(() => {
      void this.handleRewardedAutoFlip("blue");
    });
    this.addChild(this.blueFreeFlip);
    this.blueFreeFlip.alpha = isSinglePlayerMode() ? 0 : 1;
    this.blueFreeFlip.visible = !isSinglePlayerMode();
    this.blueFreeFlip.scale.set(0.15);
    const blueBg = new Graphics();
    blueBg.beginFill(0xffffff);
    blueBg.drawCircle(0, 0, this.blueFreeFlip.width * 2.5);
    blueBg.endFill();
    this.blueFreeFlip.addChildAt(blueBg, 0);
    this.blueFreeFlip.onHover.connect(() => {
      this.showFreeFlipTooltip(this.blueFreeFlip);
    });
    this.blueFreeFlip.onOut.connect(() => {
      this.hideFreeFlipTooltip();
    });

    this.redFreeFlip = new FancyButton({
      defaultView: "redFlipIcon.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.redFreeFlip.onPress.connect(() => {
      void this.handleRewardedAutoFlip("red");
    });
    this.addChild(this.redFreeFlip);
    this.redFreeFlip.alpha = isSinglePlayerMode() ? 0 : 1;
    this.redFreeFlip.visible = !isSinglePlayerMode();
    this.redFreeFlip.scale.set(0.15);
    const redBg = new Graphics();
    redBg.beginFill(0xffffff);
    redBg.drawCircle(0, 0, this.redFreeFlip.width * 2.5);
    redBg.endFill();
    this.redFreeFlip.addChildAt(redBg, 0);
    this.redFreeFlip.onHover.connect(() => {
      this.showFreeFlipTooltip(this.redFreeFlip);
    });
    this.redFreeFlip.onOut.connect(() => {
      this.hideFreeFlipTooltip();
    });

    const tooltip = this.createFreeFlipTooltip();
    this.freeFlipTooltip = tooltip.container;
    this.addChild(this.freeFlipTooltip);
  }

  private showFreeFlipTooltip(button: FancyButton) {
    if (isSinglePlayerMode() || !button.visible) return;

    this.freeFlipTooltip.x = button.x;
    this.freeFlipTooltip.y = button.y + button.height * 0.9;
    this.freeFlipTooltip.visible = true;
    gsap.killTweensOf(this.freeFlipTooltip);
    gsap.to(this.freeFlipTooltip, {
      alpha: 1,
      duration: 0.16,
      ease: "power2.out",
    });
  }

  private hideFreeFlipTooltip() {
    gsap.killTweensOf(this.freeFlipTooltip);
    gsap.to(this.freeFlipTooltip, {
      alpha: 0,
      duration: 0.14,
      ease: "power2.out",
      onComplete: () => {
        this.freeFlipTooltip.visible = false;
      },
    });
  }

  private async handleRewardedAutoFlip(player: "blue" | "red") {
    if (
      isSinglePlayerMode() ||
      this.gameOver ||
      this.paused ||
      this.bonusAdPending
    ) {
      return;
    }

    const alreadyUsed =
      player === "blue" ? this.blueFlipUsed : this.redFlipUsed;
    if (alreadyUsed || !this.grid.canStartAutoFlip(player)) return;

    this.bonusAdPending = true;

    try {
      if (typeof PokiSDK === "undefined") return;

      const success = await PokiSDK.rewardedBreak();
      if (!success) return;

      if (player === "blue") {
        this.blueFlipUsed = true;
        this.blueFreeFlip.visible = false;
      } else {
        this.redFlipUsed = true;
        this.redFreeFlip.visible = false;
      }

      await this.grid.startAutoFlip(player);
    } finally {
      this.bonusAdPending = false;
    }
  }

  private endGame() {
    this.gameOver = true;
    this.mainContainer.interactiveChildren = false;

    const winner =
      this.blueScore === this.redScore
        ? "Tie"
        : this.blueScore > this.redScore
          ? isSinglePlayerMode()
            ? "You"
            : "Blue"
          : "Red";

    GameOverPopup.setResult({
      winner,
      blueScore: this.blueScore,
      redScore: this.redScore,
      singlePlayer: isSinglePlayerMode(),
    });
    void engine().navigation.presentPopup(GameOverPopup);
  }

  private updateTurnDisplay(currentTurn: "blue" | "red", animateTurn = true) {
    const isBlueTurn = currentTurn === "blue";

    this.blueTurnPill.visible = isBlueTurn;
    this.redTurnPill.visible = !isBlueTurn;

    const pill = isBlueTurn ? this.blueTurnPill : this.redTurnPill;
    const baseX = isBlueTurn ? 0 : this.redTurnPill.x;

    gsap.killTweensOf([
      this.bgBlue,
      this.bgRed,
      this.blueTurnPill,
      this.redTurnPill,
    ]);

    pill.alpha = 1;
    pill.x = baseX;

    if (animateTurn) {
      gsap.fromTo(
        pill,
        { alpha: 0, x: baseX - 30 },
        { alpha: 1, x: baseX, duration: 0.3, ease: "power2.out" },
      );
    }

    if (isBlueTurn) {
      gsap.to(this.bgBlue, { alpha: 1, duration: 0.4, ease: "sine.out" });
      gsap.to(this.bgRed, { alpha: 0, duration: 0.4, ease: "sine.out" });
    } else {
      gsap.to(this.bgBlue, { alpha: 0, duration: 0.4, ease: "sine.out" });
      gsap.to(this.bgRed, { alpha: 1, duration: 0.4, ease: "sine.out" });
    }
  }

  public prepare() {}

  public update(_time: Ticker) {
    void _time;
    if (this.paused) return;
  }

  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
    if (typeof PokiSDK !== "undefined") {
      PokiSDK.gameplayStop();
    }
  }

  public async resume() {
    if (this.gameOver) return;
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
    if (typeof PokiSDK !== "undefined") {
      PokiSDK.gameplayStart();
    }
  }

  public reset() {}

  public resize(width: number, height: number) {
    this.mainContainer.x = width * 0.5;
    this.mainContainer.y = height * 0.5;

    this.bgBlue.width = width;
    this.bgBlue.height = height;

    this.bgRed.width = width;
    this.bgRed.height = height;
    this.bgShapes.resize(width, height);

    const BASE_PILL_SIZE = 340;
    const hudScale = Math.min(1, width / BASE_PILL_SIZE);
    const hudSize = BASE_PILL_SIZE * hudScale;

    this.blueTurnPill.scale.set(hudScale);
    this.redTurnPill.scale.set(hudScale);
    this.blueScorePill.scale.set(hudScale);
    this.redScorePill.scale.set(hudScale);

    const BOTTOM_PADDING = Math.max(16, height * 0.02);
    const BUTTON_GAP = 60;

    // PAUSE button → bottom center (left)
    this.pauseButton.x = width / 2 - BUTTON_GAP;
    this.pauseButton.y =
      height - BOTTOM_PADDING - this.pauseButton.height * 0.5;

    // SETTINGS button → bottom center (right)
    this.settingsButton.x = width / 2 + BUTTON_GAP;
    this.settingsButton.y =
      height - BOTTOM_PADDING - this.settingsButton.height * 0.5;

    // BLUE FREE FLIP button → top center (left)
    this.blueFreeFlip.x = width / 2 - BUTTON_GAP;
    this.blueFreeFlip.y = this.blueFreeFlip.height * 0.5 + BOTTOM_PADDING;

    // RED FREE FLIP button → top center (right)
    this.redFreeFlip.x = width / 2 + BUTTON_GAP;
    this.redFreeFlip.y = this.redFreeFlip.height * 0.5 + BOTTOM_PADDING;

    if (this.freeFlipTooltip.visible) {
      const anchorButton = this.redFreeFlip.visible
        ? this.redFreeFlip
        : this.blueFreeFlip;
      this.freeFlipTooltip.x = anchorButton.x;
      this.freeFlipTooltip.y = anchorButton.y + anchorButton.height * 0.9;
    }

    // TOP-left
    this.blueTurnPill.x = 0;
    this.blueTurnPill.y = 0;

    // TOP-right
    this.redTurnPill.x = width - hudSize;
    this.redTurnPill.y = 0;

    // BLUE – bottom-left
    this.blueScorePill.x = 0;
    this.blueScorePill.y = height - hudSize;

    // RED – bottom-right
    this.redScorePill.x = width - hudSize;
    this.redScorePill.y = height - hudSize;
  }

  public async show(): Promise<void> {
    if (typeof PokiSDK !== "undefined") {
      PokiSDK.gameplayStart();
    }
    await Assets.load([
      "/assets/preload/coookie_man.svg",
      "/assets/preload/cup_cake.svg",
      "/assets/preload/gift_pack.svg",
      "/assets/preload/hang_socks.svg",
      "/assets/preload/head_phone.svg",
      "/assets/preload/pop_cone.svg",
      "/assets/preload/shiny_ball.svg",
      "/assets/preload/snow_man.svg",
      "/assets/preload/xmas_bell.svg",
      "/assets/preload/xmas_cards.svg",
      "/assets/preload/xmas_hat.svg",
      "/assets/preload/xmas_home.svg",
      "/assets/preload/xmas_papa.svg",
      "/assets/preload/xmas_tree.svg",
    ]);

    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const elements = [this.pauseButton, this.settingsButton];
    let finalPromise!: AnimationPlaybackControls;

    for (const el of elements) {
      el.alpha = 0;
      finalPromise = animate(
        el,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" },
      );
    }

    await finalPromise;
  }

  public async hide() {}

  public blur() {
    if (!engine().navigation.currentPopup) {
      engine().navigation.presentPopup(PausePopup);
    }
  }
}
