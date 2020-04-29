import { LitElement, html } from '../../lib/lit-element/lit-element.js';
//import { render } from '../../lib/lit-html/lib/lit-extended.js';

export class FiberDot extends LitElement {

    static get properties() {
        return {
            size: {
                type: Number
            },
            s: {
                type: Number,
                computed: '_computeS(size)'
            },
            x: {
                type: Number
            },
            y: {
                type: Number
            },
            text: {
                type: String
            },
            hover: {
                type: Boolean,
                value: false
            }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('mouseenter', _ => this.hover = true);
        this.addEventListener('mouseleave', _ => this.hover = false);
    }

    _computeS(size) {
        return size * 1.3;
    }

    render({ s, x, y, text, hover }) {
        return html`
      <style>
        :host {
          contain: strict;
          position: absolute;
          font: normal 15px sans-serif;
          text-align: center;
          cursor: pointer;
          width: ${s}px;
          height: ${s}px;
          left: ${x}px;
          top: ${y}px;
          border-radius: ${s / 2}px;
          line-height: ${s}px;
          background: ${ hover ? '#ff0' : '#61dafb'};
        }
      </style>
      ${ hover ? '**' + text + '**' : text}
    `;
    }
}

customElements.define('fiber-dot', FiberDot.withProperties());