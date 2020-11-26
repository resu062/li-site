import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';

customElements.define('li-xxx', class LiXXX extends LiElement {
    render() {
        return html`
            <h3>Misc DEMO</h3>
        `;
    }
});
