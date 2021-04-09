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
            levels: { type: Number, default: 0, category: 'params' },
            sizeValue: { type: Number, default: 0, category: 'params' },
            angleValue: { type: Number, default: 0, category: 'params' },
            rules: { type: Object, category: 'params' },
            symbols: { type: Object, default: { 'F': 'F', '+': '+', '-': '-', '[': '[', ']': ']', '|': '|', '!': '!', '<': '<', '>': '>', '(': '(', ')': ')' }, category: 'params' },
            extSymbols: { type: String, default: '', category: 'params' },
            rotate: { type: Number, default: 0, category: 'params' },
            sizeGrowth: { type: Number, default: 0, category: 'variables' },
            angleGrowth: { type: Number, default: 0, category: 'variables' },
            lineWidth: { type: Number, default: 0.218, category: 'variables' },
            lineColor: { type: String, default: 'black', category: 'variables', list: ['red', 'blue', 'green', 'orange', 'lightblue', 'lightgreen', 'lightyellow', 'yellow', 'darkgray', 'gray', 'darkgray', 'lightgray', 'white', 'black'] },
            colorStep: { type: Number, default: 0, category: 'variables' },
            depth: { type: Number, default: 0, category: 'variables' },
            speed: { type: Number, default: 1, category: 'variables' },
            x: { type: Number, default: 0, category: 'offset' },
            y: { type: Number, default: 0, category: 'offset' },
            orientation: { type: Number, default: 0, category: 'offset' },
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

    firstUpdated() {
        super.firstUpdated();
        this._sign = 1;
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this._location = window.location.href;
        this.getCommands(this.name, true);
    }

    updated(changedProperties) {
        if (this._isReady) {
            let update = false;
            changedProperties.forEach((oldValue, propName) => update = [
                'name', 'animation', 'inverse', 'orientation', 'sizeValue', 'sizeGrowth', 'angleValue', 'angleGrowth', 'lineWidth',
                'lineColor', 'levels', 'rules', 'symbols', 'x', 'y', 'depth', 'speed', 'colorStep', 'extSymbols'
            ].includes(propName));
            if (changedProperties.has('extSymbols')) {
                if (this.extSymbols) {
                    const o = {};
                    this.extSymbols.split(',').forEach(i => {
                        i = i.split(':');
                        o[i[0]] = i[1];
                    })
                    this.symbols = { ...o, ...this.symbols };
                    if (!this.animation) this.loop();
                }
            }
            if (changedProperties.has('inverse')) {
                this.canvas.style.background = this.inverse ? 'black' : 'white';
                this.lineColor = this.inverse ? 'white' : 'black';
            }
            if (changedProperties.has('name')) {
                this._refreshPage();
                this.getCommands(this.name, true);
            } else if (changedProperties.has('levels') || changedProperties.has('rules')) {
                this.getCommands();
            } else if (changedProperties.has('animation') && this.animation) {
                this.loop(true);
            } else if (update && !this.animation) {
                this.loop();
            }

        }
    }

    static get styles() {
        return css`
            .header {
                font-size: xx-large;
                font-weight: 600;
            }
            canvas {
                cursor: pointer;
            }
            img {
                max-width: 64px;
                max-height: 64px;
                padding: 4px;
                cursor: pointer;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app sides="300,300,1,1" fill="#9f731350">    
                 <img slot="app-top-left" src="${url.replace('l-system.js', 'li.png')}" @click="${() => this._refreshPage(true)}" title="reload page">
                 <div slot="app-top" class="header"><a target="_blank" href="https://ru.wikipedia.org/wiki/L-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0">L-System</a></div>
                 <div slot="app-top">[${this._lenght}]</div>
                 <div slot="app-top-right">
                    <li-button name="play-arrow" rotate=180 @click="${() => { this._sign = -1; this.animation = !this.animation; this.$update() }}"></li-button>
                    <li-button name="play-arrow" @click="${() => { this._sign = 1; this.animation = !this.animation; this.$update() }}"></li-button>
                    <li-button name="chevron-left" @click="${() => { this.rotate -= Number(this.speed); this.loop() }}"></li-button>
                    <li-button name="chevron-right" @click="${() => { this.rotate += Number(this.speed); this.loop() }}"></li-button>
                    <li-button name="refresh" @click="${() => this.getCommands(this.name, true)}" title="refresh params"></li-button>
                    <li-button name="launch" @click="${this.toUrl}" title="open in new window"></li-button>
                 </div>
                <div slot="app-left" style="padding-left:4px;display:flex;flex-direction:column;">
                    ${Object.keys(data).map(name => html`
                        <li-button back="${this.name === name ? '#e0e0e0' : ''}" width="100%" .label="${name}" @click="${() => this.name = name}"></li-button>
                    `)}
                </div>
                <canvas ref="canvas" slot="app-main" width="${innerWidth}" height="${innerHeight}" @mousedown="${() => this.animation = true}" @mouseup="${() => this.animation = false}"
                        @touchstart="${() => { this.animation = true; this.$update() }}" @touchend="${() => { this.animation = false; this.$update() }}"></canvas>
                <li-property-grid slot="app-right" label="l-system" .io="${this}"></li-property-grid>
            </li-layout-app>
            <li-monitor .hide="${!this.showMonitor}"></li-monitor>
        `
    }

    getCommands(name = this.name, refreshData = false) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._isReady = false;
        if (this._isGetCommands) return;
        this._isGetCommands = true;

        if (refreshData) {
            let s = data[name] || data['tree'];
            this.rotate = 0;
            let _s = this._location.split('?')[1];
            if (_s && !this._isReady) {
                if (data[_s]) {                                                                                 // pollenanate  || tree || re-coil || ...
                    s = data[_s];
                } else if (_s?.includes('p.size') && _s?.includes('p.angle') && _s?.split('&').length >= 4) {   // ...i=30...&r=...&p.size=0,0...&p.angle=0,0...
                    s = _s;
                } else if (_s.split('=').length === 2) {                                                        // spirograph=210
                    let arr = _s.split('=');
                    let val = arr[0].replace(/\s/g, '');
                    if (data[val]) {
                        this.rotate = Number(arr[1]) || 0;
                        s = data[val];
                    }
                }
            }
            this.fromUrl(s);
        }

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
        this._lenght = this.commands.length;
        setTimeout(() => {
            this._isReady = true;
            this.loop(true);
        }, 100);
        this.$update();
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
            'c': v => { this.lineColor = v || 'black' },
            'cstep': v => { this.colorStep = parseFloat(v) },
            'depth': v => { this.depth = parseFloat(v) },
            'speed': v => { this.speed = parseFloat(v) },
            's': v => {
                const s = decodeURIComponent(v);
                this.extSymbols = s;
                const o = {};
                s.split(',').forEach(i => {
                    i = i.split(':');
                    o[i[0]] = i[1];
                })
                this.symbols = { ...o, ...this.symbols };
            },
            'rotate': v => { this.rotate = parseFloat(v) },
            'animation': v => { this.animation = v === 'true' ? true : false },
            'inverse': v => {
                this.inverse = v === 'true' ? true : false
                this.canvas.style.background = this.inverse ? 'black' : 'white';
                this.lineColor = this.inverse ? 'white' : 'black';
            },
            'sign': v => { this._sign = parseFloat(v) },
        }
        this.lineWidth = 0.218;
        this.x = this.y = 0;
        this.orientation = -90;
        this.sizeValue = this.angleValue = this.sensSizeValue = this.sensAngleValue = 0;
        this.lineColor = 'black';
        this.colorStep = this.depth = 0;
        this.speed = 1;
        this.extSymbols = '';
        this.inverse = false;
        this.canvas.style.background = 'white';
        this.lineColor = 'black';
        this.animation = false;
        const d = url.split('&');
        d.map(p => {
            let v = p.split('=')
            if (['p.size', 'p.angle', 's.size', 's.angle', 'offsets'].includes(v[0]))
                v[1] = v[1].split(',');
            if (convertor[v[0]])
                convertor[v[0]](v[1]);
        })
    }

    toUrl() {
        let url =
            `#?name=${encodeURIComponent(this.name)}` +
            `&i=${this.levels}` +
            `&r=${encodeURIComponent(this.rules)}` +
            `&p.size=${this.sizeValue},${this.sizeGrowth}` +
            `&p.angle=${this.angleValue},${this.angleGrowth}` +
            `&s.size=${this.sensSizeValue},${this.sensSizeGrowth}` +
            `&s.angle=${this.sensAngleValue},${this.sensAngleGrowth}` +
            `&offsets=${this.x},${this.y},${this.orientation}` +
            `&w=${this.lineWidth}` +
            `&c=${this.lineColor}` +
            `&cstep=${this.colorStep}` +
            `&depth=${this.depth}` +
            `&speed=${this.speed}` +
            `&rotate=${this.rotate}` +
            `&animation=${this.animation}` +
            `&inverse=${this.inverse}` +
            `&sign=${this._sign}`;
        if (this.extSymbols)
            url += `&s=${encodeURIComponent(this.extSymbols)}`;
        url = this.$url.replace('l-system.js', url);
        navigator.clipboard.writeText(url);
        window.open(url, '_blank').focus();
        return url;
    }

    _refreshPage(sure = false) {
        if (!this._isReady) return;
        const url = this.$url.replace('l-system.js', 'index.html');
        if (sure)
            window.location.href = url;
        else
            this._location = url;
    }

    get state() {
        return {
            levels: Number(this.levels),
            orientation: Number(this.orientation),
            stepSize: Number(this.sizeValue),
            stepAngle: Number(this.angleValue),
            sizeGrowth: Number(this.sizeGrowth),
            angleGrowth: Number(this.angleGrowth),
            lineWidth: Number(this.lineWidth),
            lineColor: this.lineColor,
            x: innerWidth / 2 + Number(this.x),
            y: innerHeight / 2 + Number(this.y),
            sensSizeValue: Math.pow(10, (this.sensSizeValue || 7.7) - 10) * this.depth,
            sensSizeGrowth: Math.pow(10, (this.sensSizeGrowth || 7.53) - 10) * this.depth,
            sensAngleValue: Math.pow(10, (this.sensAngleValue || 7.6) - 10) * this.depth,
            sensAngleGrowth: Math.pow(10, (this.sensAngleGrowth || 4) - 10) * this.depth,
            animation: this.animation,
            colorStep: this.colorStep
        }
    }

    loop(sure = false) {
        if (!this._isReady || (!sure && this.animation)) return;
        draw(this.state, this.commands, this.ctx, this.rotate);
        this._isGetCommands = false;
        if (this.animation) {
            this.rotate += this.speed * this._sign;
            requestAnimationFrame(this.loop.bind(this));
        } else {
            this.$update();
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
        '+': () => { state.orientation += (state.stepAngle + rotate + state.sensAngleValue) },
        '-': () => { state.orientation -= (state.stepAngle - rotate - state.sensAngleValue) },
        '[': () => { context.stack.push({ orientation: state.orientation, stepAngle: state.stepAngle, stepSize: state.stepSize, x: state.x, y: state.y }) },
        ']': () => {
            context.state = state = { ...state, ...context.stack.pop() };
            ctx.moveTo(state.x, state.y);
        },
        '|': () => { state.orientation += 180 },
        '!': () => { state.stepAngle *= -1 },
        '<': () => { state.stepSize *= 1 + state.sizeGrowth + state.sensSizeGrowth },
        '>': () => { state.stepSize *= 1 - state.sizeGrowth - state.sensSizeGrowth },
        '(': () => { state.stepAngle *= 1 - state.angleGrowth - state.sensAngleGrowth },
        ')': () => { state.stepAngle *= 1 + state.angleGrowth + state.sensAngleGrowth }
    }
    const context = { stack: [] };
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = state.colorStep ? `hsla(${rotate * state.colorStep},50%, 50%, .8)` : state.lineColor;
    ctx.lineWidth = state.lineWidth;
    ctx.beginPath();
    ctx.moveTo(state.x, state.y);
    commands.forEach(c => { cmd[c]() });
    ctx.stroke();
}
