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
import '../../lib/li-utils/utils.js';
import '../layout-tree/layout-tree.js';

import '../../lib/pouchdb/pouchdb.js';
import '../../lib/li-utils/utils.js';
import { ITEM, BOX } from './data.js';

customElements.define('li-wiki', class LiWiki extends LiElement {
    static get properties() {
        return {
            articles: { type: Array, default: [], local: true },
            selected: { type: Object, local: true },
            templates: { type: Array, default: [], local: true },
            selectedTemplate: { type: Object },
            _item: { type: Object, local: true },
            _indexFullArea: { type: Number, default: -1, local: true },
            _action: { type: String, local: true },
            _widthL: { type: Number, default: 800, save: true },
            _expandItem: { type: Object, local: true },
            _lPanel: { type: String, default: 'articles' },
            _firstLoadDemoDB: { type: Boolean, default: true, save: true },
            dbName: { type: String, default: 'wiki', save: true },
            dbIP: { type: String, default: 'http://admin:54321@localhost:5984/', save: true },
            _changedList: { type: Array, default: [] },
            _deletedList: { type: Array, default: [] }
        }
    }

    get selectedEditors() {
        return this.selected?.templates || [];
    }
    get _needSave() {
        if (this._changedList?.length || this._deletedList?.length) return true;
        return false;
    };

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
                overflow: hidden;
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
            .lbl {
                padding: 4px;
            }
            input {
                border: none; 
                outline: none; 
                width: 100%; 
                color:gray; 
                opacity: 0.9;
                font-size: 18;
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
                        <li-button name="refresh" title="reload page" @click="${() => document.location.reload()}"></li-button>
                        <li-button name="camera-enhance" title="save tree state" @click="${this._saveTreeState}"></li-button>
                        <li-button name="save" title="save" @click="${this._treeActions}" .fill="${this._needSave ? 'red' : ''}" .color="${this._needSave ? 'red' : 'gray'}"></li-button>
                    </div>
                    <div class="panel-in">
                        ${this._lPanel === 'editors' ? html`
                            <b>editors</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="display: flex; flex-direction: column; overflow: auto;">
                                add editor:
                                <li-button width="auto" @click="${this._addBox}">html-editor</li-button>
                                <li-button width="auto" @click="${this._addBox}">suneditor</li-button>
                                <li-button width="auto" @click="${this._addBox}">simplemde</li-button>
                                <li-button width="auto" @click="${this._addBox}">showdown</li-button>
                                <li-button width="auto" @click="${this._addBox}">iframe</li-button>
                            </div>
                        ` : this._lPanel === 'actions' ? html`
                            <b>actions</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="display: flex; flex-direction: column; overflow: auto;">
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
                            </div>
                        ` : this._lPanel === 'settings' ? html`
                            <b>settings</b>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="display: flex; flex-direction: column; overflow: auto;">
                                <div class="lbl" style="color:gray; opacity: 0.7">version: 0.7.3</div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div class="lbl" style="color:gray; opacity: 0.7">Couchdb settings:</div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div style="display: flex"><div class="lbl" style="width: 100px">db name:</div><input .value="${this.dbName}" @change="${(e) => this.dbName = e.target.value}"></div>
                                <div style="display: flex"><div class="lbl" style="width: 100px">db ip:</div><input .value="${this.dbIP}" @change="${(e) => this.dbIP = e.target.value}"></div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                                <li-button id="Replicate db" @click="${this._settings}" height="auto" width="auto" padding="4px">Replicate from CouchDB</li-button>
                                <li-button id="Compacting db" @click="${this._settings}" height="auto" width="auto" padding="4px">Compacting database</li-button>
                                <li-button id="Clear db" @click="${this._settings}" height="auto" width="auto" padding="4px">Clear from _deleted in CouchDB if any</li-button>
                                <li-button id="Export db" @click="${this._settings}" height="auto" width="auto" padding="4px">Export db (open in new tab)</li-button>
                                <li-button id="Export dbFile" @click="${this._settings}" height="auto" width="auto" padding="4px">Export db to file (_data.json)</li-button>
                                <div class="lbl">Import database:</div>
                                <input type="file" id="Import db" @change=${(e) => this._settings(e)}/>
                                <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            </div>
                        ` : html`
                            <div style="display: flex"><b>${this._lPanel}</b>${this._lPanel === "templates" ? html`<div style="flex:1;"></div><div> Coming soon ...</div>` : html``}</div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <div style="display:flex">
                                <li-button name="unfold-less" title="collapse" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="unfold-more" title="expand" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="star-border" ref="star" toggledClass="ontoggled" title="set selected as root" size="20" @click="${this._treeActions}"
                                    ?toggled="${this['_star-' + this._lPanel]}"></li-button>
                                <div style="flex:1"></div>
                                <li-button name="cached" title="clear deleted" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="delete" title="delete" size="20" @click="${this._treeActions}"></li-button>
                                <li-button name="library-add" title="add new" size="20" @click="${this._treeActions}"></li-button>
                            </div>
                            <div style="border-bottom:1px solid lightgray;width:100%;margin: 4px 0;"></div>
                            <li-layout-tree .item="${this._star}" .selected="${this._selected}" @selected="${this.fnSelected}" style="overflow: auto;"
                                allowEdit allowCheck iconSize="20" style="color: gray;" @changed="${this._changed}"></li-layout-tree>
                        `}
                    </div>
                </div>
                <div slot="app-main" class="main" id="main">
                    ${this._widthL <= 0 ? html`` : html`
                        <div class="main-panel main-left" style="width:${this._widthL}px" @dragover="${(e) => e.preventDefault()}">
                            ${this._expandItem ? html`
                                <li-wiki-box .item="${this._expandItem}" style="height: calc(100% - 40px);"></li-wiki-box>` : html`
                                ${(this.selectedEditors.filter(i => !i._deleted) || []).map((i, idx) => html`
                                    ${this._item === i && this._action === 'box-move' ? html`
                                    <li-wiki-box-shadow></li-wiki-box-shadow>` : html`
                                    <li-wiki-box .item="${i}" .idx="${idx}"></li-wiki-box>`}`)}`}
                        </div>
                    `}
                    <div class="splitter ${this._action === 'splitter-move' ? 'splitter-move' : ''}" @mousedown="${this._moveSplitter}"></div>
                    <div class="main-panel" style="flex: 1;" ?hidden="${this._widthL >= this.$id?.main.offsetWidth && !this._action !== 'splitter-move'}">
                        ${(this.selectedEditors.filter(i => !i._deleted && i.show) || []).map(i => html`
                            ${i.name === 'showdown' ? html`
                                <li-viewer-md .src="${i.value || ''}"></li-viewer-md>` : i.name === 'iframe' ? html`
                                <iframe .srcdoc="${i.htmlValue || i.value || ''}" style="width:100%;border: none; height: ${i.h + 'px' || 'auto'}"></iframe>` : html`
                                <div class="res" .item="${i}" .innerHTML="${i.htmlValue || i.value || ''}"></div>
                            `}
                        `)}
                    </div>
                </div>
            </li-layout-app>
        `;
    }
    async fnSelected(e) {
        this._item = this._expandItem = undefined;
        if (this._lPanel === 'articles') {
            this.selected = e.detail;
            await this._setSelectedEditors();
            //console.log('articles - ', 'items: ', this.selected.items.length, ' templates: ', this.selected.templates.length)
        }
        else if (this._lPanel === 'templates') {
            this.selectedTemplate = e.detail;
            //console.log('templates - ', 'items: ', this.selectedTemplate.items.length, ' templates: ', this.selectedTemplate.templates.length)
        }
        this.$update()
    }
    _settings(e) {
        const id = e.target.id,
            w = this.$id.main.offsetWidth,
            d = this.selectedEditors || [],
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
                        (this.selectedEditors || []).forEach(i => i._deleted = i.hidden);
                    }
                },
                s10: () => {
                    let invisible = 0;
                    d.forEach(i => { if (!i.show) ++invisible })
                    if (invisible && window.confirm(`Do you really want delete ${invisible} invisible box?`)) {
                        (this.selectedEditors || []).forEach(i => i._deleted = i.show);
                    }
                },
                s11: () => {
                    if (window.confirm(`Do you really want delete all?`)) {
                        (this.selectedEditors || []).forEach(i => i._deleted = true);
                    }
                },
                'Replicate db': async () => {
                    if (!window.confirm(`Do you really want replicate from couchdb Database ?`)) return;
                    this.dbWiki.destroy((err, response) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            console.log("Database Deleted");
                        }
                    });
                    this.dbWiki = new PouchDB(this.dbName);
                    this.dbWiki.replicate.from(this.dbLocalHost).on('complete', () => {
                        console.log('replicate complete');
                        setTimeout(() => {
                            document.location.reload();
                        }, 500);
                    }).on('error', (err) => {
                        return console.log(err);
                    });
                },
                'Compacting db': async () => {
                    if (!window.confirm(`Do you really want compacting current Database ?`)) return;
                    this.dbWiki.compact().then(function(info) {
                        console.log('compaction complete');
                    }).catch(function(err) {
                        return console.log(err); f
                    });
                    this.dbLocalHost.compact().then(function(info) {
                        console.log('compaction complete');
                    }).catch(function(err) {
                        return console.log(err);
                    });
                },
                'Clear db': async () => {
                    if (!window.confirm(`WARNING!!! Do you really want clear current local Database and remote CouchDB Database if any (clear from _deleted)?`)) return;
                    let _doc;
                    await this.dbWiki.allDocs({ include_docs: true }, (error, doc) => {
                        if (error) console.error(error);
                        else {
                            _doc = doc;
                        };
                    });
                    if (!_doc) return;
                    _doc = _doc.rows.map(({ doc }) => doc);
                    await this.dbLocalHost.destroy((err, response) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            console.log("Database Deleted");
                        }
                    });
                    await this.dbWiki.destroy((err, response) => {
                        if (err) {
                            return console.log(err);
                        } else {
                            console.log("Database Deleted");
                        }
                    });
                    this.dbWiki = new PouchDB(this.dbName);
                    this.dbLocalHost = new PouchDB(this.dbIP + this.dbName);
                    this.dbWiki.sync(this.dbLocalHost, { live: true });
                    await this.dbWiki.bulkDocs(
                        _doc,
                        { new_edits: false },
                        (...args) => {
                            console.log('DONE', args)
                        }
                    );
                    setTimeout(() => {
                        document.location.reload();
                    }, 500);
                },
                'Export db': async () => {
                    await this.dbWiki.allDocs({ include_docs: true }, (error, doc) => {
                        if (error) console.error(error);
                        else {
                            const content = new Blob([JSON.stringify(doc.rows.map(({ doc }) => doc))], { type: 'text/plain' });
                            this._download(content);
                        };
                    });
                },
                'Export dbFile': async () => {
                    await this.dbWiki.allDocs({ include_docs: true }, (error, doc) => {
                        if (error) console.error(error);
                        else {
                            const content = new Blob([JSON.stringify(doc.rows.map(({ doc }) => doc))], { type: 'text/plain' });
                            this._download(content, '_data.json');
                        };
                    });
                },
                'Import db': ({ target: { files: [file] } }) => {
                    if (!window.confirm(`Do you really want rewrite current Database ?`)) return;
                    if (file) {
                        this.dbLocalHost.destroy((err, response) => {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log("Database Deleted");
                            }
                        });
                        this.dbWiki.destroy(async (err, response) => {
                            if (err) {
                                return console.log(err);
                            } else {
                                console.log("Database Deleted");
                                const reader = new FileReader();
                                reader.onload = async ({ target: { result } }) => {
                                    result = JSON.parse(result);
                                    console.log(result)
                                    this.dbWiki = new PouchDB(this.dbName);
                                    this.dbLocalHost = new PouchDB(this.dbIP + this.dbName);
                                    this.dbWiki.sync(this.dbLocalHost, { live: true });
                                    await this.dbWiki.bulkDocs(
                                        result,
                                        { new_edits: false },
                                        (...args) => {
                                            this.$update();
                                            console.log('DONE', args)
                                        }
                                    );
                                };
                                reader.readAsText(file);
                                setTimeout(() => {
                                    document.location.reload();
                                }, 500);
                            }
                        });
                    }
                }
            }
        if (fn[id]) {
            this._item = this._expandItem = undefined;
            fn[id](e);
            this.$update();
        }
    }
    _download(content, fileName, contentType = 'text/plain') {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        if (fileName) {
            a.download = fileName;
            a.click();
        } else {
            window.open(a.href, '_blank');
        }
    }
    get _star() { return this._lPanel === 'articles' ? this['_star-articles'] || this.articles : this['_star-templates'] || this.templates }
    get _items() { return this._lPanel === 'articles' ? this.articles : this.templates }
    get _flat() { return this._lPanel === 'articles' ? this._articles : this._templates }
    get _selected() { return this._lPanel === 'articles' ? this.selected : this.selectedTemplate }
    get _label() { return this._lPanel === 'articles' ? 'new-article' : 'new-template' }
    _treeActions(e, title, confirm = true) {
        title = title || e.target.title;
        const fn = {
            'add new': async () => {
                let item = new ITEM({ type: this._lPanel, label: this._label, parent: this._selected, parentId: this._selected._id, changed: true })
                this._selected.items.splice(this._selected.items.length, 0, item);
                this._selected.expanded = true;
                this._flat[item._id] = item;
                this._changedList.add(item._id);
                this.$update();
            },
            'collapse': () => {
                LIUtils.arrSetItems(this._selected, 'expanded', false);
            },
            'expand': () => {
                LIUtils.arrSetItems(this._selected, 'expanded', true);
            },
            'set selected as root': (e) => {
                if (e.target.toggled && this._selected?.items?.length)
                    this['_star-' + this._lPanel] = this._selected;
                else {
                    this['_star-' + this._lPanel] = undefined;
                    e.target.toggled = false;
                }
            },
            'delete': async () => {
                this._items[0].checked = false;
                const itemToDelete = LIUtils.arrFindItem(this._items[0], 'checked', true);
                if (!itemToDelete || (confirm && !window.confirm(`Do you really want delete selected and all children ${this._lPanel}?`))) return;
                Object.keys(this._flat).forEach(k => {
                    if (this._flat[k].checked) {
                        this._flat[k].checked = false;
                        this._flat[k]._deleted = true;
                        this._deletedList.add(k);
                        this._flat[k]._templatesId?.forEach(i => this._deletedList.add(i));
                        this._flat[k].templatesId?.forEach(i => this._deletedList.add(i));
                    }
                })
                this._refreshTree = true;
            },
            'clear deleted': () => {
                Object.keys(this._flat).forEach(k => {
                    if (this._flat[k]._deleted) this._flat[k]._deleted = false;
                })
                //LIUtils.arrSetItems(this._items[0], '_deleted', false);
            },
            'save': async () => {
                await this._saveTreeAction('articles');
                await this._saveTreeAction('templates');
                this._updateTree();

                if (this._lPanel === 'articles') {
                    this._editors = {};
                    this._setSelectedEditors();
                }
                Object.keys(this._articles).forEach(k => this._articles[k].setEditors = false);
                this._deletedList = [];
                this._changedList = [];
            },
            'saveTreeState': async () => {
                await this._saveTreeState();
            }
        }
        if (fn[title]) {
            fn[title](e);
            this.$update();
        }
    }
    _updateTree() {
        if (!this._refreshTree) return;
        if (this._lPanel === 'articles') {
            this._articles = {};
            this.articles = undefined;
            requestAnimationFrame(async () => {
                this.rootArticle = new ITEM({ ...await this.dbWiki.get('$wiki:articles') });
                this.articles = [this.rootArticle]
                this._articles = await this._createTree('articles');
                this.selected = this._articles[this._localStore['selected-articles']] || this.articles[0];
            });
        } else {
            this._templates = {};
            this.templates = undefined;
            requestAnimationFrame(async () => {
                this.rootTemplate = new ITEM({ ...await this.dbWiki.get('$wiki:templates') });
                this.templates = [this.rootTemplate]
                this._templates = await this._createTree('templates');
                this.selectedTemplate = this._templates[this._localStore['selected-templates']] || this.templates[0];
            });
        }
        this._refreshTree = false;
    }
    async _saveTreeAction(type) {
        if (!type) return;
        const f = this['_' + type];
        if (this._changedList?.length) {
            const items = await this.dbWiki.allDocs({ keys: this._changedList, include_docs: true });
            const res = [];
            items.rows.map(i => {
                if (i.doc) {
                    if (i.key.startsWith('editors') && this._editors?.[i.key]) i.doc = { ...i.doc, ...this._editors[i.key].doc };
                    else if (f[i.key]?.doc) i.doc = { ...i.doc, ...f[i.key].doc };
                    res.add(i.doc);
                    this._changedList.remove(i.key);
                }
            })
            this._changedList.forEach(i => {
                if (i.startsWith('editors') && this._editors?.[i]) res.add(this._editors[i].doc);
                else if (f[i]) res.add(f[i].doc);
            })
            await this.dbWiki.bulkDocs(res);
        }
        if (this._deletedList?.length) {
            const items = await this.dbWiki.allDocs({ keys: this._deletedList, include_docs: true });
            const res = [];
            items.rows.map(i => {
                if (i.doc) {
                    i.doc._deleted = true;
                    res.add(i.doc);
                }
            })
            await this.dbWiki.bulkDocs(res);
        }
    }
    async _saveTreeState() {
        const
            type = this._lPanel,
            f = this['_' + type],
            expanded = [];
        Object.keys(f).map(k => { if (f[k]?.expanded) expanded.push(k) });
        let _ls = {};
        try {
            _ls = await this.dbWiki.get('_local/store')
        } catch (error) { }
        _ls._id = '_local/store';
        _ls['selected-' + type] = type === 'articles' ? this.selected?._id || '' : this.selectedTemplate?._id || '';
        _ls['expanded-' + type] = expanded;
        _ls['starId-' + type] = this['_star-' + type]?._id || undefined;
        await this.dbWiki.put(_ls);
        this._localStore = await this.dbWiki.get('_local/store');
    }

    _addBox(e) {
        this._item = this._expandItem = undefined;
        const label = e.target.innerText;
        let item = new BOX({ type: 'editors', name: label, label, show: true, h: 120, value: '', changed: true });
        item.parent = this.selected;
        this._editors = this._editors || {};
        this._editors[item._id] = item;
        this.selectedEditors.splice(this.selectedEditors.length, 0, item);
        this._changedList.add(item._id);
        this.$update();
    }

    async firstUpdated() {
        super.firstUpdated();
        this.dbName = this.dbName || 'wiki';
        this.dbIP = this.dbIP || 'http://admin:54321@localhost:5984/';
        setTimeout(async () => {
            this.dbWiki = new PouchDB(this.dbName);
            this.dbLocalHost = new PouchDB(this.dbIP + this.dbName);
            this.dbWiki.sync(this.dbLocalHost, { live: true });

            if (this._firstLoadDemoDB) {
                const response = await fetch(LI.$url.replace('li.js', 'li/wiki/data.json'));
                const text = await response.text();
                await this.dbWiki.bulkDocs(
                    JSON.parse(text),
                    { new_edits: false }
                );
                this._firstLoadDemoDB = false;
            }

            try { this.rootArticle = await this.dbWiki.get('$wiki:articles') } catch (error) { }
            if (!this.rootArticle) {
                await this.dbWiki.put((new ITEM({ _id: '$wiki:articles', label: 'wiki-articles', type: 'articles' })).doc);
                this.rootArticle = await this.dbWiki.get('$wiki:articles');
            }
            this.rootArticle = new ITEM({ ...this.rootArticle });
            try { this.rootTemplate = await this.dbWiki.get('$wiki:templates') } catch (error) { }
            if (!this.rootTemplate) {
                await this.dbWiki.put((new ITEM({ _id: '$wiki:templates', label: 'wiki-templates', type: 'templates' })).doc);
                this.rootTemplate = await this.dbWiki.get('$wiki:templates');
            }
            this.rootTemplate = new ITEM({ ...this.rootTemplate });

            this.articles = [this.rootArticle];
            this.templates = [this.rootTemplate];
            try {
                this._localStore = await this.dbWiki.get('_local/store');
            } catch (error) { }
            this._localStore = this._localStore || {};

            this._articles = await this._createTree('articles');
            this._templates = await this._createTree('templates');
            this.selected = this._articles[this._localStore['selected-articles']] || this.articles[0];
            this.selectedTemplate = this._templates[this._localStore['selected-templates']] || this.templates[0];
            if (this._localStore['starId-articles']) {
                this['_star-articles'] = this._articles[this._localStore['starId-articles']] || undefined;
                this.$refs.star.toggled = true;
            }
            if (this._localStore['starId-templates']) {
                this['_star-templates'] = this._templates[this._localStore['starId-templates']] || undefined;
                //this.$refs.star.toggled = true;
            }

            await this._setSelectedEditors();

            Object.keys(this._articles).forEach(k => this._articles[k].changed = false);
            Object.keys(this._templates).forEach(k => this._templates[k].changed = false);
            LI.listen(document, 'needSave', (e) => {
                //console.log(e.detail);
                if (e?.detail?._id && e?.detail?.type === '_deleted') this._deletedList.add(e.detail._id);
                else if (e?.detail?._id && !this._deletedList.includes(e.detail._id)) this._changedList.add(e.detail._id);
            });

            this.$update();
        }, 100);
    }
    async _createTree(type) {
        const
            items = await this.dbWiki.allDocs({ include_docs: true, startkey: type, endkey: type + '\ufff0' }),
            flat = {},
            tree = this[type],
            rootParent = '$wiki:' + type;
        items.rows.forEach(i => flat[i.doc._id] = new ITEM({ ...i.doc }));
        Object.values(flat).forEach(f => {
            if (f['parentId'] === rootParent) {
                f.parent = tree[0];
                tree[0].items.push(f);
            } else {
                const i = flat[f['parentId']];
                if (i) {
                    i.items = i.items || [];
                    f.parent = i;
                    i.items.push(f);
                } else {
                    f['parentId'] = rootParent;
                    f.parent = tree[0];
                    tree[0].items.push(f);
                    f._deleted = true;
                }
            }
        });
        flat[rootParent] = this[type][0];
        this._localStore['expanded-' + type]?.forEach(k => flat[k] ? flat[k].expanded = true : '');
        return flat;
    }
    async _setSelectedEditors() {
        if (!this._selected || this._selected.setEditors || !this._selected.templatesId) return;
        this._editors = this._editors || {};
        const temps = await this.dbWiki.allDocs({ keys: this.selected.templatesId, include_docs: true });
        this._selected.templates.splice(0);
        temps.rows.forEach(i => {
            if (i.doc) {
                const box = new BOX({ ...i.doc, changed: false });
                this._selected.templates.push(box);
                this._editors[i.id] = box;
            }
        });
        this._selected.setEditors = true;
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

    get selectedEditors() {
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
                    <li-button class="btn" name="delete" title="delete box" @click="${this._deleteBox}" size="20"></li-button>
                    <div style="width:8px"></div>
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

    _deleteBox() {
        if (window.confirm(`Do you really want delete box?`)) {
            this.item._deleted = true;
            this.item.hidden = true;
            this._expandItem = undefined;
            LI.fire(document, 'needSave', { type: 'changed', _id: this.selected._id, e: 'deleteBox' });
            this.$update();
        }
    }
    _stepMoveBox(v) {
        let indx = this.selectedEditors.indexOf(this.item);
        let itm = this.selectedEditors.splice(this.selectedEditors.indexOf(this.item), 1);
        this.selectedEditors.splice(indx + v, 0, itm[0]);
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
        let itm = this.selectedEditors.splice(this.selectedEditors.indexOf(this._item), 1);
        let indx = this.selectedEditors.indexOf(this.item) + shadowOffset;
        this.selectedEditors.splice(indx, 0, itm[0]);
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
