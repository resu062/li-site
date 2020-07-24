//import { LitElement, html, css } from 'https://unpkg.com/lit-element/lit-element.js?module';
import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import * as icons from './li-bit-icons.js';

    class LitButton extends LitElement {

      static get properties() {
        return {
          disabled: { type: Boolean, reflect: true }
        }
      }
      constructor() {
        super();
        this.disabled = false;
      }
      /*Comunity - litElement : We recommend using static styles for optimal performance*/
      static get styles() {
        return css`
          :host {
            display: var(--lit-button-display, inline-block);
            box-sizing: inherit;
          }

          :host(.block) {
            --lit-button-display: block;
            --lit-button-width: 100%;
          }

          .lit-button {
            background-color: var(--lit-button-bg-color, transparent);
            border: none;
            border-radius: 0.25rem;
            color: var(--lit-button-color, var(--white, #FFFFFF));
            cursor: pointer;
            font-weight: 400;
            font-size: 1.6rem;
            height: 4.8rem;
            line-height: 1.5;
            min-width: var(--lit-button-min-width, 12rem);
            outline: 0;
            padding: 0 var(--lit-button-padding-horizontal, 2.4rem);
            -webkit-appearance: button;
            position: relative;
            transition: color 0.15s ease-in-out 0s, 
              background-color 0.15s ease-in-out 0s;
            text-align: center;
            text-decoration: none;
            text-transform: none;
            user-select: none;
            vertical-align: middle;
            width: var(--lit-button-width, auto);
          }
          .lit-button-icon {
            --lit-button-min-width: 5rem;
            --lit-button-padding-horizontal: 0;
          }

          button[disabled], button[disabled]:hover  {
            opacity: 0.65;
            pointer-events: none;
          }

          button:focus::before {
            content: "";
            border-radius: 0.25rem;
            border: 1px solid var(--white, #FFF);
            box-sizing: inherit;
            display: block;
            position: absolute;
            height: calc(100% - .8rem);
            top: .4rem;
            left: .4rem;
            visibility: visible;
            width: calc(100% - .8rem);
          }

          :host(.primary) {
            --lit-button-bg-color: var(--primary, #903D57);
          }

          :host(.primary) button:active, :host(.primary) button:hover {
            --lit-button-bg-color: var(--primary-active, #0062cc);
          }

          :host(.secondary) { 
            --lit-button-bg-color: var(--secondary, #433FDC);
          }

          :host(.secondary) button:active, :host(.secondary) button:hover {
            --lit-button-bg-color: var(--secondary-active, #433FA7);
          }

          :host(.success) {
            --lit-button-bg-color: var(--success, #00D000);
          }

          :host(.success) button:active, :host(.success) button:hover {
            --lit-button-bg-color: var(--success-active, #00AE00);
          }

          :host(.icon) {
            --lit-button-min-width: 5rem;
            --lit-button-padding-horizontal: 0;
          }
          `;
      }
      render() {
        return html `
          <button 
            class="lit-button"
            ?disabled=${this.disabled}>
            <slot></slot>
          </button>
        `;
      }
      
      /*No-slot*/
      
      /*render() {
        return html `
          <button 
            class="lit-button ${this.icon ? 'lit-button-icon' :''}"
            ?disabled=${this.disabled}>
            ${this.icon ? 
              html`<lit-icon icon="${this.icon}"></lit-icon>` : 
              `${this.text}`
            }
          </button>
        `;
      }*/
    }


    class LitIcon extends LitElement {

      static get properties() {
        return {
          icon: { type: String }
        }
      }
      static get styles() {
        return css`
          :host {
            display: flex;
            justify-content: center;
            color: var(--lit-icon-color, var(--while, #FFFFFF));
            pointer-events: none;
          }`
      }
      render() {
        return icons[this.icon];
      }
    }


    customElements.define('lit-button', LitButton);
    customElements.define('lit-icon', LitIcon);