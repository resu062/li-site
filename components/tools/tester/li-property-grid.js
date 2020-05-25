import { LitElement } from '../../../lib/lit-element/lit-element.js';
import '../../display/table/li-table.js';


class LiPropertyGrid extends LitElement {
    static get properties() {
        return { options: { type: Object }, label: { type: String } }
    }

    constructor() {
        super();
        this._props = {
            properties: customElements.get(this.localName).properties,
            defaults: {
                options: undefined, label: 'li-button'
            }
        }
        //for (let i in this._props.defaults) this[i] = this._props.defaults[i];
        let columns = [
            { title: "Name", field: "name", width: 150, bottomCalc: "count" },
            { title: "Value", field: "value", width: 150, hozAlign: "center" },
        ];
        //this.inspectedElement = e.target.assignedNodes()[1];
        let data = [{ name: '001', value: '002' }];
        //for (let i in this._props.defaults) data.push({ name: this.inspectedElement._props.defaults[i].key, value: this.inspectedElement._props.defaults[i].value });
        this.options = {
            label: '',
            maxHeight: "100%",
            minHeight: '100%',
            height: "30%",
            data: data,
            layout: "fitColumns",
            //autoColumns: true,
            columns: columns
            //rowClick: function(e, row) { alert("Row " + row.getData().id + " Clicked!!!!"); }
        };
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                height: 100%;
            }
        `;
    }

    render() {
        return html`
        <slot></slot>
        <div style="flex:1"></div>
        <div style="width:300px;display:flex">
            <li-table .options=${this.options} label=${this.options.label}></li-table>
        </div>
        `;
    }
}

customElements.define('li-property-grid', LiPropertyGrid);
