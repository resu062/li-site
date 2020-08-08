import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

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
            :host * {
                font-size: 1em;
                color: dark;
                font-family: Arial;
            }   
        </style>
            <div  style="width: auto; background:lightyellow; border: 1px solid lightblue; padding:2.5px;">
                <input id="input" type="${this.type}" value="${this.value}" @change="${e => this._change(e)}" style="text-align: center;width: 100%; outline: none; background: transparent; border: none"/>
            </div>
        `;
    }

    _change(e) {
        this.value = this.type === 'checkbox' ? e.target.checked : e.target.value;
    }
});