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
        this._expanded = props.expanded || false;
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

    get $expanded() {
        return this._expanded;
    }

    set $expanded(n) {
        this._expanded = n;
        LI.fire(document, 'updateTree', { ulid });
    }
}
let ulid = LI.ulid();
let dragInfo = {};

customElements.define('li-layout-designer', class LiLayoutDesigner extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: undefined },
            layout: { type: Object, default: undefined },
            keyID: { type: String, default: 'id' },
            keyLabel: { type: String, default: 'label' },
            keyItems: { type: String, default: 'items' },
            designMode: { type: Boolean, default: false }
        }
    }

    updated(changedProps) {
        super.update(changedProps);
        //console.log(changedProps);
        if (changedProps.has('item') && this.item) {
            this.layout = new LayoutItem(this.item, { keyID: this.keyID, keyLabel: this.keyLabel, keyItems: this.keyItems });
        }
    }

    render() {
        return html`
            <li-layout-app hide="r">
                <div slot="app-top">li-layout-designer</div>
                <li-button slot="app-top-right" name="tree-structure" toggledClass="ontoggled" style="margin-right: 4px;" @click="${this._setDesignMode}"></li-button>>
                <div slot="app-left" style="margin:4px 0px 4px 4px; border: .5px solid lightgray;border-bottom:none">
                    <li-tree .item="${this.layout}" ulid="${ulid}"></li-tree>
                </div>
                <li-layout-structure id="structure" slot="app-main" .items="${this.layout && this.layout.items || this.layout}" ?designMode="${this.designMode}"></li-layout-structure>
            </li-layout-app>
        `;
    }

    _setDesignMode(e) {
        this.designMode = e.target.toggled;
    }
});

customElements.define('li-layout-structure', class LiLayoutStructure extends LiElement {
    static get properties() {
        return {
            items: { type: Array, default: [] },
            designMode: { type: Boolean, default: false }
        }
    }

    render() {
        if (!this.items || !this.items.map) return html``;
        return html`
            <style>
                :host {
                    border: .5px solid lightblue;
                    margin: 2px;
                    padding: 2px;
                    overflow: auto;
                    display: flex;
                    flex-direction: column;
                }
            </style>
            ${this.items.map(i => html`
                <li-layout-container .item=${i} ?designMode="${this.designMode}"></li-layout-container>
            `)}
        `;
    }
});

customElements.define('li-layout-container', class LiLayoutContainer extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: {} },
            designMode: { type: Boolean, default: false },
            iconSize: { type: Number, default: 24 }
        }
    }

    constructor() {
        super();
        this.__requestUpdate = this._requestUpdate.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        LI.listen(document, 'updateTree', this.__requestUpdate);
    }
    disconnectedCallback() {
        LI.unlisten(document, 'updateTree', this.__requestUpdate);
        super.disconnectedCallback();
    }

    _requestUpdate(e) {
        if (e.detail && e.detail.ulid === ulid) this.requestUpdate();
    }

    render() {
        return html`
            <style>
                :host {
                    min-width: 200px;
                }
                .complex {
                    margin-left: 16px;
                    overflow: hidden;
                }
                oda-icon {
                    cursor: pointer;
                }
                .design-row {
                    border: .5px dotted lightgray;
                    cursor: move;
                }
                .design-row:hover {
                    background: lightyellow;
                }
            </style>
            <div class="${this.designMode ? 'design-row' : ''}" :draggable @dragstart="${this._dragstart}" @dragend="${this._dragend}"
                    @dragover="${this._dragover}" @dragleave="${this._dragleave}" @drop="${this._dragdrop}"  style="display:flex;align-items:center">
                ${this.item && this.item.items && this.item.items.length ? html`
                    <li-button name="chevron-right" toggledClass="right90" ?toggled="${this.item && this.item.$expanded}" style="pointer-events:visible" @click="${this._toggleExpand}" border="0"></li-button>`
                : html`
                    <div style="width:${this.iconSize}px;height:${this.iconSize}px;"></div>
                `}
                <label style="cursor: move;">${this.item && this.item.label}</label>
                <div style="flex:1;"></div>
            </div>
            ${this.item && this.item.items && this.item.items.length && this.item.$expanded ? html`
                <li-layout-structure class="complex"
                    .items="${this.item.items || []}" ?designMode="${this.designMode}" style="flex-wrap: wrap;"></li-layout-structure>` : ''
            }
        
        `;
    }

    _toggleExpand(e) {
        this.item.$expanded = e.target.toggled;
        this.requestUpdate();
    }
    _dragstart() {

    }
    _dragend() {

    }
    _dragover() {

    }
    _dragleave() {

    }
    _dragdrop() {

    }
});