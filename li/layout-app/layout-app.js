import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-layout-app', class LiLayoutApp extends LiElement {
    static get properties() {
        return {
            outside: { type: Boolean, default: false, reflect: true },
            sides: { type: String, default: '240, 240', save: true },
            minSize: { type: Number, default: 128 },
            hide: { type: String, default: '' },
            over: { type: Boolean, default: false, reflect: true },
            overLeft: { type: Boolean, default: false, reflect: true },
            overRight: { type: Boolean, default: false, reflect: true },
            _indx: { type: Number, default: -1 },
            _move: { type: String, default: '' },
            _widthL: { type: Number, default: 0 },
            _widthR: { type: Number, default: 0 },
            _isOver: { type: Boolean, default: false },
        }
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.sides) {
            let s = this.sides.split(',');
            this._l = this.hide.includes('l') ? 0 : Number(s[0]) || 0;
            this._r = this.hide.includes('r') ? 0 : Number(s[1]) || 0;
            this._t = !this.hide.includes('t');
            this._b = !this.hide.includes('b');
            if (this.over || this.overLeft) this._l = this._l > 0 ? this._l * -1 : this._l;
            if (this.over || this.overRight) this._r = this._r > 0 ? this._r * -1 : this._r;

            if (this._l >= 0) this._widthL = this._lastWidthL = this._l;
            else {
                this._widthL = 0;
                this._lastWidthL = this._l * -1;
            }
            if (this._r >= 0) this._widthR = this._lastWidthR = this._r;
            else {
                this._widthR = 0;
                this._lastWidthR = this._r * -1;
            }
        }
    }
    _movePanel(panel) {
        this._move = panel;
        this._indx = 999;
    }
    _up(e) {
        e.preventDefault();
        this._indx = -1;
        // if (this._widthL >= document.body.clientWidth - this._widthR && this._move === 'left')
        //     this._widthL = document.body.clientWidth - this._widthR - this.minSize;
        // else if (this._widthR >= document.body.clientWidth - this._widthL && this._move === 'right')
        //     this._widthR = document.body.clientWidth - this._widthL - this.minSize;

        if (this._widthL < this.minSize) {
            this._widthL = this._widthL = 0;
            //this._lastWidthL = this.minSize;
            this._l = this._l < 0 ? this._l : this._l * -1;
        }
        if (this._widthR < this.minSize) {
            this._widthR = this._widthR = 0;
            //this._lastWidthR = this.minSize;
            this._r = this._r < 0 ? this._r : this._r * -1;
        }
        this.sides = (this._widthL || ('-' + (this._lastWidthL || this.minSize))) + ',' + (this._widthR || ('-' + (this._lastWidthR || this.minSize)));
        this._move = '';
        window.dispatchEvent(new Event('resize'));
    }
    _mousemove(e) {
        if (!this._move) return;
        e.preventDefault();
        if (this._move === 'left') this._widthL = this._widthL + e.movementX;
        if (this._move === 'right') this._widthR = this._widthR - e.movementX;
    }
    _hideL(e) {
        const over = this.over || this.overLeft || false;
        if (e === true && !over) return;
        let l = this._lastWidthL || this._widthL;
        this._lastWidthL = this._widthL || this._lastWidthL || this.minSize;
        if (e === true) this._l = this._l > 0 ? this._l * -1 : this._l;
        else this._l = this._l * -1;
        if (this._l > 1) {
            if (this._r > 1 && (this.over || this.overRight)) this._r = this._r * 1;
            this.isOver = this.over || this.overLeft ? true : false;
        }
        this._widthL = this._l < 0 ? 0 : l;
        this.sides = (this._widthL || ('-' + (this._lastWidthL || this.minSize))) + ',' + (this._widthR || ('-' + (this._lastWidthR || this.minSize)));
        window.dispatchEvent(new Event('resize'));
    }
    _hideR(e) {
        const over = this.over || this.overRight || false;
        if (e === true && !over) return;
        let r = this._lastWidthR || this._widthR;
        this._lastWidthR = this._widthR || this._lastWidthR || this.minSize;
        if (e === true) this._r = this._r > 0 ? this._r * -1 : this._r;
        else this._r = this._r * -1;
        if (this._r > 1) {
            if (this._l > 1 && (this.over || this.overLeft)) this._l = this._l * 1;
            this.isOver = this.over || this.overRight ? true : false;
        }
        this._widthR = this._r < 0 ? 0 : r;
        this.sides = (this._widthL || ('-' + (this._lastWidthL || this.minSize))) + ',' + (this._widthR || ('-' + (this._lastWidthR || this.minSize)));
        window.dispatchEvent(new Event('resize'));
    }
    _hideAll() {
        this._hideL(true);
        this._hideR(true);
        this.isOver = false;
    }
    static get styles() {
        return css`
            .temp {
                position: fixed;
                top: 0; left: 0; bottom: 0; right: 0;
            }
            .pnl-spl {
                top: 0;
                bottom: 0;
                position: absolute;
                max-width: 4px;
                min-width: 4px;
                cursor: col-resize;
                z-index: 9;
            }
            /* .pnl-spl:hover, */
            .pnl-spl:active {
                background: darkgray;
            }
        `;
    }

    get border() {
        return '1px solid lightgray'
    }
    get styleLP() {
        return `border-right: ${this.border}; width:${this._widthL}px; overflow-x: hidden; overflow-y: auto;flex: 0 0 ${this._widthL}px;display:flex;justify-content:space-between;
            ${this.over || this.overLeft ? 'position: absolute; left:0;top:0;bottom:0;z-index:1;background:white;transition: .5s;z-index:99;' : ''}`
    }
    get leftPanel() {
        return this._l ? html`
            <div style="${this.styleLP}">
                <slot name="app-left" style="width:${this._widthL - 4}px;display:inline-block"></slot>
                ${this.leftSplitter}
            </div>
        ` : "";
    }
    get styleRP() {
        return `border-left: ${this.border}; width: ${this._widthR}px; overflow-x: hidden; overflow-y: auto;flex: 0 0 ${this._widthR}px;display:flex;justify-content:start;
            ${this.over || this.overRight ? 'position: absolute; right:0;top:0;bottom:0;z-index:1;background:white;transition: .5s;z-index:99;' : ''}`
    }
    get rightPanel() {
        return this._r ? html`
            <div style="${this.styleRP}">
                ${this.rightSplitter}
                <slot name="app-right" style="width:${this._widthR - 4}px;display:inline-block"></slot>
            </div>
        ` : "";
    }
    get mainPanel() {
        return html`
            <div style="flex: 1 1 auto; overflow: auto;width:100%;">
                <slot name="app-main"></slot>
            </div>
        `
    }
    get topPanel() {
        return this._t ? html`
            <div style="border-bottom: ${this.border}; display: flex; align-items: center; justify-content: center">
                ${this._l ? html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" ?toggled="${this._widthL <= this.minSize}" toggledClass="left90" style="padding:2px; cursor: pointer;z-index:2" @click="${this._hideL}"></li-button>` : ""}
                <div style="display: flex; align-items: center; justify-content: center;flex:1">
                    <slot name="app-top-left">
   
                    </slot>
                    <div style="flex:1; text-align: center; justify-content: center; align-items:center">
                        <slot name="app-top">
                            
                        </slot>
                    </div>
                    <slot name="app-top-right">
                        
                    </slot>
                </div>
                ${this._r ? html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" ?toggled="${this._widthR <= this.minSize}" toggledClass="right90" style="padding:2px; cursor: pointer;z-index:2" @click="${this._hideR}"></li-button>` : ""}
            </div>
        ` : "";
    }
    get bottomPanel() {
        return this._b ? html`
            <div style="border-top: ${this.border};">
                <slot name="app-bottom"></slot>
            </div>
        ` : "";
    }
    get leftSplitter() { return html`<div class="pnl-spl" @mousedown="${e => this._movePanel('left')}" style="left:${this._widthL-2}"></div>` }
    get rightSplitter() { return html`<div class="pnl-spl" @mousedown="${e => this._movePanel('right')}" style="right:${this._widthR-2}"></div>` }
    get tempPanel() { return html`<div class="temp" @mousemove="${this._mousemove}" @mouseup="${this._up}" @mouseout="${this._up}" style="z-index: ${this._indx}"></div>` }
    get shadowPanel() { return this.isOver ? html`<div style="position:absolute;top:0;bottom:0;left:0;right:0;z-index:98;background:gray;opacity:.5;cursor:pointer;transition:5s;" @click="${this._hideAll}"></div>` : '' }
    get body() {
        return this.outside ?
            html`
                <div style="display: flex; height: 100%;">
                    ${this.leftPanel}
                    <div style="display: flex; flex-direction: column;overflow:hidden; flex:1;">
                        ${this.topPanel}
                        ${this.mainPanel}
                        ${this.bottomPanel}
                    </div>
                    ${this.rightPanel}
                </div>
            ` :
            html`
                <div style="display: flex; flex-direction: column; height: 100%;">
                    ${this.topPanel}
                    <div style="display: flex; flex: 1;overflow: hidden;">
                        ${this.leftPanel}
                        ${this.mainPanel}
                        ${this.rightPanel}
                    </div>
                    ${this.bottomPanel}
                </div>
            `
    };
    render() {
        return html`
            ${this.body}
            ${this.tempPanel}
            ${this.shadowPanel}
        `;
    }
});
