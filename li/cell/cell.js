import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../../lib/cleave/cleave-esm.min.js';

customElements.define('li-cell', class LiCell extends LiElement {
    static get properties() {
        return {
            type: { type: String, default: 'text' },
            value: { type: String, default: '' },
            icon: { type: String, default: '' },
            br: { type: String, default: 'bottom right' },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        if (this.type === 'number') {
            this._ca = new Cleave(this.$id.input, {
                numeral: true,
                delimiter: ' ',
                //numeralPositiveOnly: true
            });
        } else  if (this.type === 'date') {
            this._dt = new Cleave(this.$id.input, {
                date: true,
                datePattern: ['Y', 'm', 'd'],
                delimiter: '-'
            });
        }
    }

    static get styles() {
        return css`
            :host {
                display:flex;
                flex-direction: column;
                overflow: hidden;
            }
            .top { border-top: 1px lightgray solid; }
            .right { border-right: 1px lightgray solid; }
            .bottom { border-bottom: 1px lightgray solid; }
            .left { border-left: 1px lightgray solid; }
            .red { background: red; }
            #cell {
                display:flex;
                align-items: center;
                padding: 4px;
            }
            #input {
                font-size: 1em;
                color: gray;
                font-family: Arial;
                text-align: left;
                outline: none; 
                background: transparent; 
                border: none;
                flex: 1;
                min-width: 0px;
            } 
            #input[type="checkbox"] {
                text-align: center;
            }
            #input[type="number"] {
                text-align: right;
            } 
        `;
    }

    render() {
        return html`
            <div id="cell" class="${this.br}">
                <input id="input" type="${this.type}" value="${this.value}" @keydown="${e => this._change(e)}" ?readonly="${this.props?.readOnly}"/>
                ${this.icon ? html`
                    <li-button name="${this.icon}" size="16" fill="darkgray" color="darkgray" @click="${this._tap}"></li-button>`
                : html``}
            </div>
        `;
    }

    updated() {
        if (this.type === 'checkbox') this.$id.input.checked = this.value;
    }

    _change(e) {
        if (e.keyCode === 13) this.value = this.type === 'checkbox' ? e.target.checked : e.target.value;
    }

    _tap(e) {
        let el = this.$id.input;
        this.value = this.type === 'checkbox' ? el.checked : e.target.className ? e.target.innerText : el.value;
        LI.fire(document, "dropdownDataChange", { target: this, value: this.value });
    }
});