import './src/ace.js'
import './webpack-resolver.js'

customElements.define('cs-ace-editor', class extends HTMLElement {
    constructor() {
        super();
        ace.config.set("basePath", "./src/")
        let shadow = this.attachShadow({ mode: "closed" });
        let dom = require("ace/lib/dom");
        dom.buildDom(
            ["div", { id: "host" },
                ["div", { id: "editor" }],
                ["style", `
                    #host {
                        width:100%;
                    }
                    #editor {
                        height: 400px;
                    }
                `]
            ], shadow);
            this.aceEditor = ace.edit(shadow.querySelector("#editor"), {
            theme: "ace/theme/solarized_light",
            mode: "ace/mode/javascript",
            value: this.src,
            autoScrollEditorIntoView: true
        });
        this.aceEditor.renderer.attachToShadowRoot();
    }
    connectedCallback() {
        this.src = this.getAttribute('src');
        if (this.src) this.aceEditor.setValue(this.src);
    }
});
