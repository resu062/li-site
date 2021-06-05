import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../../lib/simplemde/simplemde.min.js'
import '../button/button.js';

customElements.define('li-editor-simplemde', class LiEditorSimpleMDE extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' },
            editable: { type: Boolean, default: true },
            item: { type: Object }
        }
    }

    get value() {
        return this.editor.options.previewRender(this.editor.value()) || '';
    }
    set value(v) {
        this.editor.value(v);
    }

    static get styles() {
        return css`

        `;
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
            // autofocus: true,
            // autosave: {
            //     enabled: true,
            //     uniqueId: "MyUniqueID",
            //     delay: 1000,
            // },
            // blockStyles: {
            //     bold: "__",
            //     italic: "_"
            // },
            // forceSync: true,
            hideIcons: ['side-by-side', 'fullscreen'],
            // indentWithTabs: false,
            // initialValue: "Hello world!",
            // insertTexts: {
            //     horizontalRule: ["", "\n\n-----\n\n"],
            //     image: ["![](http://", ")"],
            //     link: ["[", "](http://)"],
            //     table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
            // },
            // lineWrapping: false,
            // parsingConfig: {
            //     allowAtxHeaderWithoutSpace: true,
            //     strikethrough: false,
            //     underscoresBreakWords: true,
            // },
            // placeholder: "Type here...",
            // previewRender: function(plainText) {
            //     return customMarkdownParser(plainText); // Returns HTML from a custom parser
            // },
            // previewRender: function(plainText, preview) { // Async method
            //     setTimeout(function(){
            //         preview.innerHTML = customMarkdownParser(plainText);
            //     }, 250);
        
            //     return "Loading...";
            // },
            // promptURLs: true,
            // renderingConfig: {
            //     singleLineBreaks: false,
            //     codeSyntaxHighlighting: true,
            // },
            // shortcuts: {
            //     drawTable: "Cmd-Alt-T"
            // },
            // showIcons: ["code", "table"],
            spellChecker: false,
            status: false,
            // status: ["autosave", "lines", "words", "cursor"], // Optional usage
            // status: ["autosave", "lines", "words", "cursor", {
            //     className: "keystrokes",
            //     defaultValue: function(el) {
            //         this.keystrokes = 0;
            //         el.innerHTML = "0 Keystrokes";
            //     },
            //     onUpdate: function(el) {
            //         el.innerHTML = ++this.keystrokes + " Keystrokes";
            //     }
            // }], // Another optional usage, with a custom status bar item that counts keystrokes
            // styleSelectedText: false,
            // tabSize: 4,
            // toolbar: true,
            toolbarTips: true,
        });
        this.value = this.item?.value || this.src || '';
        if (this.item)
            this.item.htmlValue = this.value;
        this.editor.codemirror.on("change", () => {
            if (this.item) {
                this.item.htmlValue = this.value;
                this.item.value = this.editor.value(); 
                this.$update();
            }
        });
    }
})
