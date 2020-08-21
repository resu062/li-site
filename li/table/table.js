import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import './src/tabulator.js';
import { tabulatorStyles } from './src/styles.js';


customElements.define('li-table', class LiTable extends LiElement {
    
    static get properties() {
        return {
            options: {
                type: Object,
                default: undefined,
                hasChanged(n, o) {
                    if (n) return true;
                }
            },
            label: { type: String, default: '' },
            str: { type: String, default: '' }
        }
    }

    static get styles() {
        return tabulatorStyles;
    }

    render() {
        return html`
            <div id="label">${this.label}</div>
            <div id="table"></div>
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        this.hidden = true;
        this.$table = new Tabulator(this.$id.table, this.options);
        setTimeout(() => {
            this.hidden = false;
        }, 300);
    }

    updated() {
        this.firstUpdated();
    }
    
});
