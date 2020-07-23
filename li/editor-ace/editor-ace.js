import { LitElement, html } from '../../lib/lit-element/lit-element.js';
import './src/ace.js'

customElements.define('li-editor-ace', class LiAceEditor extends LitElement {
    static get properties() {
        return {
            src: { type: String }, mode: { type: String }, theme: { type: String }
        }
    }

    constructor() {
        super();
        this.src = '';
        this.mode = 'javascript';
        this.theme = 'solarized_light';
    }

    render() {
        return html`
<style>
    #host {
        width:100%;
    }
    #editor {
        height: 400px;
    }
</style>
<div id="host">
    <div id="editor"></div>
</div>
`
    }

    updated() {
        let ed = this.shadowRoot.getElementById('editor');
        ace.config.set('basePath', '/li/editor-ace/src/');
        this.editor = ace.edit(ed, { autoScrollEditorIntoView: true });
        this.editor.setTheme('ace/theme/' + this.theme);
        this.editor.getSession().setMode('ace/mode/' + this.mode);
        this.editor.setValue(this.src);
        this.editor.renderer.attachToShadowRoot();
        this.editor.setOptions({ maxLines: 40, minLines: 40, fontSize: 20 });
        this.editor.session.selection.clearSelection();
    }
})
