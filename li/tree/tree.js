import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-tree', class LiTree extends LiElement {
    static get properties() {
        return {
            $$id: { type: String, update: true },
            item: { type: Object, default: {} },
            iconSize: { type: String, default: '28' },
            margin: { type: String, default: '0' },
            fullBorder: { type: Boolean, default: false },
            colorBorder: { type: String, default: 'lightgray' },
            verticalLine: { type: Boolean, default: true },
            allowCheck: { type: Boolean, default: true }
        }
    }

    get items() {
        return this.item && this.item.map ? this.item : this.item && this.item.items && this.item.items.map ? this.item.items : [];
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
        `;
    }

    render() {
        return html`
            ${this.items.map(i => html`
                <div style="${this.fullBorder ? 'border-bottom: .5px solid ' + this.colorBorder : ''}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}">
                        ${i.items && i.items.length
                            ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" .toggled="${i.expanded}"
                                            @click="${(e) => this._click(e, i)}" size="${this.iconSize-2}"></li-button>`
                            : html`<div style="min-width:${this.iconSize}px;width:${this.iconSize}px;min-height:${this.iconSize}px;height:${this.iconSize}px"></div>`
                        }
                        ${this.allowCheck ? html`<li-checkbox></li-checkbox>` : html``}
                        <div style="padding:2px">${i.label || i.name}</div>
                        <div></div>
                    </div>
                </div>
                <div class="complex ${this.verticalLine ? 'complex-line' : ''}">
                    ${i.items && i.items.length && i.expanded ? html`<li-tree .item="${i.items}" margin="${Number(this.margin)}" .$$id="${this.$$id}" .allowCheck="${this.allowCheck}"></li-tree>` : ''}
                </div>
            `)}
        `
    }
    _click(e, i) {
        i.expanded = e.target.toggled;
        this.$$update();
    }
});