import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../property-grid/property-grid.js';
import '../monitor/monitor.js';
import '../button/button.js';
import { data } from './data.js';

let url = import.meta.url;

customElements.define('li-l-system', class LiLSystem extends LiElement {
    static get properties() {
        return {
            name: { type: String, default: 'l-system', category: 'actions', save: true },
            animation: { type: Boolean, category: 'actions' },
            inverse: { type: Boolean, category: 'actions' },
            showMonitor: { type: Boolean, category: 'actions' },
            x: { type: Number, default: 0, category: 'offset' },
            y: { type: Number, default: 0, category: 'offset' },
            orientation: { type: Number, default: 0, category: 'offset' },
            levels: { type: Number, default: 0, category: 'params' },
            rules: { type: Object, category: 'params' },
            symbols: { type: Object, default: { 'F': 'F', '+': '+', '-': '-', '[': '[', ']': ']', '|': '|', '!': '!', '<': '<', '>': '>', '(': '(', ')': ')' }, category: 'params' },
            sizeValue: { type: Number, default: 0, category: 'variables' },
            sizeGrowth: { type: Number, default: 0, category: 'variables' },
            angleValue: { type: Number, default: 0, category: 'variables' },
            angleGrowth: { type: Number, default: 0, category: 'variables' },
            lineWidth: { type: Number, default: 0.218, category: 'variables' },
            lineColor: { type: String, default: 'black', category: 'variables', list: ['red', 'blue', 'green', 'orange', 'lightblue', 'lightgreen', 'lightyellow', 'yellow', 'darkgray', 'gray', 'darkgray', 'lightgray', 'white', 'black'] },
            // sensSizeValue: { type: Number, default: 0, category: 'sensitivities' },
            // sensSizeGrowth: { type: Number, default: 0, category: 'sensitivities' },
            // sensAngleValue: { type: Number, default: 0, category: 'sensitivities' },
            // sensAngleGrowth: { type: Number, default: 0, category: 'sensitivities' }
        }
    }

    constructor() {
        super();
        this.constructor._classProperties.get('name').list = Object.keys(data) || [];
    }

    init() {
        this.textRules = [];
        this.rules.replace(/\s|\n/g, '').split(",").forEach((r) => { if (r.includes(':')) this.textRules.push(r.split(':')) });
        this.seed = this.textRules[0][0];
        this.ruleMap = {};
        this.textRules.forEach(r => this.ruleMap[r[0]] = r[1]);
        this._commands = this.makeCommands(this.levels, this.seed, '', 0, 0, 400000);
        this.commands = []
        this._commands.split('').forEach(c => {
            c = this.symbols[c];
            if (c && Object.keys(this.symbols).includes(c)) this.commands.push(c);
        })
    }

    makeCommands(levelNum, levelExpr, acc, start, processed, count) {
        var end, i, reachesEndOfLevel, remaining, symbol;
        while (processed < count) {
            if (levelNum === 0) return levelExpr;
            remaining = count - processed;
            reachesEndOfLevel = remaining >= (levelExpr.length - start);
            if (reachesEndOfLevel) remaining = levelExpr.length - start;
            i = start;
            end = start + remaining;
            while (i < end) {
                symbol = levelExpr[i];
                acc += this.ruleMap[symbol] || symbol;
                i++;
            }
            processed += remaining;
            start += remaining;
            if (reachesEndOfLevel) {
                levelNum--;
                levelExpr = acc;
                acc = '';
                start = 0;
            }
        }
        return levelExpr;
    }

    fromUrl(url) {
        if (!url) return;
        const convertor = {
            'name': v => { this.name = decodeURIComponent(v || 'l-system') },
            'i': v => { this.levels = parseInt(v) },
            'r': v => { this.rules = decodeURIComponent(v.replaceAll('%0A', ', ')) },
            'p.size': v => { this.sizeValue = parseFloat(v[0] ? v[0] : 0); this.sizeGrowth = parseFloat(v[1] ? v[1] : 0.01) },
            'p.angle': v => { this.angleValue = parseFloat(v[0] ? v[0] : 0); this.angleGrowth = parseFloat(v[1] ? v[1] : 0.05) },
            's.size': v => { this.sensSizeValue = parseFloat(v[0] ? v[0] : 0); this.sensSizeGrowth = parseFloat(v[1] ? v[1] : 0.01) },
            's.angle': v => { this.sensAngleValue = parseFloat(v[0] ? v[0] : 0); this.sensAngleGrowth = parseFloat(v[1] ? v[1] : 0.05) },
            'offsets': v => { this.x = parseFloat(v[0] ? v[0] : 0); this.y = parseFloat(v[1] ? v[1] : 0); this.orientation = parseFloat(v[2] ? v[2] : 0); },
            'w': v => { this.lineWidth = parseFloat(v || 0.218) },
            'c': v => { this.lineColor = v },
            's': v => {
                const s = decodeURIComponent(v).split(',');
                const o = {};
                s.forEach(i => {
                    i = i.split(':');
                    o[i[0]] = i[1];
                })
                this.symbols = { ...o, ...this.symbols }
            },
        }
        this.lineWidth = 0.218;
        this.x = this.y = 0;
        this.orientation = -90;
        this.sizeValue = this.angleValue = this.sensSizeValue = this.sensAngleValue = 0;
        const d = url.split('&');
        d.map(p => {
            let v = p.split('=')
            if (['p.size', 'p.angle', 's.size', 's.angle', 'offsets'].includes(v[0]))
                v[1] = v[1].split(',');
            if (convertor[v[0]])
                convertor[v[0]](v[1]);
        })
    }

    firstUpdated() {
        super.firstUpdated();
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');

        let _s = window.location?.href.split('?')[1];
        let s = _s?.includes('p.size') && _s?.includes('p.angle') && _s?.split('&').length >= 5 ? _s : data[_s] ? data[_s] : data[this.name] || data['tree'];
        this.fromUrl(s);
        this._lineColor = this.lineColor;

        this._updated();
        setTimeout(() => {
            this.loop();
            this._isReady = true;
        }, 500);
    }

    updated(changedProperties) {
        if (this._isReady) {
            let update = false;
            changedProperties.forEach((oldValue, propName) => update = [
                'name', 'animation', 'inverse', 'orientation', 'sizeValue', 'sizeGrowth', 'angleValue', 'angleGrowth', 'lineWidth', 'lineColor', 'levels', 'rules', 'symbols', 'x', 'y'
            ].includes(propName));
            if (changedProperties.has('lineColor')) {
                this._lineColor = this.lineColor;
            }
            if (changedProperties.has('name')) {
                this._setData();
            } else if (changedProperties.has('animation')) {
                this.loop();
            } else if (update && !this._isUpdated) {
                this._isUpdated = true;
                this._updated();
            }
        }
    }

    _setData(name) {
        this._isUpdated = true;
        let s = data[name] || data[this.name] || data['tree'];
        this.fromUrl(s);
        this._lineColor = this.lineColor;
        this._updated();
    }

    _updated() {
        this.canvas.style.background = this.inverse ? 'black' : 'white';
        this.lineColor = this.inverse ? 'white' : this._lineColor === 'white' ? 'black' : this._lineColor;
        this.rotate = 0;
        this._x = innerWidth / 2;
        this._y = innerHeight / 2;
        this.state = {
            levels: this.levels,
            orientation: this.orientation,
            stepSize: this.sizeValue,
            stepAngle: this.angleValue,
            sizeGrowth: this.sizeGrowth,
            angleGrowth: this.angleGrowth,
            lineWidth: this.lineWidth,
            lineColor: this.lineColor,
            x: this._x + Number(this.x),
            y: this._y + Number(this.y)
        }
        this.init();
        this.$update();
        this.loop();
        this._isUpdated = false;
    }

    static get styles() {
        return css`
            .header {
                font-size: xx-large;
                font-weight: 700;
            }
            canvas {
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app sides="300,300,1,1" fill="#9f731350">
                 <img slot="app-top-left" src="${url.replace('l-system.js', 'li.png')}" style="max-width:64px;max-height:64px;padding:4px">
                 <div slot="app-top" class="header"><a target="_blank" href="https://ru.wikipedia.org/wiki/L-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0">L-System</a></div>
                 <div slot="app-top-right">
                     <li-button name="play-arrow" @click="${() => { this.animation = !this.animation; this.$update() }}"></li-button>
                     <li-button name="chevron-left" @click="${() => { this.rotate--; this.loop() }}"></li-button>
                     <li-button name="chevron-right" @click="${() => { this.rotate++; this.loop() }}"></li-button>
                 </div>
                <div slot="app-left" style="padding-left:4px;display:flex;flex-direction:column;">
                    ${Object.keys(data).map(name => html`
                        <li-button width="100%" .label="${name}" @click="${() => this._setData(name)}"></li-button>
                    `)}
                </div>
                <div slot="app-main">
                <canvas ref="canvas" slot="main" width="${innerWidth}" height="${innerHeight}" @mousedown="${() => this.animation = true}" @mouseup="${() => this.animation = false}"
                        @touchstart="${() => this.animation = true}" @touchend="${() => this.animation = false}"></canvas>
                </div>
                <div slot="app-right" style="padding-right:4px;display:flex;flex-direction:column; align-items: left; justify-content: center">
                    <li-property-grid label="l-system" .io="${this}"></li-property-grid>
                </div>
            </li-layout-app>
            <li-monitor .hide="${!this.showMonitor}"></li-monitor>
        `
    }

    loop() {
        draw({ ...this.state }, this.commands, this.ctx, this.rotate);
        if (this.animation) {
            this.rotate = this.rotate += 1;
            requestAnimationFrame(this.loop.bind(this));
        }
    }
});

function draw(state, commands, ctx, rotate) {
    const cmd = {
        'F': () => {
            const ang = ((state.orientation % 360) / 180) * Math.PI;
            state.x += Math.cos(ang) * state.stepSize;
            state.y += Math.sin(ang) * state.stepSize;
            ctx.lineTo(state.x, state.y);
        },
        'S': () => { },
        '+': () => { state.orientation += (state.stepAngle + rotate) },
        '-': () => { state.orientation -= (state.stepAngle - rotate) },
        '[': () => { context.stack.push({ orientation: state.orientation, stepAngle: state.stepAngle, stepSize: state.stepSize, x: state.x, y: state.y }) },
        ']': () => {
            context.state = state = { ...state, ...context.stack.pop() };
            ctx.moveTo(state.x, state.y);
        },
        '|': () => { state.orientation += 180 },
        '!': () => { state.stepAngle *= -1 },
        '<': () => { state.stepSize *= 1 + state.sizeGrowth },
        '>': () => { state.stepSize *= 1 - state.sizeGrowth },
        '(': () => { state.stepAngle *= 1 - state.angleGrowth },
        ')': () => { state.stepAngle *= 1 + state.angleGrowth }
    }
    const context = { stack: [] };
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = state.lineColor;
    ctx.lineWidth = state.lineWidth;
    ctx.beginPath();
    ctx.moveTo(state.x, state.y);
    commands.forEach(c => { cmd[c]() });
    ctx.stroke();
}
