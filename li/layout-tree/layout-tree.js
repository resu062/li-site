import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-layout-tree', class LiLayoutTree extends LiElement {
    static get properties() {
        return {
            id: { type: String, default: '' },
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
            selected: { type: Object, default: {} },
            fontSize: { type: String, default: 'medium' },
            allowEdit: { type: Boolean, default: false }
        }
    }

    get items() {
        return this.item && this.item.map ? this.item : this.item && this.item.items && this.item.items.map ? this.item.items : undefined;
    }
    get _ed() {
        return this.allowEdit && this._allowEdit;
    }
    set _ed(v) {
        this._allowEdit = v;
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
            [contentEditable] {
                outline: 0px solid transparent
            }
        `;
    }

    render() {
        return html`
            ${!this.items ? html`` : this.items.map(i => html`
                <div class="row ${this.selected === i || this.selected?.ulid === i.ulid ? 'selected' : ''}" style="${this.fullBorder ? 'border-bottom: .5px solid ' + this.colorBorder : ''}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}">
                        ${i.items && i.items.length ? html`
                            <li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" ?toggled="${i.expanded}"
                                    @click="${(e) => this._click(e, i)}" size="${this.iconSize}"></li-button>
                        ` : html`
                            <div style="min-width:${this.iconSize + 2}px;width:${this.iconSize + 2}px;min-height:${this.iconSize + 2}px;height:${this.iconSize + 2}px"></div>
                        `}
                        ${this.allowCheck ? html`
                            <li-checkbox .size="${this.iconSize}" .item="${i}" @click="${(e) => this._checkChildren(e, i)}" @blur="${() => this._ed = false}"></li-checkbox>
                        ` : html``}
                        ${this._ed && (this.selected === i || this.selected?.ulid === i.ulid)  && !i._deleted ? html`
                            <input value="${i.label}" @change="${(e) => this._setLabel(e, i)}" style="color: gray; flex:1;padding:1px;width:${this.labelWidth}px;font-size:${this.fontSize};border: none;margin:1px;outline: none;"/>
                        ` : html`
                            <div style="flex:1;padding:2px;width:${this.labelWidth}px;font-size:${this.fontSize}; text-decoration:${i._deleted ? 'line-through solid red !important' : ''}"
                                @dblclick="${() => this._ed = true}" @click="${(e) => this._focus(e, i)}">${i.label}</div>
                        `}
                    </div>
                </div>
                <div class="complex ${this.complex} ${this.complexExt}">
                    ${i.items && i.items.length && i.expanded ? html`
                        <li-layout-tree .item="${i.items}" .margin="${this.margin}" .id="${this.id}" ?allowEdit="${this.allowEdit}" ?allowCheck="${this.allowCheck}" .iconSize="${this.iconSize}" .selected="${this.selected}"></li-layout-tree>
                    ` : html``}
                </div>
            `)}
        `
    }
    _setLabel(e, i) {
        if (this._ed) {
            this.selected.label = e.target.value;
            this._ed = false;
            this.fire('setlabel', e.target.value);
            //this.fire('changed', { type: 'setlabel', value: e.target.value, item: i  });
            this.$update();
        }
    }
    _checkChildren(e, i) {
        if (!this.noCheckChildren) LID.arrSetItems(i, 'checked', e.target.toggled);
        //this.fire('changed', { type: 'checked', value: e.target.toggled, item: i });
        this.$update();
    }
    _click(e, i) {
        i.expanded = e.target.toggled;
        //this.fire('changed', { type: 'expanded', value: e.target.toggled, item: i });
        this.$update();
    }
    _focus(e, i) {
        this.selected = i;
        this.fire('selected', i);
        this.$update();
    }
});
