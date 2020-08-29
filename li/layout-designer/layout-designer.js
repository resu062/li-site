import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../layout-app/layout-app.js'
import '../tree/tree.js';

class LayoutItem {
    constructor(item, props = {}) {
        this.$item = item;
        this._keyID = props.keyID || 'id';
        this._keyLabel = props.keyLabel || 'label';
        this._keyItems = props.keyItems || 'items';
    }

    get id() {
        if (!this._id) {
            this._id = this.$item[this._keyID] || LI.ulid();
        }
        return this._id;
    }

    get label() {
        if (!this._label) {
            this._label = this.$item[this._keyLabel];
        }
        return this._label;
    }
    
    get items() {
        if (!this._items) {
            this._items = (this.$item[this._keyItems] || []).map(i => {
                return new LayoutItem(i, { keyID: this._keyID, keyLabel: this._keyLabel, keyItems: this._keyItems });
            })
        }
        return this._items;
    }
}
let dragInfo = {};

customElements.define('li-layout-designer', class LiLayoutDesigner extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: undefined },
            layout: { type: Object, default: undefined },
            keyID: { type: String, default: 'id' },
            keyLabel: { type: String, default: 'label' },
            keyItems: { type: String, default: 'items' },
            designMode: { type: Boolean, default: false },
        }
    }

    connectedCallback() {
        super.connectedCallback();
    }

    updated(changedProps) {
        super.update(changedProps);
        console.log(changedProps);
        if (changedProps.has('item') && this.item) {
            this.layout = new LayoutItem(this.item, { keyID: this.keyID, keyLabel: this.keyLabel, keyItems: this.keyItems });
        }
    }

    render() {
        return html`
            <li-layout-app hide="r">
                <div slot="app-top">li-layout-designer</div>
                <li-button slot="app-top-right" name="tree-structure" toggledClass="ontoggled" style="margin-right: 4px;"></li-button>>
                <div slot="app-left" style="margin:4px 0px 4px 4px; border: .5px solid lightgray;border-bottom:none">
                    <li-tree .item="${this.layout}"></li-tree>
                </div>
            </li-layout-app>
        `;
    }
});
