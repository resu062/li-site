import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js'

customElements.define('li-db-panel', class LiDbPanel extends LiElement {
    static get properties() {
        return {
            _useInfo: { type: Boolean, default: true },
            label: { type: String, default: '' },
        }
    }

    static get styles() {
        return css`
            .container {
                border: 1px solid red;
                width: 300px;
                height: 300px;
            }
        `;
    }

    render() {
        return html`
            <div class="container" @contextmenu="${this._contextmenu}">

            </div>
        `;
    }
    async _contextmenu(e) {
        e.preventDefault();
        const cb = () => console.log('0987654321');
        let val = await LI.show('dropdown', 'db-cell-list', { list: [{ icon: 'add', label: 'Add db', action: 'addDB' }, { icon: 'close', label: 'Delete db' }, { icon: 'add', label: 'Add class' }, { icon: 'close', label: 'Delete class' }] }, {});
        LI.action(val.detail.action);
        return val;
    }
});
