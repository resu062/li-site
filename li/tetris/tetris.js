import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../button/button.js'

let url = import.meta.url;

customElements.define('li-tetris', class LiTetris extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: 'TETRIS' },
        }
    }

    static get styles() {
        return css`

        `;
    }

    render() {
        return html`
            <li-layout-app sides="360,360,1,1" fill="#9f731350">
                <div slot="app-top" style="font-size:xx-large;display:flex;align-items: center; justify-content: center;">
                    <img src="${url.replace('tetris.js', 'li.png')}" style="max-width:48px;max-height:48px;padding:4px">
                     ... TETRIS ...
                    <img src="${url.replace('tetris.js', 'li.png')}" style="max-width:48px;max-height:48px;padding:4px">
                </div>

                <div slot="app-left" style="display:flex;flex-direction:column; align-items: strech; justify-content: center;height:100%">
                    <div style="flex:1"></div>
                    <li-button width="auto" height="128px" >1</li-button>
                    <div style="display:flex;align-items: center; justify-content: center;">
                        <li-button width="auto" height="128px" style="flex:1">2</li-button>
                        <li-button width="auto" height="128px" style="flex:1">3</li-button>
                    </div>
                    <li-button width="auto" height="128px" >4</li-button>
                </div>

                <div slot="app-main" style="display:flex;align-items: center; justify-content: center;height:100%">
                    <div style="border: 4px solid orange;height:86vh;width:28vw;border-radius:8px"></div>
                </div>

                <div slot="app-right" style="display:flex;flex-direction:column; align-items: strech; justify-content: center;height:100%;font-size:large;">
                    <div style="margin:16px;font-size:large;">Score: 000</div>
                    <div style="margin:16px;font-size:large;">Lines: 000</div>
                    <div style="margin:16px;font-size:large;">Level: 000</div>
                    <div style="flex:1"></div>
                    <li-button width="auto" height="128px" >1</li-button>
                    <div style="display:flex;align-items: center; justify-content: center;">
                        <li-button width="auto" height="128px" style="flex:1">2</li-button>
                        <li-button width="auto" height="128px" style="flex:1">3</li-button>
                    </div>
                    <li-button width="auto" height="128px" >4</li-button>
                </div>

                <!-- <div slot="app-bottom" style="display:flex;; align-items: center; justify-content: left;">  
                    <li-button size=28 name="home" fill="gray" style="padding:2px" br="none:50%" @click="${(e) => LI.notifier.modal('Home ...')}" ></li-button>
                    <div style="flex:1"></div>
                    <li-button size=28 name="settings" fill="gray" style="padding:2px" br="none:50%"></li-button>
                    <li-button size=28 name="help-outline" fill="gray" style="padding:2px" br="none:50%"></li-button>
                </div> -->
            </li-layout-app>
        `;
    }
});
