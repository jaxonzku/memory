// src/app/screens/main/MainScreen.ts

import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { CardGrid } from "./CardGrid";
import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { gsap } from "gsap";
import { Container, Text, Sprite, Texture, Graphics, Rectangle } from "pixi.js";
const BLUE_BG = 0x7fb7d6; // blue player
const RED_BG = 0xf2a07b; // red player

/** The screen that holds the app */
export class MainScreen extends Container {
  public static assetBundles = ["main"];
  private bg!: Sprite;
  public mainContainer: Container;
  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  private blueScore = 0;
  private redScore = 0;
  private blueScoreText!: Text;
  private redScoreText!: Text;
  // private turnText!: Text;
  private paused = false;
  private bgBlue!: Sprite;
  private bgRed!: Sprite;
  private blueScorePill!: Container;
  private redScorePill!: Container;
  private blueScoreLabel!: Text;
  private redScoreLabel!: Text;
  private blueTurnPill!: Container;
  private redTurnPill!: Container;
  private blueTurnLabel!: Text;
  private redTurnLabel!: Text;

  private alignPillX(
    pill: Container,
    side: "left" | "right",
    screenWidth: number,
    flatBodyWidth: number,
    edgePadding: number
  ) {
    const bounds = pill.getLocalBounds();
    const overhang = bounds.width - flatBodyWidth;

    if (side === "left") {
      pill.x = edgePadding - overhang;
    } else {
      pill.x = screenWidth - flatBodyWidth - edgePadding;
    }
  }
  private createTurnPill(
    bgColor: number,
    text: string,
    side: "left" | "right"
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
    side: "left" | "right"
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
      // bg.stroke({ width: 5, color: "white" });
    } else {
      bg.beginFill(bgColor);
      bg.moveTo(SIZE, SIZE);
      bg.arc(SIZE, SIZE, RADIUS, Math.PI, Math.PI * 1.5);
      bg.lineTo(SIZE, SIZE);
      bg.endFill();
      // bg.stroke({ width: 5, color: "white" });
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

  constructor() {
    super();
    this.bgBlue = new Sprite(Texture.WHITE);
    this.bgBlue.tint = BLUE_BG;
    this.bgBlue.alpha = 1;

    this.bgRed = new Sprite(Texture.WHITE);
    this.bgRed.tint = RED_BG;
    this.bgRed.alpha = 0;

    this.addChild(this.bgBlue);
    this.addChild(this.bgRed);

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // CARD GRID
    const grid = new CardGrid(14, 4, 100, ({ player, matched }) => {
      // update score
      if (matched) {
        if (player === "blue") {
          gsap.fromTo(
            this.blueScorePill.scale,
            { x: 1, y: 1 },
            { x: 1.15, y: 1.15, duration: 0.15, yoyo: true, repeat: 1 }
          );
          this.blueScore++;
          this.blueScoreLabel.text = String(this.blueScore);
        } else {
          gsap.fromTo(
            this.redScorePill.scale,
            { x: 1, y: 1 },
            { x: 1.15, y: 1.15, duration: 0.15, yoyo: true, repeat: 1 }
          );
          this.redScore++;
          this.redScoreLabel.text = String(this.redScore);
        }
      }

      // determine current turn AFTER move
      const isBlueTurn = matched
        ? player === "blue" // same player continues
        : player !== "blue"; // switch player on miss

      // update turn text
      // this.turnText.text = `Turn: ${isBlueTurn ? "Blue" : "Red"}`;
      // this.turnText.style.fill = isBlueTurn ? 0x3b82f6 : 0xef4444;
      this.blueTurnPill.visible = isBlueTurn;
      this.redTurnPill.visible = !isBlueTurn;

      const pill = isBlueTurn ? this.blueTurnPill : this.redTurnPill;

      gsap.fromTo(
        pill,
        { alpha: 0, x: pill.x - 30 },
        { alpha: 1, x: pill.x, duration: 0.3, ease: "power2.out" }
      );

      // update background EVERY turn end]
      gsap.killTweensOf([this.bgBlue, this.bgRed]);

      if (isBlueTurn) {
        gsap.to(this.bgBlue, { alpha: 1, duration: 0.4, ease: "sine.out" });
        gsap.to(this.bgRed, { alpha: 0, duration: 0.4, ease: "sine.out" });
      } else {
        gsap.to(this.bgBlue, { alpha: 0, duration: 0.4, ease: "sine.out" });
        gsap.to(this.bgRed, { alpha: 1, duration: 0.4, ease: "sine.out" });
      }
    });
    const blueTurn = this.createTurnPill(0x3b82f6, "Blue's Turn", "left");
    this.blueTurnPill = blueTurn.container;
    this.blueTurnLabel = blueTurn.label;
    this.addChild(this.blueTurnPill);

    // Red → TOP-RIGHT
    const redTurn = this.createTurnPill(0xef4444, "Red's Turn", "right");
    this.redTurnPill = redTurn.container;
    this.redTurnLabel = redTurn.label;
    this.addChild(this.redTurnPill);

    // Blue starts
    this.blueTurnPill.visible = true;
    this.redTurnPill.visible = false;

    const blue = this.createScorePill(0x3b82f6, 0xffffff, "left");
    this.blueScorePill = blue.container;
    this.blueScoreLabel = blue.label;
    this.addChild(this.blueScorePill);

    const red = this.createScorePill(0xef4444, 0xffffff, "right");
    this.redScorePill = red.container;
    this.redScoreLabel = red.label;
    this.addChild(this.redScorePill);

    // this.turnText = new Text({
    //   text: "Turn: Blue",
    //   style: { fill: 0x3b82f6, fontSize: 26, fontWeight: "bold" },
    // });
    // this.addChild(this.turnText);

    const bounds = grid.getLocalBounds();
    grid.pivot.set(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    this.mainContainer.addChild(grid);

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
    this.pauseButton.onPress.connect(() =>
      engine().navigation.presentPopup(PausePopup)
    );
    this.addChild(this.pauseButton);

    // SETTINGS BUTTON
    this.settingsButton = new FancyButton({
      defaultView: "icon-settings.png",
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup)
    );
    this.addChild(this.settingsButton);
  }

  public prepare() {}

  public update(_time: Ticker) {
    if (this.paused) return;
  }

  public async pause() {
    this.mainContainer.interactiveChildren = false;
    this.paused = true;
  }

  public async resume() {
    this.mainContainer.interactiveChildren = true;
    this.paused = false;
  }

  public reset() {}

  public resize(width: number, height: number) {
    this.mainContainer.x = width * 0.5;
    this.mainContainer.y = height * 0.5;

    this.bgBlue.width = width;
    this.bgBlue.height = height;

    this.bgRed.width = width;
    this.bgRed.height = height;

    const BOTTOM_PADDING = 30;
    const BUTTON_GAP = 60;

    // PAUSE button → bottom center (left)
    this.pauseButton.x = width / 2 - BUTTON_GAP;
    this.pauseButton.y = height - BOTTOM_PADDING;

    // SETTINGS button → bottom center (right)
    this.settingsButton.x = width / 2 + BUTTON_GAP;
    this.settingsButton.y = height - BOTTOM_PADDING;
    const RADIUS_TURN = 170;
    const SIZE_TURN = RADIUS_TURN * 2;

    // TOP-left
    this.blueTurnPill.x = 0;
    this.blueTurnPill.y = 0;

    // TOP-right
    this.redTurnPill.x = width - SIZE_TURN;
    this.redTurnPill.y = 0;

    const RADIUS = 170;
    const SIZE = RADIUS * 2;
    // BLUE – bottom-left
    this.blueScorePill.x = 0;
    this.blueScorePill.y = height - SIZE;

    // RED – bottom-right
    this.redScorePill.x = width - SIZE;
    this.redScorePill.y = height - SIZE;
  }

  public async show(): Promise<void> {
    // await Assets.load([
    //   "/assets/preload/coookie_man.",
    //   "/assets/preload/cup_cake.",
    //   "/assets/preload/gift_pack.",
    //   "/assets/preload/hang_socks.",
    //   "/assets/preload/head_phone.",
    //   "/assets/preload/pop_cone.",
    //   "/assets/preload/shiny_ball.",
    //   "/assets/preload/snow_man.",
    //   "/assets/preload/xmas_bell.",
    //   "/assets/preload/xmas_cards.",
    //   "/assets/preload/xmas_hat.",
    //   "/assets/preload/xmas_home.",
    //   "/assets/preload/xmas_papa.",
    //   "/assets/preload/xmas_tree.",
    // ]);

    // CARD GRID

    engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

    const elements = [this.pauseButton, this.settingsButton];
    let finalPromise!: AnimationPlaybackControls;

    for (const el of elements) {
      el.alpha = 0;
      finalPromise = animate(
        el,
        { alpha: 1 },
        { duration: 0.3, delay: 0.75, ease: "backOut" }
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
