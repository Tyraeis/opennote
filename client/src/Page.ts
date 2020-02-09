import msgpack from './lib/msgpack.min';

interface Line {
    color: string,
    points: Point[]
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
    return dx * dx + dy * dy;
}

export default class Page {
    parent: HTMLElement;
    _canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    lines: Record<number, Line> = {};
    pointers: Record<number, PointerState> = {};
    nextLineId = 0;
    needsRedraw = false;

    public color: string = "#000";
    public onchange: () => void | null;

    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
        this.parent = canvas.parentElement;

        this._canvas.onpointerdown = (e) => this.handlePointerDown(e);
        this._canvas.onpointermove = (e) => this.handlePointerMove(e);
        this._canvas.onpointerup = (e) => this.handlePointerUp(e);
        this._canvas.oncontextmenu = (e) => e.preventDefault();

        this.needsRedraw = true;

        this.ctx = this._canvas.getContext("2d")!;

        window.addEventListener('resize', () => {
            this.needsRedraw = true;
        });
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas
    }

    clear() {
        this.lines = [];
        this.nextLineId = 0;
        this.needsRedraw = true;
    }

    export(): string {
        let data: any = {
            lines: []
        };

        for (let lineId in this.lines) {
            let line = this.lines[lineId];
            let compact_line: any = { color: line.color, points: [] };
            for (let point of line.points) {
                compact_line.points.push([point.x, point.y, point.weight])
            }
            data.lines.push(compact_line)
        }

        return String.fromCharCode.apply(null, msgpack.serialize(data));
    }

    import(data_ser: string) {
        // Clear existing data
        this.clear();

        var buf = new Uint8Array(data_ser.length);
        for (var i = 0; i < data_ser.length; i++) {
            buf[i] = data_ser.charCodeAt(i);
        }

        try {
            let data: any = msgpack.deserialize(buf);
        
            for (let line of data.lines) {
                let new_line: Line = {
                    color: line.color,
                    points: []
                };
                for (let point of line.points) {
                    new_line.points.push({
                        x: point[0],
                        y: point[1],
                        weight: point[2]
                    });
                }
                this.lines[this.nextLineId++] = new_line;
            }
        } catch (e) {
            console.log(e);
            alert("Document is corrupted");
        }
    }

    render() {
        if (!this.needsRedraw) return;
        this.needsRedraw = false;

        this._canvas.width = this.parent.clientWidth;
        this._canvas.height = this.parent.clientHeight;

        this.ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

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

    doChange() {
        if (this.onchange != null) {
            this.onchange();
        }
    }

    getAndUpdatePointer(e: PointerEvent): PointerState {
        if (!(e.pointerId in this.pointers)) {
            return this.pointers[e.pointerId] = {
                x: e.offsetX,
                y: e.offsetY,
                action: PointerAction.None,
                lineId: -1
            }
        } else {
            let p = this.pointers[e.pointerId];
            p.x = e.offsetX;
            p.y = e.offsetY;
            return p;
        }
    }

    handlePointerDown(e: PointerEvent) {
        e.preventDefault();

        // Started drawing a line
        // Create new line object
        this.lines[this.nextLineId] = {
            color: this.color,
            points: [{
                x: e.offsetX,
                y: e.offsetY,
                weight: e.pressure
            }]
        };

        // Add pointer to pointer list
        let p = this.getAndUpdatePointer(e);
        if (e.pointerType == "pen" && e.buttons & 0x20 || e.pointerType == "mouse" && e.buttons & 2) {
            // Erase
            p.action = PointerAction.Erase;
        } else {
            // Draw
            p.action = PointerAction.Draw;
        }
        p.lineId = this.nextLineId;

        this.nextLineId += 1;
        this.needsRedraw = true;
        this.doChange();
    }

    handlePointerMove(e: PointerEvent) {
        e.preventDefault();

        // Update pointer object
        let p = this.getAndUpdatePointer(e);

        if (p) {
            if (p.action == PointerAction.Draw) {
                // Extend line
                this.lines[p.lineId].points.push({
                    x: e.offsetX,
                    y: e.offsetY,
                    weight: e.pressure
                });
                this.doChange();
            } else if (p.action == PointerAction.Erase) {
                // Try to erase lines
                for (let lineId in this.lines) {
                    let line = this.lines[lineId];
                    for (let point of line.points) {
                        // Erase this line if the point is close to the pen
                        if (square_distance(point.x, point.y, p.x, p.y) < 25) {
                            delete this.lines[lineId];
                            break;
                        }
                    }
                }
                this.doChange();
            }
        }

        this.needsRedraw = true;
    }

    handlePointerUp(e: PointerEvent) {
        // Stopped drawing line; delete pointer object
        let p = this.getAndUpdatePointer(e);

        if (p) {
            if (p.action == PointerAction.Draw) {
                // Extend line
                this.lines[p.lineId].points.push({
                    x: e.offsetX,
                    y: e.offsetY,
                    weight: e.pressure
                });
            }
        }
                
        delete this.pointers[e.pointerId];
        this.needsRedraw = true;
        this.doChange();
    }
}