import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../table/table.js';

customElements.define('li-tester', class LiTester extends LiElement {
    static get properties() {
        return {
            options: { type: Object, default: undefined },
            label: { type: String, default: 'li-button' },
            component: { type: Object, default: undefined }
        }
    }

    get _columns() {
        return [
            { title: 'Name', field: 'name', width: 150, bottomCalc: 'count' },
            {
                title: 'Value', field: 'value', width: 150, hozAlign: 'center',
                cellClick: async (e, cell, el = this.component) => {
                    var editor = document.createElement("input");
                    let type = cell.getData().type.name.toLowerCase();
                    switch (type) {
                        case 'number':
                            type = 'number';
                            break;
                        case 'boolean':
                            type = 'checkbox';
                            break;
                        default:
                            type = 'text';
                            break;
                    }
                    editor.setAttribute('type', type);
                    editor.value = cell.getValue()
                    let value = cell.getValue();

                    try {
                        let val = await LI.show('dropdown', 'cell', { type, value }, { parent: e.target, useParentWidth: true, intersect: true })
                        cell.setValue(val.value)
                        el[cell.getData().name] = val.value;
                    } catch (err) { }
                }
            },
        ]
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                height: 100%;
                color: gray;
                font-family: Arial;
            }
            ::slotted(*) {
                display: contents;
            }
        `;
    }

    render() {
        return html`
            <slot @slotchange=${this.slotchange}></slot>
            <div style="flex:1"></div>
            <div style="width:300px;display:flex">
                <li-table id="prg" .options="${this.options}"></li-table>
            </div>
        `;
    }

    async slotchange() {
        this.options = {
            maxHeight: '100%',
            minHeight: '100%',
            height: '30%',
            //data: [{ name: '001', value: '002' }, { name: '001', value: '002' }],
            layout: 'fitColumns',
            columns: this._columns,
        };
        let el = this.component = this.shadowRoot.querySelectorAll('slot')[0].assignedElements()[0];
        setTimeout(() => {
            let data = [];
            let id = 0;
            for (const k of el.$props.keys()) {
                if (k.startsWith('_')) continue;
                const prop = el.$props.get(k)
                data.push({ id, name: k, value: el[k] || prop.default, type: prop.type });
                id++;
            }
            this.options = { ...{}, ...this.options, ...{ data: data } };
            el._setTabulatorData = (prop, val) => {
                this.$id.prg.options.data.forEach(d => {
                    if (d.name === prop) {
                        d.value = val;
                        this.$id.prg.$table.updateData([{ ...d }]);
                        //this.$id.prg.$table.setData(this.$id.prg.$table.options.data);
                    }
                })
            }
            this.requestUpdate();
        });
    }
});
