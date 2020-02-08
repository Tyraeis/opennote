import Page from './Page';
import Toolbar from './Toolbar';

export default class App {
    root: HTMLElement;
    page: Page;
    toolbar: Toolbar;

    constructor() {
        this.root = document.getElementById('root');
        this.page = new Page(this.root);
        this.toolbar = new Toolbar((color: string) => this.handleColorChange(color));
        this.mainLoop();
    }

    handleColorChange(color: string) {
        console.log(color);
        this.page.color = color;
    }

    mainLoop() {
        this.page.render();
        requestAnimationFrame(() => this.mainLoop());
    }
}