import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-cell', class LiCell extends LiElement {
    static get properties() {
        return {
            type: { type: String, default: 'text' },
            value: { type: String, default: '' },
            props: { type: Object, default: undefined }
        }
    }

    static get styles() {
        return css`
                :host {
                    display:flex;
                    flex-direction: column;
                    align-items: stretch;
                    justify-content: center;
                    overflow: hidden;
                } 
                .cell {
                    display:flex;
                    justify-content: center;
                    align-items: center;
                    background: lightyellow; 
                    padding: 2px;
                    border:1px solid lightblue; 
                }
                #input {
                    font-size: 1em;
                    color: dark;
                    font-family: Arial;
                    text-align: center;
                    outline: none; 
                    background: transparent; 
                    border: none;
                    flex: 1;
                    min-width: 0px;
                }  
                .cells {
                    text-align: left;
                    background: lightyellow; 
                    padding: 2px;
                    border:1px solid lightblue;
                    border-top: 0px;
                    cursor: pointer;
                    justify-content: left;
                    flex: 1;
                }
                .cells:hover {
                    transition: .3s;
                    filter: brightness(85%);
                }
                .list {
                    overflow: auto;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                }
        `;
    }

    render() {
        return html`
            <div class="cell">
                <input id="input" type="${this.type}" value="${this.value}" @change="${e => this._change(e)}"/>
                <li-button name="check" size="16" fill="lightblue" color="lightblue" @click="${this._tap}"></li-button>
            </div>
            <div class="list">
                ${this.props && this.props.list ? this.props.list.map(l => html`<div class="cells" @click="${this._tap}">${l}</div>`) : ``}
            </div>
        `;
    }

    updated() {
        if (this.type === 'checkbox') this.$id.input.checked = this.value;
    }

    _change(e) {
        this.value = this.type === 'checkbox' ? e.target.checked : e.target.value;
    }

    _tap(e) {
        let el = this.$id.input;
        this.value = this.type === 'checkbox' ? el.checked : e.target.className ? e.target.innerText : el.value;
        LI.fire(document, "okChangedValue");
    }
});