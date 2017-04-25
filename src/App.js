import React, { Component } from 'react';
import './App.css';
import ImageManager from './models/imagemanager';
import GameWorld from './models/gameworld';


//red #E91E63
//green #2196F3
//blue #8BC34A
//orange #FF8E51
//background #8BB5E3

class CanvasComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {height: props.height, width: props.width };
    }

    componentDidMount(x,y,z) {

        // After the component has mounted, get the width and height of the document
        this.setState({width: window.innerWidth, height: window.innerHeight });
        this.gameWorld = new GameWorld(window.innerWidth, window.innerHeight,

            // onStep
            (outPutArray)=>{

                requestAnimationFrame(()=>{

                    // Clear the canvas
                    this.ctx.clearRect(0, 0, this.state.width, this.state.height);

                    outPutArray.forEach((element)=>{
                        this.ctx.drawImage(ImageManager.Instance.get(element.color), element.x, element.y, element.size, element.size);
                    });
                });

            },
            // onScoreChange
            this.props.onScoreChange,
            // onGameStart
            ()=>{
                console.log('onGameStart');
            },
            // onGameOver
            ()=>{

                console.log('onGameOver');
            },
        );

        // Prepare drawing area
        this.ctx = this.refs.canvas.getContext('2d');

        let then = Date.now();

        // Check for gyroscope compability
        if (window.DeviceOrientationEvent && 'ontouchstart' in window) {

            // Listen for the event and handle DeviceOrientationEvent object
            window.addEventListener('deviceorientation', (eventData)=>{

                // gamma is the left-to-right tilt in degrees, where right is positive
                const tiltLR = eventData.gamma;

                // beta is the front-to-back tilt in degrees, where front is positive
                const tiltFB = eventData.beta;

                this.gameWorld.setGyro(tiltLR, tiltFB);

            }, false);

        } else {

            // Set up follow mouse
            document.onmousemove = (event)=> {

                let now = Date.now();
                let delta = now - then;

                // Reset then variable
                then = now;

                const mouseX = event.pageX;
                const mouseY = event.pageY;

                // If we are not on a touch device with gyroscope, use mouse for movement
                this.gameWorld.setMouse(mouseX, mouseY);

            };
        }

        this.gameWorld.start();
    }

    componentDidUpdate() {}

    render() {

        return (
            <canvas ref="canvas" width={this.state.width} height={this.state.height}/>
        );
    }
}


CanvasComponent.propTypes = {
    height:React.PropTypes.number,
    width:React.PropTypes.number
};

CanvasComponent.defaultProps = {
    height: 500,
    width: 500
};

class App extends Component {

    componentDidMount() {
        this.scoreElement = document.querySelector('.score');
    }

    handleScoreUpdate(value){
        this.scoreElement.innerHTML = value;
    }

    render() {
        return (
            <div>
                <div className={'score'}>0</div>
                <CanvasComponent onScoreChange={this.handleScoreUpdate.bind(this)}/>
            </div>
        );
    }
}


export default App;
