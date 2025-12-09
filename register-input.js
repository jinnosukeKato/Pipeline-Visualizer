class RegisterInput extends HTMLElement {
  constructor() {
    super();
    this.shadowDOM = this.attachShadow({ mode: "open" });
    this.shadowDOM.innerHTML = `
            <select>
                <option value="R0">R0</option>
                <option value="R1">R1</option>
                <option value="R2">R2</option>
                <option value="R3">R3</option>
                <option value="R4">R4</option>
                <option value="R5">R5</option>
            </select>
        `;
    this.selectElement = this.shadowDOM.querySelector("select");
  }

  get value() {
    return this.selectElement.value;
  }

  set value(val) {
    this.selectElement.value = val;
  }

  get disabled() {
    return this.selectElement.disabled;
  }

  set disabled(val) {
    this.selectElement.disabled = val;
  }
}

customElements.define("register-input", RegisterInput);
