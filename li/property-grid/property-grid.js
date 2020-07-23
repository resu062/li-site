import { LitElement, html, css } from '../../lib/lit-element/lit-element.js';
import '../table/table.js';


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
        };
        var dEditor = function(cell, onRendered, success, cancel, editorParams){
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
            onRendered(function(){
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
            data: [{name: '001', value: '002'}, {name: '001', value: '002'}],
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
        let el = this.shadowRoot.querySelectorAll('slot')[0].assignedElements()[0];
        el.addEventListener('liel-ready', (e) => {
            let data = [];
            if (el.localName === e.detail.message) Object.keys(el._props.defaults).forEach(key => { data.push({ name: key, value: el[key] }) });
            //this.options.data = data;
            this.options = { ...{}, ...this.options, ...{ data: data } };
            let prg = this.shadowRoot.getElementById('prg');
            prg.options = this.options;
            //this.option.data = data;
            this.requestUpdate();
            console.dir(this.options)
        })
    }
}

customElements.define('li-property-grid', LiPropertyGrid);
