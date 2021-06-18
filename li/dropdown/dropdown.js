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
            maxHeight: { type: Number, default: undefined, reflect: true },
            align: { type: String, default: 'bottom' }
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
            LI.listen(this, 'ok', (e) => resolve({ component: this.component, detail: e.detail.detail }));
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
        const res = e && e.detail || this.component;
        LI.fire(this, 'ok', { detail: res });
        if (this.parentElement === document.body) document.body.removeChild(this);
        return res;
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
    _setSize() {
        const rect = LIRect(this.parent);
        if (!this.component || !rect.ok) return;
        this.contentRect = this.component.getBoundingClientRect()
        let top = rect.top;
        let left = rect.left
        let height = this.contentRect?.height || 0;
        let width = this.contentRect?.width || 0;
        if (!height || !width) {
            top += 'px';
            left += 'px';
            return { top, left };
        }

        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let maxHeight = winHeight;
        let maxWidth = winWidth;
        let minHeight = this.minHeight || height;
        let minWidth = this.minWidth || width;
        let right = left + width;
        let bottom = top + height;

        let parentWidth = rect.width;
        if (rect.right > winWidth)
            parentWidth += winWidth - rect.right;
        if (rect.left < 0)
            parentWidth += rect.left;

        let size = {};
        this._steps = this._steps || [];
        switch (this.align) {
            case 'left': {
                right = this.intersect ? rect.right : rect.left;
                left = right - width;
                if (this.parent) {
                    if (left < 0) {
                        this.align = this._steps.includes('right') ? 'bottom' : 'right';
                        this._steps.push('right');
                        this._setSize();
                    }
                }
            } break;
            case 'right': {
                left = this.intersect ? rect.left : rect.right;
                right = left + width;
                if (this.parent) {
                    if (right > winWidth) {
                        this.align = this._steps.includes('left') ? 'bottom' : 'left';
                        this._steps.push('right');
                        this._setSize();
                    }
                }
            } break;
            case 'top': {
                bottom = this.intersect ? rect.bottom : rect.top;
                top = bottom - height;
                if (this.parent) {
                    if (this.useParentWidth) minWidth = maxWidth = parentWidth;
                    else {
                        if (width < parentWidth) minWidth = parentWidth;
                        if (right > winWidth) size.right = 0;
                    }
                    left = left < 0 ? 0 : left;
                    top = top < 0 ? 0 : top;
                    if (bottom > winHeight) size.bottom = 0;;
                    maxHeight = bottom - top;
                    if (height / 2 > maxHeight && winHeight - rect.bottom > rect.top) {
                        this.align = this._steps.includes('bottom') ? 'top' : 'bottom';
                        if (this.align === 'bottom') {
                            this._steps.push('top');      
                            this._setSize();
                        }
                    }
                }
            } break;
            case 'bottom':
            default: {
                top = this.intersect ? rect.top : rect.bottom;
                bottom = top + height;
                if (this.parent) {
                    if (this.useParentWidth) minWidth = maxWidth = parentWidth;
                    else {
                        if (width < parentWidth) minWidth = parentWidth;
                        if (right > winWidth) size.right = 0;
                    }
                    left = left < 0 ? 0 : left;
                    top = top < 0 ? 0 : top;
                    if (bottom > winHeight) size.bottom = 0;;
                    maxHeight = winHeight - top;
                    if (height / 2 > maxHeight &&  rect.top > winHeight - rect.bottom) {
                        this.align = this._steps.includes('top') ? 'bottom' : 'top';
                        if (this.align === 'top') {
                            this._steps.push('bottom');      
                            this._setSize();
                        }
                    }
                }
            } break;
        }

        if (!this.parent) {
            top = top < 0 ? 0 : top;
            left = left < 0 ? 0 : left;
            if (bottom > winHeight) size.bottom = 0
            if (right > winWidth) size.right = 0;
        } else {
            if (this.align === 'left' || this.align === 'right') {
                if (this.useParentWidth) minWidth = maxWidth = parentWidth;
                if ((height && top) > winHeight - top) {
                    top = rect.bottom - height;
                    top = top < 0 ? 0 : top;
                    maxHeight = winHeight - top;
                } else if (bottom >= winHeight) size.bottom = 0;
            }
        }
        minWidth = minWidth > maxWidth ? maxWidth : minWidth;
        minHeight = minHeight > maxHeight ? maxHeight : minHeight;

        size = { ...size, ...{ maxWidth, minWidth, minHeight, maxHeight } };
        if (!size.hasOwnProperty('bottom')) size.top = top;
        if (!size.hasOwnProperty('right')) size.left = left;
        Object.keys(size).forEach(k => size[k] += 'px');
        this.size = { ...{}, ...size };
        this._steps = [];
        return size;
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
