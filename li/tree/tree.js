import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import { LItem, ldfn } from '../../lib/li-utils/li-data.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-tree', class LiTree extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            item: { type: Object, default: undefined },
            litem: { type: Object, default: undefined },
            props: { type: Object, default: {} },
            iconSize: { type: String, default: '28', local: true },
            margin: { type: String, default: '0', local: true },
            fullBorder: { type: Boolean, default: false, local: true },
            colorBorder: { type: String, default: 'lightgray', local: true },
            verticalLine: { type: Boolean, default: true, local: true },
            allowCheck: { type: Boolean, default: true, local: true }
        }
    }

    updated(changedProps) {
        super.update(changedProps);
        if (changedProps.has('item') && this.item) {
            this.litem = new LItem(this.item, this.props, undefined, undefined, this.$$id);
            this.litem.$root = this.litem;
        }
    }

    get _items() {
        return this.litem && this.litem.map ? this.litem : this.litem && this.litem.items && this.litem.items.map ? this.litem.items : [];
    }

    static get styles() {
        return css`
            .complex-line {
                border-left: 1px dashed lightgray;
            }
            .complex {
                margin-left: 14px;
                overflow: hidden;
            }
            .row:hover {
                box-shadow: inset 0 -2px 0 0 black;
                cursor: pointer;
            }
            .selected {
                background-color: lightyellow;
            }
        `;
    }

    render() {
        return html`
            ${this._items.map(i => html`
                <div class="row ${this.$$ && this.$$.selection && this.$$.selection.includes(i) ? 'selected' : ''}" style="${this.fullBorder ? 'border-bottom: .5px solid ' + this.colorBorder : ''}" @click="${(e) => this._focus(e, i)}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}">
                        ${i.items && i.items.length
                            ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}"
                                                @click="${(e) => this._expanded(e, i)}" size="${this.iconSize - 2}"></li-button>`
                            : html`<div style="min-width:${this.iconSize}px;width:${this.iconSize}px;min-height:${this.iconSize}px;height:${this.iconSize}px"></div>`
                        }
                        ${this.allowCheck ? html`<li-checkbox .toggled="${i.checked}" @click="${(e) => this._checked(e, i)}"></li-checkbox>` : html``}
                        <div style="padding:2px">${i.label || i.name}</div>
                        <div></div>
                    </div>
                </div>
                <div class="complex ${this.verticalLine ? 'complex-line' : ''}">
                    ${i.items && i.items.length && i.expanded ? html`<li-tree .litem="${i.items}" .$$id="${this.$$id}"></li-tree>` : html``}
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