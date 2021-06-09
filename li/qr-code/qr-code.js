import { LiElement, html, css } from '../../li.js';

import './qr.js'; // https://www.webcomponents.org/element/webcomponent-qr-code

customElements.define('li-qr-code', class LiQrCode extends LiElement {
    static get properties() {
        return {
            value: { type: String, default: '' },
            format: { type: String, default: 'png', list: ['png', 'svg', 'html'] },
            margin: { type: Number, default: 2 },
            moduleSize: { type: Number, default: 5 }
        }
    }

    render() {
        return html`
             <qr-code data="${this.value}" margin="${this.margin}" modulesize="${this.moduleSize}" format="${this.format}"></qr-code>
        `;
    }
});
