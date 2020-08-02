import { LitElement, html } from '../../lib/lit-element/lit-element.js';
import '../layout-app/layout-app.js';
let url = import.meta.url;

customElements.define('li-app', class LiApp extends LitElement {

    render() {
        return html`
            <li-layout-app sides="260,260,1,1" fill="#9f731350">
                 <img slot="app-top" src="${url.replace('app.js', 'li.png')}" style="max-width:64px;max-height:64px;padding:4px">

                 <div slot="app-bottom" style="display:flex;; align-items: center; justify-content: left;">
                    <li-button size=28 name="home" fill="gray" style="padding:2px" br="none:50%" onclick="notifier.modal('<b>Home</b>');" ></li-button>
                    <div style="flex:1"></div>
                    <li-button size=28 name="cloud-queue" fill="gray" style="padding:2px" br="none:50%" onclick="notifier.modal('<b>Cloud</b>');" style="border-radius:4px;"></li-button>
                    <li-button size=28 name="settings" fill="gray" style="padding:2px" br="none:50%" onclick="notifier.modal('<b>Settings</b>');" ></li-button>
                    <li-button size=28 name="help-outline" fill="gray" style="padding:2px" br="none:50%" onclick="notifier.modal('<b>Help</b>');" ></li-button>
                </div>
            </li-layout-app>
        `;
    }

});