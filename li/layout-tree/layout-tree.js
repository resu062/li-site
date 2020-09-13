import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

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
        }
    }

    constructor() {
        super();
        this.__requestUpdate = this._requestUpdate.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        LI.listen(document, 'updateTree', this.__requestUpdate);
    }
    disconnectedCallback() {
        LI.unlisten(document, 'updateTree', this.__requestUpdate);
        super.disconnectedCallback();
    }

    _requestUpdate(e) {
        if (e.detail && e.detail.ulid === this.ulid) this.requestUpdate();
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
        `;
    }

    render() {
        if (!this.item || (this.item.items && !this.item.items.map) || !this.item.map) return html``;
        return html`
            ${((this.item && this.item.items) || this.item).map(i => html`
                <div style="${this.fullBorder ? 'border-bottom: .5px solid ' + this.colorBorder : ''}">
                    <div style="display:flex;align-items:center;margin-left:${this.margin}px;${!this.fullBorder ? 'border-bottom: 1px solid ' + this.colorBorder : ''}">
                        ${i.items && i.items.length
                            ? html`<li-button back="transparent" name="chevron-right" border="0" toggledClass="right90" ?toggled="${i.$expanded}"
                                @click="${(e) => this._click(e, i)}" size="${this.iconSize}"></li-button>`
                            : html`<div style="min-width:${this.iconSize+2}px;width:${this.iconSize+2}px;min-height:${this.iconSize+2}px;height:${this.iconSize+2}px"></div>`
                        }
                        <div style="padding:2px;width:${this.labelWidth}px;">${i.label || i.name}</div>
                        <div style="flex:1"></div>
                    </div>
                </div>
                <div class="complex ${this.complex} ${this.complexExt}">
                    ${i.items && i.items.length && i.$expanded ? html`<li-layout-tree .item="${i.items}" margin="${this.margin}" ulid="${this.ulid}"></li-layout-tree>` : ''}
                </div>
            `)}
        `
    }
    _click(e, i) {
        i.$expanded = e.target.toggled;
        this.requestUpdate();
    }
});