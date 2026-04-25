import { FancyButton } from "@pixi/ui";
import { animate } from "motion";
import { Container, Sprite, Texture } from "pixi.js";

import { setGameMode } from "../gameMode";
import { engine } from "../getEngine";
import { AppColors } from "../theme/colors";
import { SettingsPopup } from "../popups/SettingsPopup";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { MainScreen } from "./main/MainScreen";
import { AnimatedBackground } from "../ui/AnimatedBackground";

/** Initial screen shown before gameplay starts */
export class StartScreen extends Container {
  public static assetBundles = ["main"];
  private static readonly PANEL_WIDTH = 460;
  private static readonly PANEL_HEIGHT = 500;

  private bg: AnimatedBackground;
  private panel: Container;
  private panelBase: RoundedBox;
  private title: Label;
  private subtitle: Label;
  private twoPlayerButton: Button;
  private singlePlayerButton: Button;
  private settingsButton: FancyButton;

  constructor() {
    super();

    this.bg = new AnimatedBackground();
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({
      width: StartScreen.PANEL_WIDTH,
      height: StartScreen.PANEL_HEIGHT,
    });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Memory Match",
      style: {
        fill: AppColors.panelTitle,
        fontSize: 42,
      },
    });
    this.panel.addChild(this.title);

    this.subtitle = new Label({
      text: "Choose a mode to start the game.",
      style: {
        fill: AppColors.panelText,
        fontSize: 18,
      },
    });
    this.panel.addChild(this.subtitle);

    this.twoPlayerButton = new Button({ text: "2 Player" });
    this.twoPlayerButton.onPress.connect(() => {
      setGameMode("two-player");
      void engine().navigation.showScreen(MainScreen);
    });
    this.panel.addChild(this.twoPlayerButton);

    this.singlePlayerButton = new Button({ text: "Single Player" });
    this.singlePlayerButton.onPress.connect(() => {
      setGameMode("single-player");
      void engine().navigation.showScreen(MainScreen);
    });
    this.panel.addChild(this.singlePlayerButton);

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

    const settingsIcon = new Sprite(Texture.from("icon-settings.png"));
    settingsIcon.tint = AppColors.panelTitle; // You can change this to any color!

    this.settingsButton = new FancyButton({
      defaultView: settingsIcon,
      anchor: 0.5,
      animations: buttonAnimations,
    });
    this.settingsButton.onPress.connect(() => {
      void engine().navigation.presentPopup(SettingsPopup);
    });
    this.panel.addChild(this.settingsButton);

    this.layoutPanelContent();
  }

  public prepare() {}

  private layoutPanelContent() {
    const items = [
      this.title,
      this.subtitle,
      this.twoPlayerButton,
      this.singlePlayerButton,
      this.settingsButton,
    ];

    const itemHeights = items.map((item) => item.getLocalBounds().height);
    const totalHeight = itemHeights.reduce((sum, height) => sum + height, 0);
    const naturalGap =
      (StartScreen.PANEL_HEIGHT - totalHeight) / (items.length + 1);
    const gap = naturalGap * 0.88;
    const totalStackHeight = totalHeight + gap * (items.length - 1);

    let currentY = -totalStackHeight / 2;

    items.forEach((item, index) => {
      const height = itemHeights[index] ?? 0;
      item.y = currentY + height / 2;
      currentY += height + gap;
    });
  }

  public resize(width: number, height: number) {
    this.panel.position.set(width * 0.5, height * 0.5);
    try {
      this.bg.resize(width, height);
    } catch (e) {
      console.error("AnimatedBackground resize error:", e);
    }
  }

  public async show() {
    this.alpha = 1;
    this.panel.alpha = 0;
    this.panel.scale.set(0.94);

    animate(this.panel, { alpha: 1 }, { duration: 0.35, ease: "linear" });
    await animate(
      this.panel.scale,
      { x: 1, y: 1 },
      { duration: 0.35, ease: "backOut" },
    );
  }

  public async hide() {
    animate(this.panel, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.scale,
      { x: 0.98, y: 0.98 },
      { duration: 0.2, ease: "easeOut" },
    );
  }
}
