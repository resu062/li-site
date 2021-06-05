import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../editor-html/editor-html.js';
import '../editor-simplemde/editor-simplemde.js';
import '../editor-showdown/editor-showdown.js';
import '../viewer-md/viewer-md.js';
import '../button/button.js';

customElements.define('li-wiki', class LiWiki extends LiElement {
    static get properties() {
        return {
            data: {
                type: Array,
                default: [
                    { label: 'html-editor', order: 0, h: 120, type: 'html-editor', value: '<div style="color:red;font-size:26px;font-weight:600;">HTML editor</div>' },
                    { label: 'simple-mde', order: 0, h: 120, type: 'simple-mde', value: '## SimpleMDE (markdown editor)' },
                    { label: 'showdown', order: 0, h: 120, type: 'showdown', value: '## Showdown (markdown editor)' },
                ],
                local: true,
                //save: true
            },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _widthL: { type: Number, default: 800, save: true },
            _expandItem: { type: Object, local: true },
            _lPanel: { type: String, default: 'home' },
            _rPanel: { type: String, default: '' },
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
                flex-direction: column;
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
                    li-wiki (prototype)
                </div>
                <div slot="app-left" class="panel">
                    <div>
                        <li-button name="tree-structure" title="home" @click="${() => this._lPanel = 'home'}"></li-button>
                        <li-button name="playlist-add" title="editors" @click="${() => this._lPanel = 'editors'}"></li-button>
                        <li-button name="settings" title="settings" @click="${() => this._lPanel = 'settings'}"></li-button>
                    </div>
                    <div class="panel-in">
                        ${this._lPanel === 'editors' ? html`
                            editors
                            <!-- <li-button width="100%" @click="${this._addBox}">html</li-button> -->
                            <li-button width="100%" @click="${this._addBox}">html-editor</li-button>
                            <!-- <li-button width="100%" @click="${this._addBox}">ace-editor</li-button> -->
                            <li-button width="100%" @click="${this._addBox}">simple-mde</li-button>
                            <li-button width="100%" @click="${this._addBox}">showdown</li-button>
                        ` : this._lPanel === 'settings' ? html`
                            settings
                        ` : html`
                            home
                        `}
                    </div>
                </div>
                <div slot="app-right" class="panel">
                    <div>
                        <li-button name="" title="001" @click="${() => this._rPanel = '001'}">1</li-button>
                        <li-button name="" title="002" @click="${() => this._rPanel = '002'}">2</li-button>
                        <li-button name="" title="003" @click="${() => this._rPanel = '003'}">3</li-button>
                    </div>
                    <div class="panel-in">
                    ${this._rPanel === '002' ? html`
                            right-panel-002
                        ` : this._rPanel === '003' ? html`
                            right-panel-003
                        ` : html`
                            right-panel-001
                        `}
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
                                    ` : this._item === i && this._action === 'box-hide' ? html`` : html`
                                        <li-wiki-box .item="${i}" style="order:${i.order * 10}"></li-wiki-box>
                                    `}
                                `)}                        
                            `}
                        </div>
                    `}
                    <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @mousedown="${this._moveSplitter}"></div>
                    <div class="main-panel" style="flex: 1;" ?hidden="${this._widthL >= this.$id?.main.offsetWidth && !this._action !== 'splitter-move'}">
                        ${(this._data || []).map(i => html`
                            ${i.type === 'showdown' ? html`
                                <li-viewer-md src="${i.value || ''}" style="order:${i.order * 10}; margin-top: -12px"></li-viewer-md>
                            ` : html`
                                <div class="res" .item="${i}" style="order:${i.order * 10}" .innerHTML="${i.htmlValue || i.value || ''}"></div>
                            `}
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }
    _addBox(e) {
        console.log(e.target.innerText);
        this.data.push({ label: e.target.innerText, order: 99999, h: 120, type: e.target.innerText, value: '' });
        this.$update();
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
            _expandItem: { type: Object, local: true },
            data: { type: Array, local: true },
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

    get _editor() {
        if (!this.item) return html``;
        switch (this.item.type) {
            case 'html-editor':
                return html`<li-editor-html ref="ed" .item=${this.item}></li-editor-html>`;
            case 'simple-mde':
                return html`<li-editor-simplemde ref="ed" .item=${this.item}></li-editor-simplemde>`;
            case 'showdown':
                return html`<li-editor-showdown ref="ed" .item=${this.item}></li-editor-showdown>`;
            default:
                return html`<li-editor-html ref="ed" .item=${this.item}></li-editor-html>`;
        }
    }

    render() {
        return html`
            <div draggable="${!this._expandItem}" class="header"
                    @dragstart="${this._dragStart}" 
                    @dragend="${() => this._item = undefined}" 
                    @dragover="${this._dragover}"
                    @dragleave="${this._dragleave}">
                ${this.item?.label}
                <div style="flex:1"></div>
                <li-button name="expand-more" title="down" @click="${() => { this._moveBox(1.5) }}"></li-button>
                <li-button name="expand-less" title="up" @click="${() => { this._moveBox(-1.5) }}"></li-button>
                <li-button name="fullscreen-exit" title="collapse" @click="${this._collapseBox}"></li-button>
                <li-button name="aspect-ratio" title="expand/collapse" @click="${() => this._expandItem = this._expandItem ? undefined : this.item}"></li-button>
                <li-button name="close" title="close" @click="${this._closeBox}"></li-button>
            </div>
            <div class="box" @dragover="${this._dragover}" @dragleave="${() => this.shadowOffset = 0}" ?hidden="${!this._expandItem && this.item?.h <= 0}"
                    style="height:${this._expandItem ? '100%' : this.item?.h + 'px'}">
                ${this._editor}
            </div>
            <div class="bottomSplitter ${this._item === this.item ? 'bottomSplitter-move' : ''}" ?hidden="${this._expandItem}"
                    @mousedown="${this._mousedown}"
                    @dragover="${this._dragover}">
            </div>
        `;
    }

    _moveBox(v) {
        this._item = this.item;
        this._action = 'box-hide';
        setTimeout(() => {
            requestAnimationFrame(() => {
                this.item.order += v;
                this._item = undefined;
                this._action = '';
                this.$update();
            })
        }, 0);
    }
    _collapseBox() {
        if (this.item.h > 0 || this._expandItem) {
            this._h = this.item.h;
            this.item.h = 0;
        } else {
            this.item.h = this._h || 120;
            this._h = 0;
        }
        this._expandItem = undefined;
        this.requestUpdate();
    }
    _closeBox() {
        if (window.confirm(`Do you really want delete box-${this.item.label} ?`)) {
            this.data.splice(this.data.indexOf(this.item), 1);
            this.$update();
        }
    }
    _mousedown(e) {
        this._item = this.item;
        this._action = 'set-box-height';
        this._indexFullArea = 999;
    }
    _dragStart() {
        this._item = this.item;
        this._action = 'box-move';
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
