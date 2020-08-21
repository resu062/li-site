import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-db-cell', class LiDbCell extends LiElement {
    static get properties() {
        return {
            icon: { type: String, default: 'apps'},
            label: { type: String, default: 'db-cell ...' }
        }
    }

    static get styles() {
        return css`
                #db-cell {
                    display:flex;
                    align-items: center;
                    justify-content: stretch;
                    border: .5px solid lightgray;
                    background: whitesmoke;
                    width: 240px;
                }
        `;
    }

    render() {
        return html`
            <div id="db-cell" @click="${this._tap}">
                <li-button name="${this.icon}" label="${this.label}" width="auto" style="flex:1" textAlign="left" borderColor="lightgray"></li-button>
                <li-button name="flip-to-front" fill="lightgray" border="0"></li-button>
                <li-button name="settings" fill="lightgray" border="0"></li-button>
            </div>
        `;
    }

    async _tap(e) {
        LI.fire(document, "dropdownDataChange", { value: e.target.label || e.target.name });
    }
});