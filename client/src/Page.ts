interface Line {
    color: string,
    points: [Point]
}

interface Point {
    x: number,
    y: number,
    weight: number
}

enum PointerAction {
    None,
    Draw,
    Erase,
    Select
}

interface PointerState {
    x: number,
    y: number,
    action: PointerAction,
    lineId: number
}

export default class Page {
    parent: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    lines: Record<number, Line> = {};
    pointers: Record<number, PointerState> = {};
    nextLineId = 0;
    needsRedraw = false;

    constructor(parent: HTMLElement) {
        this.parent = parent;
        this.canvas = document.createElement("canvas");
        this.canvas.classList.add("page-canvas");

        this.canvas.onpointerdown = (e) => this.handlePointerDown(e);
        this.canvas.onpointermove = (e) => this.handlePointerMove(e);
        this.canvas.onpointerup = (e) => this.handlePointerUp(e);

        this.canvas.width = this.parent.clientWidth;
        this.canvas.height = this.parent.clientHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = this.parent.clientWidth;
            this.canvas.height = this.parent.clientHeight;
            this.needsRedraw = true;
        });

        parent.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d")!;
    }

    render() {
        if (!this.needsRedraw) return;
        this.needsRedraw = false;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let lineId in this.lines) {
            let line = this.lines[lineId];

            this.ctx.strokeStyle = line.color;
            this.ctx.beginPath();
            for (let point of line.points) {
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.stroke();
        }
    }

    handlePointerDown(e: PointerEvent) {
        e.preventDefault();

        this.lines[this.nextLineId] = {
            color: "#000",
            points: [{
                x: e.clientX,
                y: e.clientY,
                weight: e.pressure
            }]
        };

        this.pointers[e.pointerId] = {
            x: e.clientX,
            y: e.clientY,
            action: PointerAction.Draw,
            lineId: this.nextLineId
        }

        this.nextLineId += 1;
        this.needsRedraw = true;
    }

    handlePointerMove(e: PointerEvent) {
        e.preventDefault();

        let p = this.pointers[e.pointerId];
        p.x = e.clientX;
        p.y = e.clientY;

        if (p.action == PointerAction.Draw) {
            this.lines[p.lineId].points.push({
                x: e.clientX,
                y: e.clientY,
                weight: e.pressure
            });
        }
        this.needsRedraw = true;
    }

    handlePointerUp(e: PointerEvent) {
        delete this.pointers[e.pointerId];
        this.needsRedraw = true;
    }
}