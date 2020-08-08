import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../icon/icon.js'

customElements.define('li-button', class LiButton extends LiElement {
    static get properties() {
        return {
            icon: { type: Object, default: undefined },
            name: { type: String, default: '' },
            fill: { type: String, default: '' },
            size: { type: Number, default: 24 },
            scale: { type: Number, default: 0.9 },
            rotate: { type: Number, default: 0 },
            speed: { type: Number, default: 0 },
            blink: { type: Number, default: 0 },
            blval: { type: String, default: '1;0;0;1' },
            path: { type: String, default: '' },
            label: { type: String, default: '' },
            color: { type: String, default: 'gray' },
            back: { type: String, default: '#fdfdfd' },
            width: { type: String, default: '' },
            height: { type: String, default: '' },
            border: { type: String, default: '1px' },
            radius: { type: String, default: '2px' },
            br: { type: String, default: '' },
            swh: { type: String, default: '' },
            toggle: { type: String, default: '' },
            toggleded: { type: Boolean, default: false, reflect: true, notify: true }
        }
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
        return html`<li-icon class="${this.toggleded ? this.toggle : 'notoggled'}" icon=${_icon} name="${this.name}" fill="${this.fill}" size="${this.size}" scale="${this.scale}" 
            rotate="${this.rotate}" speed="${this.speed}" blink="${this.blink}" blval="${this.blval}" path="${this.path}"></li-icon>`;
    }
    render() {
        return html`
            <div id="li-btn" class="li-btn"  tabindex="0" style="
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
});
