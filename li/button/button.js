import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../icon/icon.js'

customElements.define('li-button', class LiButton extends LiElement {
    static get properties() {
        return {
            _useInfo: { type: Boolean, default: true },
            label: { type: String, default: '' },
            textAlign: { type: String, default: 'center' },
            name: { type: String, default: '' },
            fill: { type: String, default: '' },
            color: { type: String, default: 'gray' },
            borderColor: { type: String, default: '' },
            back: { type: String, default: '#fdfdfd' },
            size: { type: Number, default: 24 },
            width: { type: String, default: '' },
            height: { type: String, default: '' },
            swh: { type: String, default: '' },
            border: { type: String, default: '1px' },
            radius: { type: String, default: '2px' },
            br: { type: String, default: '' },
            scale: { type: Number, default: 0.9 },
            rotate: { type: Number, default: 0 },
            speed: { type: Number, default: 0 },
            blink: { type: Number, default: 0 },
            blval: { type: String, default: '1;0;0;1' },
            padding: { type: String, default: '' },
            toggledClass: { type: String, default: 'none' },
            notoggledClass: { type: String, default: 'notoggled' },
            toggled: { type: Boolean, default: false, reflect: true },
            path: { type: String, default: '' },
            icon: { type: Object, default: undefined }
        }
    }

    clickHandler() {
        this.toggled = !this.toggled;
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
            .left90 {
                transition: .3s;
                transform: rotate(-90deg);
            }
            .right90 {
                transition: .3s;
                transform: rotate(90deg);
            }
            .left360 {
                transition: .3s;
                transform: rotate(-360deg);
            }
            .right360 {
                transition: .3s;
                transform: rotate(360deg);
            }
            .notoggled {
                transition: .3s;
                transform: rotate(0deg);
            }
        `;
    }
    firstUpdated(setPath = false) {
        super.firstUpdated();
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
    }
    _icon() {
        let _icon = '{}';
        this.fill = this.fill || this.color;
        this.size = this.size || this.height || this.width;
        if (this.icon) _icon = JSON.stringify(this.icon);
        return html`<li-icon class="${this.toggled ? this.toggledClass : this.notoggledClass}" icon=${_icon} name="${this.name}" fill="${this.fill}" size="${this.size}" scale="${this.scale}" 
            rotate="${this.rotate}" speed="${this.speed}" blink="${this.blink}" blval="${this.blval}" path="${this.path}"></li-icon>`;
    }
    render() {
        return html`
            <div id="li-btn" class="li-btn"  tabindex="0" style="
                    text-align: ${this.textAlign};
                    width: ${this.width || this.size};
                    height: ${this.height || this.size};
                    border: ${this.border} solid ${this.borderColor || this.color || this.fill};
                    border-radius: ${this.radius};
                    background-color: ${this.back};
                    overflow: hidden;
                    padding: ${this.padding}"
                    @click="${this.clickHandler}">
                ${this.icon || this.name ? this._icon() : ''}
                <div style="color: ${this.color}; user-select: none; flex: 1">
                    ${this.label}
                    <slot></slot>
                </div>
            </div>       
        `;
    }
});
