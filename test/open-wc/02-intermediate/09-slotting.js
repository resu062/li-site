import { LitElement, html } from '../../../lib/lit-element/lit-element.js';

customElements.define('slotting-demo', class Slotting extends LitElement {
  render() {
    return html`
      <card-element>
        <h1 slot="title">Hello universe</h1>
        <h2 slot="details">This is some text</h2>
        <h3>any other content</h3>
      </card-element>
    `;
  }
});

customElements.define('card-element', class CardElement extends LitElement {
  render() {
    return html`
      <div class="card-wrapper">
        <slot name="title"></slot>
        <slot name="details"></slot>
        <slot></slot>
      </div>
    `;
  }
});