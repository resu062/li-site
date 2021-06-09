import { LiElement, html, css } from '../../li.js';

import '../editor-ace/editor-ace.js'

customElements.define('li-editor-iframe', class LiEditorIFrame extends LiElement {
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
        this.editor.setValue(v || '', -1);
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
    
    updated(changedProperties) {
        if ((changedProperties.has('src') || changedProperties.has('item')) && this.editor) {
            this.value = this.item?.value || this.src || '';
            this.$update();
        }
    }

    _update() {
        if (!this.$refs?.editor?.editor) return;
        this.editor = this.$refs.editor.editor;
        this.editor.setTheme('ace/theme/chrome');
        this.editor.getSession().setMode('ace/mode/html');
        this.editor.setOptions({ fontSize: 16, maxLines: Infinity, minLines: 100, });
        this.value = this.item?.value || this.src || '';
        this.editor.getSession().on('change', () => {
            if (this.item) {
                this.item.value = this.value;
                this.$update();
            }
        });
    }
})
