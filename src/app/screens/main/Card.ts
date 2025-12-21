// src/app/screens/main/Card.ts

import { Container, Graphics, Text } from "pixi.js";
import { gsap } from "gsap";

export class Card extends Container {
  public id!: number;

  private front: Graphics;
  private back: Graphics;
  private debugText?: Text;
  private debugEnabled = false;
  private backColor!: number;

  public flipped = false;
  public locked = false;
  public removed = false;
  public shake() {
    gsap.fromTo(
      this,
      { x: this.x - 8 },
      { x: this.x + 8, duration: 0.05, yoyo: true, repeat: 2 }
    );
  }
  public animateRemove() {
    this.removed = true;
    this.locked = true;

    gsap
      .timeline()
      .to(this.scale, {
        x: 1.5,
        y: 1.5,
        duration: 0.15,
        ease: "power2.out",
      })
      .to(this, {
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 0.25,
        ease: "back.in",
        onComplete: () => {
          this.visible = false;
        },
      });
  }
  constructor(size = 80, backColor = 0x4ade80, debug = false) {
    super();
    this.debugEnabled = debug;
    this.backColor = backColor;

    this.front = new Graphics()
      .roundRect(-size / 2, -size / 2, size, size, 15)
      .fill(0xed427c)
      .stroke({
        width: 8,
        color: "white",
      });

    this.back = new Graphics()
      .roundRect(-size / 2, -size / 2, size, size, 15)
      .fill(backColor)
      .stroke({
        width: 8,
        color: "white",
      });
    this.back.visible = false;

    this.addChild(this.front, this.back);

    if (this.debugEnabled) {
      this.debugText = new Text({
        text: "",
        style: {
          fill: 0xffffff,
          fontSize: 12,
          align: "center",
        },
      });
      this.debugText.anchor.set(0.5);
      this.addChild(this.debugText);
    }
  }
  public setDebugInfo(id: number) {
    if (!this.debugEnabled || !this.debugText) return;
    this.debugText.text = `ID: ${id}\n#${this.backColor
      .toString(16)
      .padStart(6, "0")}`;
  }

  public reveal() {
    if (this.locked || this.removed || this.flipped) return;
    this.flipped = true;
    this.animateFlip(true);
  }

  public hide() {
    if (this.removed || !this.flipped) return;
    this.flipped = false;
    this.animateFlip(false);
  }

  public remove() {
    this.removed = true;
    this.locked = true;
    this.visible = false;
  }

  private animateFlip(showBack: boolean) {
    gsap.to(this.scale, {
      x: 0,
      duration: 0.25,
      ease: "power1.in",
      onComplete: () => {
        this.front.visible = !showBack;
        this.back.visible = showBack;

        gsap.to(this.scale, {
          x: 1,
          duration: 0.25,
          ease: "power1.out",
        });
      },
    });
  }
}
