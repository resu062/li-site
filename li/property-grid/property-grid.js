import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-property-grid', class LiPropertyGrid extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            io: { type: Object, default: undefined },
            ioProperties: { type: Object, default: {} },
            expertMode: { type: Boolean, default: false, local: true },
            group: { type: Boolean, default: false, local: true },
            item: { type: Object, default: undefined },
            iconSize: { type: String, default: '28', local: true },
            sort: { type: String, default: 'none', local: true },
            labelColumn: { type: Number, default: 250, local: true },
            focused: { type: Object, default: undefined, local: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.io = this.$id.btn;
        this.getData();
    }

    get args() { return { expert: this.expertMode, group: this.group, sort: this.sort } };

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
            }
            .header {
                position: sticky;
                top: 0px;
                display: flex;
                background-color: gray;
                z-index: 1;
            }
            .label {
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: center;
                font-size: large;
                color: white;
            }
            .buttons {
                display: flex;
                padding: 2px;
            }
            .container {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                /* border:1px solid red; */
            }            
            .group-header {
                position: sticky;
                top: 0px;
                display: flex;
                align-items: center;
                background-color: #f0f0f0;
                border-bottom:1px solid gray;
                min-height: 28px;
                padding-left: 16px;
                z-index: 1;
            }
        `;
    }

    render() {
        return html`
            <div class="header">
                <div class="label">${this.item?.label || 'PropertyGrid'}</div>
                <div class="buttons" >
                    <li-button class="btn" name="radio-button-checked" title="view focused" @click="${(e) => this._showFocused()}"></li-button>
                    <li-button class="btn" name="refresh" title="refresh" @click="${(e) => this._expert()}"></li-button>
                    <li-button class="btn" name="sort" title="sort" @click="${(e) => this._sort()}"></li-button>
                    <li-button class="btn" id="btn" toggledClass="ontoggled" name="list" title="group" @click="${(e) => this._expert(e)}"></li-button>
                    <li-button class="btn" toggledClass="ontoggled" name="settings" title="expertMode" @click="${(e) => this._expert(e)}"></li-button>
                </div>
            </div>
            <div class="container">
                ${Object.keys(this._item || {}).map(key => html`
                    <div class="group">
                        <div class="group-header">${key}</div>
                        <li-property-tree class="tree" .item="${this._item[key]}" .$$id="${this.$$id}" .args="${this.args}"></li-property-tree>
                    </div>
                `)}
            </div>
        `
    }

    getData(io = this.io, _io) {
        if (!_io)
            this._io = makeData(io, this.args);
        const obj = {};
        this.ioLength = 0;
        this._io.items.map(i => {
            let cat = i.category || 'no category';
            obj[cat] = obj[cat] || [];
            obj[cat].push(i);
        })
        this._item = obj;
        this.$$update();
    }
    _scroll(e) {
        // if (!this.$refs?.splitter) return
        // this._top = (e.target.scrollTop - 2) + 'px';
        // requestAnimationFrame(() => {
        //     this.$refs.splitter.style.top = this._top;
        //     this.$refs.splitter2.style.top = this._top;
        // })
    }
    _expert(e) {
        this.expertMode = !this.expertMode;
        const _io = this.isShowFocused ? this._io : undefined;
        this.getData(this.io, _io);
    }
    _sort(e) {
        this.sort = this.sort === 'none' ? 'ascending' : this.sort === 'ascending' ? 'descending' : 'none';
        const io = this.isShowFocused ? this.focused.el || this.focused : this.io;
        this.getData(io);
    }
    _group(e) {
        this.group = !this.group;
        this.getData();
    }
    _showFocused(e) {
        if (this.focused) {
            this.isShowFocused = !this.isShowFocused;
            //const io = this.isShowFocused ? this.focused.el || this.focused : this.io;
            this.getData(this.focused.el);
        }
    }
})

customElements.define('li-property-tree', class LiPropertyTree extends LiElement {
    static get properties() {
        return {
            $$id: { type: String, default: '', update: true },
            expertMode: { type: Boolean, default: false, local: true },
            item: { type: Object, default: undefined },
            props: { type: Object, default: {} },
            iconSize: { type: String, default: '28', local: true },
            labelColumn: { type: Number, default: 250, local: true },
            focused: { type: Object, default: undefined, local: true },
            args: { type: Object }
        }
    }

    get _items() {
        return this.item && this.item.map ? this.item : this.item && this.item.items && this.item.items.map ? this.item.items : [];
    }

    static get styles() {
        return css`
            .complex {
                background-color: hsla(90, 50%, 50%, .075);
                box-shadow: inset 0 -2px 0 0 gray;
                overflow: hidden;
            }
            .row:hover {
                background-color: lightyellow;
                /* box-shadow: inset 0 -2px 0 0 black; */
                cursor: pointer;
            }
            .focused {
                /* background-color: lightblue; */
                box-shadow: inset 0 -1px 0 0 blue;
            }
            #input {
                font-size: 1em;
                color: gray;
                font-family: Arial;
                text-align: left;
                outline: none; 
                background: transparent; 
                border: none;
                flex: 1;
                min-width: 0px;
            }
            .label {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                display: flex;
                padding:0 2px;
                align-items: center;
            }
        `;
    }

    render() {
        return html`
            ${this._items.map(i => html`
                <div class="row ${this.$$ && this.$$.selection && this.$$.selection.includes(i) ? 'selected' : ''} ${this.focused === i ? 'focused' : ''}" style="border-bottom: .5px solid lightgray" @click="${(e) => this._focus(e, i)}">
                    <div style="display:flex;align-items:center;${'border-bottom: 1px solid ' + this.colorBorder}">
                        ${i.items?.length || i.is
                ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}"
                                    @click="${(e) => this._expanded(e, i)}" size="${this.iconSize - 2}"></li-button>`
                : html`<div style="min-width:${this.iconSize}px;width:${this.iconSize}px;min-height:${this.iconSize}px;height:${this.iconSize}px"></div>`}
                        <div class="label" style="max-width:${this.labelColumn}px;min-width:${this.labelColumn}px;height:${this.iconSize}px;">${i.label || i.name}</div>
                        <input id="input" value="${i.value}" style="display:flex;padding:0 2px;white-space: nowrap;border-left:1px solid lightgray;height:${this.iconSize}px;align-items: center;" @change="${(e) => this._change(e, i)}">
                    </div>
                </div>
                <div class="complex">
                    ${(i.el || i.items.length) && i.expanded ? html`<li-property-tree .item="${i.data}" .$$id="${this.$$id}" .args="${this.args}"></li-property-tree>` : html``}
                </div>
            `)}
        `
    }
    _expanded(e, i) {
        i.expanded = e.target.toggled;
        if (i.expanded)
            i.data = makeData(i.el, this.args);
        else
            i.data = [];
        this.$$update();
    }
    _focus(e, i) {
        this.focused = i;
    }
    _change(e, i) {
        if (i && i.label in i.obj)
            i.obj[i.label] = e.target.value;
    }
})

function makeData(el, { expert, group, sort }) {
    const editors = {
        'boolean': 'checkbox',
        'number': 'number',
        'string': 'text'
    }
    let obj = el;
    const exts = /^(_|\$)/;
    const label = el?.constructor?.name || el?.localName || '';
    const data = { label, items: [] };
    const props = el.constructor._classProperties;

    function fn(key, category = 'no category', props) {
        //if (!group) category = '...';
        let value = el[key], is, type;
        const _docs = undefined;
        if (el[key] && el[key]._docs) _docs = el[key]._docs;
        const item = { label: key, value, el: el[key], items: [], category, obj, _docs };
        if (value && Array.isArray(value)) {
            Object.defineProperty(item, 'value', { get() { return 'Array [' + (this?.obj && this.obj[this.label] ? this.obj[this.label].length : '') + ']'; } });
            is = 'array';
            type = 'text';
        } else if (value !== null && typeof value === 'object') {
            Object.defineProperty(item, 'value', { get() { return '[Object]'; } });
            is = 'object';
            type = 'text';
        } else {
            type = props && props[key] && props[key].type ? props[key].type.name.toLowerCase() : undefined;
            if (!type)
                type = typeof el[key];
            if (editors[type])
                type = editors[type];
            item.type = type || 'text';
            Object.defineProperty(item, 'value', {
                get() { try { return this.obj[this.label] } catch (err) { return value } },
                set(v) { this.obj[this.label] = v; }
            });
        }
        if (props && props[key] && props[key].list) item.list = props[key].list;
        item.is = is;
        data.items.push(item);
    }

    if (props) {
        for (const key of props.keys()) {
            if (!expert && exts.test(key)) continue;
            fn(key, 'properties');
        }
    }

    while (obj) {
        let names = Object.getOwnPropertyNames(obj);
        for (let key of names) {
            if (!expert && exts.test(key)) continue;
            if (/^(__|props|properties|\$props)/.test(key)) continue;
            const d = Object.getOwnPropertyDescriptor(obj, key);
            if (!d || typeof d.value === 'function') continue;
            fn(key, obj.constructor.name);
        }
        if (!expert) break;
        obj = obj.__proto__;
    }
    if (sort === 'ascending' || sort === 'descending') {
        data.items.sort((a, b) => {
            if (a.label > b.label) return sort === 'ascending' ? 1 : -1;
            if (b.label > a.label) return sort === 'ascending' ? -1 : 1;
        });
    }
    return data;
}