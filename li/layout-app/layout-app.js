import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import '../button/button.js';

class LiLayoutApp extends LitElement {
    static get properties() {
        return {
            outside: { type: Boolean, reflect: true }, hide: { type: String },
            widthL: { type: Number }, widthR: { type: Number },
            _move: { type: String }, _indx: { type: Number },
            _widthL: { type: Number }, _widthR: { type: Number },
            _hl: { type: String }, _hr: { type: String },
        }
    }
    constructor() {
        super();
        let prop = { // hide => 'lrtb' (left, right, top, bottom)
            outside: false, hide: '', widthL: 300, widthR: 300,
            _widthL: 300, _widthR: 300, _lastWidthL: 300, _lastWidthR: 300, _move: '', _indx: -1, _hl: '', _hr: ''
        }
        for (let i in prop) this[i] = prop[i];
        if (this.hide.includes('l')) this._widthL = this.widthL = 0;
        if (this.hide.includes('r')) this._widthR = this.widthR = 0;
    }
    _movePanel(panel) {
        this._move = panel;
        this._indx = 999;
    }
    _up(e) {
        e.preventDefault();
        this._indx = -1;
        if (this._widthL >= document.body.clientWidth - this._widthR && this._move === 'left')
            this._widthL = document.body.clientWidth - this._widthR - 200;
        else if (this._widthR >= document.body.clientWidth - this._widthL && this._move === 'right')
            this._widthR = document.body.clientWidth - this._widthL - 200;
        this._lastWidthL = this.widthL = this._widthL;
        this._lastWidthR = this.widthR = this._widthR;
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
        this._hl = this._hl ? '' : 'outl';
        let l = this._lastWidthL;
        this._lastWidthL = this.widthL;
        this._widthL = this.widthL = (this.widthL > 34 ? 0 : l <= 34 ? 300 : l);
        window.dispatchEvent(new Event('resize'));
    }
    _hideR(e) {
        this._hr = this._hr ? '' : 'outr';
        let r = this._lastWidthR;
        this._lastWidthR = this.widthR
        this._widthR = this.widthR = (this.widthR > 34 ? 0 : r <= 34 ? 300 : r);
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
                position: absolute;
                top: 0; bottom: 0;
                width: 6px;
                cursor: col-resize;
                z-index: 9;
            }
            .outl {
	            transform: translateX(-100%);
            }
            .outr {
	            transform: translateX(100%);
            }       
        `;
    }

    get border() { 
        return '1px solid lightgray'
    }
    get leftPanel() {
        return this.hide.includes('l') ? '' : html`
            <div class="${this._hl}" style="border-right: ${this.border}; width: ${this.widthL}px; overflow: auto; flex: 0 0 ${this.widthL}px;">
                <slot name="app-left"></slot>
            </div>
        `
    }
    get rightPanel() {
        return this.hide.includes('r') ? '' : html`
            <div class="${this._hr}" style="border-left: ${this.border}; width: ${this.widthR}px; overflow: auto; flex: 0 0 ${this.widthR}px;">
                <slot name="app-right"></slot>
            </div>
        `
    }
    get mainPanel() {
        return html`
            <div style="flex: 1 1 auto; overflow: auto;width:100%">
                <slot name="app-main"></slot>
            </div>
        `
    }
    get topPanel() {
        return this.hide.includes('t') ? '' : html`
            <div style="border-bottom: ${this.border}; display: flex; align-items: center; justify-content: center">
                ${this.hide.includes('l') ? '' : html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" toggled="left" style="padding:2px; cursor: pointer;" @click="${this._hideL}"></li-button>`}
                <div style="flex:1"><slot name="app-top"></slot></div>
                ${this.hide.includes('r') ? '' : html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" toggled="right" style="padding:2px; cursor: pointer;" @click="${this._hideR}"></li-button>`}
            </div>
        `
    }
    get bottomPanel() {
        return this.hide.includes('b') ? '' : html`
            <div style="border-top: ${this.border};">
                <slot name="app-bottom"></slot>
            </div>
        `
    }
    get leftSplitter() {
        return this.hide.includes('l') ? '' : html`<div class="pnl-l-spl" style="left: ${this._widthL - 2}px; background: ${this._move === "left" ? 'darkgray' : ''}" @mousedown="${e => this._movePanel('left')}"></div>`
    }
    get rightSplitter() {
        return this.hide.includes('r') ? '' : html`<div class="pnl-r-spl" style="right: ${this._widthR - 2}px; background: ${this._move === "right" ? 'darkgray' : ''}" @mousedown="${e => this._movePanel('right')}"></div>`
    }
    get tempPanel() {
        return html`<div class="temp" @mousemove="${this._mousemove}" @mouseup="${this._up}" style="z-index: ${this._indx}" @mouseout="${this._up}"></div>`
    }
    get body() { 
        return this.outside ?
            html`
                <div style="display: flex; height: 100%;">
                    ${this.leftPanel}
                    <div style="display: flex; flex-direction: column;overflow:hidden; flex:1">
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
            ${this.leftSplitter}
            ${this.rightSplitter}
            ${this.tempPanel}
        `;
    }
}

customElements.define('li-layout-app', LiLayoutApp);