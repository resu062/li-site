import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import '../icon/icon.js'

class LiButton extends LitElement {
    static get properties() {
        return {
            icon: { type: Object },
            name: { type: String }, fill: { type: String }, size: { type: String }, scale: { type: Number },
            rotate: { type: Number }, speed: { type: Number }, blink: { type: Number }, blval: { type: String },
            path: { type: String },
            label: { type: String }, color: { type: String }, back: { type: String },
            width: { type: String }, height: { type: String }, border: { type: String }, radius: { type: String },
            br: { type: String }, swh: { type: String }, toggle: { type: String }, toggleded: { type: Boolean, reflect: true }
        }
    }
    constructor() {
        super();
        this._props = {
            properties: customElements.get(this.localName).properties,
            defaults: {
                icon: undefined, hide: false,
                name: '', fill: '', size: 24, scale: 0.9, rotate: 0,
                label: '', color: 'gray', back: '#fdfdfd',
                rotate: 0, speed: 0, blink: 0, blval: '1;0;0;1',
                path: '',
                width: '', height: '', border: '1px', radius: '2px', br: '', toggle: '', toggleded: false
            }
        }
        for (let i in this._props.defaults) this[i] = this._props.defaults[i];
    }
    clickHandler() {
        this.toggleded = !this.toggleded;
    }
    static get styles() {
        return css`
            :host {
                display: inline-block;
                vertical-align: middle;
                font-family:Verdana, Geneva, Tahoma, sans-serif;
                margin: 1px;
                user-select: none;
            }
            .li-btn {
                display: flex;
                align-items: center;
                text-align:center;
                cursor: pointer;
            }
            .li-btn:hover {
                transition: .3s;
                filter: brightness(85%);
            }
            .li-btn:active {
                transition: .1s;
                filter: brightness(70%);
            }
            .li-btn:focus {
                outline:none;
            }
            .left {
                transition: .3s;
                transform: rotate(-90deg);
            }
            .right {
                transition: .3s;
                transform: rotate(90deg);
            }
            .notoggled {
                transition: .3s;
                transform: rotate(0deg);
            }
        `;
    }
    _setData() {
        if (this.br) {
            let arr = this.br.split(':');
            this.border = arr[0] || this.border;
            this.radius = arr[1] || this.radius;
        }
        if (this.swh) {
            let arr = this.swh.split(':');
            this.size = arr[0] || this.size;
            this.width = arr[1] || this.width;
            this.height = arr[2] || this.height;
        }
    };
    _icon() {
        let _icon = '{}';
        this.fill = this.fill || this.color;
        this.size = this.size || this.height || this.width;
        if (this.icon) _icon = JSON.stringify(this.icon);
        return html`<li-icon class="${this.toggleded ? this.toggle : 'notoggled'}" icon=${_icon} name="${this.name}" fill="${this.fill}" size="${this.size}" scale="${this.scale}" 
            rotate="${this.rotate}" speed="${this.speed}" blink="${this.blink}" blval="${this.blval}" path="${this.path}"></li-icon>`;
    }
    render() {
        this._setData();
        return html`
            <div class="li-btn"  tabindex="0" style="
                    width: ${this.width || this.size};
                    height: ${this.height || this.size};
                    border: ${this.border} solid ${this.color || this.fill};
                    border-radius: ${this.radius};
                    background-color: ${this.back};
                    overflow: hidden;"
                    @click="${this.clickHandler}">
                ${this.icon || this.name ? this._icon() : ''}
                <div style="color: ${this.color}; user-select: none; flex: 1">
                    ${this.label}
                    <slot></slot>
                </div>
            </div>       
        `;
    }

    firstUpdated() {
        this.dispatchEvent(new CustomEvent('liel-ready', { detail: { message: this.localName } }));
    }
}

customElements.define('li-button', LiButton);
