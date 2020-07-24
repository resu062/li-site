//import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module';
import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';

class FirstLitElement extends LitElement {

    static get properties() {
        return {
            status: { type: String }
        }
    }

    static get styles() {
        return css`.status { color: #00FF00; }`;
    }

    render() {
        return html`
          Web Components are <span class="status">${this.status}</span>!
        `;
    }

}

customElements.define('first-lit-element', FirstLitElement);


//Examples imports for https://codepen.io/francisco1990Web/pen/RdXbWg

export const menu = html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>`;
export const search = html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-reactid="1051"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
export const crop = html`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"></path><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"></path></svg>`;