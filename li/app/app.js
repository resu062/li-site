import { LitElement, html } from '../../lib/lit-element/lit-element.js';
import '../layout-app/layout-app.js';

customElements.define('li-app', class LiApp extends LitElement {

    render() {
        return html`
            <li-layout-app>

            </li-layout-app>
        `;
    }

});