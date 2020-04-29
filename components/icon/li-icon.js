import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import './icons/icons.js';

class LiIcon extends LitElement {
    static get properties() {
        return {
            icon: { type: Object },
            name: { type: String },
            size: { type: Number },
            _s2: { type: Number },
            height: { type: String },
            width: { type: String },
            viewbox: { type: String },
            fill: { type: String },
            stroke: { type: String },
            strokeWidth: { type: String },
            rotate: { type: Number },
            speed: { type: Number },
            blink: { type: Number },
            blval: { type: String },
            scale: { type: String },
            path: { type: String },
        }
    }

    constructor() {
        super();
        let prop = {
            icon: undefined, name: '', path: '',
            size: 24, _s2: 0, height: 0, width: 0, viewbox: '0 0 24 24', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0,
            rotate: 0, speed: 0, blink: 0, blval: '1;0;0;1', scale: '1,1'
        }
        for (let i in prop) this[i] = prop[i];
    }

    setData() {
        if (this.icon)
            for (let i in this.icon) this[i] = this.icon[i];
        const name = this.name;
        let s = 24;
        if (!this.path && name && icons[name]) {
            this.path = icons[name].path;
            s = icons[name].size || 24;
            this.viewbox = icons['viewbox'] || `0 0 ${s} ${s}`;
        }
        this._s2 = s / 2;
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
                vertical-align: middle;
            }
        `;
    }
    render() {
        this.setData();
        return html`
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                preserveAspectRatio="xMidYMid meet" xml:space="preserve"
                display="block"
                viewBox="${this.viewbox}"
                width="${this.width || this.size}"
                height="${this.height || this.size}"
                style="transform:rotate(${this.rotate}deg) scale(${this.scale});">
                <g
                    fill="${this.fill}"
                    stroke="${this.stroke}"
                    stroke-width="${this.strokeWidth}"
                    style="transform-origin: center center; transform-box: fill-box;">
                    <path d="${this.path}">
                        <animate
                            attributeName="opacity"
                            values="${this.blval}"
                            dur="${Math.abs(this.blink)}s"
                            repeatCount="indefinite" />
                        <animateTransform attributeType="xml"
                            attributeName="transform"
                            type="rotate"
                            from="${this.speed > 0 ? 0 : 360} ${this._s2} ${this._s2}"
                            to="${this.speed > 0 ? 360 : 0} ${this._s2} ${this._s2}"
                            begin="0s"
                            dur="${Math.abs(this.speed)}s"
                            repeatCount="indefinite"/>
                    </path>
                /> 
            </svg>
        `
    }
}

customElements.define('li-icon', LiIcon);
