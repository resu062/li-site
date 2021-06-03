import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../editor-html/editor-html.js';
import '../button/button.js';

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
                ],
                //save: true
            },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _widthL: { type: Number, default: 800, save: true },
            _expandItem: { type: Object, local: true }
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
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            .panel-in {
                display: flex;
                border-top: 1px solid lightgray;
                padding: 4px;
                flex: 1;
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
            .full-area {
                position: fixed;
                top: 0; left: 0; bottom: 0; right: 0;
            }
        `;
    }

    render() {
        return html`
            <div class="full-area" @mousemove="${this._mousemove}" @mouseup="${this._up}" @mouseout="${this._up}" style="z-index: ${this._indexFullArea}"></div>
            <li-layout-app>
                <div slot="app-top" class="header">
                    li-wiki
                </div>
                <div slot="app-left" class="panel">
                    <div>
                        <li-button name="tree-structure" title="home"></li-button>
                        <li-button name="playlist-add" title="editors"></li-button>
                        <li-button name="settings" title="settings"></li-button>
                    </div>
                    <div class="panel-in">
                        left-panel
                    </div>
                </div>
                <div slot="app-right" class="panel">
                    <div>
                        <li-button name="" title=""></li-button>
                        <li-button name="" title=""></li-button>
                        <li-button name="" title=""></li-button>
                    </div>
                    <div class="panel-in">
                        right-panel
                    </div>
                </div>
                <div slot="app-main" class="main" id="main">
                    ${this._widthL <= 0 ? html`` : html`
                        <div class="main-panel main-left" style="width:${this._widthL}px" @dragover="${(e) => e.preventDefault()}">
                            ${this._expandItem ? html`
                                <li-wiki-box .item="${this._expandItem}" style="height: calc(100% - 40px);"></li-wiki-box>
                            ` : html`
                                ${(this._data || []).map(i => html`
                                    ${this._item === i && this._action === 'box-move' ? html`
                                        <li-wiki-box-shadow style="order:${i.order * 10}"></li-wiki-box-shadow>
                                    ` : html`
                                        <li-wiki-box .item="${i}" style="order:${i.order * 10}"></li-wiki-box>
                                    `}
                                `)}                        
                            `}
                        </div>
                    `}
                    <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @mousedown="${this._moveSplitter}"></div>
                    <div class="main-panel" style="flex: 1;" ?hidden="${this._widthL >= this.$id?.main.offsetWidth && !this._action !== 'splitter-move'}">
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
            if (!this._widthL && this._widthL !== 0) this._widthL = 800;
            else this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id?.main.offsetWidth ? this.$id.main.offsetWidth : this._widthL;
            this.$update();
        }, 100);
    }

    _moveSplitter() {
        this._action = 'splitter-move';
        this._indexFullArea = 999;
    }
    _mousemove(e) {
        if (this._action === 'splitter-move') {
            e.preventDefault();
            this._widthL = this._widthL + e.movementX;
            this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id?.main.offsetWidth ? this.$id.main.offsetWidth : this._widthL;
        } else if (this._action === 'set-box-height') {
            this._item.h = this._item.h + e.movementY;
            this._item.h = this._item.h > 0 ? this._item.h : 0;
            this.$update();
        }
    }
    _up(e) {
        e.preventDefault();
        this._indexFullArea = -1;
        this._action = '';
        this._item = undefined;
        //window.dispatchEvent(new Event('resize'));
    }
});

customElements.define('li-wiki-box', class LiWikiBox extends LiElement {
    static get properties() {
        return {
            item: { type: Object },
            shadow: { type: Number, default: 0 },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _expandItem: { type: Object, local: true }
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
                white-space: nowrap;
            }
            .box {
                border: 1px solid #666;
                background-color: #ddd;
                margin: 2px;
                overflow: auto;
            }
            [draggable=true] {
                cursor: move;
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
            <div draggable="${!this._expandItem}" class="header"
                    @dragstart="${() => { this._item = this.item; this._action = 'box-move'; }}" 
                    @dragend="${() => this._item = undefined}" 
                    @dragover="${this._dragover}"
                    @dragleave="${this._dragleave}">
                ${this.item?.label}
                <div style="flex:1"></div>
                <li-button name="fullscreen-exit" title="collapse" @click="${this._collapseBox}"></li-button>
                <li-button name="aspect-ratio" title="expand/collapse" @click="${() => this._expandItem = this._expandItem ? undefined : this.item}"></li-button>
                <li-button name="close" title="close" @click="${this._closeBox}"></li-button>
            </div>
            ${!this._expandItem && this.item?.h <= 0 ? html`` : html`
                <div class="box" @dragover="${this._dragover}" @dragleave="${() => this.shadowOffset = 0}"
                        style="height:${this._expandItem ? '100%' : this.item?.h + 'px'}">
                    <li-editor-html .item=${this.item}></li-editor-html>
                </div>
            `}
            <div class="bottomSplitter ${this._item === this.item ? 'bottomSplitter-move' : ''}" ?hidden="${this._expandItem}"
                    @mousedown="${this._mousedown}"
                    @dragover="${this._dragover}">
            </div>
        `;
    }
    _collapseBox() {
        if (this.item.h > 0) {
            this._h = this.item.h;
            this.item.h = 0;
        } else {
            this.item.h = this._h || 200;
            this._h = 0;
        }
        this.requestUpdate();
    }
    _closeBox() {
        console.log('close-box ... ' + this.item?.label);
    }
    _mousedown(e) {
        this._item = this.item;
        this._action = 'set-box-height';
        this._indexFullArea = 999;
    }
    _dragover(e) {
        if (this._action !== 'box-move') return;
        e.preventDefault();
        LI.throttle('dragover', () => {
            this.shadowOffset = 0;
            if (e.target.className === 'header') this.shadowOffset = -1;
            else this.shadowOffset = 1;
            this._item.order = this.item.order + this.shadowOffset / 2;
            this.$update();
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
