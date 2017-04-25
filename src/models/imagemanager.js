class ImageManager {
    static Instance = new ImageManager();

    constructor() {
        this.redImg = new Image();
        this.redImg.src = require('./../assets/images/dot-red.svg');
        this.greenImg = new Image();
        this.greenImg.src = require('./../assets/images/dot-green.svg');
        this.blueImg = new Image();
        this.blueImg.src = require('./../assets/images/dot-blue.svg');
        this.orangeImg = new Image();
        this.orangeImg.src = require('./../assets/images/dot-orange.svg');
        this.whiteImg = new Image();
        this.whiteImg.src = require('./../assets/images/dot-white.svg');
    }

    get(index) {
        switch(index) {
            case 0: return this.redImg;
            case 1: return this.orangeImg;
            case 2: return this.blueImg;
            default: return this.whiteImg;
        }
    }
}

export default ImageManager;