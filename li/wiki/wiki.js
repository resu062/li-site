import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';

customElements.define('li-wiki', class LiWiki extends LiElement {
    static get properties() {
        return {
            data: {
                type: Array,
                default: [
                    { label: '000', order: 0 },
                    { label: '001', order: 0 },
                    { label: '002', order: 0 },
                    { label: '003', order: 0 },
                    { label: '004', order: 0 },
                ]
            },
            focused: { type: Object, local: true }
        }
    }

    get _data() {
        if (!this.data) return [];
        let data = this.data.sort((a, b) => {
            if (a.order > b.order) return 1;
            if (a.order < b.order) return -1;
            return 0;
        }).map((i, idx) => {
            i.order = idx;
            return i;
        })
        this.data = data;
        return this.data
    }

    static get styles() {
        return css`
            .header {
                font-weight: 700;
            }
            .panel {
                padding:4px;
            }
            .main {
                display: flex;
                height: 100%;
            }
            .main-panel {
                margin: 4px;
                flex: 1;
                border: 1px solid lightgray;
            }
            .main-left {
                display: flex;
                flex-direction: column;
                padding: 4px;
            }
            .res {
                padding: 4px;
            }
            [draggable] {
                user-select: none;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app>
                <div slot="app-top" class="header">
                    li-wiki
                </div>
                <div slot="app-left" class="panel">
                    left-panel
                </div>
                <div slot="app-right" class="panel">
                    right-panel
                </div>
                <div slot="app-main" class="main">
                    <div class="main-panel main-left">
                        Editors:
                        ${(this._data || []).map(i => html`
                            <li-wiki-box .item="${i}" style="order:${i.order}" ?hidden=${this.focused?.item.label === i.label}></li-wiki-box>
                        `)}
                    </div>
                    <div class="main-panel">
                        Result:
                        ${(this._data || []).map(i => html`
                            <div class="res" .item="${i}" style="order:${i.order}">${i.label}</div>
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }

});

customElements.define('li-wiki-box', class LiWikiBox extends LiElement {
    static get properties() {
        return {
            item: { type: Object },
            focused: { type: Object, local: true },
            shadow: { type: Number, default: 0 },
            lastOver: { type: Object, local: true },
        }
    }

    static get styles() {
        return css`
            :host {
                width: 100%;
            }
            .box {
                border: 1px solid #666;
                background-color: #ddd;
                padding: 10px;
                cursor: move;
                margin: 2px;
                height: 20px;
                overflow: hidden;
            }
            [draggable] {
                user-select: none;
            }
            .top {
                box-shadow: inset 0 3px 0 0 blue;
            }
            .bottom {
                box-shadow: inset 0 -3px 0 0 blue;
            }
        `;
    }

    render() {
        return html`
            <div draggable="true" class="box ${this.shadow < 0 ? 'top' : this.shadow > 0 ? 'bottom' : 'no'}"
                    @dragstart="${this.handleDragStart}" 
                    @dragend="${this.handleDragEnd}" 
                    @dragover="${this.handleDragOver}"
                    @dragleave="${this.handleDragLeave}">
                ${this.item.label}
            </div>
        `;
    }

    handleDragStart(e) {
        this.focused = this;
    }
    handleDragEnd(e) {
        if (this.$$.lastOver) {
            this.item.order = this.$$.lastOver.item.order + this.$$.lastOver.shadow / 2;
            this.$$.lastOver.shadow = 0;
        }
        this.focused = null;
    }
    handleDragOver(e) {
        e.preventDefault();
        LI.throttle('dragover', () => {
            this.shadow = 0;
            let h = e.target.clientHeight;
            if (e.offsetY < h / 2) this.shadow = -1;
            else if (e.offsetY > h / 2) this.shadow = 1;
            this.lastOver = this;
        }, 100, true)
    }
    handleDragLeave(e) {
        this.shadow = 0;
        this.lastOver = null;
    }
});
