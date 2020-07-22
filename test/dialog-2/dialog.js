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
        this.component = undefined
    }

    show() {
        let el = document.createElement('li-dropdown');
        el.appendChild(this.component);
        //this.component.setAttribute('slot', 'component')
        document.body.appendChild(el);
    }

    _onSlotted(e) {
        console.log(e);
        const els = e.target.assignedElements();
        if (els.length) {
            setTimeout(() => {
                this.component = els[0];
                this.component.style.visibility = 'visible'
                console.log(this.component.offsetWidth, this.component.offsetHeight);
            }, 10);

        }
    }

    static get properties() {
        return {
            opened: { type: Boolean }, component: { type: Object }
        }
    }

    render() {
        return html`
        123
        <slot @slotchange="${this._onSlotted}"></slot>
        <slot name="component"></slot>
`
    }
}

customElements.define('li-dropdown', LiDropdown);