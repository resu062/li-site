import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import { Observable } from '../../lib/object-observer/object-observer.min.js';
import '../button/button.js';
import '../layout-app/layout-app.js'
import '../tree/tree.js';

class LayoutItem {
    constructor(item, props = {}, parent) {
        this.$item = item;
        this.$props = props;
        this.$owner = this.$root = parent;
        if (this.$root && !this.$root.color) {
            if (_props.hColor === 0)
                this.$root.color = 'white';
            else
                this.$root.color = `hsla(${_props.hColor}, 70%, 50%, 1)`;
            _props.hColor += 63;
        }
        this._keyID = props.keyID || 'id';
        this._keyLabel = props.keyLabel || 'label';
        this._keyItems = props.keyItems || 'items';
        this._expanded = props.expanded || false;
    }

    get id() {
        if (!this._id) {
            this._id = this.$props.id || this.$item[this._keyID] || LI.ulid();
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
    constructor(props, target, parent) {
        this.complex = 'li-layout-group';
        this._expanded = true;
        this._label = 'group';
        this.align = ['left', 'right'].includes(props.to) ? 'row' : 'column';
        this.label = props.label || this.label + '-' + this.align.slice(0, 3);
        this.id = props.id || LI.ulid();
        this.name = props.name || '~' + this.align.slice(0, 3) + '-' + this.id;
        if (target.$owner && target.$owner.items)
            target.$owner.items.splice(target.$owner.items.indexOf(target), 1, this);
        this.$root = target.$root;
        this.$owner = parent;
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
let observableUpdate = Observable.from({ update: false });
let selected = {};
let selection = [];
let img = new Image();
img.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAAACXBIWXMAAAsSAAALEgHS3X78AAAAYUlEQVRIie2WoQ0AMQgArxW1jPCu8/wIP3e3wNbwKaIrEBIuwaDugqEZPAgLZZAJYaPM7vIvA4NUc5yFdS5gvshIg55U/VIB0VRANBUQTQVEUwHRdP/qvoTmx1nYud9pZf5YeD58rKruzAAAAABJRU5ErkJggg==`
let img3 = new Image();
img3.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAYAAACL6W/rAAAACXBIWXMAAAsSAAALEgHS3X78AAAAv0lEQVRYhe2YMQ6DMBRD/RlY06UzG+fpEXrf3qBbj5ARFlc/Hfgg0t1fPAkpUhhs2eQDRmBCwRsVI5QoWFExg/ycqR6aqQdGEJC6XLNr7+CJsd2oiHkYtPPE1DEjbrbAbMplrFPLBFWM662W+olFQi1zGQu1TFbFbZ0rscBlTI3LmBpDe0t+Cip3zff+tu5ni5t6wdX/OBz3RoYh5pM7yUzbP2OJanlMLE0t98Yi4rXsH/fKtSxY/yWm+5OnYv4CLUxy42WrZpUAAAAASUVORK5CYII=`

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
        if (changedProps.has('item') && this.item) {
            this.layout = new LayoutItem(this.item, { keyID: this.keyID, keyLabel: this.keyLabel, keyItems: this.keyItems, id: 'main' });
            this.layout.$root = this.layout;
        }
    }

    render() {
        return html`
            <li-layout-app hide="r">
                <div slot="app-top">li-layout-designer</div>
                <div slot="app-top-right">
                    <li-button name="refresh" scale=".9, -.9" rotate="-180" style="margin-right: 2px;" @click="${this._resetLayout}"></li-button>
                    <li-button name="select-all" toggledClass="ontoggled" style="margin-right: 2px;" @click="${this._showGroup}"></li-button>
                    <li-button name="color-lens" toggledClass="ontoggled" style="margin-right: 2px;" @click="${this._setUseColor}"></li-button>
                    <li-button name="settings" toggledClass="ontoggled" style="margin-right: 4px;" @click="${this._setDesignMode}"></li-button>
                </div>
                <div slot="app-left" style="margin:4px 0px 4px 4px; border: 1px solid lightgray;border-bottom:none">
                    <li-tree .item="${this.layout}" ulid="${ulid}"></li-tree>
                </div>
                <li-layout-structure id="structure" slot="app-main" .layout="${this.layout}" .items="${this.layout && this.layout.items || this.layout}" ?designMode="${this.designMode}" style="padding: 4px;"></li-layout-structure>
            </li-layout-app>
        `;
    }

    _setDesignMode(e) {
        this.designMode = e.target.toggled;
    }

    _setUseColor(e) {
        _props.useColor = e.target.toggled;
        observableUpdate.update = !observableUpdate.update;
    }

    _showGroup(e) {
        _props.showGroup = e.target.toggled;
        observableUpdate.update = !observableUpdate.update;
    }

    _resetLayout(e) {

    }
});

customElements.define('li-layout-structure', class LiLayoutStructure extends LiElement {
    static get properties() {
        return {
            layout: { type: Object, default: undefined },
            items: { type: Array, default: [] },
            designMode: { type: Boolean, default: false },
            selection: { type: Array, default: [] }
        }
    }

    constructor() {
        super();
        observableUpdate.observe(changes => { this.requestUpdate(); });
    }

    updated(changedProps) {
        super.update(changedProps);
        if (changedProps.has('layout') && this.layout) {
            if (!this.items) return;
            if (this.layout.actions && this.layout.actions.length) return;
            let actions = undefined;
            try {
                actions = localStorage.getItem('li-layout-structure.' + (this.layout.name || 'main'));
                if (actions) actions = JSON.parse(actions) || [];
                this.layout.actions = actions;
            } catch (err) { return; }
            if (this.layout.actions) this.layout.actions.forEach(action => this[action.action](action.props));
        }
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
            ${this.items.map(item => html`
                <li-layout-container .item=${item} ?designMode="${this.designMode}" ?align="${this.layout.align}"  @click="${this._focus}" ?isSelected="${this.selection.includes(item)}"></li-layout-container>
            `)}
        `;
    }

    execute(action, item = this.layout) {
        this.layout.actions = this.layout.actions || (item.$root && item.$root.actions) || [];
        this.layout.actions.push(action);
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
        this.layout.actions.last.props.name = this.layout.actions.last.props.name || target.$owner.name;
        this.layout.actions.last.props.label = this.layout.actions.last.props.label || target.$owner.label;
        observableUpdate.update = !observableUpdate.update;
        LI.fire(document, 'updateTree', { ulid });
        localStorage.setItem('li-layout-structure.' + (target.$root && target.$root.name || 'main'), JSON.stringify(this.layout.actions));
    }
    _focus(e) {
        if (!this.designMode) return;
        e.stopPropagation();
        const item = e.target.item;
        if (!selected || this.selection.length === 0) selected = item;
        if (e.ctrlKey || e.metaKey) {
            if (selected.$root !== item.$root) return;
            if (this.selection.includes(item)) {
                this.selection.splice(this.selection.indexOf(item), 1);
                observableUpdate.update = !observableUpdate.update;
                return;
            }
            this.selection.splice(this.selection.length, 0, item)
        } else if (e.shiftKey) {
            if (selected.$root !== item.$root) return;
            const from = selected.$root.items.indexOf(selected);
            const to = selected.$root.items.indexOf(item);
            const arr = selected.$root.items.slice((from < to ? from : to), (from > to ? from : to) + 1)
            this.selection.splice(0, this.selection.length, ...arr);
        } else {
            selected = item;
            this.selection.splice(0, this.selection.length, item)
        }
        selection = this.selection.map(i => i.name);
        observableUpdate.update = !observableUpdate.update;
        //console.log(selection)
    }
});

customElements.define('li-layout-container', class LiLayoutContainer extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: {} },
            designMode: { type: Boolean, default: false },
            iconSize: { type: String, default: '28' },
            align: { type: Boolean, default: true },
            dragto: { type: String, default: undefined, reflect: true },
            selection: { type: Array, default: [] },
            isSelected: { type: Boolean, default: false, reflect: true }
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

        observableUpdate.observe(changes => { this.requestUpdate(); });
    }
    disconnectedCallback() {
        LI.unlisten(document, 'updateTree', this.__requestUpdate);
        super.disconnectedCallback();
    }

    _requestUpdate(e) {
        if (e.detail && e.detail.ulid === ulid) this.requestUpdate();
    }

    static get styles() {
        return css`
            :host {
                min-width: 200px;
                flex: 1;
                position: relative;
                min-height: 32px;
            }
            .complex {
                margin-left: 14px;
                overflow: hidden;
                border-left: 1px dashed darkgray;
            }
            .group {
                overflow: hidden;
            }
            oda-icon {
                cursor: pointer;
            }
            .row {
                margin-top: -1px;
                margin-left: 1px;
                border: 1px dotted lightgray;
                min-height: 32px;
            }
            .design-row {
                cursor: move;
            }
            .design-row:hover {
                box-shadow: inset 0 0 0 1px red;
            }
            :host([dragto=left]):after {
                content: "";
                box-shadow: inset 4px 0 0 0 blue;
            }
            :host([dragto=right]):after {
                content: "";
                box-shadow: inset -4px 0 0 0 blue;
            }
            :host([dragto=top]):after {
                content: "";
                box-shadow: inset 0 4px 0 0 blue;
            }
            :host([dragto=bottom]):after {
                content: "";
                box-shadow: inset 0 -4px 0 0 blue;
            }
            :host([dragto]):after {
                content: "";
                pointer-events: none;
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,255,0,.3);
            }
            :host([dragto=error]):after {
                content: "";
                pointer-events: none;
                background-color: rgba(255,0,0,.3) !important;
            }
            .selected {
                background-color: lightyellow;
            }
        `;
    }

    render() {
        return html`
            ${!_props.showGroup && this.isGroup ? '' : html`
                <div class="row ${this.designMode ? 'design-row' : ''} ${this.isSelected ? 'selected' : ''}" style="display:flex;align-items:center;" draggable="${this.designMode}" @dragstart="${this._dragstart}" @dragend="${this._dragend}"
                        @dragover="${this._dragover}" @dragleave="${this._dragleave}" @drop="${this._dragdrop}">
                    ${this.item && this.item.items && this.item.items.length ? html`
                        <li-button back="transparent" size="${this.iconSize}" name="chevron-right" toggledClass="right90" ?toggled="${this.item && this.item.$expanded}" style="pointer-events:visible" @click="${this._toggleExpand}" border="0"></li-button>`
                    : html`
                        <div style="width:${this.iconSize}px;height:${this.iconSize}px;"></div>
                    `}
                    <label style="cursor: move;" @dblclick="${this._editGroupLabel}" @blur="${this._closeEditGroupLabel}" @keydown="${this._keydownGroupLabel}">${this.item && this.item.label}</label>
                    <div style="flex:1;"></div>
                </div>
            `}
            ${this.item && this.item.items && this.item.items.length && this.item.$expanded ? html`
                <li-layout-structure class="${this.isGroup ? 'group' : 'complex'}"
                    .items="${this.item.items || []}" ?designMode="${this.designMode}" style="flex-wrap: wrap;${_props.useColor ? 'padding:8px; box-shadow: inset 0px 0px 0px 2px ' + this.item.color : ''};" .layout="${this.item}"></li-layout-structure>` : ''
            }     
        `;
    }

    _toggleExpand(e) {
        this.item.$expanded = e.target.toggled;
        this.requestUpdate();
    }
    _dragstart(e) {
        if (!this.isSelected) {
            e.preventDefault();
            return;
        }
        dragInfo.dragItem = this.item;
        e.dataTransfer.setDragImage(selection.length > 2 ? img3 : img, 24, 6);
    }
    _dragend(e) {
        dragInfo = {};
        this.dragto = null;
    }
    _dragover(e) {
        this.dragto = 'error';
        if (this.isSelected || dragInfo.dragItem === this.item) return;
        if (dragInfo.dragItem.$root !== this.item.$root) return;

        e.preventDefault();

        let rect = e.currentTarget.getBoundingClientRect(),
            x = ((e.clientX - rect.left) - rect.width / 2) / rect.width * 2,
            y = ((e.clientY - rect.top) - rect.height / 2) / rect.height * 2,
            to = '';
        if (Math.abs(x) > Math.abs(y)) to = x < 0 ? 'left' : 'right';
        else to = y < 0 ? 'top' : 'bottom';
        this.dragto = to;
        dragInfo.action = 'move';
        dragInfo.to = to;
    }
    _dragleave(e) {
        this.dragto = null;
    }
    _dragdrop(e) {
        dragInfo.targetItem = this.item;
        this.dragto = null;
        const action = { action: dragInfo.action, props: { item: dragInfo.dragItem.name, target: this.item.name, to: dragInfo.to } };
        this.$root.execute(action, this.item);
    }

    _editGroupLabel(e) {
        if (!this.designMode || !this.isGroup) return;
        e.stopPropagation();
        const t = e.target;
        this._oldLabel = t.innerText;
        t.setAttribute('contentEditable', '');
        t.focus();
        t.style.outline = "0px solid transparent";
        window.getSelection().selectAllChildren(t)
    }
    _closeEditGroupLabel(e) {
        if (!this.designMode) return;
        e.stopPropagation();
        e.target.removeAttribute('contentEditable');
        this.item.label = e.target.innerText;
        this.item.$root.actions.forEach(i => {
            if (this.item.name === i.props.name) i.props.label = this.item.label;
        });
        localStorage.setItem('li-layout-structure.' + this.item.$root.name, JSON.stringify(this.item.$root.actions));
        LI.fire(document, 'updateTree', { ulid });
    }
    _keydownGroupLabel(e) {
        if (e.key === 'Enter') this._closeEditGroupLabel(e);
        else if (e.key === 'Escape') {
            e.target.innerText = this._oldLabel;
            this._closeEditGroupLabel(e);
        }
    }
});