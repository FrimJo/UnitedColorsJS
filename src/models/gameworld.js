import LinkedList from './linkedlist';
import {PlayerDot, BigDot, SmallDot} from './dot';
import DotSpawner from './dotspawner'

class GameWorld {

    constructor(width, height, onStep, onScoreChange, onGameStart, onGameOver){

        // Set up some variables for use in the game world
        this.width = width;
        this.height = height;

        // Set up listener
        this.handleUpdate = onStep;
        this.handleScoreChange = onScoreChange;
        this.handleGameStart = onGameStart;
        this.handleGameOver = onGameOver;

        // Prepare for start

        this.isRunning = false;
        this.setupNewGame();

    }

    setupNewGame() {

        // If the game is still running,
        if(this.isRunning) throw new Error("Can not setup new game if a current game is already running. Use stop() to stop current game.");

        // Setup or reset som values
        this.score = 0;

        // Create the dot lists or clear them if they are already crated, and create the player dot
        if(this.smallDotList) this.smallDotList.clear(); else this.smallDotList = new LinkedList();
        if(this.bigDotList) this.bigDotList.clear(); else this.bigDotList = new LinkedList();
        this.playerDot = new PlayerDot(20, 0, this.width/2.0, this.height/2.0);

        // Create spawners if don't already have them
        if(this.bigDotSpawner) this.bigDotSpawner.reset();
        else this.bigDotSpawner = new DotSpawner(10000, () => this.bigDotList.length === 0, this.spawnBigDot.bind(this));

        if(this.smallDotSpawner) this.smallDotSpawner.reset();
        else this.smallDotSpawner = new DotSpawner(2000, () => true, this.spawnSmallDot.bind(this));
    }

    start() {

        // Trigger game start listener
        this.handleGameStart();

        // Kick of the update-loop
        this.isRunning = true;                  // Set game state to running
        this.then = Date.now();                 // Set then to now for correct delta in update

        this.loop = setInterval(()=>{
            this.update();                      // Run update until game stops
        }, 60/1000);

    }

    update() {

        // Calculate the delta time passed since last update
        let now = Date.now();
        let delta = now - this.then;

        // Reset then variable
        this.then = now;

        // Step the spawners for spawning dots
        this.smallDotSpawner.step(delta);
        this.bigDotSpawner.step(delta);

        // Update the position of all dots
        const smallDotInfo = this.updateSmallDots(delta);
        const bigDotInfo = this.updateBigDots();
        const playerDotInfo = this.updatePlayerDot(delta);

        // Gather the information to send as output
        const outPutArray = smallDotInfo.concat(bigDotInfo);
        outPutArray.push(playerDotInfo);

        // Trigger update listener
        this.handleUpdate(outPutArray);

    }

    updatePlayerDot(delta) {

        // If view is using mouse
        if (this.mouseX && this.mouseY) {

            // Calculate direction of mouse
            const dx = (this.mouseX - this.playerDot.px);
            const dy = (this.mouseY - this.playerDot.py);

            const distance_pow = Math.pow(dx, 2) + Math.pow(dy, 2);
            const distance = Math.sqrt(distance_pow);
            const nvx = dx / distance;
            const nvy = dy / distance;

            // Calculate velocity
            const vx = nvx * delta * this.playerDot.speed;
            const vy = nvy * delta * this.playerDot.speed;
            const velocity_pow = Math.pow(vx, 2) + Math.pow(vy, 2);

            // If we overshoot the mouse, set velocity to zero
            this.playerDot.vx = velocity_pow > distance_pow? 0.0 : nvx;
            this.playerDot.vy = velocity_pow > distance_pow? 0.0 : nvy;

        }

        // Else if view is using gyroscope
        else if(this.gyroX && this.gyroY) {

            this.playerDot.vx = (this.gyroX < 20.0? (this.gyroX > -20.0? this.gyroX : -20.0) : 20.0) / 20.0;
            this.playerDot.vy = (this.gyroY < 20.0? (this.gyroY > -20.0? this.gyroY : -20.0) : 20.0) / 20.0;
        }

        // Update player dots position
        this.updatePositionFor(this.playerDot, delta);
        return {x: this.playerDot.cx, y: this.playerDot.cy, color: this.playerDot.color, size: this.playerDot.size}
    }

    updateSmallDots(delta){

        const dotArray = [];

        // For each small dot
        this.smallDotList.forEach((dot)=>{

            // Check for collision with player dot after updated position of player dot
            if(this.didCollideWithPlayerDot(dot)) this.runCollisionWithSmallDot(dot);

            // If no collision occurred
            else {

                // Update small dots position
                this.updatePositionFor(dot, delta);

                // Check for collision with player dot after updated position of small dot
                if(this.didCollideWithPlayerDot(dot)) this.runCollisionWithSmallDot(dot);

                // Else if the dot did not collide before it was moved or after, add dot to array
                else dotArray.push({x: dot.cx, y: dot.cy, color: dot.color, size: dot.size});
            }
        });

        return dotArray;
    }

    updateBigDots(){

        const dotArray = [];

        // For each small dot
        this.bigDotList.forEach((dot)=> {
            if (this.didCollideWithPlayerDot(dot)) this.runCollisionWithBigDot(dot);
            else dotArray.push({x: dot.cx, y: dot.cy, color: dot.color, size: dot.size});
        });

        return dotArray;
    }

    updatePositionFor(dot, delta) {

        const position = this.calculatePosition(dot, delta);

        dot.px = position.x;
        dot.py = position.y;

    }

    calculatePosition(dot, delta) {

        // Calculate new position
        let x, y, reCalc = true;
        while(reCalc){

            // Do a recalculation
            x = dot.px + dot.vx * dot.speed * delta;
            y = dot.py + dot.vy * dot.speed * delta;

            // Loop until it is not outside mapp
            if(x > this.width || x < 0) {
                dot.vx *= -1;
            } else if(y > this.height || y < 0) {
                dot.vy *= -1;
            }else {
                reCalc = false;
            }
        }

        return {x: x, y: y}
    }

    didCollideWithPlayerDot(dot) {
        const distance_pow = Math.pow(dot.px - this.playerDot.px, 2) + Math.pow(dot.py - this.playerDot.py, 2);
        const size_pow = Math.pow(dot.radius + this.playerDot.radius, 2);
        return distance_pow <= size_pow;
    }

    runCollisionWithSmallDot(dot){
        if(dot.color === this.playerDot.color) {
            this.smallDotList.remove(dot);
            this.incrementScore(dot.score);
        } else {
            this.gameOver();
        }
    }

    runCollisionWithBigDot(dot){

        // Remove the self despawn timer from the big dot
        clearTimeout(dot.lifeTimer);

        this.bigDotList.remove(dot);
        this.playerDot.setNewColor();
        this.incrementScore(dot.score);
    }

    incrementScore(value){
        this.score += value;
        this.handleScoreChange(this.score);
    }

    gameOver(){
        this.isRunning = false;
        clearInterval(this.loop);
        this.loop = undefined;
        this.handleGameOver();
    }

    spawnSmallDot() {

        // Get random color
        const color = Math.floor(Math.random() * 3);

        // Determine side
        const position = this.calculateRandomOuterPosition(this.width, this.height);

        // Calculate random direction
        const nVector = this.calculateRandomNormalizedVector();

        this.smallDotList.add(new SmallDot(10,color,position.x,position.y,1,nVector));
    }

    calculateRandomOuterPosition(width, height) {
        const side = Math.floor(Math.random() * 3);
        let y, x = y = 0;
        switch (side) {
            case 2:
                y = height;
            case 0:
                x = Math.floor(Math.random() * width);
                break;
            case 3:
                x = width;
            case 1:
                y = Math.floor(Math.random() * height);
                break;
            default:
                break;
        }

        return {x: x, y: y};
    }

    calculateRandomNormalizedVector() {
        const side = Math.floor(Math.random() * 3);

        let y, x = y = 1;
        switch (side) {
            case 2:
                y = -1;
            case 0:
                x = Math.random() * 2 - 1;
                break;
            case 1:
                x = -1;
            case 3:
                y = Math.random() * 2 - 1;
                break;
            default:
                break;
        }

        // Normalize vector, divide by the length
        const length = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
        x /= length;
        y /= length;

        return {x: x, y: y};
    }

    spawnBigDot() {

        // Calculate spawn position
        const x = Math.floor(this.width * Math.random() * 0.6 + 0.2);
        const y = Math.floor(this.height * Math.random() * 0.6 + 0.2);

        // Get color
        const color = this.playerDot.color;

        // Create dot
        const dot = new BigDot(15,color,x,y,10);

        // Add it to the list of dots
        this.bigDotList.add(dot);

        // Set a life timer
        dot.lifeTimer = setTimeout(()=>{
            this.bigDotList.remove(dot);
        }, 5000);
    }

    setGyro(x, y) {
        this.gyroX = x;
        this.gyroY = y;
    }

    setMouse(x,y){
        this.mouseX = x;
        this.mouseY = y;
    }

}

export default GameWorld;