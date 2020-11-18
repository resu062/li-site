import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-accordion', class LiAccordion extends LiElement {
    static get styles() {
        return css`
            :host{
                width: 100%;
                display: flex;
                flex-direction: column;
                flex: 1 1 auto;
                overflow: hidden;
            }
        `
    }

    render() {
        return html`
            <slot></slot>
        `
    }
});

customElements.define('li-accordion-item', class LiAccordionItem extends LiElement {
    static get properties() {
        return {
            iconSize: { type: Number, default: 24 },
            label: { type: String, default: '' },
            iconName: { type: String, default: '' },
            expanded: { type: Boolean, default: false, reflect: true }
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .bar{
                display: flex;
                background-color: lightgray;
                align-items: center;
                min-height: 40px;
                margin: 1px 0px;
            }
        `;
    }

    render() {
        return html`
            <div class="bar">
                <li-icon .iconSize="${this.iconSize * .7}" .name="${this.iconName}" .icon="${this.icon}" style="opacity: .5"></li-icon>
                <div style="text-align:center; flex: 1">${this.label}</div>
                <li-button .iconSize="${this.iconSize * .7}" name="chevron-right" style="opacity: .5;margin-right: 4px;" @click="${this._click}" toggledClass="right90" radius="50%"></li-button>
            </div>
            <div style="display:flex;flex-direction:column;overflow: hidden;flex:1">
                <slot ?hidden="${!this.expanded}" style="flex:1"></slot>
            </div>
        `
    }

    _click(e) {
        this.expanded = e.currentTarget.toggled;
        this.$$update();
    }
});
