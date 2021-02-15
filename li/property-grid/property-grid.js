import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import { LItem, ldfn } from './li-data.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-property-grid', class LiPropertyGrid extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            _inspectedObject: { type: Object, default: undefined },
            expertMode: { type: Boolean, default: false, local: true },
            litem: { type: Object, default: undefined },
            props: { type: Object, default: {} },
            iconSize: { type: String, default: '28', local: true },
            labelColumn: { type: Number, default: 250, local: true }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.getData();
    }

    getData() {
        if (!this.litem) {
            this._inspectedObject = this.$id.btn;
            const data = makeData(this);
            this.litem = new LItem(data, this.props, undefined, undefined, this.$$id);
            this.litem.$root = this.litem;
        }
    }

    render() {
        return html`
            <div style="border:1px solid gray;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;height:100%">
                <div style="font-size:large;color:gray;z-index:1;min-height:32px;position:sticky;top:0px;display:flex;align-items:center;justify-content: center;width:100%;border-bottom:1px solid gray;height:32px;background:lightgray">${this.litem?.label || 'PropertyGrid'}</div>
                <li-button id="btn" toggledClass="ontoggled" name="settings" title="expertMode" style="z-index:1;position:absolute;right:2px;top:3px" @click="${(e) => this._expert(e)}" ></li-button>
                <li-property-tree .litem="${this.litem}" .$$id="${this.$$id}"></li-property-tree>
            </div>
        `
    }
    _expert(e) {
        this.litem = undefined;
        this.expertMode = e.target.toggled;
        this.getData();
        this.$$update();
    }
});

const exts = /^(_|\$)/;
function makeData(el) {
    const expert = el.expertMode;
    const data = { label: el._inspectedObject?.localName, items: [] };
    const props = el._inspectedObject.constructor._classProperties;
    for (const key of props.keys()) {
        if (!expert && exts.test(key)) continue;
        let value = el._inspectedObject[key];
        if (value != null && value.constructor.name === "Object") value = '[Object Object]';
        data.items.push({ label: key, value, items: [] });
    }
    return data;
}

customElements.define('li-property-tree', class LiPropertyTree extends LiElement {
    static get properties() {
        return {
            $$id: { type: String, default: '', update: true },
            expertMode: { type: Boolean, default: false, local: true },
            litem: { type: Object, default: undefined },
            props: { type: Object, default: {} },
            iconSize: { type: String, default: '28', local: true },
            labelColumn: { type: Number, default: 250, local: true }
        }
    }

    get _items() {
        return this.litem && this.litem.map ? this.litem : this.litem && this.litem.items && this.litem.items.map ? this.litem.items : [];
    }

    static get styles() {
        return css`
            .complex {
                background-color: hsla(0, 0%, 90%, .5);
                box-shadow: inset 0 -2px 0 0 gray;
                overflow: hidden;
            }
            .row:hover {
                background-color: lightyellow;
                /* box-shadow: inset 0 -2px 0 0 black; */
                cursor: pointer;
            }
            .selected {
                background-color: lightyellow;
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
        `;
    }

    render() {
        return html`
            ${this._items.map(i => html`
                <div class="row ${this.$$ && this.$$.selection && this.$$.selection.includes(i) ? 'selected' : ''}" style="border-bottom: .5px solid lightgray" @click="${(e) => this._focus(e, i)}">
                    <div style="display:flex;align-items:center;${'border-bottom: 1px solid ' + this.colorBorder}">
                        ${i.items && i.items.length
                ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}"
                                    @click="${(e) => this._expanded(e, i)}" size="${this.iconSize - 2}"></li-button>`
                : html`<div style="min-width:${this.iconSize}px;width:${this.iconSize}px;min-height:${this.iconSize}px;height:${this.iconSize}px"></div>`}
                        ${this.allowCheck ? html`<li-checkbox .toggled="${i.checked}" @click="${(e) => this._checked(e, i)}"></li-checkbox>` : html``}
                        <div style="overflow:hidden;display:flex;padding:0 2px;max-width:${this.labelColumn}px;min-width:${this.labelColumn}px;white-space: nowrap;height:${this.iconSize}px;align-items: center;">${i.label || i.name}</div>
                        <input id="input" value="${i.value}" style="display:flex;padding:0 2px;white-space: nowrap;border-left:1px solid lightgray;height:${this.iconSize}px;align-items: center;">
                    </div>
                </div>
                <div class="complex">
                    ${i.items && i.items.length && i.expanded ? html`<li-property-tree .litem="${i.items}" .$$id="${this.$$id}"></li-property-tree>` : html``}
                </div>
            `)}
        `
    }
    _expanded(e, i) {
        i.expanded = e.target.toggled;
        this.$$update();
    }
    _checked(e, i) {
        i.checked = e.target.toggled;
        this.$$update();
    }
    _focus(e, item) {
        ldfn.focus(e, item, item);
        this.$$update();
    }
});
