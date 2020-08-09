import { html } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import './src/ace.js'
let url = import.meta.url;

customElements.define('li-editor-ace', class LiAceEditor extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' }, 
            mode: { type: String, default: 'javascript' }, 
            theme: { type: String, default: 'solarized_light' }
        }
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
        ace.config.set('basePath', url.replace('editor-ace.js', 'src/'));
        this.editor = ace.edit(ed, { autoScrollEditorIntoView: true });
        this.editor.setTheme('ace/theme/' + this.theme);
        this.editor.getSession().setMode('ace/mode/' + this.mode);
        this.editor.setValue(this.src);
        this.editor.renderer.attachToShadowRoot();
        this.editor.setOptions({ maxLines: 40, minLines: 40, fontSize: 20 });
        this.editor.session.selection.clearSelection();
    }
})
