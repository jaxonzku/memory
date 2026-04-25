import { Container, Graphics, Ticker, DestroyOptions } from "pixi.js";
import { AppColors } from "../theme/colors";

class FloatingShape extends Graphics {
  public vx = 0;
  public vy = 0;
  public rotSpeed = 0;
}

type AnimatedBackgroundOptions = {
  showBase?: boolean;
  shapeAlpha?: number;
};

export class AnimatedBackground extends Container {
  private bgBase: Graphics;
  private shapes: FloatingShape[] = [];
  private w = 800;
  private h = 600;
  private readonly showBase: boolean;

  constructor(options: AnimatedBackgroundOptions = {}) {
    super();
    this.showBase = options.showBase ?? true;
    this.bgBase = new Graphics();
    this.addChild(this.bgBase);

    // Create floating shapes
    for (let i = 0; i < 30; i++) {
      const shape = new FloatingShape();

      // Randomly draw a circle or rounded rectangle
      if (Math.random() > 0.5) {
        shape.circle(0, 0, Math.random() * 50 + 20);
      } else {
        const size = Math.random() * 80 + 40;
        shape.roundRect(-size / 2, -size / 2, size, size, 15);
      }

      shape.fill({ color: 0xffffff, alpha: options.shapeAlpha ?? 0.1 });

      shape.x = Math.random() * 2000;
      shape.y = Math.random() * 2000;
      shape.vx = (Math.random() - 0.5) * 1.5;
      shape.vy = -Math.random() * 2.5 - 0.5; // float upwards
      shape.rotSpeed = (Math.random() - 0.5) * 0.02;

      this.shapes.push(shape);
      this.addChild(shape);
    }

    Ticker.shared.add(this.update, this);
  }

  public resize(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.bgBase.clear();
    this.bgBase.rect(0, 0, w, h);

    if (this.showBase) {
      // Use the color directly; PixiJS v8 Color can parse strings including #RGBA
      this.bgBase.fill(AppColors.appBackground);
    } else {
      // Keep the mask active without drawing a visible solid background.
      this.bgBase.fill({ color: 0xffffff, alpha: 0.001 });
    }

    // Use bgBase as the mask to clamp the container's bounds
    this.mask = this.bgBase;
  }

  private update(ticker: Ticker) {
    const dt = ticker.deltaTime;

    for (const shape of this.shapes) {
      shape.x += shape.vx * dt;
      shape.y += shape.vy * dt;
      shape.rotation += shape.rotSpeed * dt;

      // Wrap around bounds
      if (shape.y < -150) shape.y = this.h + 150;
      if (shape.x < -150) shape.x = this.w + 150;
      if (shape.x > this.w + 150) shape.x = -150;
    }
  }

  public destroy(options?: DestroyOptions | boolean) {
    Ticker.shared.remove(this.update, this);
    super.destroy(options);
  }
}
