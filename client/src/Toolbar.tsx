import * as React from 'react';

interface Pen {
    color: string,
    weight: number
}

interface ToolbarProps {
    onpenchange: (pen: Pen) => void
}

interface ToolbarState {
    color: string,
    pens: Pen[]
}

export default class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
    constructor(props: ToolbarProps) {
        super(props);
        this.state = {
            color: "#000",
            pens: [
                {
                    color: "#000",
                    weight: 5
                },
                {
                    color: "#f00",
                    weight: 5
                },
                {
                    color: "#0a0",
                    weight: 5
                },
                {
                    color: "#22f",
                    weight: 5
                },
            ]
        };
    }

    render() {
        let buttons = this.state.pens.map((button: Pen, index: number) => {
            let buttonId = 'pen' + index + 'Button';
            return <div key={index} className="pen">
                <input id={buttonId} className="pen-button" type="radio" name="pen" onChange={this.handlePenChange.bind(this)} data-value={index} />
                <label htmlFor={buttonId} className="pen-label">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <circle cx="12" cy="12" r={button.weight} fill={button.color}></circle>
                    </svg>
                </label>
            </div>
        });

        return (
            <header id="toolbar">
                <a className="toolbar-brand" href="#">OpenNote</a>
                <div id="pen-selector" className="toolbar-group">
                    {buttons}
                </div>
            </header>
        )
    }

    handlePenChange(evt: React.ChangeEvent<HTMLInputElement>) {
        console.log(this);
        let button = this.state.pens[Number(evt.target.dataset.value)];
        this.props.onpenchange(button);
    }
}

class Toolbar2 {
    element: HTMLElement;
    btnContainer: HTMLElement;
    _color: string;
    nextPenId: number = 0;
    onchange: (color: string) => void;

    constructor(onchange: (color: string) => void) {
        this.element = document.getElementById("toolbar");
        this.btnContainer = document.getElementById("pen-selector");
        this.onchange = onchange;

        this.createButton("#000");
        this.createButton("#f00");
        this.createButton("#0a0");
        this.createButton("#22f");
    }

    get color(): string {
        return this._color;
    }

    createButton(value: string) {
        let button = document.createElement("div");
        button.className = "pen";
        button.dataset.value = value;

        let inputId = "pen" + (this.nextPenId++).toString() + "Button";

        let input = document.createElement("input");
        input.type = "radio";
        input.name = "pen";
        input.className = "pen-button";
        input.id = inputId;

        let labelElement = document.createElement("label");
        labelElement.htmlFor = inputId;
        labelElement.className = "pen-label";
        labelElement.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="'+value+'"></svg>';
        
        button.appendChild(input);
        button.appendChild(labelElement);

        input.onchange = () => {
            if (input.checked) {
                this._color = value;
                this.onchange(value);
            }
        }

        this.btnContainer.appendChild(button);
    }
}