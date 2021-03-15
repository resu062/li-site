import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../db-cell/db-cell.js';

customElements.define('li-tabs', class LiTabs extends LiElement {
    static get properties() {
        return {
            _partid: { type: String, default: '' },
            item: { type: Object, default: {} },
            liSize: { type: Number, default: 28, local: true },
            vertical: { type: Boolean, default: false },
            horizontal: { type: Boolean, default: false },
            iconSettingsV: { type: String, default: 'more-vert' },
            iconSettingsH: { type: String, default: 'more-horiz' }
        }
    }

    get items() {
        return this.item && this.item.map ? this.item : this.item && this.item.items && this.item.items.map ? this.item.items : [];
    }

    static get styles() {
        return css`
            :host {
                margin: 2px;
            }
            .tabs {
                display: flex;
            }
            .cell {
                margin: 2px;
            }
        `;
    }

    render() {
        return html`
            <div class="buttons" style="display:flex;flex-direction:${this.horizontal ? 'row' : 'column'};position:sticky;top:0px;float:right;z-index:9;">
                <li-button name="chevron-left" size="${this.liSize}" style="margin:2px;"></li-button> 
                <li-button name="chevron-right" size="${this.liSize}" style="margin:2px;"></li-button>  
                <li-button name="expand-more" size="${this.liSize}" style="margin:2px;"></li-button>
                <li-button name="settings" size="${this.liSize}" style="margin:2px;" @click="${this._clickSettings}"></li-button>
            </div> 
            <div class="tabs" style="overflow:auto;flex-direction:${this.vertical ? 'column' : 'row'}">
                ${this.items.map(i => html`
                    <li-db-cell class="cell" .item="${i}" icon="${i.icon}" label="${i.label}" hideIcons="2" iconSettings="close" liSize="${this.liSize}" @click="${this._clickCell}"></li-db-cell>    
                `)}
            </div>
        `
    }
    async _clickSettings(e) {
        this._iconSettings = this._iconSettings === this.iconSettingsH ? this.iconSettingsV : this.iconSettingsH;
        let val = await LI.show('dropdown', 'db-cell-list', {
            list: [
                { icon: this._iconSettings, label: 'Rotate menu', action: 'rotateMenu', hideIcons: '23' },
                { icon: 'repeat', label: 'Rotate tabs', action: 'rotateTabs', hideIcons: '23' },
                { icon: 'add', label: 'Add tab', action: 'addTab', hideIcons: '23' },
            ]
        }, {});
        switch (val.detail.action) {
            case 'addTab':
                if (this.item && this.item.map) {
                    this.item.push({ label: 'new-tab' });
                } else if (this.item && this.item.items && this.item.items.map) {
                    this.item.items.push({ label: 'new-tab' });
                }
                break;
            case 'rotateTabs':
                this.vertical = !this.vertical;
                break;
            case 'rotateMenu':
                this.horizontal = !this.horizontal;
                break;
            default:
                break;
        }
        this.$update();
    }
    _clickCell(e) {
        if (e.target._target && e.target._target.id === 'btn3') {
            console.log(e);
            if (this.item && this.item.map) {
                this.item.splice(this.item.indexOf(e.target.item), 1);
            } else if (this.item && this.item.items && this.item.items.map) {
                this.item.items.splice(this.item.items.indexOf(e.target.item), 1);
            }
        }
        this.$update();
    }
});
