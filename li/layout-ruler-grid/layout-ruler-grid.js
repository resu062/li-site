import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-layout-ruler-grid', class LiLayoutGrid extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            _width: { type: Number, default: 10000, local: true }, _height: { type: Number, default: 10000, local: true }, _gridMain: { type: Object, default: {}, local: true },
            zoom: { type: Number, default: 1 },
            _step: { type: Number, default: 10 }
        }
    }

    get _unit() { return this._step === 0.1 ? 'mm' : (this._step === 1 || this._step === 10) ? 'cm' : (this._step === 100 || this._step === 1000 || this._step === 10000) ? 'm' : 'km' }
    get _percentText() {
        return this.zoom === 1 ? '100%'
            : this.zoom < 1 ? `${this.zoom < 0.0001 ? Math.round(this.zoom * 100000000) / 1000000 : Math.round(this.zoom * 10000) / 100}%`
                : `${Math.round(this.zoom * 100)}%`;
    }
    get _sizeBig() { return this.zoom * this._step / 10 * 100 }
    get _sizeSmall() { return this._step === 0.1 ? 0 : this._sizeBig / 10 }
    get _mainHeight() { return window.innerHeight - (this.$refs?.main?.offsetTop || 0) }

    firstUpdated() {
        super.firstUpdated();
        this._gridMain = this.$refs.main;
        this.__mousewheel = this._mousewheel.bind(this);
        this._resizeRuller();
        LI.listen(this, 'mousewheel', this.__mousewheel, true);
    }

    _resizeRuler_h(zoom = this.zoom, _step = this._step) {
        const _cvWidth = this.$refs?.main?.offsetWidth;
        const _scrollDx = this.$refs?.main?.scrollLeft;
        const ctx = this._initRuler(this.$refs.ruler_h, _cvWidth, 25);
        let k = Math.round(_cvWidth / _step / zoom);
        for (let i = Math.round(_scrollDx / zoom / _step); i < Math.round(k + _scrollDx / zoom / _step); i++) {
            if (!(i % (10))) {
                ctx.fillRect(Math.round(i * zoom * _step - _scrollDx), 5, 1, 20);
                ctx.fillText(this._getTextValue(i * _step, _step), Math.round((i * zoom * _step - _scrollDx) + 5), 9, 25);
            } else if (!(i % (5)) && _step !== 0.1) ctx.fillRect(Math.round(i * zoom * _step - _scrollDx), 15, 1, 12);
            else if (_step !== 0.1) ctx.fillRect(Math.round(i * zoom * _step - _scrollDx), 20, 1, 5);
        }
    }
    _resizeRuler_v(zoom = this.zoom, _step = this._step) {
        const _cvHeight = this.$refs?.main?.offsetHeight;
        const _scrollDy = this.$refs?.main?.scrollTop;
        const ctx = this._initRuler(this.$refs.ruler_v, 25, _cvHeight);
        ctx.rotate(.5 * Math.PI);
        let k = Math.round(_cvHeight / _step / zoom);
        for (let i = Math.round(_scrollDy / zoom / _step); i < Math.round(k + _scrollDy / zoom / _step); i++) {
            if (!(i % (10))) {
                ctx.fillRect(Math.round(i * _step * zoom - _scrollDy), 0, 1, -20 - i);
                ctx.fillText(this._getTextValue(i * _step, _step), Math.round(i * _step * zoom - _scrollDy) + 5, -2, 30);
            } else if (!(i % 5) && _step !== 0.1) ctx.fillRect(Math.round(i * _step * zoom - _scrollDy), -15, 1, -12);
            else if (_step !== 0.1) ctx.fillRect(Math.round(i * _step * zoom - _scrollDy), -20, 1, -5);
        }
    }
    _initRuler(canvas, width, height) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        canvas.width = width;
        canvas.height = height;
        ctx.font = "normal 11px 'Lucida Grande', sans-serif";
        ctx.fillStyle = "#000";
        return ctx;
    }

    _getTextValue(value, _step) {
        return _step === 0.1 ? value : (_step === 1 || _step === 10) ? value / 10 : (_step === 100 || _step === 1000 || _step === 10000 ? value / 1000 : value / 1000000);
    }
    _resizeRuller() {
        this._resizeRuler_h();
        this._resizeRuler_v();
    }
    _mousewheel(e) {
        if (e.ctrlKey) {
            e.stopPropagation();
            e.preventDefault();
            const k = 0.9,
                zoom = e.deltaY > 0 ? Math.min(2000, this.zoom / k) : Math.max(1 / 100000000, this.zoom * k);
            this._scale(zoom);
        } else
            this._resizeRuller();
    }
    _scale(zoom, step) {
        this.$$.zoom = this.zoom = zoom;
        zoom = zoom > 1 ? Math.min(2000, zoom) : Math.max(1 / 100000000, zoom);
        if (zoom === 2000 || zoom === 1 / 100000000) {
            this.$$.zoom = this.zoom = zoom;
        } else {
            if (step) {
                this._step = step;
            } else {
                let _step = this._step;
                if ((_step * zoom) > 50 && this._unit !== 'mm') _step = _step / 10;
                else if ((_step * zoom) < 5) _step = _step * 10;
                this._step = _step;
            }
        }
        this._resizeRuller();
        setTimeout(() => {
            this.$$update();
        }, 10)

    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
        `;
    }

    render() {
        return html`
            <div style="font-size:12px;display:flex;align-items:center;border-bottom:1px solid lightgray;padding-bottom:4px">
                <li-button size="20" name="add" @click="${() => this._scale(this.zoom *= 1.1)}"></li-button>
                <li-button size="20" width="120" @click="${() => this._scale(1, 10)}">${this._percentText}</li-button>
                <li-button size="20" name="remove" @click="${() => this._scale(this.zoom *= 0.9)}"></li-button>
                <li-button size="20" name="grid-off"></li-button>
                <slot nameg="gridTopLeft"></slot>
                <div style="flex:1"></div>
                <slot nameg="gridTopCenter"></slot>
                <div style="flex:1"></div>
                <slot nameg="gridTopRight"></slot>
            </div>
            <div style="display:flex;height:25px;margin-bottom:5px">
                <div style="font-size:12px;min-width:30px;max-width:30px">${this._unit}</div>
                <canvas ref="ruler_h"></canvas>
            </div>
            <div style="display:flex;">
                <div style="width:25px;margin-right:5px"><canvas ref="ruler_v"></canvas></div>
                <div ref="main" style="height:${this._mainHeight};position:relative;overflow:auto;" @mousewheel="${this._resizeRuller}">
                    <svg width=${this._width} height="${this._height}" :preserve-aspect-ratio="'xMinYMin meet'">
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
                        <rect width="100%" height="100%" fill="url(#grid)" vector-effect="non-scaling-stroke"></rect>
                    </svg>
                    <slot name="layout-grid-main"></slot>
                </div>
            </div>
        `;
    }

    _tops() {
        return [
            { is: 'oda-button', slot: 'gridTopLeft', icon: 'grid-off', title: 'hide grid', toggled: 'hideGrid' },
            { is: 'oda-button', slot: 'gridTopCenter', icon: 'zoom-in', title: 'zoom-in', zoom: 1.1 },
            { is: 'oda-button', slot: 'gridTopCenter', title: '100%', zoom: 1, percent: 'ok' },
            { is: 'oda-button', slot: 'gridTopCenter', icon: 'zoom-out', title: 'zoom-out', zoom: 0.9 },
        ]
    }
    _percent() {
        return this.zoom === 1 ? '100%'
            : this.zoom < 1 ? `${this.zoom < 0.0001 ? Math.round(this.zoom * 100000000) / 1000000 : Math.round(this.zoom * 10000) / 100}%`
                : `${Math.round(this.zoom * 100)}%`;
    }
});
