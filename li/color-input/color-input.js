import { LiElement, html, css } from '../../li.js';

import '../../lib/maska/maska.js';

customElements.define('li-color-input', class LiColorInput extends LiElement {
    static get properties() {
        return {
            value: { type: String, default: '#F00000' },
        }
    }

    firstUpdated() {
        super.firstUpdated();

    }

    static get styles() {
        return css`
            :host {
                display: flex;
                justify-content: center;
                align-items: center;
            }
            input {
                border: none;
                outline: none;
            }
            #txt {
                width: 100%;
            }
            #clr {
                width: 24px;
            }
        `;
    }

    firstUpdated() {
        super.firstUpdated();

        this.maska = Maska.create(this.$id.txt, { mask: '!#HHHHHH', tokens: { 'H': { pattern: /[0-9a-fA-F]/, uppercase: true } } });
    }

    render() {
        return html`
            <input id="txt" .value="${this.value}" @change="${this._setTxt}"/>
            <input id="clr" type="color" .value="${this.value}" @input="${this._setClr}"/>
        `;
    }

    _setTxt(e) {
        this.value = this.$id?.txt.value;
        this.$update();
    }
    _setClr(e) {
        this.value = this.$id?.clr.value.toUpperCase();
        this.$update();
    }
});
