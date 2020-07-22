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
        this.count = 0
    }

    show(comp, props = {}) {
        for (let p in props) {
            this[p] = props[p];
        }
        this.component = comp;
        this.appendChild(this.component)
        if (!this.parentElement)
            document.body.appendChild(this);
        console.log('isShow');
    }

    _onSlotted(e) {
        console.log(e);
        const els = e.target.assignedElements();
        if (els.length) {
            setTimeout(() => {
                this.component = els[0];
                this.component.style.visibility = 'visible'
                //this.component.setAttribute('slot', 'component')
                console.log(this.component.offsetWidth, this.component.offsetHeight);
            }, 10);

        }
        // return new Promise((resolve, reject) => {
        //     this.listen('ok', e => {
        //         resolve(this.component);
        //     }, { once: true })
        //     this.listen('close', e => {
        //         reject();
        //     }, { once: true })
        // })
    }

    static get properties() {
        return {
            opened: { type: Boolean }, component: { type: Object }, count: { type: Number }
        }
    }

    render() {
        return html`
        <slot @slotchange="${this._onSlotted}"></slot>
`
    }
}

customElements.define('li-dropdown', LiDropdown);