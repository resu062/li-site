import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import '../button/button.js';

class LiLayoutPanel extends LitElement {
    static get properties() {
        return {

        }
    }
    constructor() {
        super();
        let prop = {}
        for (let i in prop) this[i] = prop[i];
    }
    connectedCallback() {
        super.connectedCallback();

    }

    static get styles() {
        return css`

        `;
    }

    render() {
        return html`
            
        `;
    }
}

customElements.define('li-layout-panel', LiLayoutPanel);
