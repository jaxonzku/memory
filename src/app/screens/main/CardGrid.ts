import { Container } from "pixi.js";
import { Card } from "./Card";

export class CardGrid extends Container {
  constructor(rows = 3, cols = 3, gap = 100) {
    super();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const card = new Card();
        card.x = c * gap;
        card.y = r * gap;
        card.eventMode = "static";
        card.cursor = "pointer";
        card.on("pointerdown", () => card.flip());

        this.addChild(card);
      }
    }
  }
}