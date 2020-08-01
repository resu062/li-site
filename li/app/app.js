import { LitElement, html } from '../../lib/lit-element/lit-element.js';
import '../layout-app/layout-app.js';

customElements.define('li-app', class LiApp extends LitElement {

    render() {
        return html`
            <li-layout-app hide="LR" fill="#9f731350">
                 <img slot="app-top" src="/li.png" style="max-width:64px;max-height:64px;padding:4px">
            </li-layout-app>
        `;
    }

});