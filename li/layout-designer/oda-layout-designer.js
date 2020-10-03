import '../app-layout/app-layout.js';
import '../../buttons/button/button.js';
import '../../grids/tree/tree.js';
import '../../../tools/property-grid/property-grid.js';
import '../../menus/menu/menu.js';
import '../tabs/tabs.js';

class baseItem {
    constructor() {
        this._checked = true;
        this._expanded = false;
    }
    get uuid() { return this._uuid || this.$root && this.$root.uuid }
    get bs() { return _bus[this.uuid] || {} }
    get level() { return this._level || this.$root.level || this.id || 'main' }
    get actions() { return this.bs.actions[this.level || this.$root.level || 'main'] }
    get name() { return this.label || this.id }
    get checked() { return this._checked }
    set checked(v) {
        this._checked = v;
        if (this instanceof BlockItem) return;
        this.applyAction('hide', v);
    }
    get $expanded() { return this._expanded }
    set $expanded(v) {
        this._expanded = v;
        this.applyAction('expanded', v);
    }
    setChecked(v) { this._checked = v }
    setExpanded(v) { this._expanded = v }
    applyAction(name, v) {
        if (!this.uuid || !this.bs.designMode || !this.bs.enableSave) return;
        const item = { action: name, props: { item: this.id + '', value: v } }
        const level = this.level2 || this.level || this.$root.level || 'main';
        this.bs.actions[level].splice(this.bs.actions[level].length, 0, item);
        saveToLocalStorage(this, true);
    }
}
class LayoutItem extends baseItem {
    constructor(item, listKey = 'items', parent, uuid) {
        super();
        if (uuid) {
            this._uuid = uuid;
            this._id = 'main';
        }
        this.$item = item;
        this.$owner = this.$root = parent;
        this._listKey = listKey;
    }
    get id() { return this._id || this.$item.id || this.$item.name || 'main' }
    get items() {
        if (!this._items) {
            this._items = (this.$item[this._listKey] || []).map(i => {
                return new LayoutItem(i, this._listKey, this);
            })
            if (this._items.length) {
                this._items.forEach(i => {
                    i._level = this.id;
                    i._uuid = this._uuid;
                })
                this._level = this.id;
                this.bs.actions[this.level] = [];
                this.level2 = this.$root.level;
                loadFromLocalStorage(this);
            }
        }
        return this._items;
    }
}
class BlockItem extends baseItem {
    constructor(props, target, owner) {
        super();
        this._expanded = true;
        this.hideExpander = true;
        this.complex = 'oda-layout-block';
        this.align = ['left', 'right'].includes(props.to) ? 'row' : 'column';
        this.id = props.id || getUUID();
        this.owid = props.owid;
        this.label = props.label || 'block (' + { row: 'h', column: 'v' }[this.align] + ')';
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
        const selection = this.bs.selection
        if (to === 'grouping') {
            this.grouping(item, selection);
            return;
        }
        let idx = this.items.indexOf(target);
        if (['right', 'bottom'].includes(to))
            ++idx;
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
    grouping(item, selection) {
        if (this.$owner instanceof GroupItem) return;
        this.$owner = new GroupItem({ id: this.owid }, this);
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
class GroupItem extends baseItem {
    constructor(props, target) {
        super();
        this._expanded = true;
        this._checked = true;
        this.complex = 'oda-layout-group';
        this.label = props.label || 'group';
        this.id = props.id || getUUID();
        target.$owner.items.splice(target.$owner.items.indexOf(target), 1, this);
        this.$root = target.$root
        this.$owner = target.$owner;
        target.$owner = this;
        this.items = [target];
    }
    get $expanded() { return this.hideExpander ? true : this._expanded }
    set $expanded(v) { this._expanded = v }
}

function findRecursive(id) {
    if (!this.items) return;
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
        return;
    }
    item.items.forEach(i => deleteRecursive(i))
}

function loadFromLocalStorage(item) {
    let actions = localStorage.getItem(item.bs.fileName);
    actions = actions ? JSON.parse(actions) : {};
    item.bs.actions['' + item.level] = actions['' + item.level] || [];
    loadActions(item);
}
function saveToLocalStorage(item, save) {
    if (save && item.bs.enableSave && item.bs.designMode && item.bs.actions) {
        localStorage.setItem(item.bs.fileName, JSON.stringify(item.bs.actions));
    }
    try {
        item.bs.fnTreeRefresh();
    } catch (err) { }
}

const loadActions = (item) => {
    if (!item.actions) return;
    item.actions.forEach(act => {
        if (act.props.selection && act.props.selection.length) {
            item.bs.selection = [];
            item.bs.selectionID = [];
            act.props.selection.forEach(i => {
                const obj = findRecursive.call(item.$root, i);
                if (obj) {
                    item.bs.selection.push(obj);
                    item.bs.selectionID.push(obj.id);
                }
            })
        }
        fn[act.action](item, act.props);
    })
}
const move = (item, props, save = false) => {
    if (item.bs._lastAction === props) return;
    item.bs._lastAction = props;
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
    item.actions.last.props.selection = item.actions.last.props.selection || item.bs.selectionID;
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
const focus = (e, item, selection = []) => {
    if (!item.bs.designMode) return;
    const source = e.target.item;
    if (!item.bs.selected || selection.length === 0) item.bs.selected = source;
    if (e.detail.sourceEvent.ctrlKey) {
        if (item.bs.selected.$root !== source.$root) return;
        if (selection.includes(source)) {
            selection.splice(selection.indexOf(source), 1);
            return;
        }
        selection.splice(selection.length, 0, source)
    } else if (e.detail.sourceEvent.shiftKey) {
        if (item.bs.selected.$root !== source.$root) return;
        const from = item.bs.selected.$root.items.indexOf(item.bs.selected);
        const to = item.bs.selected.$root.items.indexOf(source);
        const arr = item.bs.selected.$root.items.slice((from < to ? from : to), (from > to ? from : to) + 1)
        selection.splice(0, selection.length, ...arr);
    } else {
        item.bs.selected = source;
        selection.splice(0, selection.length, source)
    }
    item.bs.selection = selection;
    item.bs.selectionID = selection.map(i => i.id);
    return item.bs.selection;
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

    item.bs.dragInfo.action = 'move';
    item.bs.dragInfo.to = to;

    if (item.bs.multiSelect) {
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
        item.bs.indxs = [];
        indxs.forEach(i => {
            if (ow.items[i]) {
                ow.items[i].dragTo = 'drag-to-' + to;
                item.bs.indxs.push(ow.items[i]);
            }
        })
    } else {
        item.dragTo = 'drag-to-' + to;
    }

    item.bs.dragInfo.targetItem = item;

    // здесь можно устанавливать отладочные сообщения на псевдоэлементы
    // в релизе тоже можно выводить пояснения для пользователей
    return Math.round(Math.abs(e.layerX / 3) * 3);
}

const _bus = {};
const getUUID = function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b) };
const img = new Image();
img.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAQCAYAAABQrvyxAAAACXBIWXMAAAsSAAALEgHS3X78AAAAa0lEQVRIiWPU6v91RFv4jwIv+78/DEMIfP7JxHL1LcsDFpDjJ7p8kB5KjoeB/D0CDExDLeSRAcjtTIPHOeSBUQ8MNBj1wECDUQ8MNBj1wECDUQ8MNGACteqGquNBbgc3SUGtuiHZnH7L8gAAtichl6hs6rYAAAAASUVORK5CYII=`;
const img3 = new Image();
img3.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAUCAYAAADC1B7dAAAACXBIWXMAAAsSAAALEgHS3X78AAAA4klEQVRYhWPU6v91RFv4jwIv+78/DEMIfP7JxHL1LcuDqwWsNsiuZgF5ZqLLB+mh5BkYyN8jwMDAwIoixjTUYgYZ8LL/Ew9b/P2J9oTfR2DCTIPCZWQCQfb/LKDUBUplMBNYhponsAFYTIHy1JCOIRhAjqlh4SEYAJUHw8pDDEO9UMAGRj002MGohwY7GH4eArVaB4E7yAIffzFiaAM3wUGtVlDzAVTjDgmfQD3z6SdmAmOB9CdYGUBtoRbbodmNQI4peIwMl5hi/P//P4oCUEwN4Q7fU4yYQIqpodclf8vyAAC+a17T0iNSKwAAAABJRU5ErkJggg==`;

ODA({
    is: 'oda-layout-designer', extends: "oda-app-layout",
    template: `
        <oda-layout-toolbar slot="top-right" :layout></oda-layout-toolbar>
        <oda-layout-tree ref="tree" :slot="layout && layout.bs && layout.bs.designMode?'left-drawer':'?'" :data-set="layout?.items" :focused-row="focused" ::selection></oda-layout-tree>
        <oda-layout-structure ~style="{padding: \`$\{iconSize/2\}px $\{iconSize/2\}px $\{iconSize/2\}px 0px\`}" ref="struct" slot="main" :layout :selection style="overflow: auto;"></oda-layout-structure>
        <!--<oda-property-grid :slot="layout && layout.bs && layout.bs.designMode?'right-drawer':'?'" :inspected-object="focused"></oda-property-grid>-->
    `,
    props: {
        item: Object,
        layout: {
            type: Object,
            freeze: true
        },
        listKey: 'items',
        iconSize: {
            default: 24,
            shared: true
        },
        selection: {
            type: Array,
            freeze: true
        },
        focused: null
    },
    observers: [
        '_initLayout(item, listKey)'
    ],
    _initLayout(item, listKey) {
        this.uuid = this.item.id = this.item.id || this.id || getUUID();
        this.layout = new LayoutItem(item, listKey, undefined, this.uuid);
        this.layout.$root = this.layout;
        _bus[this.uuid] = {
            fileName: 'oda-layout-designer-actions-' + this.uuid, enableSave: false,
            designMode: false, dragInfo: {}, selected: {}, selection: [], selectionID: [], actions: {},
            fnTreeRefresh: () => this.$refs.tree._refresh(), root: this.layout
        };
    }
});

ODA({
    is: 'oda-layout-structure',
    template: `
        <style>
            :host {
                overflow: hidden;
                @apply --vertical;
                flex-direction: {{align}};
                flex-wrap: {{align === 'row' ? 'wrap' : 'none' }};
            }
        </style>
        <oda-layout-container :is-selected="selection && selection.includes(item)" ~for="items  || 1" :item :align :selection @tap.stop="_focus"></oda-layout-container>
    `,
    props: {
        layout: {
            type: Object,
            freeze: true
        },
        items: {
            get() { return this.layout && this.layout.items || []; },
            freeze: true
        },
        align() { return this.layout && this.layout.align; },
        selection: {
            type: Array,
            freeze: true
        }
    },
    _focus(e) {
        this.selection = focus(e, this.layout, this.selection);
    }
})

ODA({
    is: 'oda-layout-container',
    template: `
        <style>
            :host {
                @apply --vertical;
                min-width: 200px;
                flex: {{align === 'row' ? '1' : '0'}};
                position: relative;
            }
            .complex {
                border-left: 1px dashed darkgray;
                margin-left: 12px;
                overflow: hidden;
            }
            .group {
                overflow: hidden;
                @apply --border;
                margin: 12px;
            }
            .is-group {
                margin: 4px;
                border: 1px solid gray;
            }
            .first-group {
                margin-right: 0;
            }
            .icon {
                cursor: pointer;
            }
            .row {
                border: 1px dotted transparent;
                min-height: 32px;
                flex: 0;
            }
            .design-row {
                border: 1px dotted lightgray;
                cursor: move;
            }
            .design-row:hover {
                box-shadow: inset 0 0 0 1px var(--info-color);
            }
            .header {
                @apply --header;
            }
            .label-group {
                margin: 4px;
                cursor: pointer;
            }
            .drag-to-left:after {
                box-shadow: inset 2px 0 0 0 var(--success-color);
            }
            .drag-to-right:after {
                box-shadow: inset -2px 0 0 0 var(--success-color);
            }
            .drag-to-top:after {
                box-shadow: inset 0 2px 0 0 var(--success-color);
            }
            .drag-to-bottom:after {
                box-shadow: inset 0 -2px 0 0 var(--success-color);
            }
            .drag-to:after {
                text-align: center;
                font-size: smaller;
                font-weight: bolder;
                content: attr(capture);
                pointer-events: none;
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,255,0,.3);
            }
            .drag-to-error:after {
                content: "not allow drop";
                pointer-events: none;
                background-color: rgba(255,0,0,.3) !important;
            }
            .active {
                @apply --active;
            }
            .shadow {
                @apply --shadow;
            }
            .is-dragged {
                filter: opacity(25%);
            }
            .disabled {
                @apply --disabled;
            }
            .focused {
                @apply --focused;
            }
        </style>
        <div class="flex vertical" ~class="{group: isGroups && item?.checked, 'first-group': domHost?.localName === 'oda-layout-structure', 'is-group': isGroups && item.bs.designMode && item.cheked,  
                'drag-to':item?.dragTo, [item?.dragTo]:item?.dragTo}" :capture>
            <div ~if="item?.checked && !isBlock" class="flex horizontal row" :draggable style="align-items:center"
                    ~class="{header:isGroups, active: isSelected, 'design-row': item.bs.designMode, 'is-dragged': item?.isDragged}" ~style="{marginBottom: isGroups?'1px':''}">
                <oda-icon ~class="{icon:item?.items.length}" :hide-icon="!item?.items.length || item.hideExpander" :rotate="item && item.$expanded?90:0" icon="icons:chevron-right" @tap.stop="_toggleExpand"></oda-icon>
                <div class="horizontal" style="min-width: 32px">
                    <div class="horizontal no-flex">
                            <label ref="lbl" ~class="{'label-group':isGroups}" @dblclick.stop="_editGroupLabel" @blur.stop="_closeEditGroupLabel" @keydown="_keydownGroupLabel">
                                {{isGroup && item?.items?.length ? '' : (item.label || item.id)}}
                            </label>
                    </div>
                </div>
                <div ~is="simple" class="horizontal flex" ~class="{disabled: item.bs.designMode && !isGroup}" :items="item?.items" ::focused-index="tabIndex" :design-mode="item.bs.designMode" ::action style="min-width: 140px"></div>
            </div>
            <div ~is="item?.complex || (item?.items?.length ? 'oda-layout-structure' : 'div')" ~class="{complex:!isGroups}" :selection
                ~if="item && item.$expanded && (item.checked || isBlock)" :layout="(isGroup && item?.items[tabIndex]) || item"></div>
        </div>
    `,
    props: {
        item: {
            type: Object,
            freeze: true
        },
        capture: String,
        isGroups() { return this.item instanceof GroupItem || this.item instanceof BlockItem; },
        isGroup() { return this.item instanceof GroupItem; },
        isBlock() { return this.item instanceof BlockItem; },
        draggable() { return this.item.bs.designMode ? 'true' : 'false'; },
        align: '',
        selection: {
            type: Array,
            freeze: true
        },
        isSelected: false,
        tabs() { return this.item.items; },
        tabIndex: 0,
        action: {
            type: Object,
            set(n) {
                if (n) {
                    switch (n.action) {
                        case 'addTab':
                            this.item.items.splice(-1);
                            this.execute({ action: 'addTab', props: { item: this.item.id, target: this.item.id } });
                            break;
                        case 'deleteTab':
                            this.execute({ action: 'deleteTab', props: { item: this.item.id, target: this.item.id, index: n.index } });
                            break;
                        case 'dragover':
                            this._clearDragTo();
                            break;
                        case 'dragstart':
                            this.item.bs.dragInfo.dragItem = n.item;
                            break;
                        case 'dragdrop':
                            this.item.bs.dragInfo.targetItem = n.item;
                            const action = { action: 'move', props: { item: this.item.bs.dragInfo.dragItem.id, target: this.item.bs.dragInfo.targetItem.id, to: 'right' } };
                            this.execute(action);
                            break;
                        default:
                            break;
                    }
                }
            }
        },
        simple() { return this.isGroup ? 'oda-tabs' : this.isBlock ? 'div' : 'input'; }
    },
    listeners: {
        'dragstart': '_dragstart',
        'dragend': '_dragend',
        'dragover': '_dragover',
        'dragleave': '_dragleave',
        'drop': '_dragdrop',
        async contextmenu() {
            if (!this.item.bs.designMode) return;
            const res = await ODA.showDropdown('oda-layout-menu');
            if (res && res.focusedItem) {
                switch (res.focusedItem.label) {
                    case 'grouping':
                        const action = { action: 'move', props: { item: this.item.id, target: this.item.id, to: 'grouping' } };
                        this.execute(action);
                        break;
                    default:
                        break;
                }
            }
        }
    },
    execute(action) {
        this.item.actions.push(action);
        fn[action.action](this.item, action.props, true);
    },
    _toggleExpand(e) {
        if (e.target.hideIcon) return;
        this.item.$expanded = !this.item.$expanded;
        this.render();
    },
    _clearDragTo() {
        this.capture = '';
        this.item.dragTo = '';
        if (this.item.bs.indxs) {
            this.item.bs.indxs.forEach(i => {
                i.dragTo = '';
            })
            this.item.bs.indxs = [];
        }
        this.item.$owner.items.forEach(i => i.dragTo = '');
        if (this.item.bs.dragInfo.last) this.item.bs.dragInfo.last.item.dragTo = '';
        if (this.domHost && this.domHost.layout) this.domHost.layout.dragTo = '';
    },
    _clearIsDragged() {
        this.item.bs.dragInfo.dragItem.isDragged = false;
        if (this.item.bs.selection && this.item.bs.selection.length) this.item.bs.selection.forEach(i => i.isDragged = '');
    },
    _dragstart(e) {
        e.stopPropagation();
        this.item.bs.dragInfo.dragItem = this.item;
        if (this.item.bs.selection && this.item.bs.selection.includes(this.item.bs.dragInfo.dragItem)) this.item.bs.selection.forEach(i => i.isDragged = true);
        else this.item.isDragged = this.item.bs.dragInfo.dragItem === this.item;
        e.dataTransfer.setDragImage((this.item.bs.selection && this.item.bs.selection.includes(this.item.bs.dragInfo.dragItem) && this.item.bs.selection.length) > 1 ? img3 : img, -20, 7);
    },
    _dragend(e) {
        this._clearDragTo();
        this._clearIsDragged();
    },
    _dragover(e) {
        e.stopPropagation();
        this._clearDragTo();
        this.item.dragTo = 'drag-to-error';
        if ((this.item.bs.selection && this.item.bs.selection.includes(this.item.bs.dragInfo.dragItem) && this.isSelected) || this.item.bs.dragInfo.dragItem === this.item) return;
        if (this.item.bs.dragInfo.dragItem.$root !== this.item.$root) return;
        this._clearDragTo();
        e.preventDefault();
        this.capture = dragOver(this.item, e);
        this.item.bs.dragInfo.last = this;
    },
    _dragleave(e) {
        this._clearDragTo();
    },
    _dragdrop(e) {
        e.stopPropagation();
        this._clearDragTo();
        this._clearIsDragged();
        const action = { action: this.item.bs.dragInfo.action, props: { item: this.item.bs.dragInfo.dragItem.id, target: this.item.bs.dragInfo.targetItem.id, to: this.item.bs.dragInfo.to } };
        this.execute(action);
    },
    _editGroupLabel(e) {
        if (!this.item.bs.designMode || !this.isGroups) return;
        const t = e.target;
        this._oldLabel = t.innerText;
        t.setAttribute('contentEditable', '');
        t.focus();
        t.style.outline = "0px solid transparent";
        window.getSelection().selectAllChildren(t)
    },
    _closeEditGroupLabel(e) {
        if (!this.item.bs.designMode) return;
        e.target.removeAttribute('contentEditable');
        this.item.label = e.target.innerText;
        this.item.$root.actions.forEach(i => {
            if (this.item.id === i.props.id) i.props.label = this.item.label;
        });
        saveToLocalStorage(this.item, true);
    },
    _keydownGroupLabel(e) {
        if (e.key === 'Enter') this._closeEditGroupLabel(e);
        else if (e.key === 'Escape') {
            e.target.innerText = this._oldLabel;
            this._closeEditGroupLabel(e);
        }
    }
})

ODA({
    is: 'oda-layout-block', extends: 'oda-layout-structure'
})

ODA({
    is: 'oda-layout-group', extends: 'oda-layout-structure', template: `
        <style>
            :host {
                min-height: 32px;
            }
        </style>`
})

ODA({
    is: 'oda-layout-toolbar',
    template: `
        <style>
            :host {
                @apply --horizontal;
            }
        </style>
        <oda-button ~if="designMode" icon="icons:settings-backup-restore" title="Refresh" @tap="_refresh"></oda-button>
        <oda-button ~if="designMode" icon="icons:save" allow-toggle ::toggled="enableSave" title="Enable Save"></oda-button>
        <oda-button ~if="designMode" icon="icons:select-all" allow-toggle ::toggled="multiSelect" title="Multi select"></oda-button>
        <oda-button icon="image:tune:90" allow-toggle ::toggled="designMode" title="Design mode"></oda-button>
    `,
    props: {
        layout: {
            type: Object,
            set(n) {
                if (n) {
                    this.layout.bs.enableSave = this.enableSave;
                    this.layout.bs.multiSelect = this.multiSelect;
                }
            }
        },
        enableSave: {
            default: 'false',
            save: true,
            set(n) { if (this.layout) this.layout.bs.enableSave = n; }
        },
        designMode: {
            default: false,
            set(n) { if (this.layout) this.layout.bs.designMode = n; }
        },
        multiSelect: {
            default: 'false',
            save: true,
            set(n) { if (this.layout) this.layout.bs.multiSelect = n; }
        }
    },
    _refresh() {
        localStorage.removeItem(this.layout.bs.fileName);
        document.location.reload();
    }
});

ODA({
    is: 'oda-layout-tree', extends: "oda-tree",
    props: {
        allowFocus: true,
        allowSelection: true,
        allowCheck: 'single'
    }
});

ODA({
    is: 'oda-layout-menu', extends: 'oda-menu',
    props: {
        items: [{ label: 'grouping' }]
    }
})
