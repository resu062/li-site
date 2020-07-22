import { LitElement, html } from '../lib/lit-element/lit-element.js';

class LiApp extends LitElement {

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
`
    }
}

customElements.define('li-app', LiApp);