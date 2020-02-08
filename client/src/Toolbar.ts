export default class Toolbar {
    element: HTMLElement;
    btnContainer: Element;
    _color: string;
    onchange: (color: string) => void;

    constructor(onchange: (color: string) => void) {
        this.element = document.getElementById("toolbar");
        this.btnContainer = this.element.firstElementChild;
        this.onchange = onchange;

        this.createButton("#000", "Black");
        this.createButton("#f00", "Red");
        this.createButton("#0a0", "Green");
        this.createButton("#22f", "Blue");
    }

    get color(): string {
        return this._color;
    }

    createButton(value: string, label: string) {
        let button = document.createElement("button");
        button.className = "btn btn-secondary";
        button.dataset.value = value;
        button.textContent = label;
        button.type = "button";

        button.onclick = () => {
            this._color = value;
            this.onchange(value);
        }

        this.btnContainer.appendChild(button);
    }
}