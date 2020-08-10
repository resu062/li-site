import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-cell', class LiCell extends LiElement {
    static get properties() {
        return {
            type: { type: String, default: 'text' },
            value: { type: String, default: '' }
        }
    }

    updated(changedProps) {
        if (this.type === 'checkbox') this.$id.input.checked = this.value;
    }

    render() {
        return html`
        <style>
            :host {
                display:flex;
                flex-direction: column;
                align-items: stretch;
                justify-content: center;
                overflow: hidden;
            } 
            div {
                display:flex;
                justify-content: center;
                align-items: center;
                background: lightyellow; 
                padding: 2px;
                border:1px solid lightblue; 
            }
            input {
                font-size: 1em;
                color: dark;
                font-family: Arial;
                text-align: center;
                outline: none; 
                background: transparent; 
                border: none;
                flex: 1;
                min-width: 0px;
            }  
        </style>
            <div>
                <input id="input" type="${this.type}" value="${this.value}" @change="${e => this._change(e)}"/>
                <li-button name="check" size="16" fill="lightblue" color="lightblue" @click="${this._tap}"></li-button>
            </div>
        `;
    }

    _change(e) {
        this.value = this.type === 'checkbox' ? e.target.checked : e.target.value;
    }

    _tap() {
        let el = this.$id.input;
        this.value = this.type === 'checkbox' ? el.checked : el.value;
        LI.fire(document, "okChangedValue");
    }
});