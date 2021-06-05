import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../editor-ace/editor-ace.js'

customElements.define('li-editor-showdown', class LiEditorShowdown extends LiElement {
    static get properties() {
        return {
            src: { type: String, default: '' },
            item: { type: Object }
        }
    }

    get value() {
        return this.editor.getValue() || '';
    }
    set value(v) {
        this.editor.setValue(v || '');
    }

    render() {
        return html`
            <li-editor-ace ref="editor"></li-editor-ace>
        `
    }

    firstUpdated() {
        super.firstUpdated();
        setTimeout(() => {
            this._update();
        }, 100);
    }

    _update() {
        if (!this.$refs?.editor?.editor) return;
        this.editor = this.$refs.editor.editor;
        this.editor.setTheme('ace/theme/solarized_light');
        this.editor.getSession().setMode('ace/mode/markdown');
        this.editor.setOptions({ fontSize: 16, maxLines: Infinity, minLines: 100, });
        this.value = this.item?.value || this.src || '';
        this.editor.getSession().on('change', () => {
            this.item.value = this.value;
            this.$update();
        });
    }
})
