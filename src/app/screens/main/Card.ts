import { Container, Graphics } from "pixi.js";
import { gsap } from "gsap";

export class Card extends Container {
    private front: Graphics;
    private back: Graphics;
    private flipped = false;

    constructor(size = 80) {
        super();

        this.front = new Graphics()
            .roundRect(-size / 2, -size / 2, size, size, 15)
            .fill(0xed427c);

        this.back = new Graphics()
            .roundRect(-size / 2, -size / 2, size, size, 15)
            .fill(0x4ade80);

        this.back.visible = false;

        this.addChild(this.front, this.back);
    }

    public flip() {
        gsap.to(this.scale, {
            x: 0,
            duration: 0.25,
            ease: "power1.in",
            onComplete: () => {
                this.front.visible = false;
                this.back.visible = true;

                gsap.to(this.scale, {
                    x: 1,
                    duration: 0.25,
                    ease: "power1.out",
                    onComplete: () => {
                        gsap.delayedCall(0.5, () => {
                            gsap.to(this.scale, {
                                x: 0,
                                duration: 0.25,
                                ease: "power1.in",
                                onComplete: () => {
                                    this.front.visible = true;
                                    this.back.visible = false;

                                    gsap.to(this.scale, {
                                        x: 1,
                                        duration: 0.25,
                                        ease: "power1.out",
                                    });
                                },
                            });
                        });
                    },
                });
            },
        });
    }
}