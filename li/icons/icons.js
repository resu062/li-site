
import { html } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../icon/icons/icons.js';
import '../icon/icon.js';

customElements.define('li-icons', class LiAllIcons extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: 'li-icons' },
        }
    }

    render() {
        return html`
            ${Object.keys(icons).map(i => html`
                <div style="display: flex; align-items: center; justify-content: left; padding:2px ">
                    <li-icon name="${i}" fill="darkgray" size=32></li-icon>
                    <div style="font-size:18px; color:darkgray"> - ${i}</div>
                </div>`
        )}`
    }

});
