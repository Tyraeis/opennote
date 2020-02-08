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

function square_distance(x1: number, y1: number, x2: number, y2: number) {
    let dx = x2 - x1, dy = y2 - y1;
    return dx*dx + dy*dy;
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

        // Draw all lines
        for (let lineId in this.lines) {
            let line = this.lines[lineId];

            this.ctx.strokeStyle = line.color;
            for (let i = 1; i < line.points.length; i++) {
                let p1 = line.points[i - 1];
                let p2 = line.points[i];

                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.lineWidth = ((p1.weight + p2.weight) / 2) * 5;
                this.ctx.stroke();
            }
            this.ctx.stroke();
        }
    }

    getAndUpdatePointer(e: PointerEvent): PointerState {
        if (!(e.pointerId in this.pointers)) {
            return this.pointers[e.pointerId] = {
                x: e.clientX,
                y: e.clientY,
                action: PointerAction.None,
                lineId: -1
            }
        } else {
            let p = this.pointers[e.pointerId];
            p.x = e.clientX;
            p.y = e.clientY;
            return p;
        }
    }

    handlePointerDown(e: PointerEvent) {
        e.preventDefault();

        // Started drawing a line
        // Create new line object
        this.lines[this.nextLineId] = {
            color: "#000",
            points: [{
                x: e.clientX,
                y: e.clientY,
                weight: e.pressure
            }]
        };

        // Add pointer to pointer list
        let p = this.getAndUpdatePointer(e);
        if (e.buttons & 0x20) {
            // Erase
            p.action = PointerAction.Erase;
        } else {
            // Draw
            p.action = PointerAction.Draw;
        }
        p.lineId = this.nextLineId;
        
        this.nextLineId += 1;
        this.needsRedraw = true;
    }
    
    handlePointerMove(e: PointerEvent) {
        e.preventDefault();
        
        // Update pointer object
        let p = this.getAndUpdatePointer(e);
        
        if (p) {
            if (p.action == PointerAction.Draw) {
                // Extend line
                this.lines[p.lineId].points.push({
                    x: e.clientX,
                    y: e.clientY,
                    weight: e.pressure
                });
            } else if (p.action == PointerAction.Erase) {
                // Try to erase lines
                for (let lineId in this.lines) {
                    let line = this.lines[lineId];
                    for (let point of line.points) {
                        // Check for line intersections

                        if (square_distance(point.x, point.y, p.x, p.y) < 25) {
                            delete this.lines[lineId];
                            break;
                        }
                    }
                }
            }
        }


        this.needsRedraw = true;
    }

    handlePointerUp(e: PointerEvent) {
        // Stopped drawing line; delete pointer object
        delete this.pointers[e.pointerId];
        this.needsRedraw = true;
    }
}