import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-db-cell', class LiDbCell extends LiElement {
    static get properties() {
        return {
            icon: { type: String, default: 'apps' },
            label: { type: String, default: 'db-cell ...' },
            action: { type: String, default: '' },
            callback: { type: Object, default: undefined },
            iconOpen: { type: String, default: 'flip-to-front' },
            iconSettings: { type: String, default: 'settings' },
            hideIcons: { type: String, default: '' }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.hideIcons) {
            if (this.hideIcons.includes('1')) this.icon = '';
            if (this.hideIcons.includes('2')) this.iconOpen = '';
            if (this.hideIcons.includes('3')) this.iconSettings = '';
        }
    }

    static get styles() {
        return css`
                .db-cell {
                    display:flex;
                    align-items: center;
                    justify-content: stretch;
                    border: 1px solid lightgray;
                    background: whitesmoke;
                    width: 260px;
                }
        `;
    }

    render() {
        return html`
            <div class="db-cell" @click="${this._tap}">
                <li-button name="${this.icon}" label="${this.label}" width="auto" style="flex:1" textAlign="left" borderColor="lightgray" border="0"></li-button>
                ${!this.iconOpen ? html`` : html`
                    <li-button name="${this.iconOpen}" fill="lightgray" border="0"></li-button>
                `}
                ${!this.iconSettings ? html`` : html`
                    <li-button name="${this.iconSettings}" fill="lightgray" border="0"></li-button>
                `}
            </div>
        `;
    }

    async _tap(e) {
        LI.fire(document, "dropdownDataChange", { target: this, value: e.target.label || e.target.name, callback: this.callback, action: this.action });
    }
});