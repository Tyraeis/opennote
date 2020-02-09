import * as React from 'react';
import Page from './Page';
import Toolbar from './Toolbar';
import API from './API';

export default class App extends React.Component<{}, {}> {
    canvas = React.createRef<HTMLCanvasElement>();
    page: Page | null;

    constructor(props: {}) {
        super(props);
        //this.root = document.getElementById('root');
        //this.page = new Page(this.root);
        //this.toolbar = new Toolbar((color: string) => this.handleColorChange(color));
        this.mainLoop();
    }

    render() {
        return (
            <div id="app">
                <Toolbar onpenchange={this.handlePenChange.bind(this)}></Toolbar>
                <div id="canvas-container">
                    <canvas ref={this.canvas}></canvas>
                </div>
            </div>
        )
    }

    componentDidMount() {
        console.log("mount", this.canvas);
        this.page = new Page(this.canvas.current!)
    }

    handlePenChange(pen: { color: string, weight: number }) {
        console.log(pen);
        this.page!.color = pen.color;
    }

    mainLoop() {
        if (this.page != null) {
            this.page.render();
        }
        requestAnimationFrame(() => this.mainLoop());
    }
}