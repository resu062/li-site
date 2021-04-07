import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../checkbox/checkbox.js';
import '../../lib/cleave/cleave-esm.min.js';

customElements.define('li-cell', class LiCell extends LiElement {
    static get properties() {
        return {
            type: { type: String, default: 'text' },
            value: { type: String, default: '' },
            left: { type: Array },
            right: { type: Array },
            readOnly: { type: Boolean, default: false, local: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();

        this.inputType = ['text','date', 'datetime', 'time', 'month', 'number', 'checkbox', 'radio', 'color', 'range', 'search', 'tel', 'url'].includes(this.type) ? this.type : 'text';

        if (this.type === 'cleave-numeral') {
            this.inputType = 'text';
            this._ca = new Cleave(this.$id.input, {
                numeral: true,
                delimiter: ' ',
            });
        } else if (this.type === 'cleave-date') {
            this.inputType = 'date';
            this._dt = new Cleave(this.$id.input, {
                date: true,
                datePattern: ['Y', 'm', 'd'],
                delimiter: '-'
            });
        }
        this.requestUpdate();
    }

    static get styles() {
        return css`
            :host {
                flex: 1;
                display:flex;
                justify-content: center;
                align-items: center;
                padding: 4px;
                overflow: hidden;

            }
            .div {
                font-size: 1em;
                color: gray;
                font-family: Arial;
                flex: 1;
                text-align: left;
                padding-left: 2px;
            }
            input {
                font-size: 1em;
                color: gray;
                font-family: Arial;
                flex: 1;
                text-align: left;
                outline: none; 
                background: transparent; 
                border: none;
                min-width: 0px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            } 
            input[type="checkbox"] {
                text-align: center;
            }
            input[type="number"] {
                text-align: right;
            }
            input[_type="cleave-numeral"] {
                text-align: right;
            }
        `;
    }

    render() {
        return html`
            ${this._left}
            ${this._center}
            ${this._right}
        `;
    }

    get _left() {
        if (this.left?.length)
            return html`${this.left.map(i => html`<li-cell-item .props=${i}></li-cell-item>`)}`;
    }
    get _center() {
        if (this.type === 'div')
            return html`<div class="div">${this.value}<slot></slot></div>`;
        else
        if (this.type === 'li-checkbox')
            return html`<li-checkbox></li-checkbox>`;
        else
            return html`<input id="input" _type="${this.type}" type="${this.inputType}" value="${this.value}" @keydown="${e => this._change(e)}" ?disabled="${this.readOnly}"/>
                ${this.type === 'textarea' ? html`<li-button name="aspect-ratio" @click="${this._openTextarea}" size="18"></li-button>` : html``}
            `;
    }
    get _right() {
        if (this.right?.length)
            return html`${this.right.map(i => html`<li-cell-item .props=${i}></li-cell-item>`)}`;
    }

    updated() {
        if (this.type === 'checkbox') this.$id.input.checked = this.value;
    }

    _openTextarea(e) {
        console.log('open textarea', e);
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

customElements.define('li-cell-item', class LiCellItem extends LiElement {
    static get properties() {
        return {
            props: { type: Object },
            readOnly: { type: Boolean, default: true, local: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
    }

    static get styles() {
        return css`

        `;
    }

    render() {
        return html`
            ${this.props?.name === 'icon' ? html`<li-icon .args="${this.props?.args}"></li-icon>` : html``}
            ${this.props?.name === 'button' ? html`<li-button .args="${this.props?.args}"></li-button>` : html``}
            ${this.props?.name === 'check' ? html`<li-checkbox .args="${this.props?.args}"></li-checkbox>` : html``}
        `;
    }
});