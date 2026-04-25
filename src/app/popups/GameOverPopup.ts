import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { AppColors } from "../theme/colors";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";

type GameOverResult = {
  winner: "Blue" | "Red" | "Tie" | "You";
  blueScore: number;
  redScore: number;
  singlePlayer: boolean;
};

const defaultResult: GameOverResult = {
  winner: "Tie",
  blueScore: 0,
  redScore: 0,
  singlePlayer: false,
};

/** Popup shown when the game is over */
export class GameOverPopup extends Container {
  private static nextResult: GameOverResult = defaultResult;

  private bg: Sprite;
  private panel: Container;
  private panelBase: RoundedBox;
  private title: Label;
  private winnerLabel: Label;
  private scoreLabel: Label;
  private doneButton: Button;

  public static setResult(result: GameOverResult) {
    GameOverPopup.nextResult = result;
  }

  constructor() {
    super();

    const result = GameOverPopup.nextResult;

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = AppColors.overlayBackdrop;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 360, width: 460 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Game Over",
      style: { fill: AppColors.panelTitle, fontSize: 50 },
    });
    this.title.y = -110;
    this.panel.addChild(this.title);

    this.winnerLabel = new Label({
      text: result.winner === "Tie" ? "It's a tie!" : `${result.winner} wins!`,
      style: { fill: AppColors.panelText, fontSize: 36, align: "center" },
    });
    this.winnerLabel.y = -25;
    this.panel.addChild(this.winnerLabel);

    this.scoreLabel = new Label({
      text: result.singlePlayer
        ? `You ${result.blueScore} - ${result.redScore} Red`
        : `Blue ${result.blueScore} - ${result.redScore} Red`,
      style: { fill: AppColors.panelText, fontSize: 28, align: "center" },
    });
    this.scoreLabel.y = 30;
    this.panel.addChild(this.scoreLabel);

    this.doneButton = new Button({ text: "Play Again" });
    this.doneButton.y = 105;
    this.doneButton.onPress.connect(async () => {
      // Poki SDK: Show Commercial Break
      if (typeof PokiSDK !== "undefined") {
        try {
          // Mute audio during the ad
          const audio = engine().audio;
          const oldVolume = audio.getMasterVolume();
          audio.setMasterVolume(0);

          await PokiSDK.commercialBreak();

          audio.setMasterVolume(oldVolume);
        } catch (e) {
          console.warn("Poki Ad Blocked / Failed", e);
        }
      }

      const ctor = engine().navigation.currentScreen
        ?.constructor as unknown as new () => Container;
      await engine().navigation.dismissPopup();
      if (ctor) {
        await engine().navigation.showScreen(ctor);
      }
    });
    this.panel.addChild(this.doneButton);
  }

  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  public async show() {
    const currentEngine = engine();
    currentEngine.audio.sfx.play("main/sounds/game -over.mp3");
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
