import { LiElement, html, css } from '../../li.js';

import '../property-grid/property-grid.js';
import '../layout-app/layout-app.js';
import '../button/button.js';
import '../icon/icons/icons.js';
import { indx } from './indx.js';

customElements.define('li-tester', class LiTester extends LiElement {
    static get properties() {
        return {
            label: { type: String, default: '' },
            component: { type: Object, default: undefined }
        }
    }

    get localName() {
        return this.component?.localName || 'li-tester'
    }

    static get styles() {
        return css`
            :host {
                color: gray;
                font-family: Arial;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app sides="300,300" fill="#9f731350" id="li-layout-app-tester">
                <div slot="app-top">
                    <div>${this.localName}</div>
                </div>
                <div slot="app-main" ref="main">
                    <slot @slotchange=${this.slotchange} id="slot"></slot>
                    <slot name="app-test"></slot>
                </div>
                <div slot="app-left" style="padding-left:4px;display:flex;flex-direction:column; align-items: left; justify-content: center">
                    ${Object.keys(indx).map(key => html`
                        ${key.startsWith('li-') ?
                        html`<li-button style="border-radius:4px" .indx="${indx[key]}" .label2="${key}" label="${indx[key].label}" width="auto" @click="${(e)=>this._tap(e, key)}"
                            back="${this._focused===key?'#d0d0d0':''}"></li-button>` :
                        html`<div style="display: flex;font-size:10px;flex-wrap:wrap">${indx[key].map(i =>
                            html`<li-button height="12" border="none" padding="2px" .indx="${i}" label="${i.label}" width="auto" @click="${this._openUrl}"></li-button>`
                        )}</div>`}`
                )}
                </div>
                <li-property-grid slot="app-right" id="li-layout-app-tester" .io=${this.component} label="${this.localName}"></li-property-grid>
            </li-layout-app>
        `;
    }

    slotchange(updateComponent = false) {
        if (!(updateComponent === true && this.component))
            this.component = this.shadowRoot.querySelectorAll('slot')[0].assignedElements()[0];
        if (this.component?._setPartid && this._partid) this.component._setPartid(this._partid);
    }

    async _tap(e, key) {
        if (this.component)
            this.removeChild(this.component);
        if (!this._wasRemoved) this.$refs.main.removeChild(this.$id.slot);
        this._wasRemoved = true
        let el = e.target.label2 || e.target.label;
        this._focused = key;
        let props = { ...indx[el].props, _partid: this.partid };
        if (props.iframe && props.iframe !== 'noiframe') {
            this.component = document.createElement("iframe");
            this.component.src = props.iframe;
            this.component.style.border = 'none';
        } else {
            this.component = await LI.createComponent(el, props);
        }
        this.component.setAttribute('slot', 'app-test');
        this.appendChild(this.component);
        this.slotchange(true);
    }

    _openUrl(e) {
        window.open(e.target.indx.url, 'li-url');
    }
});
