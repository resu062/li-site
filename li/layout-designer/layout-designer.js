import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import { BaseItem, LItem, ldfn } from '../../lib/li-utils/li-data.js';
import '../button/button.js';
import '../layout-app/layout-app.js'
import '../tree/tree.js';

class GroupItem extends BaseItem {
    constructor(props, target, owner) {
        super();
        this.id = props.id || this.id
        this.label = props.label || 'group';
        this.complex = 'li-layout-group';
        this._expanded = true;
        this.align = ['left', 'right'].includes(props.to) ? 'row' : 'column';
        this.owid = props.owid;
        if (!target) {
            this.$owner = owner;
            this.$root = owner.$root;
            return;
        }
        target.$owner.items.splice(target.$owner.items.indexOf(target), 1, this);
        this.$root = target.$root;
        this.$owner = target.$owner;
        target.$owner = this;
        this.items = [target];
    }

    insert(target, item, to) {
        const selection = this.$$.selection
        if (to === 'tabsGrouping') {
            this.tabsGrouping();
            return;
        }
        let idx = this.items.indexOf(target);
        if (['right', 'bottom'].includes(to)) ++idx;
        if (selection && selection.includes(item)) {
            selection.reverse().forEach(i => {
                this.items.splice(idx, 0, i);
                i.$owner.items.splice(i.$owner.items.indexOf(i), 1);
                deleteRecursive(i.$owner);
                i.$owner = this;
            })
        }
        else {
            this.items.splice(idx, 0, item);
            item.$owner.items.splice(item.$owner.items.indexOf(item), 1);
            deleteRecursive(item.$owner);
            item.$owner = this;
        }
    }

    tabsGrouping(item, selection) {
        if (this.$owner instanceof TabsItem) return;
        this.$owner = new TabsItem({ id: this.owid }, this);
        if (selection && selection.includes(item)) {
            selection.reverse().forEach(i => {
                this.items.splice(1, 0, i);
                i.$owner.items.splice(i.$owner.items.indexOf(i), 1);
                deleteRecursive(i.$owner);
                i.$owner = this;
            });
        }
        deleteRecursive(item.$owner);
    }
}

class BlockItem extends GroupItem {
    constructor(props, target, owner) {
        super(props, target, owner);
        this.label = props.label || 'block (' + (this.align === 'row' ? 'h' : 'v') + ')';
        this.complex = 'li-layout-block';
        this.hideExpander = true;
    }
}

class TabsItem extends GroupItem {
    constructor(props, target, owner) {
        super(props, target, owner);
        this.label = props.label || 'tab';
        this.complex = 'li-layout-tabs';
    }
}

ldfn.applyAction = (item, action, props) => {
    switch (action) {
        case 'setItems':
            loadFromLocalStorage(item);
            break;
        case 'hide':
        case 'expanded':
            if (!item.$$.designMode) return;
            item.$$.actions[props.level].splice(item.$$.actions[props.level].length, 0, { action, props: { item: props.item + '', value: props.value } });
            saveToLocalStorage(item, true);
            break;
        default:
            break;
    }
}

function findRecursive(id) {
    if (!this || !this.items) return;
    let items = this.items.filter(i => i.$root.id === this.$root.id);
    if (!items || !items.length) items = this.items;
    return items.reduce((res, i) => {
        if (i.id + '' === id + '')
            res = i;
        return res || findRecursive.call(i, id);
    }, undefined);
}
function deleteRecursive(item) {
    if (!item.items || !item.items.length) {
        let i = item.$owner || item.$root;
        if (item instanceof BlockItem || item instanceof GroupItem)
            i.items.splice(i.items.indexOf(item), 1);
        let _item = i;
        i = i.$owner || i.$root;
        while (i) {
            if ((_item instanceof BlockItem || _item instanceof GroupItem) && (!_item.items || !_item.items.length))
                i.items.splice(i.items.indexOf(_item), 1);
            _item = i;
            i = i.$owner;
        }
        //return;
    } else if (item.items && item.items.length === 1 && (item.items[0] instanceof BlockItem || item.items[0] instanceof GroupItem)) {
        item.items[0].$owner = item.$owner;
        item.items[0].$root = item.$root;
        item.$owner.items.splice(item.$owner.items.indexOf(item), 1, item.items[0]);
    }
    item.items.forEach(i => deleteRecursive(i))
}

function loadFromLocalStorage(item) {
    let actions = localStorage.getItem(item.$$.actionsFileName);
    actions = actions ? JSON.parse(actions) : {};
    item.$$.actions['' + item.level] = actions['' + item.level] || [];
    loadActions(item);
}
function saveToLocalStorage(item, save) {
    if (save && item.$$.designMode && item.$$.actions)
        localStorage.setItem(item.$$.actionsFileName, JSON.stringify(item.$$.actions));
}


let img = new Image();
img.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAAACXBIWXMAAAsSAAALEgHS3X78AAAAa0lEQVRIiWPU6v91RFv4jwIv+78/DEMIfP7JxHL1LcsDFpDjJ7p8kB5KjoeB/D0CDExDLeSRAcjtTIPHOeSBUQ8MNBj1wECDUQ8MNBj1wECDUQ8MNGACteqGquNBbgc3SUGtuiHZnH7L8gAAtichl6hs6rYAAAAASUVORK5CYII=`
let img3 = new Image();
img3.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAUCAYAAADC1B7dAAAACXBIWXMAAAsSAAALEgHS3X78AAAA4klEQVRYhWPU6v91RFv4jwIv+78/DEMIfP7JxHL1LcuDqwWsNsiuZgF5ZqLLB+mh5BkYyN8jwMDAwIoixjTUYgYZ8LL/Ew9b/P2J9oTfR2DCTIPCZWQCQfb/LKDUBUplMBNYhponsAFYTIHy1JCOIRhAjqlh4SEYAJUHw8pDDEO9UMAGRj002MGohwY7GH4eArVaB4E7yAIffzFiaAM3wUGtVlDzAVTjDgmfQD3z6SdmAmOB9CdYGUBtoRbbodmNQI4peIwMl5hi/P//P4oCUEwN4Q7fU4yYQIqpodclf8vyAAC+a17T0iNSKwAAAABJRU5ErkJggg==`

const loadActions = (item) => {
    if (!item.actions) return;
    item.actions.forEach(act => {
        if (act.props.selection && act.props.selection.length) {
            item.$$.selection = [];
            item.$$.selectionID = [];
            act.props.selection.forEach(i => {
                const obj = findRecursive.call(item.$root, i);
                if (obj) {
                    item.$$.selection.push(obj);
                    item.$$.selectionID.push(obj.id);
                }
            })
        }
        fn[act.action](item, act.props);
    })
}
const move = (item, props, save = false) => {
    if (item.$$._lastAction === props) return;
    item.$$._lastAction = props;
    const dragItem = findRecursive.call(item.$root, props.item);
    const targItem = findRecursive.call(item.$root, props.target);
    if (!dragItem || !targItem) return;
    let align = ['left', 'right'].includes(props.to) ? 'row' : 'column';
    if (!(targItem.$owner instanceof BlockItem) || (targItem.$owner && targItem.$owner.align !== align)) {
        targItem.$owner = new BlockItem(props, targItem);
    }
    if (props.to === 'grouping' || targItem !== dragItem)
        targItem.$owner.insert(targItem, dragItem, props.to);
    item.actions.last.props.label = item.actions.last.props.label || targItem.$owner.label;
    item.actions.last.props.id = item.actions.last.props.id || targItem.$owner.id;
    if (props.to === 'grouping' && targItem.$owner.$owner)
        item.actions.last.props.owid = item.actions.last.props.owid || targItem.$owner.$owner.id;
    item.actions.last.props.selection = item.actions.last.props.selection || item.$$.selectionID;
    saveToLocalStorage(item, save);
}
const hide = (item, props) => {
    const propsItem = findRecursive.call(item.$root, props.item);
    if (propsItem)
        propsItem.setChecked(props.value);
}
const expanded = (item, props) => {
    const propsItem = findRecursive.call(item.$root, props.item);
    if (propsItem)
        propsItem.setExpanded(props.value);
}
const addTab = (item, props, save = false) => {
    const propsItem = findRecursive.call(item.$root, props.item);
    if (!propsItem) return;
    const block = new BlockItem(props, null, item);
    propsItem.items.splice(propsItem.items.length, 0, block);
    item.actions.last.props.id = item.actions.last.props.id || block.id;
    saveToLocalStorage(item, save);
}
const deleteTab = (item, props, save = false) => {
    const propsItem = findRecursive.call(item.$root, props.item);
    if (!propsItem) return;
    //console.log(propsItem.items.length, props.index);
    propsItem.items.splice(props.index, 1);
    saveToLocalStorage(item, save);
}
const fn = { move, hide, expanded, addTab, deleteTab }

function dragOver(item, e) {
    let to = '',
        x = e.layerX,
        y = e.layerY,
        w = e.target.offsetWidth,
        h = e.target.offsetHeight;
    x = (x - w / 2) / w * 2;
    y = (y - h / 2) / h * 2;

    if (Math.abs(x) > Math.abs(y))
        to = x < 0 ? 'left' : 'right';
    else
        to = y < 0 ? 'top' : 'bottom';

    item.$$.dragInfo.action = 'move';
    item.$$.dragInfo.to = to;

    if (item.$$.multiSelect) {
        const ow = item.$owner || item.$root;
        let step = 2,
            count = 0,
            maxCount = 0,
            indxs = [],
            indx = ow.items.indexOf(item);
        if (ow instanceof BlockItem && ow.align === 'row' && (to === 'top' || to === 'bottom')) {
            y = (1 - Math.abs(y)) * h / 2 | 0;
            maxCount = h / step / 2;
            count = y / step | 0;
        } else if ((!(ow instanceof BlockItem) || (ow instanceof BlockItem && ow.align === 'column')) && (to === 'left' || to === 'right')) {
            step = 6;
            x = (1 - Math.abs(x)) * w / 2 | 0;
            maxCount = w / step / 2;
            count = x / step | 0;
        }
        indxs.push(indx);
        count = count <= maxCount ? count : maxCount;
        let i = indx >= (ow.items.length / 2 | 0) ? indx : ow.items.length - indx;
        count = count <= i ? count : i;
        i = 1;
        while (count) {
            if (indx - i >= 0)
                if (!ow.items[indx - 1].isDragged)
                    indxs.push(indx - i);
            if (indx + i < ow.items.length)
                if (!ow.items[indx + 1].isDragged)
                    indxs.push(indx + i);
            ++i;
            --count;
        }
        item.$$.indxs = [];
        indxs.forEach(i => {
            if (ow.items[i]) {
                ow.items[i].dragTo = 'drag-to-' + to;
                item.$$.indxs.push(ow.items[i]);
            }
        })
    } else {
        item.dragTo = 'drag-to-' + to;
    }

    item.$$.dragInfo.targetItem = item;

    return Math.round(Math.abs(e.layerX / 3) * 3);
}

customElements.define('li-layout-designer', class LiLayoutDesigner extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: undefined },
            litem: { type: Object, default: undefined },
            keyID: { type: String, default: 'id' },
            keyLabel: { type: String, default: 'label' },
            keyItems: { type: String, default: 'items' },
            layout: { type: Object, default: undefined },
            iconSize: { type: Number, default: 28, local: true },
            designMode: { type: Boolean, default: false, save: true, local: true },
            showGroupName: { type: Boolean, default: false, save: true, local: true },
            showGroup: { type: Boolean, default: false, save: true, local: true }
        }
    }

    updated(changedProps) {
        super.update(changedProps);
        this.id = this.item.id || this.id || this.partid;
        if (changedProps.has('item') && this.item) {
            this.$$.actionsFileName = this.id + '.actions';
            this.$$.selected = {};
            this.$$.selection = [];
            this.$$.selectionID = [];
            this.$$.actions = {};
            this.litem = new LItem(this.item, { keyID: this.keyID, keyLabel: this.keyLabel, keyItems: this.keyItems }, undefined, undefined, this.id);
            this.litem.$root = this.litem;
        }
    }

    render() {
        return html`
            <style>
                :host {
                    animation: fade-in 1s linear;
                }
                @keyframes fade-in {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            </style>
            <li-layout-app hide="r" id="layout.layout-app">
                <div slot="app-top">li-layout-designer</div>
                <div slot="app-top-right">
                ${this.designMode
                ? html`
                    <li-button name="refresh" scale=".9, -.9" rotate="-180" style="margin-right: 2px;" @click="${this._resetLayout}"></li-button>
                    <li-button name="credit-card" toggledClass="ontoggled" style="margin-right: 2px;" .toggled="${this.showGroupName}" @click="${() => this.showGroupName = !this.showGroupName}"></li-button>
                    <li-button name="select-all" toggledClass="ontoggled" style="margin-right: 2px;" .toggled="${this.showGroup}" @click="${() => this.showGroup = !this.showGroup}"></li-button>
                ` : html``}
                    <li-button name="settings" toggledClass="ontoggled" style="margin-right: 4px;" .toggled="${this.designMode}" @click="${() => this.designMode = this.$$.designMode = !this.designMode}"></li-button>
                </div>
                <div slot="app-left" style="margin:4px 0px 4px 4px; border: 1px solid lightgray;border-bottom:none">
                    <li-tree .litem="${this.litem}"></li-tree>
                </div>
                <div slot="app-main">
                    <li-layout-structure .layout="${this.litem}" id="structure" slot="app-main" style="padding: 4px;"></li-layout-structure>
                </div>
            </li-layout-app>
        `;
    }

    _resetLayout(e) {
        localStorage.removeItem(this.litem.$$.actionsFileName);
        document.location.reload();
    }
});

customElements.define('li-layout-structure', class LiLayoutStructure extends LiElement {
    static get properties() {
        return {
            layout: { type: Object, default: undefined },
            items: { type: Array, default: [] }
        }
    }

    get items() {
        return this.layout && this.layout.items ? this.layout.items : this.layout && this.layout.map ? this.layout : [];
    }
    set items(v) {
        this._items = v;
    }

    render() {
        if (!this.items || !this.items.map) return html``;
        return html`
            <style>
                :host {
                    overflow: auto;
                    display: flex;
                    flex-direction: ${this.layout && this.layout.align || 'column'};
                }
            </style>
            ${this.items.map(item => html`
                <li-layout-container .item=${item} @click="${this._focus}" @contextmenu="${(e) => this._menu(e, item)}"></li-layout-container>
            `)}
        `;
    }

    _focus(e) {
        e.stopPropagation();
        ldfn.focus(e, this.layout);
        this.$update();
    }
    async _menu(e, item) {
        e.stopPropagation();
        e.preventDefault();
        let val = await LI.show('dropdown', 'tester-cell', { type: 'text', value: 'actions', props: { list: ['grouping', '...ungrouping', '...tabs', '...untabs'], hideButton: true, readOnly: true } }, {});
        let action = '';
        switch (val.detail.value) {
            case 'grouping':
                action = { action: 'move', props: { item: item.id, target: item.id, to: 'grouping' } };
                break;
            default:
                break;
        }
        if (action) {
            item.actions.push(action);
            fn[action.action](item, action.props, true);
            this.$update();
        }
    }
});

customElements.define('li-layout-container', class LiLayoutContainer extends LiElement {
    static get properties() {
        return {
            item: { type: Object, default: {} },
            dragto: { type: String, default: undefined, reflect: true },
            iconSize: { type: Number, local: true },
            designMode: { type: Boolean, default: false, local: true },
            showGroupName: { type: Boolean, default: false, local: true },
            showGroup: { type: Boolean, default: false, local: true },
        }
    }

    get isGroups() {
        return this.item instanceof GroupItem;
    }
    get isBlock() {
        return this.item instanceof BlockItem;
    }
    get isTabs() {
        return this.item instanceof TabsItem;
    }

    static get styles() {
        return css`
            :host {
                min-width: 40px;
                flex: 1;
                position: relative;
                /* min-height: 32px; */
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
                margin-left: 1px;
                border: 1px dotted lightgray;
                /* min-height: 32px; */
            }
            .design-row {
                cursor: move;
            }
            .design-row:hover {
                box-shadow: inset 0 0 0 1px blue;
            }
            :host([dragto=left]):after {
                content: "";
                box-shadow: inset 3px 0 0 0 blue;
            }
            :host([dragto=right]):after {
                content: "";
                box-shadow: inset -3px 0 0 0 blue;
            }
            :host([dragto=top]):after {
                content: "";
                box-shadow: inset 0 3px 0 0 blue;
            }
            :host([dragto=bottom]):after {
                content: "";
                box-shadow: inset 0 -3px 0 0 blue;
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
        return !this.item.checked ? html``
            : html`
                <div style="${this.isBlock && this.showGroup && this.designMode ? 'border: 1px solid red; margin: 4px;' : ''}">
                ${!this.isGroups || (this.isGroups && this.showGroupName && this.designMode)
                    ? html`
                        <div class="row ${this.designMode ? 'design-row' : ''} ${this.$$?.selection?.includes(this.item) ? 'selected' : ''}" style="display:flex;align-items:center;" draggable="${this.designMode}" 
                                @dragstart="${this._dragstart}" @dragend="${this._dragend}" @dragover="${this._dragover}" @dragleave="${this._dragleave}" @drop="${this._dragdrop}">
                        ${this.item && this.item.items && this.item.items.length
                            ? html`<li-button back="transparent" size="${this.iconSize}" name="chevron-right" toggledClass="right90" .toggled="${this.item && this.item.expanded}" 
                                    style="pointer-events:visible" @click="${this._toggleExpand}" border="0"></li-button>`
                            : html`<div style="width:${this.iconSize}px;height:${this.iconSize}px;"></div>`
                        }
                            <label style="cursor: move;" @dblclick="${this._editGroupLabel}" @blur="${this._closeEditGroupLabel}" @keydown="${this._keydownGroupLabel}">${this.item && this.item.label}</label>
                            <div style="flex:1;"></div>
                        </div>
                    `
                    : html``
                }
                ${this.item && this.item.items && this.item.items.length && this.item.expanded
                    ? html`<li-layout-structure class="${this.isGroups ? 'group' : 'complex'}" .layout="${this.item}"></li-layout-structure>`
                    : html``
                }   
                </div>  
            `
    }
    execute(action) {
        this.item.actions.push(action);
        fn[action.action](this.item, action.props, true);
        this.$update();
    }
    _toggleExpand(e) {
        this.item.expanded = e.target.toggled;
        this.$update();
    }
    _dragstart(e) {
        this.$$.dragItem = this.item;
        e.dataTransfer.setDragImage(this.$$.selection.length > 1 ? img3 : img, 24, 6);
    }
    _dragend(e) {
        this.dragto = null;
    }
    _dragover(e) {
        this.dragto = 'error';
        if (this.$$.isSelected || this.$$.dragItem === this.item) return;
        if (this.$$.dragItem.$root !== this.item.$root) return;

        e.preventDefault();

        let rect = e.currentTarget.getBoundingClientRect(),
            x = ((e.clientX - rect.left) - rect.width / 2) / rect.width * 2,
            y = ((e.clientY - rect.top) - rect.height / 2) / rect.height * 2,
            to = '';
        if (Math.abs(x) > Math.abs(y)) to = x < 0 ? 'left' : 'right';
        else to = y < 0 ? 'top' : 'bottom';
        this.dragto = to;
        this.$$.action = 'move';
        this.$$.to = to;
    }
    _dragleave(e) {
        this.dragto = null;
    }
    _dragdrop(e) {
        this.$$.targetItem = this.item;
        this.dragto = null;
        const action = { action: this.$$.action, props: { item: this.$$.dragItem.id, target: this.item.id, to: this.$$.to } };
        this.execute(action);
    }

    _editGroupLabel(e) {
        if (!this.$$.designMode || !this.isGroups) return;
        e.stopPropagation();
        const t = e.target;
        this._oldLabel = t.innerText;
        t.setAttribute('contentEditable', '');
        t.focus();
        t.style.outline = "0px solid transparent";
        window.getSelection().selectAllChildren(t)
    }
    _closeEditGroupLabel(e) {
        if (!this.$$.designMode) return;
        e.stopPropagation();
        e.target.removeAttribute('contentEditable');
        this.item.label = e.target.innerText;
        this.item.$root.actions.forEach(i => {
            if (this.item.id === i.props.id) i.props.label = this.item.label;
        });
        localStorage.setItem(this.$$.actionsFileName + this.item.$root.id, JSON.stringify(this.item.$root.actions));
        this.$update();
    }
    _keydownGroupLabel(e) {
        if (e.key === 'Enter') this._closeEditGroupLabel(e);
        else if (e.key === 'Escape') {
            e.target.innerText = this._oldLabel;
            this._closeEditGroupLabel(e);
        }
    }
});