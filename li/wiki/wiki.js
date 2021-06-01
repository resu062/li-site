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
                    { label: '000', order: 0, h: 200 },
                    { label: '001', order: 0, h: 200 },
                    { label: '002', order: 0, h: 200 },
                    { label: '003', order: 0, h: 200 },
                    { label: '004', order: 0, h: 200 },
                ]
            },
            focused: { type: Object, local: true },
            _indx: { type: Number, default: -1, local: true },
            _move: { type: Boolean },
            _widthL: { type: Number, default: 800, save: true },
            _itemH: { type: Object, local: true },
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
                min-width: 0;
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
            .splitter:hover, .splitter-move {
                background-color: lightgray;
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
                <div slot="app-main" class="main" id="main">
                    ${this._widthL <= 0 ? html`` : html`
                        <div class="main-panel main-left" style="width:${this._widthL}px" @dragover="${(e) => e.preventDefault()}">
                            Editors:
                            ${(this._data || []).map(i => html`
                                ${this.focused?.item.label === i.label ? html`
                                    <li-wiki-box-shadow style="order:${i.order * 10}"></li-wiki-box-shadow>
                                ` : html`
                                    <li-wiki-box .item="${i}" style="order:${i.order * 10}"></li-wiki-box>
                                `}`)}
                        </div>
                    `} 
                    <div class="splitter ${this._move ? 'splitter-move' : ''}" @mousedown="${this._moveSplitter}"></div>
                    <div class="main-panel" style="flex: 1;" ?hidden="${this._widthL >= this.$id?.main.offsetWidth && !this._move}">
                        Result:
                        ${(this._data || []).map(i => html`
                            <div class="res" .item="${i}" style="order:${i.order * 10}" .innerHTML="${i.value || ''}"></div>
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id?.main.offsetWidth ? this.$id.main.offsetWidth : this._widthL;
        this.$update();
        }, 100);
    }

    _moveSplitter() {
        this._move = true;
        this._indx = 999;
    }
    _mousemove(e) {
        if (this._move) {
            e.preventDefault();
            this._widthL = this._widthL + e.movementX;
            this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id?.main.offsetWidth ? this.$id.main.offsetWidth : this._widthL;
        } else if (this._itemH) {
            this._itemH.h = this._itemH.h + e.movementY;
            this._itemH.h = this._itemH.h > 0 ? this._itemH.h : 0;
            this.$update();
        }
    }
    _up(e) {
        e.preventDefault();
        this._indx = -1;
        this._move = '';
        this._itemH = undefined;
        //window.dispatchEvent(new Event('resize'));
    }
});

customElements.define('li-wiki-box', class LiWikiBox extends LiElement {
    static get properties() {
        return {
            item: { type: Object },
            focused: { type: Object, local: true },
            shadow: { type: Number, default: 0 },
            _indx: { type: Number, default: -1, local: true },
            _itemH: { type: Object, local: true }
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
                overflow: auto;
            }
            [draggable] {
                user-select: none;
            }
            .bottomSplitter {
                width: 100%;
                max-height: 4px;
                min-height: 4px;
                cursor: row-resize;
                z-index: 9;
            }
            .bottomSplitter:hover, .bottomSplitter-move {
                background-color: lightgray
            }
        `;
    }

    render() {
        return html`
            <div draggable="true" class="header"
                    @dragstart="${() => this.focused = this}" 
                    @dragend="${() => this.focused = null}" 
                    @dragover="${this._dragover}"
                    @dragleave="${this._dragleave}">
                ${this.item?.label}
            </div>
            ${this.item.h <= 0 ? html`` : html`
                <div class="box" @dragover="${this._dragover}" @dragleave="${() => this.shadow = 0}" style="height:${this.item.h}px">
                    <li-editor-html .item=${this.item}></li-editor-html>
                </div>
            `}
            <div class="bottomSplitter ${this._itemH === this.item ? 'bottomSplitter-move' : ''}" 
                    @mousedown="${this._mousedown}"
                    @dragover="${this._dragover}">
            </div>
        `;
    }

    _mousedown(e) {
        this._itemH = this.item;
        this._indx = 999;
    }
    _dragover(e) {
        if (!this.focused) return;
        e.preventDefault();
        LI.throttle('dragover', () => {
            this.shadow = 0;
            if (e.target.className === 'header') this.shadow = -1;
            else this.shadow = 1;
            this.focused.item.order = this.item.order + this.shadow / 2;
            this.$update()
        }, 100, true)
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
            <div class="box" @dragover="${(e) => e.preventDefault()}"></div>
        `;
    }
});
