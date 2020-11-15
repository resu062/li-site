import { html, css, svg } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-grid/layout-grid.js'
import '../button/button.js';
import '../icon/icon.js';

class BlockItem {
    constructor(item, uuid, _bs) {
        if (uuid) {
            if (_bs)
                this.__bs = _bs;
            this._uuid = uuid;
            this.__bs.$root = this;
        }
        this.$item = item;
        this._id = item.id || item.name || LI.ulid();
        this.selected = false;
        this.disabled = false;
        this.tag = item.tag || 'div';
    }
    get uuid() { return this._uuid }
    get _bs() { return this.__bs || {} }
    get id() { return this._id }
    get label() { return this.$item.label || this.$item.name || 'block' }
    get items() {
        if (!this._items) {
            this._items = (this.$item.items || []).map(i => new BlockItem(i));
            if (this._items.length) {
                this._items.forEach(i => {
                    i._uuid = this._uuid;
                    i.__bs = this._bs;
                    i._owner = this;
                })
            }
        }
        return this._items;
    }
    get $owner() { return this._owner || this }
    get model() { return this.$item.model }
    get transform() {
        let x = (this.$item.x * (this._bs?.zoom || 1));
        let y = (this.$item.y * (this._bs?.zoom || 1));
        return `translate3d(${x}px, ${y}px, 0px)`
    }
    select(e) {
        clearSelectedBlocks(this);
        this._bs.selectedBlock = this;
        this.selected = true;
    }
    move(x, y) {
        this.$item.x += x / (this._bs?.zoom || 1);
        this.$item.y += y / (this._bs?.zoom || 1);
    }
    addDefaultConnector(position) {
        if (!this._bs.editMode) return;
        this.model[position].splice(this.model[position].length, 0, defaultConnector);
        LI.notifier.success('Add default connector: <br>' + this.label)
    }
    addConnector(position, index) {
        if (!this._bs.editMode) return;
        this.model[position].splice(this.model[position].length, 0, this.model[position][index].connector || defaultConnector);
        LI.notifier.success('Add connector: <br>' + this.label)
    }
    deleteConnector(position, index) {
        if (!this._bs.editMode) return;
        this.model[position].splice(index, 1);
        LI.notifier.info('Delete connector: <br>' + this.label)
    }
    setConnectors(action = '') {
        this.$owner.items.forEach(i => {
            if (i.model)
                ['top', 'bottom', 'left', 'right'].forEach(p => {
                    let count = 0;
                    if (i.model[p])
                        i.model[p].forEach(c => {
                            c.index = count;
                            c._disabled = c.disabled || (action === 'dragStart' && this._bs?.line?.show && c.disableDrag) || false;
                            if (action === 'deleteAllLinks' && c.link && (c.link.id === this.id || i.id === this.id)) delete c.link;
                            count++;
                        })
                })
        })
    }
    deleteBlock() {
        this.deleteAllLinks();
        //this.$owner.items.splice(this.$owner.items.indexOf(this), 1);
        //LI.notifier.warning('Delete block')
    }
    deleteAllLinks() {
        this.setConnectors('deleteAllLinks');
        LI.notifier.warning('Delete all links: <br>' + this.label)
    }
    getBlock(id) {
        for (const i of this.$owner.items)
            if (i.id === id)
                return i;
    }
}
const defaultConnector = {
    type: 'default', icon: 'link', action: 'deleteConnector', size: '16', service: false,
    style: { border: '2px solid red', 'border-radius': '50% 5%', 'background-color': 'transparent' }, color: 'lime'
}
function clearSelectedBlocks(bl) {
    bl.$owner.items.forEach(i => {
        i.selected = false;
        i._bl.$$update();
    })
}


customElements.define('li-layout-scheme', class LiLayoutScheme extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            _bs: { type: Object, default: {}, local: true }, zoom: { type: Number, default: 1, local: true },
            _width: { type: Number, default: 10000, local: true }, _height: { type: Number, default: 10000, local: true },
            editMode: { type: Boolean, default: true, local: true }, _gridMain: { type: Object, default: {}, local: true },
            item: { type: Object, default: {} },
            block: { type: Object, default: {} },
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.$$update();
    }

    updated(changedProps) {
        super.update(changedProps);
        if (changedProps.has('item') && this.item && this.item.items) {
            this.uuid = this.item.id = this.item.id || this.id || LI.ulid();
            this._bs = {
                fileName: 'oda-scheme-designer-' + this.uuid, zoom: this._bs.zoom,
                editMode: this.editMode, selectedBlock: undefined, line: { show: false, x1: 0, y1: 0, x2: 0, y2: 0 }
            };
            this.block = new BlockItem(this.item, this.uuid, this._bs);
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                position: relative;
            }
        `;
    }

    render() {
        return html`
            <li-layout-grid .$$id="${this.$$id}" ref="main"  @mousemove="${this._move}" @mouseup="${this._up}">
                <div slot="layout-grid-main">
                    ${svg`
                        <svg width="${this._width}" height="${this._height}" style="position:absolute;top:0;left:0;background-color:transparent;">
                            ${(this.links || []).map(l => svg`
                                <path d="${this._link(l)}" style="stroke-width: ${l.selected ? '4px' : '2px'};cursor:pointer;z-index:-1" fill="none" opacity="0.5" stroke="${l.color || 'red'}"></path>
                            `)}
                        </svg>
                    `}
                    ${(this.block?.items || []).map(bl => html`
                        <li-layout-scheme-block .$$id="${this.$$id}" .bl="${bl}" @mousedown="${this._down}"></li-layout-scheme-block>
                    `)}
                    ${svg`
                        <svg width="${this._width}" height="${this._height}" style="position:absolute;top:0;left:0;background-color:transparent;pointer-events:none;z-index:9">
                            ${!(this._bs?.line?.show) ? svg`` : svg`    
                                <line x1="${this._bs?.line?.x1}" y1="${this._bs?.line?.y1}" x2="${this._bs?.line?.x2}" y2="${this._bs?.line?.y2}" style="stroke:red; stroke-width:2px;stroke-dasharray:2"></line>
                            `}
                        </svg>
                    `}
                </div>
            </li-layout-grid>
        `;
    }

    get links() {
        if (!this.block || !this.block.items || !this._bs || !this.$refs?.main) return [];
        const links = [];
        let color = 0;
        this.block.items.map(b => {
            if (b._bl && b.model) {
                ['top', 'bottom', 'left', 'right'].forEach(p => {
                    if (b.model[p])
                        for (let c = 0; c < b.model[p].length; c++) {
                            const i = b.model[p][c];
                            if (i.link && i.link.id && i.link.position && (i.link.index || i.link.index === 0)) {
                                let s = b._bl._getConnector(p, c);
                                if (s) {
                                    s = s.getBoundingClientRect();
                                    const block = b.getBlock(i.link.id)
                                    if (block && block._bl) {
                                        let l = block._bl._getConnector(i.link.position, i.link.index);
                                        if (l) {
                                            l = l.getBoundingClientRect();
                                            links.push({
                                                x1: (l.x + l.width / 2) * (this._bs.zoom || 1) - this.offsetLeft - this.$refs.main.$refs.main.offsetLeft,
                                                y1: (l.y + l.height / 2) * (this._bs.zoom || 1) - this.offsetTop - this.$refs.main.$refs.main.offsetTop,
                                                x2: (s.x + s.width / 2 - (this.brokenLine ? 14 : 0)) * (this._bs.zoom || 1) - this.offsetLeft - this.$refs.main.$refs.main.offsetLeft,
                                                y2: (s.y + s.height / 2) * (this._bs.zoom || 1) - this.offsetTop - this.$refs.main.$refs.main.offsetTop,
                                                selected: false, color: i.link.color || `hsla(${color}, 90%, 40%, 1)`,
                                            })
                                            color = i.link.color ? color : color + 73;
                                        }
                                    }
                                }
                            }
                        }
                })
            }
        })
        return links;
    }
    _link(l) {
        //if (this.brokenLine) return `M${l.x1} ${l.y1} L ${l.x1 + 27.5} ${l.y1} ${l.x2 - 27.5} ${l.y2} ${l.x2} ${l.y2} ${l.x2 - 6} ${l.y2 - 3} ${l.x2 - 6} ${l.y2 + 3} ${l.x2} ${l.y2}`;
        return `M${l.x1},${l.y1} Q${(l.x1 + l.x2) / 2},${l.y1} ${(l.x1 + l.x2) / 2},${(l.y1 + l.y2) / 2}  T${l.x2},${l.y2}`;
    }

    _down(e) {
        this.detail = {
            state: 'start',
            start: {
                x: e.clientX,
                y: e.clientY
            }, ddx: 0, ddy: 0, dx: 0, dy: 0,
            bl: e.target
        };
    }
    _up(e) {
        this.detail = undefined;
        this.$$update();
    }
    _move(e) {
        if (this.detail) {
            this.detail.x = e.clientX;
            this.detail.y = e.clientY;
            this.detail.ddx = -(this.detail.dx - (e.clientX - this.detail.start.x));
            this.detail.ddy = -(this.detail.dy - (e.clientY - this.detail.start.y));
            this.detail.dx = e.clientX - this.detail.start.x;
            this.detail.dy = e.clientY - this.detail.start.y;
            if (this.detail.bl.bl) this.detail.bl.bl.move(this.detail.ddx, this.detail.ddy);
            this.detail.bl.$$update();
        }
    }
})

customElements.define('li-layout-scheme-block', class LiLayoutSchemeBlock extends LiElement {
    static get properties() {
        return {
            $$id: { type: String, update: true },
            _bs: { type: Object, default: {}, local: true }, editMode: { type: Boolean, default: true, local: true }, _gridMain: { type: Object, default: {}, local: true },
            bl: { type: Object, default: {} },
            defaultSize: { type: Number, default: 24 },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.bl._bl = this;
    }

    _s(s = {}) {
        return Object.entries(s).map(([k, v]) => `${k}:${v}`).join(';')
    }

    _getConnector(p, i) {
        if (this.$refs[p] && this.$refs[p])
            return this.$refs[p].children[i];
    }

    static get styles() {
        return css`
            .hhost {
                display: flex;
                flex-direction: column;
                position: absolute;
                left: 0;
                top: 0;
                color: gray;
                font-family: Arial;
                font-size: 18px;
            }
            .block {
                display: flex;
                flex-direction: column;
                border: 1px solid gray;
                position:relative;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                padding: 2px;
                background-color: white;
                cursor: pointer;
            }
            .info-block {
                border-radius: 2px;
                padding: 4px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .connectors {
                display: flex;
                position: relative;
                align-items: center;
                justify-content: center;
            }
            .horizontal {
                display: flex;
            }
            .vertical {
                display: flex;
                flex-direction: column;
            }
            .flex {
                flex: 1;
            }
        `;
    }

    render() {
        return html`
            <div class="hhost vertical" style="zoom: ${this._bs.zoom || 1}; transform: ${this.bl?.transform}; z-index: ${this.bl?.selected ? 1 : 0}">
                ${!(this.bl?.model) ? html`` : html`
                    <div class="connectors" style="cursor: ${this.bl?._bs?.editMode ? 'pointer' : 'default'}">
                        ${!(this.bl?.model?.left?.length) ? html`` : html`
                            <div style="width:${this.$refs?.left?.offsetWidth || 0 + 'px'}"></div>
                        `}
                        <div class="connectors" ref="top">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.top || []).map(item => html`
                                    <li-layout-scheme-connector .$$id="${this.$$id}" .item="${item}" .bl="${this.bl}" position="top"></li-layout-scheme-connector>`)}                     
                            `}
                        </div>
                        ${!(this.bl?.model?.right?.length) ? html`` : html`
                            <div style="width:${this.$refs?.right?.offsetWidth || 0 + 'px'}"></div>
                        `}
                    </div>
                `}
                <div class="horizontal">
                    ${!(this.bl?.model) ? html`` : html`
                        <div class="connectors vertical" ref="left" style="cursor: ${this.bl?._bs?.editMode ? 'pointer' : 'default'}">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.left || []).map(item => html`
                                    <li-layout-scheme-connector .$$id="${this.$$id}" .item="${item}" .bl="${this.bl}" position="left"></li-layout-scheme-connector>`)} 
                            `}
                        </div>
                    `}
                    <div class="block vertical flex" style="position: relative;justify-content:center;align-items:center;box-shadow: ${this.bl?.selected ? '0 0 9px orange' : ''}"
                            @click="${this._click}">
                        <div class="info-block" is="${this.bl?.tag}" style="${this._s(this.bl?.$item.style)}">${this.bl?.label}</div>
                        <div class="horizontal" style="width: 100%; justify-content: space-between;position:absolute;top:0">
                            ${(this.bl?.model?.staticMenu?.top || [] || []).map(i => html`
                                ${(i.editMode ? !this.editMode : i.editMode) ? html`` : html`
                                    <li-icon name="${i.icon}" size="${i.size || this.defaultSize}" fill="$(i.style?.color || 'gray'}" style="${this._s(i.style)}" title="${i.title}" @click="${(e) => this._tap(e, i.action)}" disabled="${i.disabled}"></li-icon>
                                `}
                            `)}
                            <div class="flex"></div>
                            ${((this.bl?.selected && this.bl?.model?.dynamicMenu?.top) || []).map(i => html`
                                ${(i.editMode ? !this.editMode : i.editMode) ? html`` : html`
                                    <li-icon name="${i.icon}" size="${i.size || this.defaultSize}" fill="$(i.style?.color || 'gray'}" style="${this._s(i.style)}" title="${i.title}" @click="${(e) => this._tap(e, i.action)}" disabled="${i.disabled}"></li-icon>
                                `}
                            `)}
                        </div>
                        <div class="horizontal" style="width: 100%; justify-content: space-between;position:absolute;bottom:0">
                            ${(this.bl?.model?.staticMenu?.bottom || [] || []).map(i => html`
                                ${(i.editMode ? !this.editMode : i.editMode) ? html`` : html`
                                    <li-icon name="${i.icon}" size="${i.size || this.defaultSize}" fill="$(i.style?.color || 'gray'}" style="${this._s(i.style)}" title="${i.title}" @click="${(e) => this._tap(e, i.action)}" disabled="${i.disabled}"></li-icon>
                                `}
                            `)}
                            <div class="flex"></div>
                            ${((this.bl?.selected && this.bl?.model?.dynamicMenu?.bottom) || []).map(i => html`
                                ${(i.editMode ? !this.editMode : i.editMode) ? html`` : html`
                                    <li-icon name="${i.icon}" size="${i.size || this.defaultSize}" fill="$(i.style?.color || 'gray'}" style="${this._s(i.style)}" title="${i.title}" @click="${(e) => this._tap(e, i.action)}" disabled="${i.disabled}"></li-icon>
                                `}
                            `)}
                        </div>
                    </div>
                    ${!(this.bl?.model) ? html`` : html`
                        <div class="connectors vertical" ref="right" style="cursor: ${this.bl?._bs?.editMode ? 'pointer' : 'default'}">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.right || []).map(item => html`
                                    <li-layout-scheme-connector .$$id="${this.$$id}" .item="${item}" .bl="${this.bl}" position="right"></li-layout-scheme-connector>`)} 
                            `}
                        </div>
                    `}
                </div>
                ${!(this.bl?.model) ? html`` : html`
                    <div class="connectors"  style="cursor: ${this.bl?._bs?.editMode ? 'pointer' : 'default'}">
                        ${!(this.bl?.model?.left?.length) ? html`` : html`
                            <div style="width:${this.$refs?.left?.offsetWidth || 0 + 'px'}"></div>
                        `}
                        <div class="connectors" ref="bottom">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.bottom || []).map(item => html`
                                    <li-layout-scheme-connector .$$id="${this.$$id}" .item="${item}" .bl="${this.bl}" position="bottom"></li-layout-scheme-connector>`)}                     
                            `}
                        </div>
                        ${!(this.bl?.model?.right?.length) ? html`` : html`
                            <div style="width:${this.$refs?.right?.offsetWidth || 0 + 'px'}"></div>
                        `}
                    </div>
                `}
            </div>
        `;
    }

    _click(e) {
        e.stopPropagation();
        this.bl.select(e);
        this.$$update();
    }
    _tap(e, action) {
        e.stopPropagation();
        if (!action || !this._bs?.editMode) return;
        if (typeof action === 'string') {
            if (this.bl[action])
                this.bl[action]();
        } else
            action.call(this.bl);
        this.$$update();
    }
});

customElements.define('li-layout-scheme-connector', class LiLayoutSchemeConnector extends LiElement {
    static get properties() {
        return {
            $$id: { type: String, update: true },
            _bs: { type: Object, default: {}, local: true }, editMode: { type: Boolean, default: true }, _gridMain: { type: Object, default: {}, local: true },
            item: { type: Object, default: {} },
            bl: { type: Object, default: {} },
            defaultSize: { type: Number, default: 18 },
            position: { type: String, default: '' },
            dragover: { type: Boolean, default: false }
        }
    }

    get draggable() { return (this.item?._disabled || this.item?.disableDrag || !this.editMode) ? 'false' : 'true' }
    get disabled() {
        if (this._bs?.line?.connector === this) return false;
        return this.item?.disabled || this.item?._disabled || this._bs?.line?.bl === this.bl
    }
    get _style() {
        let s = {
            ...(this.item?.style || {}), ...{
                transform: this.dragover ? 'scale(2)' : 'scale(1)', cursor: this.draggable ? 'pointer' : 'default !important', margin: '2px', transition: 'transform 100ms',
                cursor: this.disabled ? 'cursor: default !important' : '', opacity: this.disabled ? '0.4' : '', 'user-select': this.disabled ? 'none' : '',
                'pointer-events': this.disabled ? 'none' : '', filter: this.disabled ? 'grayscale(80%)' : ''
            } || {}
        };
        s = Object.entries(s).map(([k, v]) => `${k}:${v}`).join(';')
        return s;
    }

    static get styles() {
        return css`
            :host {
                z-index: 1;
            }
        `
    }

    render() {
        return html`
            <div style="${this._style}" draggable="${this.draggable}" title="${this.item?.title}" @mousedown="${this._down}"
                @click="${this._tap}" @dragstart="${this._dragstart}" @drag="${this._drag}" @dragover="${this._dragover}" @dragleave="${this._dragleave}" 
                    @dragend="${this._dragend}" @drop="${this._drop}">
                ${!(this.item?.icon) ? html`` : html`
                    <li-icon  name="${this.item?.icon}" size="${this.item?.size || this.defaultSize}" fill="${this.item?.color}" ></li-icon>
                `}
            </div>
        `;
    }

    _down(e) {
        e.stopPropagation();
    }
    _tap(e) {
        if (!this.item.action || !this.editMode) return;
        this.bl.setConnectors();
        if (typeof this.item.action === 'string') {
            if (this.bl[this.item.action])
                this.bl[this.item.action](this.position, this.item.index);
        } else
            this.item.action.call(this.bl, this.position, this.item.index);
        this.$$update();
    }
    _dragstart(e) {
        let bs = this._bs;
        bs.line.connector = this;
        bs.line.bl = this.bl;
        bs.line.item = this;
        bs.line.x1 = bs.line.x2 = e.x - this._gridMain.offsetLeft + this._gridMain.scrollLeft;
        bs.line.y1 = bs.line.y2 = e.y - this._gridMain.offsetTop + this._gridMain.scrollTop;
        bs.line.show = true;
        this.bl.setConnectors('dragStart');
        this.$$update();
    }
    _drag(e) {
        let bs = this._bs;
        if (bs.line.show && e.x !== 0) {
            bs.line.x2 = e.x - this._gridMain.offsetLeft + this._gridMain.scrollLeft;
            bs.line.y2 = e.y - this._gridMain.offsetTop + this._gridMain.scrollTop;
            this.$$update();
        }
    }
    _dragover(e) {
        if (this._bs.line.show && this.draggable && !this.item._disabled && !this.item.disableDrag && this._bs?.line?.bl !== this.bl) {
            e.preventDefault()
            this.dragover = true;
        } else
            this.dragover = false;
    }
    _dragleave() {
        this.dragover = false;
    }
    _dragend(e) {
        this._clearDrag();
    }
    _drop() {
        const l = this._bs.line.item;
        this.item.link = { id: l.bl.id, position: l.position, index: l.item.index };
        this._clearDrag();
    }
    _clearDrag() {
        let bs = this._bs;
        bs.line.x1 = bs.line.x2;
        bs.line.y1 = bs.line.y2;
        bs.line.bl = bs.line.connector = undefined;
        bs.line.show = false;
        this.dragover = false;
        this.bl.setConnectors();
        this.$$update();
    }
});