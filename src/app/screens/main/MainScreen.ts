// src/app/screens/main/MainScreen.ts

import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import type { AnimationPlaybackControls } from "motion/react";
import type { Ticker } from "pixi.js";
import { Container } from "pixi.js";

import { CardGrid } from "./CardGrid";
import { engine } from "../../getEngine";
import { PausePopup } from "../../popups/PausePopup";
import { SettingsPopup } from "../../popups/SettingsPopup";
import { Button } from "../../ui/Button";
import { Text } from "pixi.js";

/** The screen that holds the app */
export class MainScreen extends Container {
  public static assetBundles = ["main"];

  public mainContainer: Container;

  private pauseButton: FancyButton;
  private settingsButton: FancyButton;
  // private addButton: Button;
  // private removeButton: Button;
  private blueScore = 0;
  private redScore = 0;

  private blueScoreText!: Text;
  private redScoreText!: Text;
  private turnText!: Text;

  private paused = false;

  constructor() {
    super();

    this.mainContainer = new Container();
    this.addChild(this.mainContainer);

    // CARD GRID
    const grid = new CardGrid(18, 6, 100, ({ player, matched }) => {
      if (matched) {
        if (player === "blue") {
          this.blueScore++;
          this.blueScoreText.text = `Blue: ${this.blueScore}`;
        } else {
          this.redScore++;
          this.redScoreText.text = `Red: ${this.redScore}`;
        }
      } else {
        const next = player === "blue" ? "Red" : "Blue";
        this.turnText.text = `Turn: ${next}`;
        this.turnText.style.fill = next === "Blue" ? 0x3b82f6 : 0xef4444;
      }
    });
    this.blueScoreText = new Text({
      text: "Blue: 0",
      style: { fill: 0x3b82f6, fontSize: 24 },
    });
    this.addChild(this.blueScoreText);

    this.redScoreText = new Text({
      text: "Red: 0",
      style: { fill: 0xef4444, fontSize: 24 },
    });
    this.addChild(this.redScoreText);

    this.turnText = new Text({
      text: "Turn: Blue",
      style: { fill: 0x3b82f6, fontSize: 26, fontWeight: "bold" },
    });
    this.addChild(this.turnText);

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

    this.pauseButton.x = 30;
    this.pauseButton.y = 30;

    this.settingsButton.x = width - 30;
    this.settingsButton.y = 30;

    // this.removeButton.x = width / 2 - 100;
    // this.removeButton.y = height - 75;

    // this.addButton.x = width / 2 + 100;
    // this.addButton.y = height - 75;

    this.blueScoreText.x = 20;
    this.blueScoreText.y = height / 2;

    this.redScoreText.x = width - this.redScoreText.width - 20;
    this.redScoreText.y = height / 2;

    this.turnText.x = width / 2 - this.turnText.width / 2;
    this.turnText.y = 20;
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
