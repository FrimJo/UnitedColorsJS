class DotSpawner {

    constructor(timeToSpawn, condition, callback){
        this.timeToSpawn = timeToSpawn;
        this.condition = condition;
        this.callback = callback;
        this.spawnTimer = 0;
    }

    step(mills){

        // If the condition for spawn is not met, end function
        if(!this.condition()) return;

        // Increment timer
        this.spawnTimer += mills;

        // If not enough time has passed, end function
        if(this.timeToSpawn > this.spawnTimer) return;

        // Reset spawn timer and run callback method
        this.spawnTimer = 0;
        this.callback();
    }

    reset(){
        this.spawnTimer = 0;
    }

    destroy() {
        this.timeToSpawn = undefined;
        this.callback = undefined;
        this.spawnTimer = undefined;
    }


}

export default DotSpawner;