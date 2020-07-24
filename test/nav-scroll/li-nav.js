import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module';
import '../../li/icon/icon.js';

class LiNav extends LitElement {
    static get properties() {
        return {
            side: { type: String }, hide: { type: String },
            widthL: { type: Number }, widthR: { type: Number },
            _move: { type: String }, _indx: { type: Number },
            _widthL: { type: Number }, _widthR: { type: Number },
            _hl: { type: String }, _hr: { type: String }, _scroll: { type: Boolean },
        }
    }
    constructor() {
        super();
        let prop = { // side => 'in', 'top'; hide => 'lrtb' (left, right, top, bottom)
            side: 'in', hide: '', widthL: 300, widthR: 300, 
            _widthL: 300, _widthR: 300, _lastWidthL: 300, _lastWidthR: 300, _move: '', _indx: -1, _hl: '', _hr: '', _scroll: false
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
    }
    _hideR(e) {
        this._hr = this._hr ? '' : 'outr';
        let r = this._lastWidthR;
        this._lastWidthR = this.widthR
        this._widthR = this.widthR = (this.widthR > 34 ? 0 : r <= 34 ? 300 : r);
    }
    scrollPrev = '';
    _onScroll(e) {
        let scrolled = e.currentTarget.scrollTop;
        console.log(scrolled)
        if ( scrolled > 100 && scrolled > this.scrollPrev ) {
            this._scroll = true;
        } else {
            this._scroll = false;
        }
        this.scrollPrev = scrolled;
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
            .outt {
                transform: translateY(-100%);
	            opacity: 0;
                height: 0;
            }
            .outb {
	            transform: translateY(100%);
                opacity: 0;
                height: 0;
            }       
        `;
    }
    render() {
        let body = html``,
            border = '1px solid lightgray',
            leftPanel = this.hide.includes('l') ? '' : html`
                <div class="${this._hl}" style="border-right: ${border}; width: ${this.widthL}px; overflow: auto; flex: 0 0 ${this.widthL}px; transition: all .3s ease;">
                    <slot name="nav-left"></slot>
                </div>
            `,
            rightPanel = this.hide.includes('r') ? '' : html`
                <div class="${this._hr}" style="border-left: ${border}; width: ${this.widthR}px; overflow: auto; flex: 0 0 ${this.widthR}px; transition: all .3s ease;">
                    <slot name="nav-right"></slot>
                </div>
            `,
            mainPanel = html`
                <div style="flex: 1 1 auto; overflow: auto;width:100%" @scroll="${this._onScroll}">
                    <slot name="nav-main"></slot>
                </div>
            `,
            topPanel = this.hide.includes('t') ? '' : html`
                <div class="${this._scroll?'outt':''}" style="border-bottom: ${border}; display: flex; align-items: center; justify-content: center;transition: all .3s ease;">
                    ${this.hide.includes('l') ? '' : html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" toggled="left" style="padding:2px; cursor: pointer;" @click="${this._hideL}"></li-button>`}
                    <div style="flex:1"><slot name="nav-top"></slot></div>
                    ${this.hide.includes('r') ? '' : html`<li-button size=28 br="none:50%" name="hamburger" fill="gray" toggled="right" style="padding:2px; cursor: pointer;" @click="${this._hideR}"></li-button>`}
                </div>
            `,
            bottomPanel = this.hide.includes('b') ? '' : html`
                <div class="${this._scroll?'outb':''}" style="border-top: ${border};transition: all .3s ease;">
                    <slot name="nav-bottom"></slot>
                </div>
            `;
        switch (this.side) {
            case 'in':
                body = html`
                    <div style="display: flex; flex-direction: column; height: 100%;">
                        ${topPanel}
                        <div style="display: flex; flex: 1;overflow: hidden;">
                            ${leftPanel}
                            ${mainPanel}
                            ${rightPanel}
                        </div>
                        ${bottomPanel}
                    </div>
                `
                break;
            case 'top':
                body = html`
                    <div style="display: flex; height: 100%;">
                        ${leftPanel}
                        <div style="display: flex; flex-direction: column;overflow:hidden; flex:1">
                            ${topPanel}
                            ${mainPanel}
                            ${bottomPanel}
                        </div>
                        ${rightPanel}
                    </div>
                `
                break;
        }
        return html`
            <div class="temp" @mousemove="${this._mousemove}" @mouseup="${this._up}" style="z-index: ${this._indx}" @mouseout="${this._up}"></div>
            ${body}
            ${(this.hide.includes('l')) ? '' : html`<div class="pnl-l-spl" 
                style="left: ${this._widthL-2}px; background: ${this._move === "left" ? 'darkgray' : ''}" @mousedown="${e => this._movePanel('left')}"></div>`}
            ${(this.hide.includes('r')) ? '' : html`<div class="pnl-r-spl" 
                style="right: ${this._widthR-2}px; background: ${this._move === "right" ? 'darkgray' : ''}" @mousedown="${e => this._movePanel('right')}"></div>`}
        `;
    }
}
customElements.define('li-nav', LiNav);
