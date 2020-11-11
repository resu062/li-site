import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-grid/layout-grid.js'
import '../button/button.js';

customElements.define('li-layout-scheme', class LiLayoutScheme extends LiElement {
    static get properties() {
        return {
            _$$id: { type: String, default: '', update: true },
            zoom: { type: Number, default: 1, local: true },
            _step: { type: Number, default: 10, local: true },
            _width: { type: Number, default: 10000, local: true },
            _height: { type: Number, default: 10000, local: true }
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                position: relative;
            }
        `;
    }

    render() {
        return html`
            <li-layout-grid .$$id="${this.$$id}">
                <div slot="layout-grid-main">
                    <div style="position:absolute;width:300px;height:80px;border:1px solid red;background:lightyellow;top:100px;left: 100px;cursor:pointer;zoom:${this.zoom}"></div>
                </div>
            </li-layout-grid>
        `;
    }
});