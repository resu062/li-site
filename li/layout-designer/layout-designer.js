import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../layout-app/layout-app.js'
import '../tree/tree.js';

class LayoutItem {
    constructor(item, props = {}, parent) {
        this.$item = item;
        this.$owner = this.$root = parent;
        if (this.$root && !this.$root.color) {
            if (_props.hColor === 0)
                this.$root.color = 'white';
            else
                this.$root.color = `hsla(${_props.hColor}, 50%, 50%, .1)`;
            _props.hColor += 63;
        }
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

    get name() {
        return this.$item.name || this.label;
    }

    get items() {
        if (!this._items) {
            this._items = (this.$item[this._keyItems] || []).map(i => {
                return new LayoutItem(i, { keyID: this._keyID, keyLabel: this._keyLabel, keyItems: this._keyItems }, this);
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

class GroupItem {
    complex = 'li-layout-group'
    _expanded = true
    _label = 'group'
    constructor(props, target, parent) {
        this.align = ['left', 'right'].includes(props.to) ? 'row' : 'column';
        this.label = props.label || this.label + '-' + this.align.slice(0, 3);
        this.name = props.name || '~' + this.align.slice(0, 3) + '-' + LI.ulid();
        if (target.$owner && target.$owner.items)
            target.$owner.items.splice(target.$owner.items.indexOf(target), 1, this);
        this.$root = target.$root;
        this.$owner = target.$owner;
        target.$owner = this;
        this.items = [target];
    }
    insert(target, item, to) {
        let idx = this.items.indexOf(target);
        if (['right', 'bottom'].includes(to))
            ++idx;
        this.items.splice(idx, 0, item)
        item.$owner.items.splice(item.$owner.items.indexOf(item), 1);
        item.$owner = this;
    }
    get label() {
        return this._label || this.name;
    }
    set label(v) {
        this._label = v;
    }
    get hideExpander() {
        return !this.checked;
    }
    get $expanded() {
        return this.hideExpander ? true : this._expanded;
    }
    set $expanded(v) {
        this._expanded = v;
    }
}
function findRecursive(id) {
    if (!this.items) return;
    let items = this.items.filter(i => i.$root.name === this.$root.name);
    if (!items || !items.length) items = this.items;
    return items.reduce((res, i) => {
        if (i.name === id)
            res = i;
        return res || findRecursive.call(i, id);
    }, undefined);
}

let dragInfo = {};
let _props = { useColor: false, hColor: 10, showGroup: false };
let ulid = LI.ulid();

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
            this.layout.$root = this.layout;
            this.layout.$owner = this.layout;
        }
    }

    render() {
        return html`
            <li-layout-app hide="r">
                <div slot="app-top">li-layout-designer</div>
                <div slot="app-top-right">
                    <li-button name="select-all" toggledClass="ontoggled" style="margin-right: 2px;" @click="${this._showGroup}"></li-button>
                    <li-button name="color-lens" toggledClass="ontoggled" style="margin-right: 2px;" @click="${this._setUseColor}"></li-button>
                    <li-button name="settings" toggledClass="ontoggled" style="margin-right: 4px;" @click="${this._setDesignMode}"></li-button>
                </div>
                <div slot="app-left" style="margin:4px 0px 4px 4px; border: 1px solid lightgray;border-bottom:none">
                    <li-tree .item="${this.layout}" ulid="${ulid}"></li-tree>
                </div>
                <li-layout-structure id="structure" slot="app-main" .layout="${this.layout}" .items="${this.layout && this.layout.items || this.layout}" ?designMode="${this.designMode}"></li-layout-structure>
            </li-layout-app>
        `;
    }

    _setDesignMode(e) {
        this.designMode = e.target.toggled;
    }

    _setUseColor(e) {
        _props.useColor = e.target.toggled;
    }

    _showGroup(e) {
        _props.showGroup = e.target.toggled;
    }
});

customElements.define('li-layout-structure', class LiLayoutStructure extends LiElement {
    static get properties() {
        return {
            layout: { type: Object, default: undefined },
            items: { type: Array, default: [] },
            designMode: { type: Boolean, default: false },
            actions: { type: Array, default: [] },
        }
    }

    constructor() {
        super();
        this.__requestUpdate = this._requestUpdate.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        LI.listen(document, 'requestUpdate', this.__requestUpdate);
    }
    disconnectedCallback() {
        LI.unlisten(document, 'requestUpdate', this.__requestUpdate);
        super.disconnectedCallback();
    }

    _requestUpdate(e) {
        this.requestUpdate();
    }

    render() {
        if (!this.items || !this.items.map) return html``;
        return html`
            <style>
                :host {
                    overflow: auto;
                    display: flex;
                    flex-direction: ${this.layout.align || 'column'};
                }
            </style>
            ${this.items.map(i => html`
                <li-layout-container .item=${i} ?designMode="${this.designMode}" ?align="${this.layout.align}"></li-layout-container>
            `)}
        `;
    }

    execute(action) {
        this.actions = this.actions || [];
        this.actions.push(action);
        this[action.action](action.props);
    }
    move(props) {
        if (!this.items) return;
        const item = findRecursive.call(this.layout.$root, props.item);
        const target = findRecursive.call(this.layout.$root, props.target);
        if (!item || !target) return;
        let _align = ['left', 'right'].includes(props.to) ? 'row' : 'col';
        if (!(target.$owner instanceof GroupItem) || (target.$owner && target.$owner.name && !target.$owner.name.includes(_align)))
            target.$owner = new GroupItem(props, target, this.layout);
        target.$owner.insert(target, item, props.to)
        this.actions.last.props.name = this.actions.last.props.name || target.$owner.name;
        this.actions.last.props.label = this.actions.last.props.label || target.$owner.label;
        LI.fire(document, 'requestUpdate');
        LI.fire(document, 'updateTree', { ulid });
    }
});

customElements.define('li-layout-container', class LiLayoutContainer extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: {} },
            designMode: { type: Boolean, default: false },
            iconSize: { type: String, default: '28' },
            draggable: { type: Boolean, default: true, reflect: true },
            align: { type: Boolean, default: true },
        }
    }

    get isGroup() {
        return this.item instanceof GroupItem;
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
                    flex: 1;
                }
                .complex {
                    margin-left: 14px;
                    overflow: hidden;
                    border-left: 1px dashed lightgray;
                }
                .group {
                    overflow: hidden;
                }
                oda-icon {
                    cursor: pointer;
                }
                .design-row {
                    border: 1px dotted lightgray;
                    cursor: move;
                }
                .design-row:hover {
                    background: lightyellow;
                }
            </style>
            ${!_props.showGroup && this.isGroup ? '' : html`
                <div class="${this.designMode ? 'design-row' : ''}" draggable="${this.draggable}" @dragstart="${this._dragstart}" @dragend="${this._dragend}"
                        @dragover="${this._dragover}" @dragleave="${this._dragleave}" @drop="${this._dragdrop}"  style="display:flex;align-items:center;">
                    ${this.item && this.item.items && this.item.items.length ? html`
                        <li-button back="transparent" size="${this.iconSize}" name="chevron-right" toggledClass="right90" ?toggled="${this.item && this.item.$expanded}" style="pointer-events:visible" @click="${this._toggleExpand}" border="0"></li-button>`
                    : html`
                        <div style="width:${this.iconSize}px;height:${this.iconSize}px;"></div>
                    `}
                    <label style="cursor: move;">${this.item && this.item.label}</label>
                    <div style="flex:1;"></div>
                </div>
            `}
            ${this.item && this.item.items && this.item.items.length && this.item.$expanded ? html`
                <li-layout-structure class="${this.isGroup ? 'group' : 'complex'}"
                    .items="${this.item.items || []}" ?designMode="${this.designMode}" style="flex-wrap: wrap;background-color: ${_props.useColor ? this.item.color : ''};" .layout="${this.item}"></li-layout-structure>` : ''
            }       
        `;
    }

    _toggleExpand(e) {
        this.item.$expanded = e.target.toggled;
        this.requestUpdate();
    }
    _dragstart(e) {
        dragInfo.dragItem = this.item;
    }
    _dragend(e) {
        dragInfo = {};
        this._setShadow();
    }
    _dragover(e) {
        this._setShadow();
        if (dragInfo.dragItem === this.item) return;
        //if (dragInfo.dragItem.$root !== this.item.$root) return;

        e.preventDefault();

        let rect = e.currentTarget.getBoundingClientRect(),
            x = ((e.clientX - rect.left) - rect.width / 2) / rect.width * 2,
            y = ((e.clientY - rect.top) - rect.height / 2) / rect.height * 2,
            to = '';
        if (Math.abs(x) > Math.abs(y)) to = x < 0 ? 'left' : 'right';
        else to = y < 0 ? 'top' : 'bottom';
        this._setShadow(to);
        dragInfo.action = 'move';
        dragInfo.to = to;
    }
    _dragleave(e) {
        this._setShadow();
    }
    _dragdrop(e) {
        dragInfo.targetItem = this.item;
        this._setShadow();
        const action = { action: dragInfo.action, props: { item: dragInfo.dragItem.name, target: this.item.name, to: dragInfo.to } };
        this.$root.execute(action);
    }
    _setShadow(to = '') {
        if (!to) this.style.boxShadow = '';
        else {
            let lr = (to === 'left' ? '8px' : to === 'right' ? '-8px' : '0px');
            let tb = (to === 'top' ? '8px' : to === 'bottom' ? '-8px' : '0px');
            this.style.boxShadow = `inset ${lr} ${tb} 0px 2px  rgba(0,128,255,0.5)`;
        }
    }
});