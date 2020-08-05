import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-layout-panel', class LiLayoutPanel extends LiElement {
    static get properties() {
        return {

        }
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
});
