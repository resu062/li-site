import { LitElement, html } from '../../../../lib/lit-element/lit-element.js';

class LiContainer extends LitElement {

    constructor() {
        super()
        this.opened = false
    }

    static get properties() {
        return {
            opened: { type: Boolean }
        }
    }

    render() {
        return html`
<style>
    .container {
        position: fixed;
        right: 0px;
        bottom: 0px;
    }
</style>
<div class="container">
    <slot></slot>
</div>
`
    }
}

customElements.define('li-container', LiContainer);

class LiDropdown extends LitElement {

    constructor() {
        super()
        this.opened = false
    }

    _onSlotted(e) {
        console.log(e);
    }

    static get properties() {
        return {
            opened: { type: Boolean }
        }
    }

    render() {
        return html`
        <slot @slotchange="${this._onSlotted}"></slot>
`
    }
}

customElements.define('li-dropdown', LiDropdown);