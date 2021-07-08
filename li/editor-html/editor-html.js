import { LiElement, html, css } from '../../li.js';

import './src/pell.js'
import '../button/button.js';
import '../editor-ace/editor-ace.js'

customElements.define('li-editor-html', class LiEditorHTML extends LiElement {
    static get properties() {
        return {
            src: { type: String },
            editable: { type: Boolean, default: true },
            item: { type: Object },
            _showSource: { type: Boolean }
        }
    }

    get value() {
        return this.editor?.content?.innerHTML || '';
    }
    set value(v) {
        this.editor.content.innerHTML = v;
    }

    static get styles() {
        return css`
            :host {
               display: relative; 
            }
            .pell {
                border: 1px solid rgba(10, 10, 10, 0.1);
                box-sizing: border-box;
            }
            .pell-content {
                box-sizing: border-box;
                outline: 0;
                overflow-y: auto;
                padding: 10px;
            }
            .pell-actionbar {
                display: flex;
                background-color: rgb(240, 240, 240);
                border: 1px solid rgba(10, 10, 10, 0.1);
                position: sticky;
                top: 0px;
                z-index: 1;
                flex-wrap: wrap;
            }
            .pell-button {
                background-color: white;
                border: solid 1px lightgray;
                border-radius: 2px;
                margin: 1px;
                cursor: pointer;
                height: 24px;
                outline: 0;
                width: 30px;
                vertical-align: bottom;
            }
            .pell-button-selected {
                background-color: rgb(220, 220, 220);
            }
            .pell-button:hover {
                background-color: rgb(230, 230, 230);
            }

            ::-webkit-scrollbar {
                width: 4px;
                height: 4px;
            }
            ::-webkit-scrollbar-track {
                background: lightgray;
            }
            ::-webkit-scrollbar-thumb {
                background-color: gray;
            }
        `;
    }
    render() {
        return html`
                <div ref="editor" ?hidden="${this._showSource}"></div>
                <div ?hidden="${!this._showSource}">
                    <li-button name="refresh" size="14"                       
                        @click="${() => { this._showSource = false; this.editor.content.innerHTML = this.ace.getValue() }}"></li-button>
                    <li-editor-ace ref="ace"></li-editor-ace>
                </div>
                

        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this._update();
        }, 100);
    }

    updated(changedProperties) {
        if (this.editor) {
            if (changedProperties.has('src')) {
                this.value = this.src;
                if (this.item)
                    this.item.value = this.value;
                this.$update();
            }
            if (changedProperties.has('item')) {
                this.value = this.item?.value || '';
                this.$update();
            }
        }
    }

    _update() {
        if (!this.editor) {
            this.ace = this.$refs.ace.editor;
            this.ace.setTheme('ace/theme/chrome');
            this.ace.getSession().setMode('ace/mode/html');
            this.ace.setOptions({ fontSize: 16, maxLines: Infinity, minLines: 100, });
            this.ace.getSession().on('change', () => {
                this.value = this.ace.getValue() || '';
                if (this.item) this.item.value = this.value;
                this.$update();
            });

            this.editor = pell.init({
                element: this.$refs.editor,
                onChange: () => { if (this.item) this.item.value = this.value; this.$update() },
                actions: [
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'heading1',
                    'heading2',
                    'heading3',
                    'heading4',
                    'heading5',
                    'heading6',
                    {
                        name: 'foreColor',
                        icon: '&#9734;',
                        title: 'foreColor',
                        result: async () => {
                            try {
                                const host = await LI.createComponent('dropdown');
                                const res = await host.show(await LI.createComponent('color-picker'));
                                if (res) pell.exec('foreColor', res.component.value);
                            } catch (error) { }
                        }
                    },
                    {
                        name: 'backColor',
                        icon: '&#9733',
                        title: 'backColor',
                        result: async () => {
                            try {
                                const host = await LI.createComponent('dropdown');
                                const res = await host.show(await LI.createComponent('color-picker'));
                                if (res) pell.exec('backColor', res.component.value);
                            } catch (error) { }
                        }
                    },
                    'olist',
                    'ulist',
                    'paragraph',
                    'quote',
                    'code',
                    'line',
                    'link',
                    'image',
                    'video',
                    'html',
                    {
                        name: 'Commands',
                        icon: '✓',
                        title: 'Commands',
                        result: function result() {
                            var url = window.prompt('c-center, f-full, l-left, r-right, i-indent, o-outdent, 1-7 fontSize, s-subScript, u-superScript, z-unLink, <-undo, >-redo, x-removeFormat');
                            if (url) {
                                url = url.toLowerCase();
                                switch (url) {
                                    case 'c':
                                        url = 'justifyCenter'
                                        break;
                                    case 'f':
                                        url = 'justifyFull'
                                        break;
                                    case 'l':
                                        url = 'justifyLeft'
                                        break;
                                    case 'r':
                                        url = 'justifyRight'
                                        break;
                                    case 'x':
                                        url = 'removeFormat'
                                        break;
                                    case 'i':
                                        url = 'inDent'
                                        break;
                                    case 'o':
                                        url = 'outDent'
                                        break;
                                    case 's':
                                        url = 'subScript'
                                        break;
                                    case 'u':
                                        url = 'superScript'
                                        break;
                                    case 'z':
                                        url = 'unLink'
                                        break;
                                    case '<':
                                        url = 'undo'
                                        break;
                                    case '>':
                                        url = 'redo'
                                        break;
                                    case '1': case '2': case '3': case '4': case '5': case '6': case '7':
                                        pell.exec('fontSize', url);
                                        return;
                                }
                                pell.exec(url);
                            }
                        }
                    },
                    {
                        name: 'viewSource',
                        icon: '&lt;/&gt;',
                        title: 'View source code',
                        result: () => {
                            this._showSource = true;
                            this.ace.setValue(this.editor.content.innerHTML);
                        }
                    },
                ],
            });
        }
        this.editor.content.contentEditable = this.editable;
        this.value = this.src || this.item?.value || '';
    }

    _open() {
        let newWin = window.open("about:blank", "HTML");
        newWin.document.write(this.value);
    }
})
