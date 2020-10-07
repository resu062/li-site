import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../db-cell/db-cell.js';

customElements.define('li-db-cell-list', class LiDbCellList extends LiElement {
    static get properties() {
        return {
            list: { type: Array, default: [] }
        }
    }

    static get styles() {
        return css`
                .db-list {
                    display:flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid lightgray;
                }
        `;
    }

    render() {
        return html`
            <div class="db-list">
                ${this.list.map(i => html`<li-db-cell icon="${i.icon}" label="${i.label}" action="${i.action}" .callback="${i.callback}" hideIcons="${i.hideIcons}"></li-db-cell>`)}
            </div>
        `;
    }

});