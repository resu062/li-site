import { LitElement, html } from '../../lib/lit-element/lit-element.js';
import '../layout-app/layout-app.js';

customElements.define('li-app', class LiApp extends LitElement {

    constructor() {
        super()
    }

    static get properties() {
        return {}
    }

    render() {
        return html`
            <style>
            </style>
            <h3>
                Coming soon...
            </h3>
        `;
    }

});