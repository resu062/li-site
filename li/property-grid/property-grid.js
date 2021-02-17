import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-property-grid', class LiPropertyGrid extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            inspectedObject: { type: Object, default: undefined },
            ioProperties: { type: Object, default: {} },
            expertMode: { type: Boolean, default: false, local: true },
            item: { type: Object, default: undefined },
            iconSize: { type: String, default: '28', local: true },
            sort: { type: String, default: 'none', local: true },
            labelColumn: { type: Number, default: 250, local: true },
            focused: { type: Object, default: undefined, local: true },
            testOBJ: {
                type: Object, default: {
                    obj1: { name: 'test Object1', arr: [{ prop1: 1 }, { prop2: 2 }, { prop3: 3, arr: [{ prop1: 1 }, { prop2: 2 }, { prop3: 3, arr: [{ prop1: 1 }, { prop2: 2 }, { prop3: 3 }] }] }], description: 'note...' },
                    obj2: { name: 'test Object2', arr: [{ prop1: 1 }, { prop2: 2 }, { prop3: 3, arr: [{ prop1: 1 }, { prop2: 2 }, { prop3: 3, arr: [{ prop1: 1 }, { prop2: 2 }, { prop3: 3 }] }] }], description: 'note...' }
                },
            }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.getData();
    }

    getData() {
        this.inspectedObject = this;
        this.item = makeData(this.inspectedObject, this.expertMode);
        const obj = {};
        this.item.items.map(i => {
            let cat = i.category || 'no category';
            obj[cat] = obj[cat] || [];
            obj[cat].push(i);
        })
        this._item = obj;
    }

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
                    <li-button id="btn" name="radio-button-checked" title="view focused" @click="${(e) => this._focused()}"></li-button>
                    <li-button id="btn" name="refresh" title="refresh" @click="${(e) => this._expert()}"></li-button>
                    <li-button id="btn" name="sort" title="sort" @click="${(e) => this._sort()}"></li-button>
                    <li-button id="btn" toggledClass="ontoggled" name="list" title="group"></li-button>
                    <li-button id="btn" toggledClass="ontoggled" name="settings" title="expertMode" @click="${(e) => this._expert(e)}"></li-button>
                </div>
            </div>
            <div class="container">
                ${Object.keys(this._item || {}).map(key => html`
                    <div class="group">
                        <div class="group-header">${key}</div>
                        <li-property-tree class="tree" .item="${this._item[key]}" .$$id="${this.$$id}"></li-property-tree>
                    </div>
                `)}
            </div>
        `
    }
    _expert(e) {
        this.expertMode = e?.target?.toggled || e ? e?.target?.toggled : this.expertMode;
        this.getData();
        //this.$$update();
    }
    _sort(e) {
        this.sort = this.sort === 'none' ? 'ascending' : this.sort === 'ascending' ? 'descending' : 'none';
        this.getData();
        //this.$$update();
    }
    _focused(e) {
        if (this.focused) {
            this.item = makeData(this.focused.el, this.expertMode);
            const obj = {};
            this.item.items.map(i => {
                let cat = i.category || 'no category';
                obj[cat] = obj[cat] || [];
                obj[cat].push(i);
            })
            this._item = obj;
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
            focused: { type: Object, default: undefined, local: true }
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
                <div class="row ${this.$$ && this.$$.selection && this.$$.selection.includes(i) ? 'selected' : ''} ${this.focused===i?'focused':''}" style="border-bottom: .5px solid lightgray" @click="${(e) => this._focus(e, i)}">
                    <div style="display:flex;align-items:center;${'border-bottom: 1px solid ' + this.colorBorder}">
                        ${i.items?.length || i.is
                ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}"
                                    @click="${(e) => this._expanded(e, i)}" size="${this.iconSize - 2}"></li-button>`
                : html`<div style="min-width:${this.iconSize}px;width:${this.iconSize}px;min-height:${this.iconSize}px;height:${this.iconSize}px"></div>`}
                        <div class="label" style="max-width:${this.labelColumn}px;min-width:${this.labelColumn}px;height:${this.iconSize}px;">${i.label || i.name}</div>
                        <input id="input" value="${i.value}" style="display:flex;padding:0 2px;white-space: nowrap;border-left:1px solid lightgray;height:${this.iconSize}px;align-items: center;">
                    </div>
                </div>
                <div class="complex">
                    ${(i.el || i.items.length) && i.expanded ? html`<li-property-tree .item="${i.data}" .$$id="${this.$$id}"></li-property-tree>` : html``}
                </div>
            `)}
        `
    }
    _expanded(e, i) {
        i.expanded = e.target.toggled;
        if (i.expanded)
            i.data = makeData(i.el, this.expertMode);
        else
            i.data = [];
        this.$$update();
    }
    _focus(e, i) {
        this.focused = i;
    }
})

function makeData(el, expert) {
    const fn = (key, category = 'no category') => {
        let value = el[key],
            is = false
        if (value && Array.isArray(value)) {
            value = 'Array [' + value.length + ']';
            is = true;
        }
        else if (value !== null && typeof value === 'object') {
            value = '[Object]';
            is = true;
        }
        data.items.push({ label: key, value, is, el: el[key], items: [], category });
    }

    const exts = /^(_|\$)/;
    const data = { label: el?.localName, items: [] };
    const props = el.constructor._classProperties;

    if (props) {
        for (const key of props.keys()) {
            if (!expert && exts.test(key)) continue;
            fn(key, 'properties');
        }
    }

    let obj = el;
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

    return data;
}