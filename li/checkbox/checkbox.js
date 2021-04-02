import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../icon/icon.js'

customElements.define('li-checkbox', class LiCheckbox extends LiElement {
    static get properties() {
        return {
            fill: { type: String, default: 'gray' },
            back: { type: String, default: '#fdfdfd' },
            size: { type: Number, default: 24 },
            toggled: { type: Boolean, default: false, reflect: true },
            indeterminate: { type: Boolean, default: false, reflect: true },
            useIndeterminate: { type: Boolean, default: false, reflect: true },
        }
    }

    static get styles() {
        return css`
            :host {
                display: inline-block;
                vertical-align: middle;
                font-family:Verdana, Geneva, Tahoma, sans-serif;
                margin: 1px;
                user-select: none;
            }
            .li-chk {
                display: flex;
                align-items: center;
                cursor: pointer;
            }
            .li-chk:hover {
                transition: .3s;
                filter: brightness(85%);
            }
            .li-chk:active {
                transition: .1s;
                filter: brightness(70%);
            }
            .li-chk:focus {
                outline:none;
            }
        `;
    }
    get icon() {
        return this.indeterminate ? 'check-box-indeterminate' : this.toggled ? 'check-box' : 'check-box-outline-blank';
    }
    render() {
        return html`
            <div class="li-chk"  tabindex="0" style="
                    width: ${this.size};
                    height: ${this.size};
                    background-color: ${this.back};"
                    @click="${this._click}">
                <li-icon name="${this.icon}" size=${this.size} fill=${this.fill}></li-icon>
            </div>       
        `;
    }

    _click(e) {
        if (this.useIndeterminate) {
            this.indeterminate = !this.indeterminate;
            if (!this.indeterminate)
                this.toggled = !this.toggled;
        } else {
            this.useIndeterminate = false;
            this.toggled = !this.toggled;
        }
        this.$update();
    }
});
