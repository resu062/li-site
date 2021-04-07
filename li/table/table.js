import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../cell/cell.js';

customElements.define('li-table', class LiTable extends LiElement {
    static get properties() {
        return {
            data: { type: Object }
        }
    }

    constructor() {
        super();

        this.data = {
            items: [

            ]
        }
        for (let i = 0; i < 1000; i++) {
            this.data.items.push({ value: 1000000 + i + i/100, type: 'cleave-numeral' })
        }
    }

    firstUpdated() {
        super.firstUpdated();

    }

    updated(changedProperties) {

    }

    static get styles() {
        return css`
            :host {
                flex: 1;
                width: 100%;
                height: 100%;
                overflow: hidden;
            }
            .table {
                display: flex;
                flex-direction: column;
                flex: 1;
                /* width: 400px; */
                height: 100%;
                overflow: auto;
                border: 1px solid red;
            }
            .row {
                display: flex;
            }
        `;
    }

    render() {
        return html`
            <div class="table">
                ${this.data?.items.map(i => html`
                    <div class="row">
                        <div>${i.type} - ${i.value}</div>
                        <div>${i.type} - ${i.value}</div>
                        <!-- <li-cell class="cell" value="${i.value}" type=${i.type}></li-cell> -->
                    </div>
                `)}
            </div>
        `
    }

})
