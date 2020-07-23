import { LitElement, html } from '../../lib/lit-element/lit-element.js';

class LiDropdown extends LitElement {

    constructor() {
        super()
        this.opened = false
        this.component = undefined
        this.count = 0
    }

    // connectedCallback() {
    //     super.connectedCallback();
    //     document.addEventListener('readystatechange', this.handleChange);
    // }

    // disconnectedCallback() {
    //     document.removeEventListener('readystatechange', this.handleChange);
    //     super.disconnectedCallback();
    // }

    show(comp, props = {}) {
        for (let p in props) {
            this[p] = props[p];
        }
        this.component = comp;
        this.appendChild(this.component)
        if (!this.parentElement)
            document.body.appendChild(this);
        return new Promise((resolve, reject) => {
            LI.listen('ok', () => {
                resolve(this.component);
            }, { target: this })
            LI.listen('close', () => {
                reject();
            }, { target: this })
        })
    }
    close() {
        this.opened = false;
        LI.fire(this, 'close', this.component);
        if (this.parentElement === document.body)
            document.body.removeChild(this);
    }
    ok() {
        this.opened = false;
        LI.fire(this, 'ok', this.component);
        if (this.parentElement === document.body)
            document.body.removeChild(this);
    }

    _onSlotted(e) {
        const els = e.target.assignedElements();
        if (els.length) {
            setTimeout(() => {
                this.component = els[0];
                this.component.style.visibility = 'visible'
            }, 10);
        }
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