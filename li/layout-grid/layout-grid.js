import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-layout-grid', class LiLayoutGrid extends LiElement {
    static get properties() {
        return {
            zoom: { type: Number, default: 10 },
            _step: { type: Number, default: 1 },
            _width: { type: Number, default: 10000 },
            _height: { type: Number, default: 10000 }
        }
    }

    get _unit() { return this._step === 0.1 ? 'mm' : (this._step === 1 || this._step === 10) ? 'cm' : (this._step === 100 || this._step === 1000 || this._step === 10000) ? 'm' : 'km' }
    get _unitText() {
        let z = this.zoom / 10;
        return z === 1 ? '100%'
            : z < 1 ? `${z < 0.0001 ? Math.round(z * 100000000) / 1000000 : Math.round(z * 10000) / 100}%`
                : `${Math.round(z * 100)}%`;
    }
    get _sizeBig() { return this.zoom * this._step / 10 * 100 }
    get _sizeSmall() { return this._step === 0.1 ? 0 : this._sizeBig / 10 }

    firstUpdated() {
        super.firstUpdated();
        this.__mousewheel = this._mousewheel.bind(this);
        this._resizeRuller();
        LI.listen(this, 'mousewheel', this.__mousewheel, true);
    }

    _resizeRuler_h(zoom = this.zoom, _step = this._step) {
        const _cvWidth = this.$refs && this.$refs.main && this.$refs.main.offsetWidth;
        const _scrollDx = this.$refs && this.$refs.main && this.$refs.main.scrollLeft;
        const canvas = this.$refs.ruler_h;
        const ctx = canvas.getContext('2d');
        const height = 25;
        this._initRuler(canvas, _cvWidth, height);
        const smallLineHeight = 5;
        const middleLineHeight = 12;
        const highLineHeight = 20;
        let k = Math.round(_cvWidth / _step / zoom);
        for (let i = Math.round(_scrollDx / zoom / _step); i < Math.round(k + _scrollDx / zoom / _step); i++) {
            if (!(i % (10))) {
                ctx.fillRect(Math.round(i * zoom * _step - (_scrollDx)), 5, 1, highLineHeight);
                ctx.fillText(this._getTextValue(i * _step, _step), Math.round((i * zoom * _step - _scrollDx) + 5), 9, 25);
            } else if (!(i % (5)) && _step !== 0.1)
                ctx.fillRect(Math.round(i * zoom * _step - _scrollDx), 15, 1, middleLineHeight);
            else if (_step !== 0.1)
                ctx.fillRect(Math.round(i * zoom * _step - _scrollDx), 20, 1, smallLineHeight);
        }
    }
    _resizeRuler_v(zoom = this.zoom, _step = this._step) {
        const _cvHeight = this.$refs && this.$refs.main && this.$refs.main.offsetHeight;
        const _scrollDy = this.$refs && this.$refs.main && this.$refs.main.scrollTop;
        const canvas = this.$refs.ruler_v;
        const ctx = canvas.getContext('2d');
        const width = 25;
        this._initRuler(canvas, width, _cvHeight);
        const smallLineHeight = 5;
        const middleLineHeight = 12;
        const highLineHeight = 20;
        ctx.rotate(.5 * Math.PI);
        let k = Math.round(_cvHeight / _step / zoom);
        for (let i = Math.round(_scrollDy / zoom / _step); i < Math.round(k + _scrollDy / zoom / _step); i++) {
            if (!(i % (10))) {
                ctx.fillRect(Math.round(i * _step * zoom - _scrollDy), 0, 1, -highLineHeight - i);
                ctx.fillText(this._getTextValue(i * _step, _step), Math.round(i * _step * zoom - _scrollDy) + 5, -2, 30);
            } else if (!(i % 5) && _step !== 0.1)
                ctx.fillRect(Math.round(i * _step * zoom - _scrollDy), -15, 1, -middleLineHeight);
            else if (_step !== 0.1)
                ctx.fillRect(Math.round(i * _step * zoom - _scrollDy), -20, 1, -smallLineHeight);
        }
    }
    _initRuler(canvas, width, height) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        canvas.width = width;
        canvas.height = height;
        ctx.font = "normal 11px 'Lucida Grande', sans-serif";
        ctx.fillStyle = "#000";
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
                zoom = Math.min(80, e.deltaY > 0 ? this.zoom * k : this.zoom / k);
            this._scale(zoom);
        } else 
            this._resizeRuller();
    }
    _scale(zoom, step) {
        this.zoom = zoom;
        if (step) {
            this._step = step;
        } else {
            let _step = this._step;
            if ((_step * zoom) > 50 && this._unit !== 'mm') _step = Math.min(0.1, _step / 10);
            else if ((_step * zoom) < 5) _step = _step * 10;
            if (_step !== this._step) this._step = _step;
        }
        this._resizeRuller();
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
            }
        `;
    }

    render() {
        return html`
            <div style="font-size:12px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid lightgray;padding-bottom:4px">
                <li-button size="20" name="add" @click="${() => this._scale(this.zoom *= 1.1)}"></li-button>
                <li-button size="20" width="120" icon="" @click="${() => this._scale(10, 1)}">${this._unitText}</li-button>
                <li-button size="20" name="remove" @click="${() => this._scale(this.zoom *= 0.9)}"></li-button>
            </div>
            <div style="position:absolute;top:40px;width:30px;align-items:center;justify-content:center">${this._unit}</div>    
            <div style="position:relative;font-size:12px;left:30px;height:25px;margin-bottom:5px"><canvas ref="ruler_h" style="height:25px"></canvas></div>
            <div style="display:flex;">
                <div style="position:relative;margin-right:5px"><canvas ref="ruler_v" style="width:25px"></canvas></div>
                <div class="main" ref="main" style="height:100vh;overflow:auto" @mousewheel="${this._resizeRuller}">
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
                </div>
            </div>
        `;
    }

});