import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';
import '../chart/chart.js';

customElements.define('li-credit-calc', class LiDbCreditCalc extends LiElement {
    static get properties() {
        return {
            left: { type: Number, default: 600 },
            summa: { type: Number, default: 1000000 },
            percent: { type: Number, default: 10 },
            period: { type: Number, default: 60 },
            date: { type: String },
            data: { type: Object },
            options: { type: Object }
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.date = '25.03.2021';

        this.data = {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [...[{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]]
        }
        this.options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex: 1;
                height: 100%;
            }
            .container {
                display: flex;
                flex-direction: column;
                /* flex: 1; */
                margin: 2px;
                border: 1px solid transparent;
                overflow: hidden;
            }
            .splitter {
                max-width: 4px;
                min-width: 4px;
                cursor: col-resize;
                z-index: 99;
                border-left: 1px solid lightgray;
                border-right: 1px solid lightgray;
            }
            .splitter:active {
                background: darkgray;
            }
            .input {
                display: flex;
                justify-content: space-between;
                margin: 1px;
            }
            input {
                margin-left: 4px;
            }
        `;
    }

    render() {
        return html`
            <div style="display: flex; flex: 1; height: 100%;" @mousemove=${this._move} @mouseup="${() => this._splitterDown = false}">
                <div class="container" style="width:${this.left + 'px'};'max-width':${this.left + 'px'}">
                    <div style="display:flex;padding: 4px;flex-wrap:wrap">
                        <div style="display:flex;flex-direction:column;">
                            <div style="font-weight: 700;text-decoration:underline;margin-bottom:8px;">Кредитный калькулятор</div>
                            <div class="input"><span>Сумма кредита</span><input type="number" value="${this.summa}" /></div>
                            <div class="input"><span>Проценты (за год)</span><input type="number" value="${this.percent}" /></div>
                            <div class="input"><span>Срок кредита месяц</span><input type="number" value="${this.period}" /></div>
                            <div class="input"><span>Дата выдачи кредита</span><input type="date" value="${this.date}" /></div>
                            <div class="input"><div class="flex"></div><li-button width="120" label="Вычислить"></li-button></div>
                        </div>
                        <div v style="display:flex;flex-direction:column;flex:1;justify-content:center;align-items:center;">
                            <div>Ежемесячный платеж</div>
                            <div style="font-weight: 700">21 247,00</div>
                            <div>Сумма кредита + Проценты</div>
                            <div style="font-weight: 700">1 000 000,00 + 274 822,68</div>
                            <div>Итого общая сумма выплат</div>
                            <div style="font-weight: 700">1 274 822,68</div>
                        </div>
                    </div>
                    <li-chart type="bar" .data="${this.data}" .options="${this.options}" style="flex:1;height:100%;"></li-chart>
                </div>
                <div class="splitter" @mousedown="${() => this._splitterDown = true}"></div>
                <div class="container">

                </div>
            </div>
        `;
    }

    _move(e) {
        if (!this._splitterDown) return;
        e.preventDefault();
        this.left += e.movementX;
        if (this.left < 600) this.left = 600;
    }
});