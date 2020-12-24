import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../../li/icon/icon.js'
import '../../li/button/button.js'

customElements.define('li-is-element', class LiIsElement extends LiElement {
    static get properties() {
        return {
            is: { type: String, default: '?' },
        }
    }

    render() {
        return html`
            <slot name="${this.is}"></slot>
        `;
    }
});

customElements.define('li-is', class LiIs extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: 'Test li-is:' },
            is: { type: String, default: 'icon' },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        const next = {
            'icon': 'button', 'button': 'div', 'div': 'input', 'input': 'span', 'span': 'icon'
        }
        setInterval(() => {
            requestAnimationFrame(() => {
                this.is = next[this.is];
            })

        }, 1000);
    }

    render() {
        return html`
            <div>${this.label}</div>
            <hr>
            <li-is-element .is="${this.is}">
                <li-icon slot="icon" name="android" fill="green"></li-icon>
                <li-button slot="button" name="hamburger" fill="red" color="red"></li-button>
                <div slot="div">i'm DIV element</div>
                <input slot="input" value="i'm INPUT element">
                <span slot="span">i'm SPAN element</span>
            </li-is-element>
        `;
    }
});
