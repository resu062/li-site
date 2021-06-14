import { LiElement, html, css } from '../../li.js';

import '../layout-app/layout-app.js';
import '../editor-html/editor-html.js';
import '../editor-simplemde/editor-simplemde.js';
import '../editor-showdown/editor-showdown.js';
import '../viewer-md/viewer-md.js';
import '../editor-iframe/editor-iframe.js';
import '../editor-suneditor/editor-suneditor.js';
import '../button/button.js';
import '../checkbox/checkbox.js';
import '../layout-tree/layout-tree.js';

import '../../lib/pouchdb/pouchdb.js'

customElements.define('li-wiki', class LiWiki extends LiElement {
    static get properties() {
        return {
            articles: { type: Array, default: [], local: true },
            selected: { type: Object, default: {}, local: true },
            templates: { type: Array, default: [], local: true },
            selectedTemplate: { type: Object, default: {} },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _widthL: { type: Number, default: 800, save: true },
            _expandItem: { type: Object, local: true },
            _lPanel: { type: String, default: 'articles' },
            _hasSaveDB: { type: Boolean, save: true }
        }
    }

    get article() {
        return this.selected?.templates || [];
    }

    static get styles() {
        return css`
            .header {
                font-weight: 700;
                display: flex;
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
            <div class="full-area" @mousemove="${this._mousemove}" @mouseup="${this._clearAction}" @mouseout="${this._clearAction}" style="z-index: ${this._indexFullArea}"></div>
            <li-layout-app hide="r" @drop="${this._clearAction}">
                <div slot="app-top" class="header">
                    <div style="flex:1"></div>li-wiki (prototype)<div style="flex:1"></div>
                    <li-button id="s06" name="filter-1" @click="${this._settings}" style="margin-right:4px"></li-button>
                    <li-button id="s00" name="view-agenda" rotate="90" @click="${this._settings}" style="margin-right:4px"></li-button>
                    <li-button id="s01" name="filter-2" @click="${this._settings}" style="margin-right:8px"></li-button>
                </div>
                <div slot="app-left" class="panel">
                    <div style="display: flex">
                        <li-button name="tree-structure" title="home" @click="${() => this._lPanel = 'articles'}"></li-button>
                        <li-button name="bookmark-border" title="templates" @click="${() => this._lPanel = 'templates'}"></li-button>
                        <li-button name="playlist-add" title="editors" @click="${() => this._lPanel = 'editors'}"></li-button>
                        <li-button name="check" title="actions" @click="${() => this._lPanel = 'actions'}"></li-button>
                        <li-button name="settings" title="settings" @click="${() => this._lPanel = 'settings'}"></li-button>
                        <div style="flex:1"></div>
                        <li-button name="save" title="save" @click="${this._treeActions}"></li-button>
                    </div>
                    <div class="panel-in">
                        ${this._lPanel === 'editors' ? html`
                            <b>editors</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            add editor:
                            <li-button width="100%" @click="${this._addBox}">html-editor</li-button>
                            <li-button width="100%" @click="${this._addBox}">suneditor</li-button>
                            <li-button width="100%" @click="${this._addBox}">simplemde</li-button>
                            <li-button width="100%" @click="${this._addBox}">showdown</li-button>
                            <li-button width="100%" @click="${this._addBox}">iframe</li-button>
                        ` : this._lPanel === 'actions' ? html`
                            <b>actions</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            editors:
                            <div style="flex"><li-button id="s01" @click="${this._settings}">01</li-button> hide/show editors</div>
                            <div style="flex"><li-button id="s02" @click="${this._settings}">02</li-button> hide all</div>
                            <div style="flex"><li-button id="s03" @click="${this._settings}">03</li-button> show all</div>
                            <div style="flex"><li-button id="s04" @click="${this._settings}">04</li-button> collapse all</div>
                            <div style="flex"><li-button id="s05" @click="${this._settings}">05</li-button> expand all</div>
                            result:
                            <div style="flex"><li-button id="s06" @click="${this._settings}">06</li-button> hide/show result</div>
                            <div style="flex"><li-button id="s07" @click="${this._settings}">07</li-button> invisible all</div>
                            <div style="flex"><li-button id="s08" @click="${this._settings}">08</li-button> visible all</div>
                            data:
                            <div style="flex"><li-button id="s09" @click="${this._settings}" fill="tomato" borderColor="tomato">09</li-button> delete all hidden</div>
                            <div style="flex"><li-button id="s10" @click="${this._settings}" fill="tomato" borderColor="tomato">10</li-button> delete all invisible</div>
                            <div style="flex"><li-button id="s11" @click="${this._settings}" fill="tomato" borderColor="tomato">11</li-button> delete all</div>              
                        ` : this._lPanel === 'settings' ? html`
                            <b>settings</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="color:gray; opacity: 0.7">version: 0.2.1</div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div>db name:</div>
                            <div>db ip:</div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div>login:</div>
                            <div>password:</div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                        ` : html`
                            <b>${this._lPanel}</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="display:flex">
                                <li-button name="unfold-less" title="collapse" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="unfold-more" title="expand" size="20" @click="${this._treeActions}"></li-button>
                                <div style="flex:1"></div>
                                <li-button name="refresh" title="refresh" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="delete" title="delete" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="library-add" title="add new" size="20" @click="${this._treeActions}"></li-button>
                                <!-- <li-button name="save" title="save" size="20" @click="${this._treeActions}"></li-button> -->
                            </div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <li-layout-tree ?hidden="${this._lPanel !== 'articles'}" .item="${this.articles}" .selected="${this.selected}" @selected="${this._selected}"
                                allowEdit allowCheck iconSize="20" style="color: gray;"></li-layout-tree>
                            <li-layout-tree ?hidden="${this._lPanel !== 'templates'}" .item="${this.templates}" .selected="${this.selectedTemplate}" @selected="${this._selected}"
                                allowEdit allowCheck iconSize="20" style="color: gray;"></li-layout-tree>
                        `}
                    </div>
                </div>
                <div slot="app-main" class="main" id="main">
                    ${this._widthL <= 0 ? html`` : html`
                        <div class="main-panel main-left" style="width:${this._widthL}px" @dragover="${(e) => e.preventDefault()}">
                            ${this._expandItem ? html`
                                <li-wiki-box .item="${this._expandItem}" style="height: calc(100% - 40px);"></li-wiki-box>` : html`
                                ${(this.article || []).map((i, idx) => html`
                                    ${this._item === i && this._action === 'box-move' ? html`
                                    <li-wiki-box-shadow></li-wiki-box-shadow>` : html`
                                    <li-wiki-box .item="${i}" .idx="${idx}"></li-wiki-box>`}`)}`}
                        </div>
                    `}
                    <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @mousedown="${this._moveSplitter}"></div>
                    <div class="main-panel" style="flex: 1;" ?hidden="${this._widthL >= this.$id?.main.offsetWidth && !this._action !== 'splitter-move'}">
                        ${(this.article || []).map(i => html`
                            ${!i.show ? html`` : i.type === 'showdown' ? html`
                                <li-viewer-md src="${i.value || ''}"></li-viewer-md>` : i.type === 'iframe' ? html`
                                <iframe .srcdoc="${i.htmlValue || i.value || ''}" style="width:100%;border: none; height: ${i.h + 'px' || 'auto'}"></iframe>` : html`
                                <div class="res" .item="${i}" .innerHTML="${i.htmlValue || i.value || ''}"></div>
                            `}
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }
    _selected(e) {
        this._item = this._expandItem = undefined;
        if (this._lPanel === 'articles') this.selected = e.detail; 
        else this.selectedTemplate = e.detail; 
        this.$update()
    }
    _settings(e) {
        const id = e.target.id,
            w = this.$id.main.offsetWidth,
            d = this.article || [],
            fn = {
                s00: () => this._widthL = w / 2 - 20,
                s01: () => this._widthL = this._widthL > 0 ? 0 : w / 2 - 20,
                s02: () => d.forEach(i => i.hidden = true),
                s03: () => d.forEach(i => i.hidden = false),
                s04: () => d.forEach(i => i.collapsed = true),
                s05: () => d.forEach(i => i.collapsed = false),
                s06: () => this._widthL = this._widthL >= w ? w / 2 - 20 : w,
                s07: () => d.forEach(i => i.show = false),
                s08: () => d.forEach(i => i.show = true),
                s09: () => {
                    let hidden = 0;
                    d.forEach(i => { if (i.hidden) ++hidden })
                    if (hidden && window.confirm(`Do you really want delete ${hidden} hidden box?`)) {
                        this.article = d.filter(i => !i.hidden);
                    }
                },
                s10: () => {
                    let invisible = 0;
                    d.forEach(i => { if (!i.show) ++invisible })
                    if (invisible && window.confirm(`Do you really want delete ${invisible} invisible box?`)) {
                        this.article = d.filter(i => i.show);
                    }
                },
                s11: () => { if (window.confirm(`Do you really want delete all?`)) this.article.splice(0); this._expandItem = undefined }
            }
        if (fn[id]) {
            this._item = this._expandItem = undefined;
            fn[id]();
            this.$update();
        }
    }
    _treeActions(e, title) {
        const items = this._lPanel === 'articles' ? this.articles : this.templates,
            selected = this._lPanel === 'articles' ? this.selected : this.selectedTemplate,
            label = this._lPanel === 'articles' ? 'new-article' : 'new-template';
        title = title || e.target.title;
        const fn = {
                'add new': () => {
                    if (!selected) selected = items.items[0];
                    selected.items = selected.items || [];
                    const item = { ulid: LI.ulid(), label, checked: false, expanded: false, items: [], templates: [] };
                    selected.items.splice(selected.items.length, 0, item);
                    selected.expanded = true;
                },
                'collapse': () => {
                    LI.setArrRecursive(selected, 'expanded', false);
                },
                'expand': () => {
                    LI.setArrRecursive(selected, 'expanded', true);
                },
                'delete': () => {
                    if (!selected?.checked || !window.confirm(`Do you really want delete selected and all children ${this._lPanel}?`)) return;
                    selected?.items?.clear();
                    const root = LI.findArrRoot(items, selected);
                    if (root) {
                        root.items.splice(root.items.indexOf(selected), 1);
                    }
                    this.$update();
                },
                'refresh': () => {
                    if (!window.confirm(`Do you really want delete all your data and restore demo-data?`)) return;
                    this._hasSaveDB = false;
                    if (this.dbWiki) {
                        this.dbWiki.get('articles').then((res) => {
                            this.dbArticles = res;
                        }).then(() => {
                            return this.dbWiki.get('templates');
                        }).then((res) => {
                            this.dbTemplates = res;
                        }).then((res) => {
                            this.dbArticles.value = [];
                            this.dbTemplates.value = [];
                            this.dbWiki.bulkDocs([this.dbArticles, this.dbTemplates]);
                        }).then(() => {
                            document.location.reload();
                        }).catch(function(err) {
                            console.log(err);
                        })
                    }
                },
                'save': () => {
                    this.dbWiki = new PouchDB('wiki');
                    this.dbWiki.get('articles').then((res) => {
                        this.dbArticles = res;
                    }).then(() => {
                        return this.dbWiki.get('templates');
                    }).then((res) => {
                        this.dbTemplates = res;
                    }).then((res) => {
                        this.dbArticles.value = this.articles;
                        this.dbTemplates.value = this.templates;
                        this.dbWiki.bulkDocs([this.dbArticles, this.dbTemplates]);
                    })
                    this.dbLocalHost = new PouchDB('http://admin:54321@10.10.10.13:5984/wiki');
                    this.dbWiki.sync(this.dbLocalHost);
                    this._hasSaveDB = true;
                },
            }
        if (fn[title]) {
            fn[title]();
            this.$update();
        }
    }

    _addBox(e) {
        this._item = this._expandItem = undefined;
        const txt = e.target.innerText;
        this.article.splice(this.article.length, 0, { label: txt, show: true, h: 120, type: txt, value: '', ulid: LI.ulid() });
        this.$update();
    }
    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            if (this._hasSaveDB) {
                this.dbWiki = new PouchDB('wiki');
                this.dbLocalHost = new PouchDB('http://admin:54321@10.10.10.13:5984/wiki');
                this.dbWiki.sync(this.dbLocalHost);
                this.dbWiki.get('articles').then((res) => {
                    this.dbArticles = res;
                    this.articles = res.value;
                }).then(() => {
                    return this.dbWiki.get('templates');
                }).then((res) => {
                    this.dbTemplates = res;
                    this.templates = res.value;
                }).then(() => {
                    this.selected = this.articles[0];
                    this.selected.expanded = true;
                    this.selectedTemplate = this.templates[0];
                    this.selectedTemplate.expanded = true;
                    if (!this._widthL && this._widthL !== 0) this._widthL = 800;
                    else this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id?.main.offsetWidth ? this.$id.main.offsetWidth : this._widthL;
                    this.$update();
                })
            } else {
                this.selected = this.articles[0];
                this.selected.expanded = true;
                this.selectedTemplate = this.templates[0];
                this.selectedTemplate.expanded = true;
                if (!this._widthL && this._widthL !== 0) this._widthL = 800;
                else this._widthL = this._widthL <= 0 ? 0 : this._widthL >= this.$id?.main.offsetWidth ? this.$id.main.offsetWidth : this._widthL;
                this.$update();
            }
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
    _clearAction(e) {
        e.preventDefault();
        this._indexFullArea = -1;
        this._action = '';
        this._item = this._expandItem = undefined;
    }
});

customElements.define('li-wiki-box', class LiWikiBox extends LiElement {
    static get properties() {
        return {
            articles: { type: Array, local: true },
            selected: { type: Object, default: {}, local: true },
            item: { type: Object },
            shadow: { type: Number, default: 0 },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _expandItem: { type: Object, local: true },
            idx: { type: Number, default: 0 }
        }
    }

    get article() {
        return this.selected?.templates || [];
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
                padding: 0 2px;
                margin: 2px;
                height: 26px;
                overflow: hidden;
                white-space: nowrap;
                color: gray;
                font-size: 16;
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
            .btn {
                opacity: .4;
            }
        `;
    }

    get _editor() {
        const editors = {
            'html-editor': html`<li-editor-html ref="ed" .item="${this.item}"></li-editor-html>`,
            'suneditor': html`<li-editor-suneditor ref="ed" .item="${this.item}"></li-editor-suneditor>`,
            'simplemde': html`<li-editor-simplemde ref="ed" .item="${this.item}"></li-editor-simplemde>`,
            'showdown': html`<li-editor-showdown ref="ed" .item="${this.item}"></li-editor-showdown>`,
            'iframe': html`<li-editor-iframe ref="ed" .item="${this.item}"></li-editor-iframe>`
        }
        return editors[this.item?.type] || editors[this.item?.label] || editors['iframe'];
    }

    render() {
        return html`
            ${this.item.hidden ? html`` : html`
                <div draggable="${!this._expandItem}" class="header"
                        @dragstart="${this._dragStart}" 
                        @dragend="${() => this._item = undefined}" 
                        @dragover="${this._dragover}"
                        @drop="${() => this._item = undefined}">
                    ${(this.idx || 0) + 1 + '. ' + this.item?.label}
                    <div style="flex:1"></div>
                    <li-button class="btn" name="expand-more" title="down" @click="${() => { this._stepMoveBox(1) }}" size="20"></li-button>
                    <li-button class="btn" name="expand-less" title="up" @click="${() => { this._stepMoveBox(-1) }}" size="20"></li-button>
                    <li-button class="btn" name="fullscreen-exit" title="collapse" @click="${this._collapseBox}" size="20"></li-button>
                    <li-button class="btn" name="aspect-ratio" title="expand/collapse" @click="${() => this._expandItem = this._expandItem ? undefined : this.item}" size="20"></li-button>
                    <li-checkbox class="btn" @click="${(e) => this.item.show = e.target.toggled}" ?toggled="${this.item.show}" 
                        title="show in result" back="transparent" size="20"></li-checkbox>
                    <li-button class="btn" name="close" title="hide box" @click="${this._hideBox}" size="20"></li-button>
                </div>
                <div class="box" ?hidden="${!this._expandItem && (this.item?.h <= 0 || this.item.collapsed)}"
                        style="height:${this._expandItem ? '100%' : this.item?.h + 'px'}">
                    ${this._editor}
                </div>
                <div class="bottomSplitter ${this._item === this.item ? 'bottomSplitter-move' : ''}" ?hidden="${this._expandItem}"
                        @mousedown="${this._setBoxHeight}"
                        @dragover="${this._dragover}">
                </div>
            `}
        `;
    }

    _stepMoveBox(v) {
        let indx = this.article.indexOf(this.item);
        let itm = this.article.splice(this.article.indexOf(this.item), 1);
        this.article.splice(indx + v, 0, itm[0]);
        this.$update();
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
    }
    _setBoxHeight(e) {
        if (this.item.collapsed) {
            this.item.h = 0;
            this.item.collapsed = false;
        }
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
        let shadowOffset = 1;
        if (e.target.className === 'header') shadowOffset = 0;
        let itm = this.article.splice(this.article.indexOf(this._item), 1);
        let indx = this.article.indexOf(this.item) + shadowOffset;
        this.article.splice(indx, 0, itm[0]);
        this.$update();
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
                height: 30px;
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
