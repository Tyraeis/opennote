import './index.css';
import Page from './Page';

let root = document.getElementById('root');
let p = new Page(root);

function renderLoop() {
    p.render();
    requestAnimationFrame(renderLoop);
}
renderLoop();