import { LiElement, html, css, styleMap } from '../../li.js';

customElements.define('li-dropdown', class LiDropdown extends LiElement {
    static get properties() {
        return {
            component: { type: Object, default: undefined },
            opened: { type: Boolean, default: false },
            size: { type: Object, default: {} },
            useParent: { type: Boolean, default: false, reflect: true },
            hFactor: { type: Number, default: 1, reflect: true },
            useParentWidth: { type: Boolean, default: false, reflect: true },
            useParentHeight: { type: Boolean, default: false, reflect: true },
            intersect: { type: Boolean, default: false, reflect: true },
            minWidth: { type: Number, default: undefined, reflect: true },
            maxWidth: { type: Number, default: undefined, reflect: true },
            maxHeight: { type: Number, default: undefined, reflect: true }
        }
    }

    constructor() {
        super();
        this.__ok = this.ok.bind(this);
        this.__keyup = this._keyup.bind(this);
        this.__close = this._close.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        LI.listen(window, 'dropdownDataChange', this.__ok, true);
        LI.listen(window, 'keyup', this.__keyup, true);
        LI.listen(window, 'mousedown, resize, wheel', this.__close, true);
        this._setSize();
    }
    disconnectedCallback() {
        LI.unlisten(window, 'dropdownDataChange', this.__ok, true);
        LI.unlisten(window, 'keyup', this.__keyup, true);
        LI.unlisten(window, 'mousedown, resize, wheel', this.__close, true);
        super.disconnectedCallback();
    }

    show(comp, props = {}) {
        for (let p in props) this[p] = props[p];
        if (comp) {
            this.component = comp;
            this.appendChild(this.component);
        }
        if (!this.parentElement) document.body.appendChild(this);
        this._setSize();
        this.opened = true;
        return new Promise((resolve, reject) => {
            LI.listen(this, 'ok', (e) => resolve({ component: this.component, detail: e.detail.detail}));
            LI.listen(this, 'close', () => reject());
        })
    }
    close() {
        this.opened = false;
        LI.fire(this, 'close', this.component);
        if (this.parentElement === document.body) document.body.removeChild(this);
    }
    ok(e) {
        this.opened = false;
        LI.fire(this, 'ok', { detail: e && e.detail || this.component});
        if (this.parentElement === document.body) document.body.removeChild(this);
    }

    _slotChange(e) {
        const els = e.target.assignedElements();
        if (els.length) {
            setTimeout(() => {
                this.component = els[0];
                this._setSize();
                this.component.style.visibility = 'visible';
            }, 10);
        }
    }
    _setSize(repeat = false) {
        const rect = LIRect(this.parent);
        if (!this.component || !rect.ok) return;
        requestAnimationFrame(() => {
            let size = {},
                containerSize = this.component.getBoundingClientRect();
            const h = containerSize.height,
                w = containerSize.width,
                l = rect.left,
                t = this.intersect ? rect.top : rect.bottom,
                r = window.innerWidth - rect.left,
                b = window.innerHeight - t;

            if (this.useParent && this.parent) {
                let s = this.parent.getBoundingClientRect();
                //size.bottom = s.bottom;
                let f = s.height * (this.hFactor || 1);
                f = f > b ? b : f;
                size.height = size.maxHeight = f;
                size.left = s.left;
                size.right = s.right;
                size.top = s.top;
                size.width = size.maxWidth = s.width;
                Object.keys(size).forEach(k => size[k] += 'px');
                this.size = { ...{}, ...size };
                return;
            }

            size.minWidth = this.parent && this.parent.offsetWidth > this.minWidth ? this.parent.offsetWidth : this.minWidth || w;
            if (this.useParentWidth && this.parent) size.width = size.maxWidth = this.parent.offsetWidth;
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
            this.size = { ...{}, ...size };
        });
    }
    _keyup(e) {
        if (e.keyCode === 27) this.close();
        if (e.keyCode === 13) this.ok();
    }
    _close(e) {
        let el = this;
        while (el) {
            if (e.target !== window && el.contains(e.target)) {
                if (e.type === 'resize' && this._offsetHeight !== e.target.offsetHeight) {
                    this._setSize();
                    this._offsetHeight = e.target.offsetHeight;
                }
                return;
            }
            el = el.nextElementSibling;
        }
        this.close();
    }

    static get styles() {
        return css`
            div { 
                position: fixed;
                overflow-y: auto;
                z-index: 99;
            }
        `;
    }
    render() {
        return html`
            <div id="dropdown" style=${styleMap({ ...this.size, visibility: this.opened ? 'visible' : 'hidden' })}>
                <slot id="component" name=${this.opened ? '' : '?'} @slotchange="${this._slotChange}"></slot>
            </div>
        `;
    }
});
