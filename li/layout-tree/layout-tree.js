import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-layout-tree', class LiLayoutTree extends LiElement {
    static get properties() {
        return {
            ulid: { type: String, default: '' },
            item: { type: Object, default: {} },
            iconSize: { type: Number, default: 28 },
            margin: { type: Number, default: 0 },
            fullBorder: { type: Boolean, default: false },
            colorBorder: { type: String, default: 'lightgray' },
            labelWidth: { type: Number, default: 128 },
            complex: { type: String, default: 'tree' },
            complexExt: { type: String, default: 'tree-line' },
            view: { type: String, default: '' },
            allowCheck: { type: Boolean, default: false },
            noCheckChildren: { type: Boolean, default: false },
            selected: { type: Object, default: {}, local: true },
            fontSize: { type: String, default: 'medium' },
        }
    }

    get items() {
        return this.item && this.item.map ? this.item : this.item && this.item.items && this.item.items.map ? this.item.items : [];
    }

    static get styles() {
        return css`
            .complex {
                overflow: hidden;
            }
            .tree {
                margin-left: 14px;
            }
            .tree-line {
                border-left: 1px dashed lightgray;
            }
            .row:not(.selected):hover {
                box-shadow: inset 0 -2px 0 0 black;
                cursor: pointer;
            }
            .selected {
                background-color: lightyellow;
                box-shadow: inset 0 -2px 0 0 blue;
            }
        `;
    }

    render() {
        return html`
            ${this.items.map(i => html`
                <div class="row ${this.selected === i ? 'selected' : ''}" style="${this.fullBorder ? 'border-bottom: .5px solid ' + this.colorBorder : ''}" @click="${(e) => this._focus(e, i)}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}">
                        ${i.items && i.items.length
                ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" ?toggled="${i.expanded}"
                                @click="${(e) => this._click(e, i)}" size="${this.iconSize}"></li-button>`
                : html`<div style="min-width:${this.iconSize + 2}px;width:${this.iconSize + 2}px;min-height:${this.iconSize + 2}px;height:${this.iconSize + 2}px"></div>`
            }
                        ${this.allowCheck ? html`<li-checkbox .size="${this.iconSize}" .item="${i}" @click="${(e) => this._checkChildren(e, i)}"></li-checkbox>` : html``}
                        <div style="padding:2px;width:${this.labelWidth}px;font-size:${this.fontSize};">${i.label || i.name}</div>
                        <div style="flex:1"></div>
                    </div>
                </div>
                <div class="complex ${this.complex} ${this.complexExt}">
                    ${i.items && i.items.length && i.expanded ? html`<li-layout-tree .item="${i.items}" .margin="${this.margin}" .ulid="${this.ulid}" .allowCheck ="${this.allowCheck}" .iconSize="${this.iconSize}"></li-layout-tree>` : ''}
                </div>
            `)}
        `
    }
    _checkChildren(e, i) {
        if (!this.noCheckChildren) LI.setArrRecursive(i, 'checked', e.target.toggled);
        this._focus(e, i);
    }
    _click(e, i) {
        i.expanded = e.target.toggled;
        this.$update();
    }
    _focus(e, i) {
        this.selected = i;
        this.$update();
        this.fire('selected', i);
    }
});
