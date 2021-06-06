import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../editor-html/editor-html.js';
import '../editor-simplemde/editor-simplemde.js';
import '../editor-showdown/editor-showdown.js';
import '../viewer-md/viewer-md.js';
import '../editor-iframe/editor-iframe.js';
import '../button/button.js';
import '../checkbox/checkbox.js';

customElements.define('li-wiki', class LiWiki extends LiElement {
    static get properties() {
        return {
            data: { type: Array, local: true },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _widthL: { type: Number, default: 800, save: true },
            _expandItem: { type: Object, local: true },
            _lPanel: { type: String, default: 'home' },
            _rPanel: { type: String, default: '' },
        }
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
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <li-button width="100%" @click="${this._addBox}">html-editor</li-button>
                            <li-button width="100%" @click="${this._addBox}">simple-mde</li-button>
                            <li-button width="100%" @click="${this._addBox}">showdown</li-button>
                            <li-button width="100%" @click="${this._addBox}">iframe</li-button>
                        ` : this._lPanel === 'settings' ? html`
                            settings
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            editors:
                            <div style="flex"><li-button id="s01" name="check" @click="${this._settings}"></li-button> 01. hide/show editors</div>
                            <div style="flex"><li-button id="s02" name="check" @click="${this._settings}"></li-button> 02. hide all</div>
                            <div style="flex"><li-button id="s03" name="check" @click="${this._settings}"></li-button> 03. show all hidden</div>
                            <div style="flex"><li-button id="s04" name="check" @click="${this._settings}"></li-button> 04. collapse all</div>
                            <div style="flex"><li-button id="s05" name="check" @click="${this._settings}"></li-button> 05. expand all</div>
                            result:
                            <div style="flex"><li-button id="s06" name="check" @click="${this._settings}"></li-button> 06. hide/show result</div>
                            <div style="flex"><li-button id="s07" name="check" @click="${this._settings}"></li-button> 07. do not show all</div>
                            <div style="flex"><li-button id="s08" name="check" @click="${this._settings}"></li-button> 08. show all</div>
                            data:
                            <div style="flex"><li-button id="s09" name="check" @click="${this._settings}" fill="tomato" borderColor="tomato"></li-button> 09. delete all hidden</div>
                            <div style="flex"><li-button id="s10" name="check" @click="${this._settings}" fill="tomato" borderColor="tomato"></li-button> 10. delete all</div>              
                        ` : html`
                            home
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
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
                                ${(this.data || []).map(i => html`
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
                        ${(this.data || []).map(i => html`
                            ${!i.show ? html`` : i.type === 'showdown' ? html`
                                <li-viewer-md src="${i.value || ''}"></li-viewer-md>
                            ` : i.type === 'iframe' ? html`<iframe .srcdoc="${i.htmlValue || i.value || ''}" style="width:100%;border: none; height: ${i.h + 'px' || 'auto'}"></iframe>` : html`
                                <div class="res" .item="${i}" .innerHTML="${i.htmlValue || i.value || ''}"></div>
                            `}
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }
    _settings(e) {
        const id = e.target.id,
            w = this.$id.main.offsetWidth,
            d = this.data || [],
            s = {
                s01: () => this._widthL = this._widthL > 0 ? 0 : w / 2,
                s02: () => d.forEach(i => i.hidden = true),
                s03: () => d.forEach(i => i.hidden = false),
                s04: () => d.forEach(i => i.collapsed = true),
                s05: () => d.forEach(i => i.collapsed = false),
                s06: () => this._widthL = this._widthL >= w ? w / 2 : w,
                s07: () => d.forEach(i => i.show = false),
                s08: () => d.forEach(i => i.show = true),
                s09: () => {
                    let hidden = 0;
                    d.forEach(i => { if (i.hidden) ++hidden })
                    if (hidden && window.confirm(`Do you really want delete ${hidden} hidden box?`)) {
                        this.data = d.filter(i => !i.hidden);
                    }
                },
                s10: () => { if (window.confirm(`Do you really want delete all?`)) this.data = [] }
            }
        if (s[id]) {
            s[id]();
            this.$update();
        }
    }
    _addBox(e) {
        const txt = e.target.innerText;
        this.data.push({ label: txt, h: 120, type: txt, value: '' });
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
            case 'iframe':
                return html`<li-editor-iframe ref="ed" .item=${this.item}></li-editor-iframe>`;
            default:
                return html`<li-editor-html ref="ed" .item=${this.item}></li-editor-html>`;
        }
    }

    render() {
        return html`
            ${this.item.hidden ? html`` : html`
                <div draggable="${!this._expandItem}" class="header"
                        @dragstart="${this._dragStart}" 
                        @dragend="${() => this._item = undefined}" 
                        @dragover="${this._dragover}">
                    ${this.item?.label}
                    <div style="flex:1"></div>
                    <li-button name="expand-more" title="down" @click="${() => { this._moveBox(1) }}"></li-button>
                    <li-button name="expand-less" title="up" @click="${() => { this._moveBox(-1) }}"></li-button>
                    <li-button name="fullscreen-exit" title="collapse" @click="${this._collapseBox}"></li-button>
                    <li-button name="aspect-ratio" title="expand/collapse" @click="${() => this._expandItem = this._expandItem ? undefined : this.item}"></li-button>
                    <li-checkbox @click="${(e) => this.item.show = e.target.toggled}" ?toggled="${this.item.show}" 
                        title="show in result" back="transparent"></li-checkbox>
                    <li-button name="close" title="hide box" @click="${this._hideBox}"></li-button>
                </div>
                <div class="box" ?hidden="${!this._expandItem && (this.item?.h <= 0 || this.item.collapsed)}"
                        style="height:${this._expandItem ? '100%' : this.item?.h + 'px'}">
                    ${this._editor}
                </div>
                <div class="bottomSplitter ${this._item === this.item ? 'bottomSplitter-move' : ''}" ?hidden="${this._expandItem}"
                        @mousedown="${this._mousedown}"
                        @dragover="${this._dragover}">
                </div>
            `}
        `;
    }

    _moveBox(v) {
        let indx = this.data.indexOf(this.item);
        if (v === -1 && indx === 0 || v === 1 && indx === this.data.length - 1) return;
        this._item = this.item;
        this._action = 'box-hide';
        setTimeout(() => {
            requestAnimationFrame(() => {
                let itm = this.data.splice(this.data.indexOf(this.item), 1);
                this.data.splice(indx + v, 0, itm[0]);
                this._item = undefined;
                this._action = '';
                this.$update();
            })
        }, 0);
    }
    _collapseBox() {
        this.item.collapsed = !this.item.collapsed;
        this._expandItem = undefined;
        this.requestUpdate();
    }
    _hideBox() {
        this.item.hidden = true;
        this._expandItem = undefined;
        this.$update();
        return;
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
            if (e.target.className === 'header') this.shadowOffset = 0;
            else this.shadowOffset = 1;
            let itm = this.data.splice(this.data.indexOf(this._item), 1);
            let indx = this.data.indexOf(this.item) + this.shadowOffset;
            this.data.splice(indx, 0, itm[0]);
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
