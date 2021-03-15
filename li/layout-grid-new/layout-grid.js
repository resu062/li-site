import { html, css, svg } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-layout-grid', class LiLayoutGrid extends LiElement {
    static get properties() {
        return {
            _partid: { type: String, default: '', update: true },
            width: { type: Number, default: 0, local: true },
            height: { type: Number, default: 0, local: true },
            zoom: { type: Number, default: 1, local: true },
            _w: { type: Number, default: 0, local: true },
            _h: { type: Number, default: 0, local: true },
            _gridMain: { type: Object, default: {}, local: true },
            _step: { type: Number, default: 10 }
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this._gridMain = this.$refs.main;
        this.__mousewheel = this._mousewheel.bind(this);
        LI.listen(this, 'mousewheel', this.__mousewheel, true);
        window.addEventListener('scroll', () => { this._update() });
        window.addEventListener('resize', () => { this._update() });
    }
    _update() {

        this.$update();
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family:Verdana, Geneva, Tahoma, sans-serif;
                color: gray;
                /* border: 1px solid red; */
                width:99.6%;
                height: 99.4%;
                margin: auto;
            }
        `;
    }

    render() {
        return html`
            <div style="display:flex;align-items:center;border-bottom:1px solid lightgray;padding:2px">
                <slot name="gridTopLeft"></slot>
                <div style="flex:1"></div>
                <slot name="gridTopCenter"></slot>
                <div style="flex:1"></div>
                <slot name="gridTopRight"></slot>
                <li-button size="20" name="grid-off"></li-button>
                <li-button size="20" name="add" @click="${() => this._setStep(this.zoom *= 1.1)}"></li-button>
                <li-button size="20" width="120" @click="${() => this._setStep(1, 10)}">${this._percent}</li-button>
                <li-button size="20" name="remove" @click="${() => this._setStep(this.zoom *= 0.9)}"></li-button>
            </div>
            <div style="display:flex;height:24px;margin-bottom:5px">
                <div style="font-size:12px;min-width:30px;max-width:30px">${this._unit}</div>
                <svg style="flex:1">
                    ${this._rulerHCount.map(i => svg`
                        <line x1="${i * this._sizeBig - this._scrollLeft}" y1="4" x2="${i * this._sizeBig - this._scrollLeft}" y2="24" fill="none" stroke="gray" stroke-width="1"></line>
                        <line x1="${i * this._sizeBig - this._scrollLeft + this._sizeBig / 2}" y1="14" x2="${i * this._sizeBig - this._scrollLeft + this._sizeBig / 2}" y2="30" fill="none" stroke="gray" stroke-width="1"></line>
                        <text x="${i * this._sizeBig + 4 + -this._scrollLeft}" y="12" style="font-size:12px;fill:gray">${i * this._unitVal}</text>
                    `)}
                </svg>
            </div>
            <div ref="main" style="display:flex;">
                <svg style="min-width:30px;width:30px" preserve-aspect-ratio="xMinYMin meet">
                    ${this._rulerVCount.map(i => svg`
                        <line x1="2" y1="${i * this._sizeBig - this._scrollTop}" x2="28" y2="${i * this._sizeBig - this._scrollTop}" fill="none" stroke="gray" stroke-width="1"></line> -->
                        <line x1="16" y1="${i * this._sizeBig - this._scrollTop + this._sizeBig / 2}" x2="28" y2="${i * this._sizeBig - this._scrollTop + this._sizeBig / 2}" fill="none" stroke="gray" stroke-width="1"></line>
                        <text x="${i * this._sizeBig + 4 - this._scrollTop}" y="0" style="font-size:12px;fill:gray;transform: rotate(90deg);">${i * this._unitVal}</text>
                    `)}
                </svg>
                <div ref="grid" style="height:${this._mainHeight};position:relative;overflow:auto;" @mousewheel="${this._resizeRuller}"  @scroll="${() => this.$update()}">
                    <svg width=${this._w} height="${this._h}" :preserve-aspect-ratio="'xMinYMin meet'">
                        <defs>
                            <pattern id="smallGrid" patternUnits="userSpaceOnUse" width="${this._sizeSmall}" height="${this._sizeSmall}">
                                <line x1="0" y1="0" x2="0" fill="none" stroke="gray" stroke-width="0.5" vector-effect="non-scaling-stroke" y2="${this._sizeSmall}"></line>
                                <line x1="0" y1="0" y2="0" fill="none" stroke="gray" stroke-width="0.5" vector-effect="non-scaling-stroke" x2="${this._sizeSmall}"></line>
                            </pattern>
                            <pattern id="grid" patternUnits="userSpaceOnUse" width="${this._sizeBig}" height="${this._sizeBig}">
                                <rect width="100%" height="100%" fill="url(#smallGrid)"></rect>
                                <line x1="0" y1="0" x2="0" fill="none" stroke="gray" stroke-width="1" vector-effect="non-scaling-stroke" y2="${this._sizeBig}"></line>
                                <line x1="0" y1="0" y2="0" fill="none" stroke="gray" stroke-width="1" vector-effect="non-scaling-stroke" x2="${this._sizeBig}"></line>
                            </pattern>
                        </defs>
                        <rect width="${this._w}" height="${this._h}" fill="url(#grid)" vector-effect="non-scaling-stroke"></rect>
                    </svg>
                    <div style="position:absolute;flex:1;top:0">
                        <slot></slot>
                    </div>
                </div>
            </div>
        `;
    }

    get _w() { return this.width || (this.$refs?.main?.offsetWidth + this.$refs?.grid?.scrollLeft + 100) || 0 }
    set _w(v) { }
    get _h() { return this.height || (this.$refs?.main?.offsetHeight + this.$refs?.grid?.scrollTop + 100) || 0 }
    set _h(v) { }
    get _scrollLeft() { return this.$refs?.grid?.scrollLeft || 0 }
    set _scrollLeft(v) { }
    get _scrollTop() { return this.$refs?.grid?.scrollTop || 0 }
    set _scrollTop(v) { }

    get _mainHeight() { return window.innerHeight - (this.$refs?.main?.offsetTop || 0) }
    get _unit() {
        return this._step === 0.1 ? 'mm'
            : (this._step === 1 || this._step === 10) ? 'cm'
                : (this._step === 100 || this._step === 1000 || this._step === 10000) ? 'm'
                    : 'km';
    }
    get _unitVal() {
        return this._step === 0.1 ? 1
            : (this._step === 1 || this._step === 10) ? this._step
                : (this._step === 100 || this._step === 1000 || this._step === 10000) ? this._step / 100
                    : this._step / 100000;
    }
    get _sizeBig() { return this.zoom * this._step * 10 }
    get _sizeSmall() { return this._step === 0.1 ? 0 : this._sizeBig / 10 }
    get _rulerHCount() { return [...new Array(Math.ceil((window.outerWidth + this._scrollLeft) / this._sizeBig) || 1).keys()] }
    get _rulerVCount() { return [...new Array(Math.ceil((window.outerHeight + this._scrollTop) / this._sizeBig) || 1).keys()] }
    get _percent() {
        return this.zoom === 1 ? '100%'
            : this.zoom < 1 ? `${this.zoom < 0.0001 ? Math.round(this.zoom * 100000000) / 1000000 : Math.round(this.zoom * 10000) / 100}%`
                : `${Math.round(this.zoom * 100)}%`;
    }
    _mousewheel(e) {
        if (!(e.ctrlKey || e.optionKey)) return;
        e.stopPropagation();
        e.preventDefault();
        const k = 0.9;
        this.zoom = e.deltaY > 0 ? Math.min(400, this.zoom / k) : Math.max(1 / 100000000, this.zoom * k);
        this._setStep();
    }
    _setStep(zoom = this.zoom, _step = this._step) {
        if (zoom === 1) {
            this.zoom = 1;
            this._step = 10;
            this._update();
            return;
        }
        zoom = zoom > 1 ? Math.min(400, zoom) : Math.max(1 / 100000000, zoom);
        if (zoom === 400 || zoom === 1 / 100000000) {
            this.zoom = zoom;
        } else {
            if ((_step * zoom) > 50) _step = _step / 10;
            else if ((_step * zoom) < 5) _step = _step * 10;
            if (_step !== this._step) this._step = _step;
        }
        this._update();
    }
});
