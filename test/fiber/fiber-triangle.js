import { LitElement, html } from '../../lib/lit-element/lit-element.js';

export class FiberTriangle extends LitElement {
    static get properties() {
        return {
            s: {
                type: Number
            },
            x: {
                type: Number
            },
            y: {
                type: Number
            },
            seconds: {
                type: Number
            }
        }
    }

    render({ s, x, y, seconds, targetSize = 25, slowDown = false }) {
        if (slowDown) {
            const e = performance.now() + 0.8;
            while (performance.now() < e) {
                // Artificially long execution time.
            }
        }

        if (s <= targetSize) {
            const s = targetSize;
            return html`
        <fiber-dot x="${x - (s / 2)}" y="${y - (s / 2)}" size="${s}" text="${seconds}"></fiber-dot>
      `;
        }

        s = s / 2;

        return html`
      <fiber-triangle x="${x}" y="${y - (s / 2)}" s="${s}" seconds="${seconds}"></fiber-triangle>
      <fiber-triangle x="${x - s}" y="${y + (s / 2)}" s="${s}" seconds="${seconds}"></fiber-triangle>
      <fiber-triangle x="${x + s}" y="${y + (s / 2)}" s="${s}" seconds="${seconds}"></fiber-triangle>
    `;
    }
}

customElements.define('fiber-triangle', FiberTriangle.withProperties());