import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Text } from "pixi.js";
import { AppColors } from "../theme/colors";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["preload"];
  /** Title label */
  private title: Text;
  /** Progress label */
  private progressLabel: Text;
  /** Progress bar track */
  private progressTrack: Graphics;
  /** Progress bar fill */
  private progressFill: Graphics;
  /** Cached progress value */
  private progress = 0;
  /** Track width */
  private readonly barWidth = 280;
  /** Track height */
  private readonly barHeight = 14;

  constructor() {
    super();

    this.title = new Text({
      text: "Loading...",
      style: {
        fill: AppColors.panelBase,
        fontSize: 34,
        fontWeight: "700",
        fontFamily: "Arial Rounded MT Bold",
      },
    });
    this.title.anchor.set(0.5);
    this.addChild(this.title);

    this.progressTrack = new Graphics();
    this.addChild(this.progressTrack);

    this.progressFill = new Graphics();
    this.addChild(this.progressFill);

    this.progressLabel = new Text({
      text: "0%",
      style: {
        fill: AppColors.panelBase,
        fontSize: 18,
        fontWeight: "600",
        fontFamily: "Arial Rounded MT Bold",
      },
    });
    this.progressLabel.anchor.set(0.5);
    this.addChild(this.progressLabel);

    this.drawProgress();
  }

  public onLoad(progress: number) {
    this.progress = Math.max(0, Math.min(100, progress));
    this.progressLabel.text = `${Math.round(this.progress)}%`;
    this.drawProgress();
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    this.title.position.set(centerX, centerY - 48);
    this.progressTrack.position.set(
      centerX - this.barWidth * 0.5,
      centerY - this.barHeight * 0.5,
    );
    this.progressFill.position.set(
      centerX - this.barWidth * 0.5,
      centerY - this.barHeight * 0.5,
    );
    this.progressLabel.position.set(centerX, centerY + 34);
  }

  /** Show screen with animations */
  public async show() {
    this.alpha = 1;
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "linear",
      delay: 1,
    });
  }

  private drawProgress() {
    this.progressTrack
      .clear()
      .roundRect(0, 0, this.barWidth, this.barHeight, this.barHeight * 0.5)
      .fill({ color: AppColors.loadTrack, alpha: 0.9 });

    this.progressFill.clear();

    const fillWidth = (this.barWidth * this.progress) / 100;
    if (fillWidth > 0) {
      this.progressFill
        .roundRect(0, 0, fillWidth, this.barHeight, this.barHeight * 0.5)
        .fill({ color: AppColors.loadFill, alpha: 1 });
    }
  }
}
