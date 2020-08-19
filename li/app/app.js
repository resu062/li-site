import { html } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../button/button.js'
let url = import.meta.url;

customElements.define('li-app', class LiApp extends LiElement {

    render() {
        return html`

            <li-layout-app sides="260,260,1,1" fill="#9f731350">
                 <img slot="app-top-left" src="${url.replace('app.js', 'li.png')}" style="max-width:64px;max-height:64px;padding:4px">

                 <div slot="app-bottom" style="display:flex;; align-items: center; justify-content: left;">
                    <li-button size=28 name="home" fill="gray" style="padding:2px" br="none:50%" @click="${(e) => LI.notifier.modal('Home ...')}" ></li-button>
                    <div style="flex:1"></div>
                    <li-button size=28 name="cloud-queue" fill="gray" style="padding:2px" br="none:50%" @click="${(e) => LI.notifier.success('Cloud ... Your custom message')}" style="border-radius:4px;"></li-button>
                    <li-button size=28 name="settings" fill="gray" style="padding:2px" br="none:50%" @click="${(e) => LI.notifier.warning('Settings ... Your custom message')}" ></li-button>
                    <li-button size=28 name="help-outline" fill="gray" style="padding:2px" br="none:50%" @click="${(e) => LI.notifier.info('Help ... Your custom message')}" ></li-button>
                </div>
                <div slot="app-left" style="padding-left:4px;display:flex;flex-direction:column; align-items: left; justify-content: center">
                    <li-button width="auto"></li-button>
                    <li-button width="auto"></li-button>
                    <li-button width="auto" @click="${(e) => { let ulid = LI.ulid(); LI.notifier.info(ulid); console.log(ulid);}}">ulid</li-button>
                </div>
                <div slot="app-right" style="padding-right:4px;display:flex;flex-direction:column; align-items: left; justify-content: center">
                    <li-button width="auto"></li-button>
                    <li-button width="auto"></li-button>
                    <li-button width="auto"></li-button>
                </div>
            </li-layout-app>
        `;
    }

});