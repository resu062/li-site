import { LiElement, html, css } from '../../li.js';

import 'https://cdn.jsdelivr.net/npm/suneditor@latest/dist/suneditor.min.js';

customElements.define('li-editor-suneditor', class LiEditorSunEditor extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' },
            item: { type: Object }
        }
    }

    get value() {
        return this.editor.getContents() || '';
    }
    set value(v) {
        this.editor.setContents(v);
    }

    render() {
        return html`
            <link href="https://cdn.jsdelivr.net/npm/suneditor@latest/dist/css/suneditor.min.css" rel="stylesheet">
            <textarea ref="editor" hidden></textarea>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this._update();
        }, 100);
        
    }

    _update() {
        this.editor = SUNEDITOR.create(this.$refs?.editor, {
            height: '100%',
            width: '100%',
            buttonList: [
                ['undo', 'redo',
                    'font', 'fontSize', 'formatBlock',
                    'paragraphStyle', 'blockquote',
                    'bold', 'underline', 'italic', 'strike', 'subscript', 'superscript',
                    'fontColor', 'hiliteColor', 'textStyle',
                    'removeFormat',
                    'outdent', 'indent',
                    'align', 'horizontalRule', 'list', 'lineHeight',
                    'table', 'link', 'image', 'video', 'audio', /** 'math', */ // You must add the 'katex' library at options to use the 'math' plugin.
                    /** 'imageGallery', */ // You must add the "imageGalleryUrl".
                    //'fullScreen', 
                    'showBlocks', 'codeView',
                    //'preview', 'print', 'save', 'template'
                ]
            ]
        });
        this.value = this.item?.value || this.src || '';
        this.editor.onChange = () => { 
            if (this.item) {
                this.item.value = this.value;
                this.$update();
            }
        }
    }
})
