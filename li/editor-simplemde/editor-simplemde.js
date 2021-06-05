import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../../lib/simplemde/simplemde.min.js'

customElements.define('li-editor-simplemde', class LiEditorSimpleMDE extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' },
            item: { type: Object }
        }
    }

    get value() {
        return this.editor.options.previewRender(this.editor.value()) || '';
    }
    set value(v) {
        this.editor.value(v);
    }

    render() {
        return html`
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css">
            <link rel="stylesheet" href="../../lib/simplemde/simplemde.min.css">
            <textarea ref="editor"></textarea>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        this._update();
    }

    _update() {
        this.editor = new SimpleMDE({
            element: this.$refs.editor,
            blockStyles: {
                bold: "__",
                italic: "_"
            },
            hideIcons: ['side-by-side', 'fullscreen'],
            renderingConfig: {
                singleLineBreaks: true,
                codeSyntaxHighlighting: true,
            },
            showIcons: ['code', 'table', 'strikethrough', 'clean-block', 'horizontal-rule'],
            spellChecker: false,
            status: false,
            tabSize: 4,
            toolbarTips: true,
        });
        this.value = this.item?.value || this.src || '';
        if (this.item)
            this.item.htmlValue = this.value;
        this.editor.codemirror.on('change', () => {
            if (this.item) {
                this.item.htmlValue = this.value;
                this.item.value = this.editor.value(); 
                this.$update();
            }
        });
    }
})
