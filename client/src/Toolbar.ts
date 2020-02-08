export default class Toolbar {
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