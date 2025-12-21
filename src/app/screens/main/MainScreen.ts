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
import { Container, Text, Sprite, Texture, Graphics } from "pixi.js";
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
    direction: "left" | "right"
  ): { container: Container; label: Text } {
    const container = new Container();
    const bg = new Graphics();

    const BODY_W = 150;
    const BODY_H = 160;
    const RADIUS = 80;
    const CIRCLE_PULL = 20;

    if (direction === "right") {
      // Body
      bg.roundRect(0, 0, BODY_W, BODY_H, 30).fill(bgColor);
      // Circle on right
      bg.circle(BODY_W - CIRCLE_PULL, BODY_H / 2, RADIUS).fill(bgColor);
    } else {
      // Circle on left
      bg.circle(RADIUS + CIRCLE_PULL, BODY_H / 2, RADIUS).fill(bgColor); // Body shifted right
      bg.roundRect(RADIUS, 0, BODY_W, BODY_H, 30).fill(bgColor);
    }

    const label = new Text({
      text,
      style: {
        fill: 0xffffff,
        fontSize: 26,
        fontWeight: "bold",
        fontFamily: "Arial Rounded MT Bold",
      },
    });

    label.anchor.set(0.5);
    label.x = bg.width / 2;
    label.y = bg.height / 2;

    container.addChild(bg, label);
    container.visible = false;

    return { container, label };
  }
  private createScorePill(
    bgColor: number,
    textColor: number,
    direction: "left" | "right" = "right"
  ): { container: Container; label: Text } {
    const container = new Container();
    const bg = new Graphics();

    const BODY_W = 130;
    const BODY_H = 160;
    const RADIUS = 80;
    const CIRCLE_PULL = 20;

    if (direction === "right") {
      // Body
      bg.roundRect(0, 0, BODY_W, BODY_H, 30).fill(bgColor);
      // Circle on right
      bg.circle(BODY_W - CIRCLE_PULL, BODY_H / 2, RADIUS).fill(bgColor);
    } else {
      // Circle on left
      bg.circle(RADIUS + CIRCLE_PULL, BODY_H / 2, RADIUS).fill(bgColor); // Body shifted right
      bg.roundRect(RADIUS, 0, BODY_W, BODY_H, 30).fill(bgColor);
    }

    // White border
    // bg.stroke({
    //   width: 6,
    //   color: 0xffffff,
    //   alignment: 0.5,
    // });

    // Score text
    const label = new Text({
      text: "0",
      style: {
        fill: textColor,
        fontSize: 42,
        fontWeight: "bold",
        fontFamily: "Arial Rounded MT Bold",
      },
    });

    // Center text using real bounds
    label.anchor.set(0.5);
    label.x = bg.width / 2;
    label.y = bg.height / 2;

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
    const blueTurn = this.createTurnPill(0x3b82f6, "Blue's Turn", "right");
    this.blueTurnPill = blueTurn.container;
    this.blueTurnLabel = blueTurn.label;
    this.addChild(this.blueTurnPill);

    const redTurn = this.createTurnPill(0xef4444, "Red's Turn", "left");
    this.redTurnPill = redTurn.container;
    this.redTurnLabel = redTurn.label;
    this.addChild(this.redTurnPill);

    // Blue starts
    this.blueTurnPill.visible = true;
    this.redTurnPill.visible = false;

    const blue = this.createScorePill(0x1f2933, 0x7fb7d6, "right");
    this.blueScorePill = blue.container;
    this.blueScoreLabel = blue.label;
    this.addChild(this.blueScorePill);

    const red = this.createScorePill(0x1f2933, 0xf2a07b, "left");
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

    // PAUSE button → middle of LEFT side
    this.pauseButton.x = 30;
    this.pauseButton.y = height / 2;

    // SETTINGS button → middle of RIGHT side
    this.settingsButton.x = width - 30;
    this.settingsButton.y = height / 2;

    const turnY = height * 0.2;
    const EDGE_PADDING_TURN = 20;
    const BODY_W_TURN = 170;

    this.alignPillX(
      this.blueTurnPill,
      "left",
      width,
      BODY_W_TURN,
      EDGE_PADDING_TURN
    );
    this.alignPillX(
      this.redTurnPill,
      "right",
      width,
      BODY_W_TURN,
      EDGE_PADDING_TURN
    );

    this.blueTurnPill.y = turnY - this.blueTurnPill.getLocalBounds().height / 2;
    this.redTurnPill.y = turnY - this.redTurnPill.getLocalBounds().height / 2;

    const pillBounds = this.blueScorePill.getLocalBounds();
    const pillHalfH = pillBounds.height / 2;
    const targetY = height * 0.8;

    this.blueScorePill.y = targetY - pillHalfH;
    this.redScorePill.y = targetY - pillHalfH;
    const EDGE_PADDING = 20;
    const BODY_W = 130; // same value used in createScorePill()
    // BLUE (flat edge on LEFT, circle faces right → inward)
    this.blueScorePill.x =
      EDGE_PADDING - (this.blueScorePill.getLocalBounds().width - BODY_W);

    // RED (flat edge on RIGHT, circle faces left → inward)
    this.redScorePill.x = width - BODY_W - EDGE_PADDING;

    // this.turnText.x = width / 2 - this.turnText.width / 2;
    // this.turnText.y = 20;
  }

  public async show(): Promise<void> {
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
