import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import '../button/button.js';

class LiLayoutApp extends LitElement {
    static get properties() {
        return {
            outside: { type: Boolean, reflect: true }, sides: { type: String }, minSize: { type: Number },
            _move: { type: String }, _indx: { type: Number },
            _widthL: { type: Number }, _widthR: { type: Number },
            __widthL: { type: Number }, __widthR: { type: Number },
            lll : {type: Boolean}
        }
    }
    constructor() {
        super();
        let prop = {
            outside: false, sides: '240, 240, 1, 1', minSize: 128, _indx: -1, lll: false, rrr: false
        }
        for (let i in prop) this[i] = prop[i];
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.sides) {
            let s = this.sides.split(',');
            this.__widthL = this._widthL = this._lastWidthL = this._l = Number(s[0]);
            this.__widthR = this._widthR = this._lastWidthR = this._r = Number(s[1]) || this._l;
            this._t = Number(s[2]);
            this._b = Number(s[3]) || this._t;

        }
    }
    _movePanel(panel) {
        this._move = panel;
        this._indx = 999;
    }
    _up(e) {
        e.preventDefault();
        this._indx = -1;
        if (this.__widthL >= document.body.clientWidth - this.__widthR && this._move === 'left')
            this.__widthL = document.body.clientWidth - this.__widthR - minSize;
        else if (this.__widthR >= document.body.clientWidth - this.__widthL && this._move === 'right')
            this.__widthR = document.body.clientWidth - this.__widthL - minSize;

        this._widthL = this.__widthL;
        this._widthR = this.__widthR;
        if (this._widthL < this.minSize) {
            this._widthL = this.__widthL = 0;
            this._lastWidthL = this.minSize;
            this._l = this._l < 0 ? this._l : this._l * -1;
        }
        if (this._widthR < this.minSize) {
            this._widthR = this.__widthR = 0;
            this._lastWidthR = this.minSize;
            this._r = this._r < 0 ? this._r : this._r * -1;
        }
        this._move = '';
        window.dispatchEvent(new Event('resize'));
    }
    _mousemove(e) {
        if (!this._move) return;
        e.preventDefault();
        if (this._move === 'left') this._widthL = this.__widthL = this.__widthL + e.movementX;
        if (this._move === 'right') this._widthR = this.__widthR = this.__widthR - e.movementX;
    }
    _hideL(e) {
        this._l = this._l * -1;
        let l = this._lastWidthL;
        this._lastWidthL = this._widthL;
        this._widthL = this.__widthL = this._l < 0 ? 0 : l;
        window.dispatchEvent(new Event('resize'));
    }
    _hideR(e) {
        this._r = this._r * -1;
        let r = this._lastWidthR;
        this._lastWidthR = this._widthR
        this._widthR = this.__widthR = this._r < 0 ? 0 : r;
        window.dispatchEvent(new Event('resize'));
    }
    static get styles() {
        return css`
            .temp {
                position: fixed;
                top: 0; left: 0; bottom: 0; right: 0;
            }
            .pnl-l-spl,
            .pnl-r-spl {
                max-width: 4px;
                min-width: 4px;
                cursor: col-resize;
                /* position: fixed;
                top: 0;
                bottom: 0; */
                z-index: 9;
            }
        `;
    }

    get border() {
        return '1px solid lightgray'
    }
    get styleLP() {
        return `border-right: ${this.border}; max-width: ${this._widthL}px; overflow-x: hidden; overflow-y: auto;flex: 0 0 ${this._widthL}px;
            ${this.lll ? 'position: absolute; left:0;top:36px;bottom:0;z-index:1;background:white;transition: 1s' : ''}`
    }
    get leftPanel() {
        return this._l ? html`
            <div style="${this.styleLP}">
                <slot name="app-left"></slot>
            </div>
        ` : "";
    }
    get styleRP() {
        return `border-left: ${this.border}; width: ${this._widthR}px; overflow-x: hidden; overflow-y: auto;flex: 0 0 ${this._widthR}px;
            ${this.rrr ? 'position: absolute; right:0;top:36px;bottom:0;z-index:1;background:white;transition: 1s' : ''}`
    }
    get rightPanel() {
        return this._r ? html`
            <div style="${this.styleRP}">
                <slot name="app-right"></slot>
            </div>
        ` : "";
    }
    get mainPanel() {
        return html`
            <div style="flex: 1 1 auto; overflow: auto;width:100%; min-width: 200px">
                <slot name="app-main"></slot>
            </div>
        `
    }
    get topPanel() {
        return this._t ? html`
            <div style="border-bottom: ${this.border}; display: flex; align-items: center; justify-content: center">
                ${this._l ? html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" ?toggleded="${this._widthL <= this.minSize}" toggle="left" style="padding:2px; cursor: pointer;z-index:2" @click="${this._hideL}"></li-button>` : ""}
                <div style="flex:1"><slot name="app-top"></slot></div>
                ${this._r ? html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" ?toggleded="${this._widthR <= this.minSize}" toggle="right" style="padding:2px; cursor: pointer;z-index:2" @click="${this._hideR}"></li-button>` : ""}
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
    get leftSplitter() {
        return this._l ? html`<div class="pnl-l-spl" style=" background: ${this._move === "left" ? 'darkgray' : ''}" @mousedown="${e => this._movePanel('left')}"></div>` : "";
    }
    get rightSplitter() {
        return this._r ? html`<div class="pnl-r-spl" style=" background: ${this._move === "right" ? 'darkgray' : ''}" @mousedown="${e => this._movePanel('right')}"></div>` : "";
    }
    get tempPanel() {
        return html`<div class="temp" @mousemove="${this._mousemove}" @mouseup="${this._up}" style="z-index: ${this._indx}" @mouseout="${this._up}"></div>`
    }
    get body() {
        return this.outside ?
            html`
                <div style="display: flex; height: 100%;">
                    ${this.leftPanel}
                    ${this.leftSplitter}
                    <div style="display: flex; flex-direction: column;overflow:hidden; flex:1;">
                        ${this.topPanel}
                        ${this.mainPanel}
                        ${this.bottomPanel}
                    </div>
                    ${this.rightSplitter}
                    ${this.rightPanel}
                </div>
            ` :
            html`
                <div style="display: flex; flex-direction: column; height: 100%;">
                    ${this.topPanel}
                    <div style="display: flex; flex: 1;overflow: hidden;">
                        ${this.leftPanel}
                        ${this.leftSplitter}
                        ${this.mainPanel}
                        ${this.rightSplitter}
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
        `;
    }
}

customElements.define('li-layout-app', LiLayoutApp);
