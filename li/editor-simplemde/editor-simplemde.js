import { LiElement, html, css } from '../../li.js';

import 'https://cdnjs.cloudflare.com/ajax/libs/simplemde/1.11.2/simplemde.min.js';

customElements.define('li-editor-simplemde', class LiEditorSimpleMDE extends LiElement {
    static get properties() {
        return {
            src: { type: String },
            item: { type: Object }
        }
    }

    get value() {
        return this.editor.options.previewRender(this.editor.value()) || '';
    }
    set value(v) {
        this.editor.value(v);
        if (this.item)
            this.item.htmlValue = this.value;
    }

    static get styles() {
        return css`
            *::-webkit-scrollbar {
                width: 4px;
            }
            *::-webkit-scrollbar-track {
                background: lightgray;
            }
            *::-webkit-scrollbar-thumb {
                background-color: gray;
            }
        `;
    }
    
    render() {
        return html`
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/simplemde/1.11.2/simplemde.min.css">
            <textarea ref="editor"></textarea>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        this._update();
    }

    updated(changedProperties) {
        if (this.editor) {
            if (changedProperties.has('src')) {
                this.value = this.src;
                if (this.item) {
                    this.item.value = this.editor.value();
                    this.item.htmlValue = this.value;
                }
                this.$update();
            }
            if (changedProperties.has('item')) {
                this.value = this.item?.value || '';
                if (this.item)
                    this.item.htmlValue = this.value;
                this.$update();
            }
        }
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
        this.value = this.src || this.item?.value || '';
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
