import { LiElement, html, css } from '../../li.js';

import '../button/button.js';
import '../../lib/maska/maska.js';

customElements.define('li-color-picker', class LiColorPicker extends LiElement {
    static get properties() {
        return {
            oldValue: { type: String },
            value: { type: String, default: 'F00000' },
            valueRGB: { type: String },
            valueHSB: { type: String },
            valueHSL: { type: String },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.pickers = {
            hue: { palette: this.$id.slider, handler: this.$id.sliderHandler },
            color: { palette: this.$id.picker, handler: this.$id.pickerHandler }
        };
        this.hsbInputs = selectInputs(this.renderRoot, "hsb");
        this.rgbInputs = selectInputs(this.renderRoot, "rgb");
        this.hexInput = this.renderRoot.querySelector("#hex input");
        buildHueSlider(this.pickers.hue.palette, this.renderRoot.querySelector("defs"));
        this.state = {
            hsb: extractValues(this.hsbInputs),
            rgb: extractValues(this.rgbInputs),
            hex: this.hexInput.value
        };
        [this.hsbInputs, this.rgbInputs].forEach(color =>
            Object.keys(color).forEach((key, i, arr) => {
                const el = color[key];
                el.addEventListener("input", () => {
                    if (!el.validity.valid) return this.updateState();
                    const val = el.value;
                    this.updateState(
                        color == this.hsbInputs
                            ? { [key]: val }
                            : toHSB(arr.reduce((rgb, val) => addProp(rgb, val, color[val].value), {})));
                    el.value = val;
                });
            }));
        this.hexInput.value = this.oldValue = this.value;
        this.updateState(toHSB(this.value));

        this.maska = Maska.create(this.$id.txt, { mask: 'HHHHHH', tokens: { 'H': { pattern: /[0-9a-fA-F]/, uppercase: true } } });
    }

    static get styles() {
        return css`
            .main {
                display: block;
                border: 1px solid lightgray;
                width: 200px;
                padding: 8px
            }
            .pickerGradient {
                pointer-events: none;
            }
            section, label {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 14px;
            }
            section {
                justify-content: space-between;
                /* width: 200px; */
                margin-top: 4px;
            }
            label, input {
                border: 1px solid #ddd;
            }
            label * {
                font: 10px -apple-system, BlinkMacSystemFont, helvetica, sans-serif;
            }
            span {
                width: 18px;
                padding: 2px 0;
                text-align: center;
                border-right: 1px solid lightgray;
            }
            input {
                margin: 0;
                outline: none; 
                border: none;
                min-width: 32px;
                /* padding: 2px 0 2px 4px; */
            }
            [type=number] {
                width: 40px;
            }
        `;
    }

    render() {
        return html`
            <div class="main" @mousemove="${(e) => { if (this._mouseDown === 'picker') this.pickColor(e); if (this._mouseDown === 'slider') this.pickHue(e); }}"
                    @mouseup="${() => this._mouseDown = ''}">
                <svg width="200" height="170">
                    <defs>
                        <linearGradient id="pickerHue">
                        <stop offset="0" stop-color="#fff" stop-opacity="1"/>
                        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                        </linearGradient>
                        <linearGradient id="pickerBrightness" x2="0" y2="1">
                        <stop offset="0" stop-color="#000" stop-opacity="0"/>
                        <stop offset="1" stop-color="#000" stop-opacity="1"/>
                        </linearGradient>
                    </defs>

                    <rect id="picker" width="200" height="150" fill="#FF0000" rx="3" ry="3" 
                            @mousedown="${(e) => { this._mouseDown = 'picker'; this.pickColor(e) }}"/>
                    <rect class="pickerGradient" width="200" height="150" fill="url(#pickerHue)" rx="2" ry="2"/>
                    <rect class="pickerGradient" width="200" height="150" fill="url(#pickerBrightness)" rx="2" ry="2"/>
                    <circle id="pickerHandler" r="6" fill="none" stroke="#fff" stroke-width="2"/>

                    <rect id="slider" width="200" height="10" y="160" rx="5" ry="5" 
                            @mousedown="${(e) => { this._mouseDown = 'slider'; this.pickHue(e) }}"/>
                    <circle id="sliderHandler" r="6" cx="5" cy="165" fill="none" stroke="#fff" stroke-width="2"/>
                </svg>

                <section id="hsb">
                    <label>
                        <span title="Hue">H</span>
                        <input type="number" min="0" max="360" class="h" @input="${this._setHSB}">
                    </label>
                    <label>
                        <span title="Saturation">S</span>
                        <input type="number" min="0" max="100" class="s" @input="${this._setHSB}">
                    </label>
                    <label>
                        <span title="Brightness">B</span>
                        <input type="number" min="0" max="100" class="b" @input="${this._setHSB}">
                    </label>
                </section>
                <section id="rgb">
                    <label>
                        <span title="Red">R</span>
                        <input type="number" min="0" max="255" class="r" @input="${this._setRGB}">
                    </label>
                    <label>
                        <span title="Green">G</span>
                        <input type="number" min="0" max="255" class="g" @input="${this._setRGB}">
                    </label>
                    <label>
                        <span title="Blue">B</span>
                        <input type="number" min="0" max="255" class="b" @input="${this._setRGB}">
                    </label>
                </section>
                <!-- <section id="hsla">
                    <label>
                        <span title="Alfa" style="background:${this.hsb_to_hsl(this.state?.hsb?.h, this.state?.hsb?.s / 100, this.state?.hsb?.b / 100)}">A</span>
                        <input id="alfa" value="100" type="number" min="0" max="100" class="h" @input="${()=>this.requestUpdate()}">
                    </label>
                    <label>
                        <div style="width:128px;">${this.hsb_to_hsl(this.state?.hsb?.h, this.state?.hsb?.s / 100, this.state?.hsb?.b / 100)}</div>
                    </label>
                </section>  -->
                <section id="hex">
                    <label>
                        <span title="Hexadecimal">#</span>
                        <input style="width:79px"  @input="${this._setHEX}" id="txt">
                        <div style="background:${'#' + this.oldValue}; width: 40px;height: 14px;margin:1px"></div>
                        <div style="background:${'#' + this.value}; width: 40px;height: 14px;margin:1px"></div>
                        <li-button name="check" size="12"></li-button>
                    </label>
                </section>
            </div>

        `;
    }

    hsb_to_hsl(h, s, v) {
        // both hsv and hsl values are in [0, 1]
        var l = (2 - s) * v / 2;

        if (l != 0) {
            if (l == 1) {
                s = 0
            } else if (l < 0.5) {
                s = s * v / (l * 2)
            } else {
                s = s * v / (2 - l * 2)
            }
        }

        return `hsl(${h}, ${parseInt(s * 100)}%, ${parseInt(l * 100)}%)`
    }

    _setHSB(e) {

    }

    _setRGB(e) {

    }

    _setHEX(e) {
        if (e.target.value.length !== 6) return;
        this.updateState(toHSB(e.target.value));
    }

    updateState(obj = {}) {
        Object.keys(obj).forEach(key => addProp(this.state.hsb, key, Math.round(obj[key])));
        addProp(this.state, "rgb", toRGB(this.state.hsb));
        addProp(this.state, "hex", toHex(this.state.rgb));
        fireEvent(this);
        this.updateUI();
        this.value = this.state.hex;
        this.valueHSL = this.hsb_to_hsl(this.state.hsb.h, this.state.hsb.s / 100, this.state.hsb.b / 100);
        this.valueHSB = `hsb(${this.state.hsb.h}, ${this.state.hsb.s}, ${this.state.hsb.b})`;
        this.valueRGB = `rgb(${this.state.rgb.r}, ${this.state.rgb.g}, ${this.state.rgb.b})`;
        this.$update();
    }

    updateUI({ hsb, rgb, hex } = this.state) {
        const bindings = new Map([[this.hsbInputs, hsb], [this.rgbInputs, rgb]]);
        bindings.forEach((obj, el) => Object.keys(obj).forEach(key => el[key].value = obj[key]));
        this.hexInput.value = hex;
        this.pickers.color.palette.setAttribute("fill", `hsl(${hsb.h}, 100%, 50%)`);

        Object.keys(this.pickers).forEach(obj => {
            const coords = getHandlerCoordinates(this.pickers, obj, hsb);
            Object.keys(coords).forEach(axis =>
                this.pickers[obj].handler.setAttribute(`c${axis}`, coords[axis]));
        });
    }

    pickColor(e) {
        const { x, y, width, height } = getPickCoordinates(this.pickers.color.palette, e);
        this.updateState({
            s: x > width ? 100 : x < 0 ? 0 : x / width * 100,
            b: y > height ? 0 : y < 0 ? 100 : (1 - y / height) * 100
        });
        e.preventDefault();
    }

    pickHue(e) {
        const { x, width } = getPickCoordinates(this.pickers.hue.palette, e);
        this.updateState({ h: x > width ? 360 : x < 0 ? 0 : x / width * 360 });
        e.preventDefault();
    }
});

const isEmpty = arr => !arr.length;

const isObject = obj => Object(obj) === obj;

const addProp = (obj, key, value) =>
    Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
    });

const create = (el, attr) =>
    Object.keys(attr).reduce((layer, key) => {
        layer.setAttribute(key, attr[key]);
        return layer;
    }, document.createElementNS("http://www.w3.org/2000/svg", el));

const fireEvent = host =>
    host.dispatchEvent(new Event("color-change", {
        bubbles: true,
        composed: true
    }));

const defineColorStops = (steps = 20, arr = [], hue = 0, max = 360) => {
    arr.push({
        "stop-color": `hsl(${hue}, 100%, 50%)`,
        "offset": (hue / max).toFixed(2)
    });
    return hue >= max ? arr : defineColorStops(steps, arr, hue + max / steps);
};

const buildHueSlider = (hue, defs) => {
    const gradientId = "sliderGradient";
    const gradient = create("linearGradient", {
        id: gradientId
    });

    defineColorStops().forEach(color => gradient.appendChild(create("stop", color)));
    defs.appendChild(gradient);
    hue.setAttribute("fill", `url(#${gradientId})`);
};

const toHex = rgb =>
    Object.keys(rgb).reduce((str, key) => {
        let hex = rgb[key].toString(16);
        if (hex.length < 2) hex = `0${hex}`;
        return str + hex;
    }, "").toUpperCase();

const toRGB = hsb => {
    const h = Number(hsb.h) / 360;
    const i = Math.floor(h * 6);
    const values = (() => {
        const [s, b] = [hsb.s, hsb.b].map(val => Number(val) / 100);
        const f = h * 6 - i;
        const p = b * (1 - s);
        const q = b * (1 - f * s);
        const t = b * (1 - (1 - f) * s);

        return {
            0: [b, t, p],
            1: [q, b, p],
            2: [p, b, t],
            3: [p, q, b],
            4: [t, p, b],
            5: [b, p, q]
        };
    })();

    const [r, g, b] = values[i % 6].map(val => Math.round(val * 255));
    return { r, g, b };
};

const toHSB = color => {
    if (isObject(color)) {
        const keys = Object.keys(color);
        if (isEmpty(keys)) return {};

        const rgb = keys.reduce((obj, key) => addProp(obj, key, Number(color[key])), {});
        const min = Math.min(rgb.r, rgb.g, rgb.b);
        const max = Math.max(rgb.r, rgb.g, rgb.b);
        const d = max - min;
        const s = max == 0 ? 0 : d / max;
        const b = max / 255;
        let h;
        switch (max) {
            case min: h = 0; break;
            case rgb.r: h = (rgb.g - rgb.b) + d * (rgb.g < rgb.b ? 6 : 0); h /= 6 * d; break;
            case rgb.g: h = (rgb.b - rgb.r) + d * 2; h /= 6 * d; break;
            case rgb.b: h = (rgb.r - rgb.g) + d * 4; h /= 6 * d; break;
        }
        const hsb = {
            h: h * 360,
            s: s * 100,
            b: b * 100
        };
        return Object.keys(hsb).reduce((obj, key) => addProp(obj, key, Math.round(hsb[key])), {});
    }
    const convert = hex => hex.match(/[\d\w]{2}/g).map(val => parseInt(val, 16));
    const [r, g, b] = convert(color);
    return toHSB({ r, g, b });
};

const selectInputs = (root, id) =>
    [...root.querySelectorAll(`#${id} input`)].reduce((obj, el) =>
        addProp(obj, el.className, el), {});

const extractValues = inputs =>
    Object.keys(inputs).reduce((state, key) =>
        addProp(state, key, Number(inputs[key].value)), {});

const getHandlerCoordinates = (pickers, type, color) => {
    const rect = pickers[type].palette.getBoundingClientRect();
    if (type == "hue") {
        let x = color.h / 360 * rect.width;
        if (x < 5) x = 5;
        else if (x > rect.width - 5) x = rect.width - 5;
        return { x };
    }
    return {
        x: color.s / 100 * rect.width,
        y: (1 - (color.b / 100)) * rect.height
    };
};

const getPickCoordinates = (el, event) => {
    const rect = el.getBoundingClientRect();
    const { width, height } = rect;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { width, height, x, y };
};
