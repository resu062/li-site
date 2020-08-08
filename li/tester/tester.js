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

    constructor() {
        super();
        var dEditor = function(cell, onRendered, success, cancel, editorParams) {
            //cell - the cell component for the editable cell
            //onRendered - function to call when the editor has been rendered
            //success - function to call to pass the successfuly updated value to Tabulator
            //cancel - function to call to abort the edit and return to a normal cell
            //editorParams - params object passed into the editorParams column definition property

            //create and style editor
            var editor = document.createElement("input");

            let type = typeof cell;
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
            editor.setAttribute("type", type);

            // //create and style input
            editor.style.padding = "3px";
            editor.style.width = "100%";
            editor.style.boxSizing = "border-box";

            // //Set value of editor to the current value of the cell
            // editor.value = moment(cell.getValue(), "DD/MM/YYYY").format("YYYY-MM-DD")
            editor.value = cell;

            // //set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
            onRendered(function() {
                editor.focus();
                editor.style.css = "100%";
            });

            // //when the value has been set, trigger the cell to update
            // function successFunc(){
            //     success(moment(editor.value, "YYYY-MM-DD").format("DD/MM/YYYY"));
            // }

            editor.addEventListener("change", {});
            editor.addEventListener("blur", {});

            //return the editor element
            return editor;
        };
        let columns = [
            { title: "Name", field: "name", width: 150, bottomCalc: "count" },
            { title: "Value", field: "value", width: 150, hozAlign: "center", editor: 'input' },
        ];
        this.options = {
            maxHeight: "100%",
            minHeight: '100%',
            height: "30%",
            data: [{ name: '001', value: '002' }, { name: '001', value: '002' }],
            layout: "fitColumns",
            //autoColumns: true,
            columns: columns,
            //rowClick: function(e, row) { alert("Row " + row.getData().id + " Clicked!!!!"); }
            cellEdited: (cell) => {
                console.dir(cell._cell.row.cells[0].value + ' - ' + cell._cell.value)
                this.component[cell._cell.row.cells[0].value] = cell._cell.value;
            },
        };
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                height: 100%;
                color: gray;
                font-family: Arial;
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

    slotchange() {
        let el = this.component = this.shadowRoot.querySelectorAll('slot')[0].assignedElements()[0];
        setTimeout(() => {
            let data = [];
            let id = 0;
            for (const k of el.$props.keys()) {
                if ( k.startsWith('_')) continue;
                const prop = el.$props.get(k)
                data.push({ id, name: k, value: el[k] || prop.default });
                id++;
            }
            this.options = { ...{}, ...this.options, ...{ data: data } };
            this.$id.prg.options = this.options;
            el._setTabulatorData = (prop, val) => {
                this.$id.prg.options.data.forEach(d => {
                    if (d.name === prop) {
                        d.value = val;
                        this.$id.prg.$table.updateData([{...d}]);
                        //this.$id.prg.$table.setData(this.$id.prg.$table.options.data);
                    }
                })
            }
            this.requestUpdate();
        });
    }
});
