import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import { styleMap } from '../../lib/lit-html/directives/style-map.js';

customElements.define('li-dropdown', class LiDropdown extends LitElement {
    static get properties() {
        return {
            opened: { type: Boolean }, component: { type: Object }, count: { type: Number }, size: { type: Object }, parent: { type: Object }
        }
    }
    constructor() {
        super();
        this.opened = false;
        this.component = undefined;
        this.count = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        LI.listen('keydown', this._keyDown.bind(this), { target: window, useCapture: true });
        LI.listen('mousedown', this._close.bind(this), { target: window, useCapture: true });
        LI.listen('resize', this._close.bind(this), { target: window, useCapture: true });
        LI.listen('wheel', this._close.bind(this), { target: window, useCapture: true });
        this._setSize();
    }
    disconnectedCallback() {
        LI.unlisten('keydown', this._keyDown.bind(this), { target: window, useCapture: true });
        LI.unlisten('mousedown', this._close.bind(this), { target: window, useCapture: true });
        LI.unlisten('resize', this._close.bind(this), { target: window, useCapture: true });
        LI.unlisten('wheel', this._close.bind(this), { target: window, useCapture: true });
        super.disconnectedCallback();
    }

    show(comp, props = {}) {
        for (let p in props) {
            this[p] = props[p];
        }
        if (comp) {
            this.component = comp;
            this.appendChild(this.component);
        }
        if (!this.parentElement) document.body.appendChild(this);
        return new Promise((resolve, reject) => {
            LI.listen('ok', () => resolve(this.component), { target: this });
            LI.listen('close', () => reject(), { target: this });
        })
    }
    close() {
        this.opened = false;
        LI.fire(this, 'close', this.component);
        if (this.parentElement === document.body) document.body.removeChild(this);
    }
    ok() {
        this.opened = false;
        LI.fire(this, 'ok', this.component);
        if (this.parentElement === document.body) document.body.removeChild(this);
    }

    _onSlotted(e) {
        const els = e.target.assignedElements();
        if (els.length) {
            setTimeout(() => {
                this.component = els[0];
                this.component.style.visibility = 'visible'
                this._setSize();
            }, 10);
        }
    }

    _setSize(repeat = false) {
        if (!this.component) return;
        requestAnimationFrame(() => {
            let size = {}//{ left: '0px', top: '0px' };
            //this.size = { ...{}, ...size };
            let containerSize = this.component.getBoundingClientRect();
            const rect = new LIRect(this.parent);
            const h = containerSize.height,
                w = containerSize.width,
                l = rect.left,
                t = this.intersect ? rect.top : rect.bottom,
                r = window.innerWidth - rect.left,
                b = window.innerHeight - t;
            size = {};
            size.minWidth = this.parent && this.parent.offsetWidth > this.minWidth ? this.parent.offsetWidth - 2 : this.minWidth || w;
            if (this.useParentWidth && this.parent) size.maxWidth = this.parent.offsetWidth - 2;
            else if (this.maxWidth) size.maxWidth = this.maxWidth > size.minWidth ? this.maxWidth : size.minWidth;
            if (this.maxHeight) size.maxHeight = this.maxHeight;
            if (b > h) {
                size.maxHeight = b;
                size.top = t;
            } else {
                if (this.parent) {
                    if (h >= t && b >= t) {
                        size.top = t;
                        size.bottom = 0;
                    } else {
                        size.top = (rect.top - h < 0 ? 0 : rect.top - h);
                        size.maxHeight = rect.top - 4;
                    }
                } else {
                    size.bottom = 0;
                }
            }
            if (r > w) {
                size.left = l;
            } else {
                if (this.parent && this.useParentWidth) {
                    size.left = l;
                } else {
                    size.right = 0;
                }
            }
            Object.keys(size).forEach(k => size[k] += 'px');
            console.log(size)

            this.size = { ...{}, ...size };
            this._ready = true;
            //if (repeat) this._ready = true;
            //else this._setSize(true);
        });
    }
    _keyDown(e) {
        console.log('_keyDown')
        if (e.keyCode === 27) this.close();
    }
    _close(e) {
        let dd = this;
        while (dd) {
            if (dd.contains(e.target)) {
                if (e.type === 'resize' && this._offsetHeight !== e.target.offsetHeight) {
                    this._setSize();
                    this._offsetHeight = e.target.offsetHeight;
                }
                return;
            }
            dd = dd.nextElementSibling;
        }
        this.close();
    }
    static get styles() {
        return css`
div { 
    position: fixed;
}
`;
    }
    render() {
        return html`
<div style=${styleMap({ ...this.size })}>
    <slot @slotchange="${this._onSlotted}"></slot>
</div>
`;
    }
});
