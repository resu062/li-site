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
                margin-top: 4px;
                border: 1px solid orange;
                height: calc(100% - 10px);
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
        let val = await LI.show('dropdown', 'db-cell-list', { list: [
            { icon: 'add', label: 'Add item', action: 'addItem' }, 
            { icon: 'close', label: 'Delete item' }, 
            { icon: 'refresh', label: '10 x console.log(ulid)', action: 'ulid'  },
            { icon: 'refresh', label: '2 x date.toISOString', action: 'toISOString'  }, 
        ] }, {});
        LI.action(val.detail.action);
        return val;
    }
});
