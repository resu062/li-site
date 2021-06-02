import { css, svg } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import './icons/icons.js';

customElements.define('li-icon', class LiIcon extends LiElement {

    static get properties() {
        return {
            _useInfo: {type: Boolean, default: true },
            name: { type: String, default: '', isIcon: true },
            fill: { type: String, default: 'currentColor' },
            stroke: { type: String, default: 'currentColor' },
            strokeWidth: { type: Number, default: 0 },
            size: { type: Number, default: 24 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
            _s2: { type: Number, default: 0 },
            viewbox: { type: String, default: '0 0 24 24' },
            scale: { type: String, default: '1,1' },
            rotate: { type: Number, default: 0 },
            speed: { type: Number, default: 0 },
            blink: { type: Number, default: 0 },
            blval: { type: String, default: '1;0;0;1' },
            path: { type: String, default: '' },
            icon: { type: Object, default: undefined },
            args: { type: Object }
        }
    }

    firstUpdated(setPath = false) {
        super.firstUpdated();
        if (setPath) this.path = '';
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
        this._isFirstUpdated = true;
    }

    update(changedProperties) {
        super.update(changedProperties);
        if (this._isFirstUpdated) {
            if (changedProperties.has('name')) {
                setTimeout(() => {
                    this.firstUpdated(true);
                }); 
            }
            if (changedProperties.has('blink') || changedProperties.has('speed')) {
                if (this.$id.animate) {
                    this.$id.animate.beginElement();
                    this.$id.animateTransform.beginElement();
                }
            }
        }
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
        return svg`
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
                        ${this.blink
                            ? svg`<animate id="animate"
                                attributeName="opacity"
                                values="${this.blval}"
                                dur="${Math.abs(this.blink)}s"
                                restart="whenNotActive"
                                repeatCount="indefinite"/>` 
                            : svg``
                        }
                        ${this.speed
                            ? svg`<animateTransform id="animateTransform" attributeType="XML"
                                attributeName="transform"
                                type="rotate"
                                from="${this.speed > 0 ? 0 : 360} ${this._s2} ${this._s2}"
                                to="${this.speed > 0 ? 360 : 0} ${this._s2} ${this._s2}"
                                begin="0s"
                                dur="${Math.abs(this.speed)}s"
                                restart="whenNotActive"
                                repeatCount="indefinite"/>`
                            : svg``
                        }
                    </path>
                />
            </svg>
        `
    }
});
