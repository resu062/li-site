
import { LitElement, html } from '../../../lib/lit-element/lit-element.js';
import './icons.js';
import '../icon.js';

class LiAllIcons extends LitElement {
    render() {
        return html`
            ${Object.keys(icons).map(i => html`
                <div style="display: flex; align-items: center; justify-content: left; padding:2px ">
                    <li-icon name="${i}" fill="darkgray" size=32></li-icon>
                    <div style="font-size:18px; color:darkgray"> - ${i}</div>
                </div>`
            )}`
    }
}

customElements.define('li-all-icons', LiAllIcons);
