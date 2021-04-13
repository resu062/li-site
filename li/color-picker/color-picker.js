import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js'

customElements.define('li-color-picker', class LiColorPicker extends LiElement {
    static get properties() {
        return {
            value: { type: String },
            valueHSL: { type: String },
            valueRGB: { type: String }
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

        const onDrag = callback => {
            const listen = action =>
                Object.keys(events).forEach(event =>
                    this[`${action}EventListener`](`mouse${event}`, events[event]));
            const end = () => listen("remove");
            const events = {
                move: callback,
                up: end
            };
            listen("add");
        };

        this.renderRoot.addEventListener("mousedown", e => {
            const callback = (() => {
                if (e.target == this.pickers.hue.palette) return this.pickHue;
                if (e.target == this.pickers.color.palette) return this.pickColor;
            })();
            if (!callback) return;
            callback.call(this, e);
            onDrag(callback);
        });

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

        this.hexInput.addEventListener("input", () => {
            const val = this.hexInput.value;
            if (val.length < 6) return;
            this.updateState(toHSB(val));
            this.hexInput.value = val;
        });
    }

    updateState(obj = {}) {
        Object.keys(obj).forEach(key => addProp(this.state.hsb, key, Math.round(obj[key])));
        addProp(this.state, "rgb", toRGB(this.state.hsb));
        addProp(this.state, "hex", toHex(this.state.rgb));
        fireEvent(this);
        this.updateUI();
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
            s: calcS(x, width),
            b: calcB(y, height)
        });
        e.preventDefault();
    }

    pickHue(e) {
        const { x, width } = getPickCoordinates(this.pickers.hue.palette, e);
        this.updateState({ h: calcH(x, width) });
        e.preventDefault();
    }

    static get styles() {
        return css`
            :host {
                display: block;
                border: 1px solid lightgray;
                width: 200px;
                padding: 4px
            }
            .pickerGradient {
                pointer-events: none;
            }
            section, label {
                display: flex;
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
                font: 12px -apple-system, BlinkMacSystemFont, helvetica, sans-serif;
            }
            span {
                width: 18px;
                padding: 2px 0;
                text-align: center;
            }
            input {
                margin: 0;
                border-width: 0 0 0 1px;
                min-width: 32px;
                padding: 2px 0 2px 4px;
            }
            [type=number] {
                width: 40px;
            }
        `;
    }

    render() {
        return html`
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

                <rect id="picker" width="200" height="150" fill="#FF0000" rx="3" ry="3"/>
                <rect class="pickerGradient" width="200" height="150" fill="url(#pickerHue)" rx="2" ry="2"/>
                <rect class="pickerGradient" width="200" height="150" fill="url(#pickerBrightness)" rx="2" ry="2"/>
                <circle id="pickerHandler" r="3" fill="none" stroke="#fff" stroke-width="2"/>

                <rect id="slider" width="200" height="10" y="160" rx="5" ry="5"/>
                <circle id="sliderHandler" r="3" cx="5" cy="165" fill="none" stroke="#fff" stroke-width="2"/>
            </svg>

            <section id="hsb">
                <label>
                    <span title="Hue">H</span>
                    <input type="number" min="0" max="360" value="0" class="h">
                </label>
                <label>
                    <span title="Saturation">S</span>
                    <input type="number" min="0" max="100" value="0" class="s">
                </label>
                <label>
                    <span title="Brightness">B</span>
                    <input type="number" min="0" max="100" value="100" class="b">
                </label>
            </section>
            <section id="rgb">
                <label>
                    <span title="Red">R</span>
                    <input type="number" min="0" max="255" value="255" class="r">
                </label>
                <label>
                    <span title="Green">G</span>
                    <input type="number" min="0" max="255" value="255" class="g">
                </label>
                <label>
                    <span title="Blue">B</span>
                    <input type="number" min="0" max="255" value="255" class="b">
                </label>
            </section>
            <section id="hex">
                <label>
                    <span title="Hexadecimal">#</span>
                    <input value="FFFFFF">
                </label>
            </section>
        `;
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
    // RGB
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

    // HEX
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

const calcH = (x, width) => {
    if (x > width) return 360;
    if (x < 0) return 0;
    return x / width * 360;
};

const calcS = (x, width) => {
    if (x > width) return 100;
    if (x < 0) return 0;
    return x / width * 100;
};

const calcB = (y, height) => {
    if (y > height) return 0;
    if (y < 0) return 100;
    return (1 - (y / height)) * 100;
};