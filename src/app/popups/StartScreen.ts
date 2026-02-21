import { BlurFilter, Container, Sprite, Texture } from "pixi.js";
import { RoundedBox } from "../ui/RoundedBox";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { engine } from "../getEngine";
import { animate } from "motion";
import { AppColors } from "../theme/colors";

type StartPopupProps = {
  title: string;
  isBlue: boolean;
  onDone: () => void;
};

export class StartPopup extends Container {
  private bg!: Sprite;
  private panel!: Container;
  private panelBase!: RoundedBox;
  private title!: Label;
  private doneButton!: Button;

  constructor() {
    super();

    /* ---------- BACKGROUND ---------- */
    this.bg = new Sprite(Texture.WHITE);
    this.bg.alpha = 0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    /* ---------- PANEL ---------- */
    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({
      width: 420,
      height: 320,
    });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "",
      style: { fill: AppColors.panelTitle, fontSize: 48 },
    });
    this.title.anchor.set(0.5);
    this.title.y = -70;
    this.panel.addChild(this.title);

    this.doneButton = new Button({ text: "Start" });
    this.doneButton.y = 80;
    this.panel.addChild(this.doneButton);
  }

  /** Called by navigation before showing */
  public prepare(props: StartPopupProps) {
    const { title, isBlue, onDone } = props;

    this.bg.tint = isBlue
      ? AppColors.playerBlueBackground
      : AppColors.playerRedBackground;
    this.title.text = title;

    this.doneButton.onPress.disconnectAll();
    this.doneButton.onPress.connect(() => {
      engine().navigation.dismissPopup();
      onDone();
    });
  }

  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;

    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
    this.panel.pivot.set(this.panel.width * 0.5, this.panel.height * 0.5);
  }

  public async show() {
    const current = engine().navigation.currentScreen;
    if (current) {
      current.filters = [new BlurFilter({ strength: 5 })];
    }

    this.panel.pivot.y = this.panel.height + 300;

    animate(this.bg, { alpha: 1 }, { duration: 0.25 });

    await animate(
      this.panel.pivot,
      { y: this.panel.height * 0.5 },
      { duration: 0.35, ease: "backOut" },
    );
  }

  public async hide() {
    const current = engine().navigation.currentScreen;
    if (current) {
      current.filters = [];
    }

    animate(this.bg, { alpha: 0 }, { duration: 0.2 });

    await animate(
      this.panel.pivot,
      { y: this.panel.height + 400 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
