import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../editor-html/editor-html.js';

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
            focused: { type: Object, local: true },
            _indx: { type: Number, default: -1 },
            _move: { type: Boolean },
            _widthL: { type: Number, default: 800 }
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
                border: 1px solid lightgray;
                overflow: auto;
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
            .splitter {
                max-width: 4px;
                min-width: 4px;
                cursor: col-resize;
                z-index: 9;
            }
            .temp {
                position: fixed;
                top: 0; left: 0; bottom: 0; right: 0;
            }
        `;
    }

    render() {
        return html`
            <div class="temp" @mousemove="${this._mousemove}" @mouseup="${this._up}" @mouseout="${this._up}" style="z-index: ${this._indx}"></div>
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
                    <div class="main-panel main-left" style="width:${this._widthL}px">
                        Editors:
                        ${(this._data || []).map(i => html`
                            ${this.focused?.item.label === i.label ? html`
                                <li-wiki-box-shadow style="order:${i.order * 10}"></li-wiki-box-shadow>
                            ` : html`
                                <li-wiki-box .item="${i}" style="order:${i.order * 10}"></li-wiki-box>
                            `}`)}
                    </div>
                    <div class="splitter" @mousedown="${this._movePanel}"></div>
                    <div class="main-panel" style="flex: 1;">
                        Result:
                        ${(this._data || []).map(i => html`
                            <div class="res" .item="${i}" style="order:${i.order * 10}" .innerHTML="${i.value || ''}"></div>
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }

    _movePanel(val = true) {
        this._move = val;
        this._indx = 999;
    }
    _mousemove(e) {
        if (!this._move) return;
        e.preventDefault();
        this._widthL = this._widthL + e.movementX;
        console.log(this._widthL, e.movementX);
    }
    _up(e) {
        e.preventDefault();
        this._indx = -1;
        this._move = '';
        window.dispatchEvent(new Event('resize'));
    }
});

customElements.define('li-wiki-box', class LiWikiBox extends LiElement {
    static get properties() {
        return {
            item: { type: Object },
            focused: { type: Object, local: true },
            shadow: { type: Number, default: 0 }
        }
    }

    static get styles() {
        return css`
            :host {
                width: 100%;
            }
            .header {
                display: flex;
                align-items: center;
                border: 1px solid gray;
                background-color: lightgray;
                padding: 0 4px;
                margin: 2px;
                height: 32px;
                overflow: hidden;
                cursor: move;
            }
            .box {
                border: 1px solid #666;
                background-color: #ddd;
                margin: 2px;
                height: 200px;
                overflow: auto;
            }
            [draggable] {
                user-select: none;
            }
        `;
    }

    render() {
        return html`
            <div draggable="true" class="header"
                    @dragstart="${this.handleDragStart}" 
                    @dragend="${this.handleDragEnd}" 
                    @dragover="${this.handleDragOver}"
                    @dragleave="${this.handleDragLeave}">
                ${this.item?.label}
            </div>
            <div class="box" @dragover="${this.handleDragOver}" @dragleave="${this.handleDragLeave}">
                <li-editor-html .item=${this.item}></li-editor-html>
            </div>
        `;
    }

    handleDragStart(e) {
        this.focused = this;
    }
    handleDragEnd(e) {
        this.focused = null;
    }
    handleDragOver(e) {
        e.preventDefault();
        LI.throttle('dragover', () => {
            this.shadow = 0;
            if (e.target.className === 'header') this.shadow = -1;
            else this.shadow = 1;
            this.focused.item.order = this.item.order + this.shadow / 2;
            this.$update()
        }, 100, true)
    }
    handleDragLeave(e) {
        this.shadow = 0;
    }
});

customElements.define('li-wiki-box-shadow', class LiWikiBoxShadow extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
            }
            .box {
                border: 1px solid red;
                background-color: tomato;
                cursor: move;
                margin: 2px;
                height: 32px;
                opacity: .5;
            }
        `;
    }

    render() {
        return html`
            <div class="box" @dragover="${this.handleDragOver}"></div>
        `;
    }

    handleDragOver(e) {
        e.preventDefault();
    }
});