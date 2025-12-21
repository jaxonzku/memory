// src/app/screens/main/Card.ts

import { Container, Graphics, Text, Sprite } from "pixi.js";
import { gsap } from "gsap";

export class Card extends Container {
  public id!: number;

  private front: Graphics;
  private debugText?: Text;
  private debugEnabled = false;
  private backSprite!: Sprite;
  private backBg!: Graphics;
  public flipped = false;
  public locked = false;
  public removed = false;
  public baseX = 0;
  public shake() {
    gsap.fromTo(
      this,
      { x: this.baseX - 8 },
      {
        x: this.baseX + 8,
        duration: 0.05,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.x = this.baseX;
        },
      }
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

  constructor(size = 80, imagePath: string, debug = false) {
    console.log("imagepath", imagePath);
    super();
    this.debugEnabled = debug;

    this.front = new Graphics()
      .roundRect(-size / 2, -size / 2, size, size, 15)
      .fill(0xed427c)
      .stroke({
        width: 8,
        color: "white",
      });

    this.backBg = new Graphics()
      .roundRect(-size / 2, -size / 2, size, size, 15)
      .fill(0xed427c)
      .stroke({
        width: 8,
        color: "white",
      });
    this.backBg.visible = false;

    this.backSprite = Sprite.from(imagePath);
    this.backSprite.visible = false;
    this.backSprite.anchor.set(0.5);
    this.backSprite.width = size * 0.75;
    this.backSprite.height = size * 0.75;

    // Simple layering - no mask needed
    this.addChild(this.backBg);
    this.addChild(this.backSprite);
    this.addChild(this.front);

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
    this.debugText.text = `ID: ${id}`;
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
        this.backBg.visible = showBack;
        this.backSprite.visible = showBack;
        gsap.to(this.scale, {
          x: 1,
          duration: 0.25,
          ease: "power1.out",
        });
      },
    });
  }
}
