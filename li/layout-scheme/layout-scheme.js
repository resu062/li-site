import { LiElement, html, css, svg } from '../../li.js';

import '../layout-grid/layout-grid.js'
import '../button/button.js';
import '../icon/icon.js';

class BlockItem {
    constructor(item, uuid, $$, owner, root) {
        this._uuid = uuid;
        this._$$ = $$;
        this._$owner = owner;
        if (root) this._$$.$root = this;
        this.$item = item;
        this._id = item.id || item.name || LI.ulid();
        this.selected = false;
        this.disabled = false;
        this.tag = item.tag || '';
    }
    get uuid() { return this._uuid }
    get $$() { return this._$$ || {} }
    get id() { return this._id }
    get label() { return this.$item.label || this.$item.name || 'block' }
    get items() {
        if (!this._items) this._items = (this.$item.items || []).map(i => new BlockItem(i, this._uuid, this.$$, this));
        return this._items;
    }
    get $owner() { return this._$owner || this }
    get model() { return this.$item.model }
    get transform() {
        if (this.$item.type === 'block') {
            let x = (this.$item.x);
            let y = (this.$item.y);
            return `translate3d(${x}px, ${y}px, 0px)`;
        }
        let val = '';
        if (this.$$?._gridMain) {
            let sl = this.$$._gridMain.scrollLeft || 0,
                st = this.$$._gridMain.scrollTop || 0,
                ow = this.$$._gridMain.offsetWidth || 0,
                oh = this.$$._gridMain.offsetHeight || 0;
            const translate = {
                left: () => { val = `translate3d(${sl + 2}px, ${st + oh / 2}px, 0px)` },
                top: () => { val = `translate3d(${sl + ow / 2}px, ${st + 2}px, 0px)` },
                right: () => { val = `translate3d(${sl + ow - 42}px, ${st + oh / 2}px, 0px)` },
                bottom: () => { val = `translate3d(${sl + ow / 2}px, ${st + oh - 42}px, 0px)` }
            }
            if (this.$item.type && translate[this.$item.type])
                translate[this.$item.type]();
        }
        return val;
    }
    select(e) {
        clearSelectedBlocks(this);
        this.$$.selectedBlock = this;
        this.selected = true;
    }
    move(x, y) {
        this.$item.x += x / (this.$$?.zoom || 1);
        this.$item.y += y / (this.$$?.zoom || 1);
    }
    addDefaultConnector(position) {
        if (!this.$$.editMode) return;
        let con = { ...{}, ...defaultConnector };
        con.id = LI.ulid();
        this.model[position].splice(this.model[position].length, 0, con);
        this.setConnectors();
        //LI.notifier.success('Add default connector: <br>' + this.label)
    }
    addConnector(position, index) {
        if (!this.$$.editMode) return;
        let con = { ...{}, ...this.model[position][index - 1].connector } || { ...{}, ...defaultConnector };
        con.id = LI.ulid();
        this.model[position].splice(this.model[position].length, 0, con);
        this.setConnectors();
        //LI.notifier.success('Add connector: <br>' + this.label)
    }
    deleteConnector(position, index) {
        if (!this.$$.editMode) return;
        this.model[position].splice(index, 1);
        //LI.notifier.info('Delete connector: <br>' + this.label)
    }
    setConnectors(action = '') {
        this.$owner.items.forEach(i => {
            if (i.model)
                ['top', 'bottom', 'left', 'right'].forEach(p => {
                    let count = 1;
                    if (i.model[p])
                        i.model[p].forEach(c => {
                            if (!c.id && c.id !== 0) c.id = LI.ulid();
                            c.index = count;
                            c._disabled = c.disabled || (action === 'dragStart' && this.$$?.line?.show && c.disableDrag) || false;
                            if (action === 'deleteAllLinks' && c.link && c.link.id === this.id) delete c.link;
                            count++;
                        })
                })
        })
    }
    deleteBlock() {
        this.deleteAllLinks();
        clearSelectedBlocks(this);
        this.$owner.items.splice(this.$owner.items.indexOf(this), 1);
        //LI.notifier.warning('Delete block')
        this.setConnectors();
    }
    deleteAllLinks() {
        this.setConnectors('deleteAllLinks');
        //LI.notifier.warning('Delete all links: <br>' + this.label)
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
        i._bl.$update();
    })
}

customElements.define('li-layout-scheme', class LiLayoutScheme extends LiElement {
    static get properties() {
        return {
            _width: { type: Number, default: 10000, local: true }, _height: { type: Number, default: 10000, local: true },
            editMode: { type: Boolean, default: true, local: true }, _gridMain: { type: Object, default: {}, local: true },
            item: { type: Object, default: {} },
            block: { type: Object, default: {} },
            shift: { type: Number, default: 10 },
            linkColor: { type: String, default: '' },
            showGrid: { type: Boolean, default: true }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.$update();
    }

    updated(changedProps) {
        super.update(changedProps);
        if (changedProps.has('item') && this.item?.items) {
            this.uuid = this.item.id = this.item.id || this.id || LI.ulid();
            this.$$.fileName = 'oda-scheme-designer-' + this.uuid;
            this.$$.zoom = this.$$.zoom;
            this.$$.editMode = this.editMode;
            this.$$.line = { show: false, x1: 0, y1: 0, x2: 0, y2: 0 };
            this.block = new BlockItem(this.item, this.uuid, this.$$, undefined, true);
            this.block?.items[0].setConnectors();
            this.$update();
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

    get _main() {
        return html`
            <div slot="layout-grid-main">
                ${svg`
                    <svg width="${this._width}" height="${this._height}" style="position:absolute;top:0;left:0;background-color:transparent;">
                        <defs>
                            <marker id="head" viewBox="0 0 10 10"
                                refX="15" refY="5" 
                                markerUnits="strokeWidth"
                                markerWidth="7" markerHeight="7"
                                orient="auto">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="${this.linkColor || "blue"}"/> 
                            </marker>
                        </defs>
                        ${(this.links || []).map(l => svg`
                            <path marker-end='url(#head)' d="${this._shift(l)}" style="stroke-width: ${l.selected ? '4px' : '2px'};cursor:pointer;z-index:-1" fill="none" opacity=".5" stroke="${l.color || 'red'}"></path>      
                            <path d="${this._link(l)}" style="stroke-width: ${l.selected ? '4px' : '2px'};cursor:pointer;z-index:-1" fill="none" opacity=".5" stroke="${l.color || 'red'}"></path>
                        `)}
                    </svg>
                `}
                ${(this.block?.items || []).map(bl => html`
                    <li-layout-scheme-block .bl="${bl}" @mousedown="${this._down}"></li-layout-scheme-block>
                `)}
                ${svg`
                    <svg width="${this._width}" height="${this._height}" style="position:absolute;top:0;left:0;background-color:transparent;pointer-events:none;z-index:9">
                        ${!(this.$$?.line?.show) ? svg`` : svg`    
                            <line x1="${this.$$?.line?.x1}" y1="${this.$$?.line?.y1}" x2="${this.$$?.line?.x2}" y2="${this.$$?.line?.y2}" style="stroke:red; stroke-width:2px;stroke-dasharray:2"></line>
                        `}
                    </svg>
                `}
            </div>
        `
    }

    render() {
        return html` ${this.showGrid ? html`
                <li-layout-grid ref="main" @mousemove="${this._move}" @mouseup="${this._up}">
                    ${this._main}
                </li-layout-grid>
            ` : html`
                <slot name="layout-grid-main"></slot>
                ${this._main}
            `}
        `
    }

    get links() {
        if (!this.block || !this.block.items || !this.$$ || !this.$refs?.main) return [];
        const links = [];
        let _color = 0;
        this.block.items.map(b => {
            ['top', 'bottom', 'left', 'right'].forEach(p => {
                if (!b._bl || !b.model || !b.model[p]) return;
                for (let c = 0; c < b.model[p].length; c++) {
                    const i = b.model[p][c];
                    if (i.link && i.link.id && i.link.position && (i.link.idc || i.link.idc === 0)) {
                        let s = b._bl._getConnector(p, i.id);
                        if (!s) return;
                        s = s.getBoundingClientRect();
                        const block = b.getBlock(i.link.id)
                        if (!block || !block._bl) return;
                        let l = block._bl._getConnector(i.link.position, i.link.idc);
                        if (!l) return;
                        const shift = this.shift || 10,
                            odx = (l.item.index || c + 1) * shift;
                        //odx = (l.item.index || 0 + 1) * shift;
                        if (!l) return;
                        l = l.getBoundingClientRect();
                        const st = this.$$._gridMain.scrollTop || 0,
                            sl = this.$$._gridMain.scrollLeft || 0;
                        const x1 = (l.x + l.width / 2) * (this.$$.zoom || 1) - this.offsetLeft - this.$$._gridMain.offsetLeft + sl,
                            y1 = (l.y + l.height / 2) * (this.$$.zoom || 1) - this.offsetTop - this.$$._gridMain.offsetTop + st,
                            x2 = (s.x + s.width / 2) * (this.$$.zoom || 1) - this.offsetLeft - this.$$._gridMain.offsetLeft + sl,
                            y2 = (s.y + s.height / 2) * (this.$$.zoom || 1) - this.offsetTop - this.$$._gridMain.offsetTop + st,
                            int = p,
                            out = i.link.position,
                            path = i.link.position + '-' + p,
                            idx = (c + 1) * shift + shift / 2;
                        let x11 = (out === 'left' ? x1 - (shift + odx) : out === 'right' ? x1 + (shift + odx) : x1),
                            y11 = (out === 'top' ? y1 - (shift + odx) : out === 'bottom' ? y1 + (shift + odx) : y1),
                            x21 = (int === 'left' ? x2 - (shift + idx) : int === 'right' ? x2 + (shift + idx) : x2),
                            y21 = (int === 'top' ? y2 - (shift + idx) : int === 'bottom' ? y2 + (shift + idx) : y2),
                            x = '', y = '', _x = '', _y = '';
                        let _links = {
                            'left-left': () => { x = x11 > x21 ? x21 : x11; y = x11 > x21 ? y1 : y21 },
                            'left-right': () => {
                                if (x11 > x21) x21 = x11;
                                else { x21 = _x = x21; x = x11; y = _y = y21 + (y11 - y21) / 2; }
                            },
                            'left-top': () => {
                                if (x21 < x11) { x = x11; y = y21; if (y11 > y21) { x = x11; y = y21; } }
                                else { _x = x2; x = x11; y = y21; if (y11 > y21) y = _y = y21; }
                            },
                            'left-bottom': () => {
                                if (x11 > x21) {
                                    if (y11 > y21) { x = x11; y = y21 } if (y11 < y21) { x = x11; y = y21; }
                                }
                                else { x = x11; y = y21 }
                            },
                            'right-right': () => { x = x11 < x21 ? x21 : x11; y = x11 < x21 ? y1 : y21 },
                            'right-left': () => {
                                if (x11 < x21) x21 = x11;
                                else { x21 = _x = x2 - (shift + idx); x = x11; y = _y = y21 + (y11 - y21) / 2; }
                            },
                            'right-top': () => {
                                if (x21 > x11) { x = x11; y = y21; if (y11 > y21) { x = x11; y = y21; } }
                                else { x = x11; y = y21; if (y11 > y21) y = y21; }
                            },
                            'right-bottom': () => {
                                if (x11 < x21) { x = x11; y = y21; if (y11 < y21) { x = x11; y = y21; } }
                                else { x = x11; y = y21 }
                            },
                            'top-top': () => { y = y11 < y21 ? y11 : y21; x = y11 < y21 ? x2 : x11 },
                            'top-left': () => {
                                if (x11 < x21) { if (y11 > y21) { y11 = y21 } else { y = y11; _y = y21; x = _x = x11 + (x21 - x11) / 2 } }
                                else { if (y11 > y21) { _x = x21; x = x11; y = _y = y21 + (y11 - y21) / 2; } else { y = y11; x = x21; } }
                            },
                            'top-right': () => {
                                if (x11 > x21) { if (y11 > y21) { y11 = y21 } else { y = y11; _y = y21; x = _x = x11 + (x21 - x11) / 2 } }
                                else { if (y11 > y21) { _x = x21; x = x11; y = _y = y21 + (y11 - y21) / 2; } else { y = y11; x = x21; } }
                            },
                            'top-bottom': () => {
                                if (y11 > y21) y21 = y11;
                                else { y21 = _y = y2 + (shift + idx); y = y11; x = _x = x21 + (x11 - x21 + idx) / 2 - odx; }
                            },
                            'bottom-bottom': () => { y = y11 < y21 ? y21 : y11; x = y11 < y21 ? x1 : x21 },
                            'bottom-left': () => {
                                if (x11 < x21) { if (y11 < y21) { y11 = y21 } else { y = y11; x = x21 } }
                                else { if (y11 < y21) { x = x21; y = y11; } else { y = y11; x = x21; } }
                            },
                            'bottom-right': () => {
                                if (x11 > x21) { if (y11 < y21) { y11 = y21 } else { y = y11; x = x21 } }
                                else { if (y11 < y21) { x = x21; y = y11 } else { y = y11; x = x21; } }
                            },
                            'bottom-top': () => {
                                if (y11 < y21) y21 = y11;
                                else { y21 = _y = y2 - (shift + idx); y = y11; x = _x = x21 + (x11 - x21 + idx) / 2 - odx; }
                            },
                        }
                        if (_links[path]) _links[path]();
                        let color = this.linkColor || i.link.color || `hsla(${_color}, 90%, 40%, 1)`;
                        links.push({ x1, y1, x2, y2, int, out, path, x11, y11, x21, y21, x, y, _x, _y, color, selected: false })
                        _color = i.link.color ? _color : _color + 47;
                    }
                }
            })
        })
        return links;
    }
    _shift(l) {
        return `M${l.x1},${l.y1} L${l.x11},${l.y11} M${l.x21},${l.y21} L${l.x2},${l.y2}`;
    }
    _link(l) {
        const xy = (l.x && l.y ? `L${l.x} ${l.y} ` : '');
        const _xy = (l._x && l._y ? `L${l._x} ${l._y} ` : '');
        return `M${l.x11} ${l.y11} ${xy} ${_xy} L${l.x21} ${l.y21}`;
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
        this.$update();
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
            this.detail.bl.$update();
        }
    }
})

customElements.define('li-layout-scheme-block', class LiLayoutSchemeBlock extends LiElement {
    static get properties() {
        return {
            editMode: { type: Boolean, default: true, local: true }, _gridMain: { type: Object, default: {}, local: true },
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

    _getConnector(p, id) {
        if (this.$refs[p] && this.$refs[p].children)
            for (let i = 0; i < this.$refs[p].children.length; i++)
                if (this.$refs[p].children[i].item.id === id)
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
            <div class="hhost vertical" style="zoom: ${this.$$?.zoom || 1};transform: ${this.bl?.transform}; z-index: ${this.bl?.selected ? 1 : 0}">
                ${!(this.bl?.model) ? html`` : html`
                    <div class="connectors" style="cursor: ${this.$$?.editMode ? 'pointer' : 'default'}">
                        ${!(this.bl?.model?.left?.length) ? html`` : html`
                            <div style="width:${this.$refs?.left?.offsetWidth || 0 + 'px'}"></div>
                        `}
                        <div class="connectors" ref="top">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.top || []).map(item => html`
                                    <li-layout-scheme-connector .item="${item}" .bl="${this.bl}" position="top"></li-layout-scheme-connector>`)}                     
                            `}
                        </div>
                        ${!(this.bl?.model?.right?.length) ? html`` : html`
                            <div style="width:${this.$refs?.right?.offsetWidth || 0 + 'px'}"></div>
                        `}
                    </div>
                `}
                <div class="horizontal">
                    ${!(this.bl?.model) ? html`` : html`
                        <div class="connectors vertical" ref="left" style="cursor: ${this.$$?.editMode ? 'pointer' : 'default'}">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.left || []).map(item => html`
                                    <li-layout-scheme-connector .item="${item}" .bl="${this.bl}" position="left"></li-layout-scheme-connector>`)} 
                            `}
                        </div>
                    `}
                    ${!(this.bl?.$item?.type === 'block') ? html`` : html`
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
                    `}
                    ${!(this.bl?.model) ? html`` : html`
                        <div class="connectors vertical" ref="right" style="cursor: ${this.$$?.editMode ? 'pointer' : 'default'}">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.right || []).map(item => html`
                                    <li-layout-scheme-connector .item="${item}" .bl="${this.bl}" position="right"></li-layout-scheme-connector>`)} 
                            `}
                        </div>
                    `}
                </div>
                ${!(this.bl?.model) ? html`` : html`
                    <div class="connectors"  style="cursor: ${this.$$?.editMode ? 'pointer' : 'default'}">
                        ${!(this.bl?.model?.left?.length) ? html`` : html`
                            <div style="width:${this.$refs?.left?.offsetWidth || 0 + 'px'}"></div>
                        `}
                        <div class="connectors" ref="bottom">
                            ${!(this.item?.editMode ? this.editMode : !this.item?.editMode) ? html`` : html`
                                ${(this.bl?.model?.bottom || []).map(item => html`
                                    <li-layout-scheme-connector .item="${item}" .bl="${this.bl}" position="bottom"></li-layout-scheme-connector>`)}                     
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
        this.$update();
    }
    _tap(e, action) {
        e.stopPropagation();
        if (!action || !this.$$?.editMode) return;
        if (typeof action === 'string') {
            if (this.bl[action])
                this.bl[action]();
        } else
            action.call(this.bl);
        this.$update();
    }
});

customElements.define('li-layout-scheme-connector', class LiLayoutSchemeConnector extends LiElement {
    static get properties() {
        return {
            editMode: { type: Boolean, default: true }, _gridMain: { type: Object, default: {}, local: true },
            item: { type: Object, default: {} },
            bl: { type: Object, default: {} },
            defaultSize: { type: Number, default: 18 },
            position: { type: String, default: '' },
            dragover: { type: Boolean, default: false }
        }
    }

    get draggable() { return (this.item?._disabled || this.item?.disableDrag || !this.editMode) ? 'false' : 'true' }
    get disabled() {
        if (this.$$?.line?.connector === this) return false;
        return this.item?.disabled || this.item?._disabled || this.$$?.line?.bl === this.bl
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
        this.$update();
    }
    _dragstart(e) {
        let bs = this.$$;
        bs.line.connector = this;
        bs.line.bl = this.bl;
        bs.line.item = this;
        bs.line.x1 = bs.line.x2 = e.x - this._gridMain.offsetLeft + this._gridMain.scrollLeft;
        bs.line.y1 = bs.line.y2 = e.y - this._gridMain.offsetTop + this._gridMain.scrollTop;
        bs.line.show = true;
        this.bl.setConnectors('dragStart');
        this.$update();
    }
    _drag(e) {
        let bs = this.$$;
        if (bs.line.show && e.x !== 0) {
            bs.line.x2 = e.x - this._gridMain.offsetLeft + this._gridMain.scrollLeft;
            bs.line.y2 = e.y - this._gridMain.offsetTop + this._gridMain.scrollTop;
            this.$update();
        }
    }
    _dragover(e) {
        if (this.$$.line.show && this.draggable && !this.item._disabled && !this.item.disableDrag && this.$$?.line?.bl !== this.bl) {
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
        const l = this.$$.line.item;
        this.item.link = { id: l.bl.id, position: l.position, idc: l.item.id };
        this._clearDrag();
    }
    _clearDrag() {
        let bs = this.$$;
        bs.line.x1 = bs.line.x2;
        bs.line.y1 = bs.line.y2;
        bs.line.bl = bs.line.connector = undefined;
        bs.line.show = false;
        this.dragover = false;
        this.bl.setConnectors();
        this.$update();
    }
});