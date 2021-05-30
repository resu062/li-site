import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import './src/pell.js'
import '../button/button.js';

customElements.define('li-editor-html', class LiEditorHTML extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' },
            editable: { type: Boolean, default: true },
            item: { type: Object }
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
        `;
    }
    render() {
        return html`
            <div ref="editor"></div>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        this._update();
    }

    _update() {
        if (!this.editor)
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
                            //     let ctrl = await ODA.createComponent('/web/lib/colors/palette/palette.html');
                            //     let val = await ODA.showDialog(ctrl, {
                            //         title: 'Select Color',
                            //         buttons: []
                            //     });
                            //     if (val) pell.exec('foreColor', val.value)
                        }
                    },
                    {
                        name: 'backColor',
                        icon: '&#9733',
                        title: 'backColor',
                        result: async () => {
                            // let ctrl = await ODA.createComponent('/web/lib/colors/palette/palette.html');
                            // let val = await ODA.showDialog(ctrl, {
                            //     title: 'Select Color',
                            //     buttons: []
                            // });

                            // if (val) pell.exec('backColor', val.value)
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
                        result: async () => {
                            // let ctrl = await ODA.createComponent('/web/lib/ace-editor/ace-editor.html');
                            // ctrl.style.height = (window.innerHeight - window.innerHeight * 0.18) + 'px';
                            // ctrl.style.width = (window.innerWidth - window.innerWidth * 0.18) + 'px';
                            // ctrl.value = this.editor.content.innerHTML;
                            // ctrl.mode = 'html';
                            // ctrl.wrap = true;
                            // ctrl.addEventListener('keydown', (e) => {
                            //     if (e.code === 'Enter') {
                            //         e.stopPropagation();
                            //     }
                            // });
                            // let val = await ODA.showDialog(ctrl, {
                            //     title: 'Ace HTML editor',
                            //     buttons: []
                            // });
                            // this.editor.content.innerHTML = val.value;
                        }
                    },
                ],
            });
        this.editor.content.contentEditable = this.editable;
        this.editor.content.innerHTML = this.item?.value || this.src || '';
    }

    _open() {
        let newWin = window.open("about:blank", "HTML");
        newWin.document.write(this.editor.content.innerHTML);
    }
})
