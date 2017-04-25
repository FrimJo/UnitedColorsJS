
const PLAYER_SPEED = 200/1000;
const SMALL_SPEED = 100/1000;

class Dot {

    constructor(size, color, px, py){
        this.size = size;
        this.color = color;
        this.px = px;
        this.py = py;
        this.radius = size / 2.0;
    }

    get cx() {
        return this.px - this.radius;
    }
    get cy() { return this.py - this.radius; }
}

class SmallDot extends Dot {
    constructor(size, color, px, py, score, direction) {
        super(size, color, px, py);
        this.score = score;
        this.vx = direction.x;
        this.vy = direction.y;
        this.speed = SMALL_SPEED;
    }
}
class BigDot extends Dot {
    constructor(size, color, px, py, score) {
        super(size, color, px, py);
        this.score = score;
    }
}

class PlayerDot extends Dot {
    constructor(size, color, px, py) {
        super(size, color, px, py);
        this.vx = 0;
        this.vy = 0;
        this.speed = PLAYER_SPEED;
    }

    setNewColor(){
        let newColor = this.color;
        while(newColor === this.color) {
            newColor = Math.floor(Math.random() * 3);
        }
        this.color = newColor;
    }
}
export {SmallDot, BigDot, PlayerDot};