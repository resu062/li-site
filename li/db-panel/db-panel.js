import { LiElement, html, css } from '../../li.js';

import '../button/button.js'
import '../tree/tree.js';

customElements.define('li-db-panel', class LiDbPanel extends LiElement {
    static get properties() {
        return {
            _useInfo: { type: Boolean, default: true },
            layout: {
                type: Object, default: {
                    items: [{
                        id: 'li-data-tree', name: 'data-tree', label: 'lidb', expanded: true, items: [
                            { label: 'Org1', items: [{ label: 'Dir' }, { label: 'Buh' }] },
                            { label: 'Org2', items: [{ label: 'Dir' }, { label: 'Buh' }, { label: 'Off' }, { label: 'Scl1' }, { label: 'Scl2' }, { label: 'Scl3' }] }
                        ]
                    }]
                }
            },
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
                <li-tree .item="${this.layout}" .allowCheck="${false}"></li-tree>
            </div>
        `;
    }
    async _contextmenu(e) {
        e.preventDefault();
        const cb = () => console.log('0987654321');
        let val = await LI.show('dropdown', 'db-cell-list', {
            list: [
                { icon: 'add', label: 'Add item', action: 'addItem', hideIcons: '23' },
                { icon: 'close', label: 'Delete item', hideIcons: '23' },
                { icon: 'refresh', label: '10 x console.log(ulid)', action: 'ulid', hideIcons: '23' },
                { icon: 'refresh', label: '2 x date.toISOString', action: 'toISOString', hideIcons: '23' },
            ]
        }, {});
        //LI.action(val.detail.action);
        return val;
    }
});
