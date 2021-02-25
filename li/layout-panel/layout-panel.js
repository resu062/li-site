import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-layout-panel', class LiLayoutPanel extends LiElement {
    static get properties() {
        return {

        }
    }

    connectedCallback() {
        super.connectedCallback();

    }

    static get styles() {
        return css`
            .div1 {
                height:100%;
                width:100%;
                position:relative;
                background:gray;
                display:flex;

            }

            .div2 {
                margin: 4px;
                position:relative;
                background:darkgray;
                border:1px solid white;
                overflow: hidden;
            }

            .dv21 {
                flex:1;
            }

            .dv22 {
                flex:1;
            }

            .div3 {
                position: absolute;
                right: 0;
                top:0;
                bottom: 0;
                width:20%;
                background:lightgray;
                border:1px solid black;

            }
            .dv31 {
                left: 0;
            }

            .dv312 {
                right: 0;
                width:10%;
                border:1px solid white;
            }
            .dv311 {
                right: 0;
                width:10%;
                border:1px solid white;
            }
        `;
    }

    render() {
        return html`
            <div class="div1">
                <div class="div2 dv21">

                    <div class="div3 dv31">
                        <div class="div3 dv31 dv311">
                        <!-- I need div3 with full width and full height -->
                        </div>
                    </div>
                    <div class="div3">
                        <div class="div3  dv312">
                            <!-- I need div3 with full width and full height -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
});
