import { LiElement, html, css } from '../../li.js';

import '../chart/chart.js';

const _lds = (date) => {
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

customElements.define('li-valuta', class LiValuta extends LiElement {
    static get properties() {
        return {
            startValute: { type: String, default: 'USD' },
            data: { type: Object },
            options: { type: Object },
            focusedValute: { type: Object },
            focusedDate: { type: Object },
            selectionValute: { type: Array, default: [] },
            startDate: { type: String },
            endDate: { type: String },
            valueRub: { type: Number, default: 0 },
            valueValute: { type: Number, default: 0 },
            _isReady: { type: Boolean }
        }
    }

    get arrValute() {
        if (!this._rates) return;
        const keys = Object.keys(this._rates?.Valute) || [];
        const arr = keys.map(k => {
            this._rates.Valute[k]._Def = this._rates.Valute[k].Value - this._rates.Valute[k].Previous;
            this._rates.Valute[k].Def = (this._rates.Valute[k].Value - this._rates.Valute[k].Previous).toFixed(2);
            return this._rates.Valute[k];
        })
        return arr;
    }
    get arrPeriod() {
        const recs = this._period?.ValCurs?.Record || [];
        const arr = recs.map(o => {
            return { x: o['@attributes'].Date, y: o.Value, n: o.Nominal };
        })
        return arr;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                height: 100%;
            }
            .horizontal { display: flex; }
            .vertical { display: flex; flex-direction: column; }
            .flex { flex: 1; }
            .flex2 { flex: 2; }
            .flex5 { flex: 5; }
            .overflow { overflow: auto; }
            .left { text-align: left; }
            .center { text-align: center; }
            .right { text-align: right; }
            .main {
                max-width: 630px; 
                min-width: 630px;
                margin: 2px;
                overflow: hidden;
            }
            .mainHeader {
                font-family: Arial;
                font-size: large;
                font-weight: 700;
                text-decoration: underline;
                margin-bottom: 16px;
                text-align: center;
            }
            .container {
                display: flex;
                flex-direction: column;
                overflow: auto;
                flex: 1; 
                font-size: small;
                margin: 2px;
                border: 1px solid transparent;
            }
            .table1 { max-width: 380px; min-width: 380px; }
            .table2 { max-width: 240px; min-width: 240px; }
            .tableHeader {
                position: sticky;
                top: 0;
                display: flex; 
                justify-content: space-between;
                text-align: center;
                background: white;
                font-weight: 600;
                z-index: 1;
            }
            .chart {
                border: 1px solid lightgray;
                margin: 8px;
                padding: 8px;
            }
            .inf {
                display: flex;
                justify-content: space-between;
                padding-left: 6px;
                font-size: larger;
                font-family: monospace;
            }
            .val { font-weight: 700; }
            .focused { box-shadow: inset 0 -3px 0 0 blue; }
            input {
                text-align: right;
                margin-left: 4px;
                color: gray;
                font-family: Arial;
                width: 140px;
                border: 1px solid lightgray;
            }
            .row {
                display: flex;
                justify-content: space-between;
            }
            .row:hover { filter: invert(15%); }
            .even { background: #f0f0f0; }
            .odd { background: #fefefe; }
            .cell {
                padding: 8px;
                border: 1px solid lightgray;
                overflow: hidden;
                font-family: Arial;
                font-size: x-small;
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            <div class="main vertical">
                <div class="vertical">
                    <div class="mainHeader">Курсы валют</div>
                    <div class="inf">Дата.......<span class="val">${this.focusedDate?.x || ''}</span><div class="flex"></div>Период с 
                        <input type="date" .value="${this.startDate}" @change="${(e) => this.startDate = _lds(e.target.valueAsDate)}"/>
                    </div>
                    <div class="inf">Валюта.....<span class="val">${this.focusedValute?.Name || ''}</span><div class="flex"></div>по 
                        <input type="date" .value="${this.endDate}" @change="${(e) => this.endDate = _lds(e.target.valueAsDate)}"/>
                    </div>
                    <div class="inf">Номинал....<span class="val">${this.focusedValute?.Nominal || ''}</span><div class="flex"></div></div>
                    <div class="inf">Курс(руб)..<span class="val">${this.focusedDate?.y || this.focusedValute?.Value || ''}</span><div class="flex"></div>
                        <span class="val">${this.focusedValute?.CharCode}</span><input type="number" .value="${this.valueValute}" @change="${this._changedValute}"/>
                        <span class="val">RUB</span><input type="number" .value="${this.valueRub}" @change="${this._changedRub}"/>
                    </div>
                </div>
                <div class="horizontal flex overflow">
                    <div class="container table1">
                        <div class="tableHeader">
                            <div class="cell flex">Код</div>
                            <div class="cell flex5">Валюта</div>
                            <div class="cell flex2">Номинал</div>
                            <div class="cell flex2">Курс</div>
                            <div class="cell flex">+/</div>
                        </div>
                        ${(this.arrValute || []).map((o, i) => {
                        return html` 
                            <div class="row ${i % 2 ? 'even' : 'odd'} ${this.focusedValute?.CharCode === o.CharCode ? 'focused' : ''}" @click="${(e) => this._tapValute(e, o)}">
                                <div class="cell flex left">${o.CharCode}</div>
                                <div class="cell flex5 left">${o.Name}</div>
                                <div class="cell flex2 right">${o.Nominal}</div>
                                <div class="cell flex2 right">${o.Value}</div>
                                <div class="cell flex right" style="color:${o._Def >= 0 ? 'blue' : 'red'}">${o.Def}</div>
                            </div>
                        `})}
                    </div>
                    <div class="container table2">
                        <div class="tableHeader">
                            <div class="cell flex2">Дата</div>
                            <div class="cell flex">Номинал</div>
                            <div class="cell flex">Курс</div>
                        </div>
                        ${(this.arrPeriod || []).map((o, i) => {
                        return html`
                            <div class="row ${i % 2 ? 'even' : 'odd'} ${this.focusedDate?.x === o.x ? 'focused' : ''}" @click="${(e) => this._tapDate(e, o)}">
                                <div class="cell flex2 center">${o.x}</div>
                                <div class="cell flex right">${o.n}</div>
                                <div class="cell flex right">${o.y}</div>
                            </div>
                        `})}
                    </div>
                </div>
            </div>
            <li-chart class="chart flex" type="line" .data="${this.data}" .options="${this.options}"></li-chart>
        `;
    }

    constructor() {
        super();
        this.init();
    }
    updated(changedProperties) {
        if (this._isReady) {
            let update = false;
            changedProperties.forEach((oldValue, propName) => {
                update = ['startDate', 'endDate'].includes(propName);
                //console.log(`${propName} changed. oldValue: ${oldValue}, newValue: ${this[propName]}`);
            });
            if (update) this.init();
        }
    }

    async init() {
        let date = new Date();
        this.endDate = this.endDate || _lds(date);
        date.setDate(1);
        date.setMonth(date.getMonth() - 1);
        this.startDate = this.startDate || _lds(date);
        let startDate = this.startDate.split('-').reverse().join('/');
        let endDate = this.endDate.split('-').reverse().join('/');

        let json = await fetch(`https://cors.bridged.cc/https://www.cbr-xml-daily.ru/daily_json.js`);
        this._rates = await json.json();
        this.focusedValute = this.focusedValute || this._rates.Valute[this.startValute];

        const res = await fetch(`
https://cors.bridged.cc/https://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=${startDate}&date_req2=${endDate}&VAL_NM_RQ=${this.focusedValute?.ID}`);
        const xml = await res.text();
        const XmlNode = new DOMParser().parseFromString(xml, 'text/xml');
        this._period = this.xmlToJson(XmlNode);
        this.focusedDate = this.arrPeriod[this.arrPeriod.length - 1];

        this.options = {
            title: {
                display: true,
                text: `Курсы валют за период с ${startDate.replaceAll('/', '.')} по ${endDate.replaceAll('/', '.')}`,
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'руб'
                    }
                }]
            }
        }
        this.data = {
            labels: (this.arrPeriod || []).map(o => o.x),
            datasets: [{
                label: this.focusedValute.CharCode,
                fill: false,
                lineTension: 0,
                backgroundColor: 'lightblue',
                borderColor: 'lightblue',
                data: (this.arrPeriod || []).map(o => o.y.replace(',', '.'))
            }]
        }
        this.$update();
        this._isReady = true;
    }
    async _tapValute(e, o) {
        this.focusedValute = o;
        await this.init();
        if (this._lastChangedRub)
            this._changedRub(this.valueRub);
        else
            this._changedValute(this.valueValute);
    }
    _tapDate(e, o) {
        this.focusedDate = o;
        if (this._lastChangedRub)
            this._changedRub(this.valueRub);
        else
            this._changedValute(this.valueValute);
    }
    _changedRub(e) {
        this._lastChangedRub = true;
        this.valueRub = e.target?.value || e;
        const val = this.focusedDate?.y || this.focusedValute?.Value;
        this.valueValute = ((e.target?.value || e) / val.replace(',', '.') * this.focusedValute.Nominal).toFixed(4);
        this.$update();
    }
    _changedValute(e) {
        this._lastChangedRub = false;
        this.valueValute = e.target?.value || e;
        const val = this.focusedDate?.y || this.focusedValute?.Value;
        this.valueRub = ((e.target?.value || e) * val.replace(',', '.') / this.focusedValute.Nominal).toFixed(4);
        this.$update();
    }
    xmlToJson(xml) {
        var obj = {};
        if (xml.nodeType == 1) {
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) {
            obj = xml.nodeValue;
        }
        var textNodes = [].slice.call(xml.childNodes).filter((node) => node.nodeType === 3);
        if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
            obj = [].slice.call(xml.childNodes).reduce((text, node) => text + node.nodeValue, "");
        } else if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof obj[nodeName] == "undefined") {
                    obj[nodeName] = this.xmlToJson(item);
                } else {
                    if (typeof obj[nodeName].push == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    obj[nodeName].push(this.xmlToJson(item));
                }
            }
        }
        return obj;
    }
});
