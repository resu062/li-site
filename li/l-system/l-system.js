import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../property-grid/property-grid.js';
import '../monitor/monitor.js';

let url = import.meta.url;

customElements.define('li-l-system', class LiLSystem extends LiElement {
    static get properties() {
        return {
            animation: { type: Boolean, category: 'actions' },
            showMonitor: { type: Boolean, category: 'actions' },
            x: { type: Number, default: 0, category: 'offset' },
            y: { type: Number, default: 0, category: 'offset' },
            orientation: { type: Number, default: 0, category: 'offset' },
            sizeValue: { type: Number, default: 0, category: 'variables' },
            sizeGrowth: { type: Number, default: 0, category: 'variables' },
            angleValue: { type: Number, default: 0, category: 'variables' },
            angleGrowth: { type: Number, default: 0, category: 'variables' },
            lineWidth: { type: Number, default: 0.218, category: 'variables' },
            lineColor: { type: String, default: 'black', category: 'variables' },
            levels: { type: Number, default: 0, category: 'params' },
            rules: { type: Object, category: 'params' },
            symbols: { type: Object, default: { 'F': 'F', '+': '+', '-': '-', '[': '[', ']': ']', '|': '|', '!': '!', '<': '<', '>': '>', '(': '(', ')': ')' }, category: 'params' },
        }
    }

    constructor() {
        super();
        this.x = 0;
        this.y = 0;

        // this.orientation = -90;
        // this.sizeValue = 7.01;
        // this.sizeGrowth = 0.01;
        // this.angleValue = -1856.68;
        // this.angleGrowth = 0.05;
        // this.levels = 31;
        // this.rules = 'L : SYS, S : F|+[F<-Y)[-S]]Y-!Y, Y : [|>F-F)++(Y]';

        this.orientation = -90;
        this.sizeValue = 14;
        this.sizeGrowth = 0.0001;
        this.angleValue = -3669.39;
        this.angleGrowth =  -0.05531299999999828;
        this.levels = 30;
        this.rules = 'L: S, S: F+>[F-Y[S]]F)G, Y: --[|F-F-FY], G: FGY[+F]+Y';

        // this.orientation = -90;
        // this.sizeValue = 9;
        // this.sizeGrowth = 0.0001;
        // this.angleValue = 25;
        // this.angleGrowth = -0.05531299999999828;
        // this.levels = 6;
        // this.rules = 'L: X, X : F-[[X]+X]+F[+FX]-X, F: FF';
        // this.y = 400;
        // this.lineWidth = 1;

        // this.orientation = 240;
        // this.sizeValue = 2;
        // this.angleValue = 60;
        // this.levels = 10;
        // this.rules = 'L: A, A: B-A-B, B: A+B+A';
        // this.symbols = { ...{ 'A': 'F', 'B': 'F' }, ...this.symbols };
        // this.x = 500;
        // this.y = 500;
        // this.lineWidth = 1;

        // this.orientation = 240;
        // this.sizeValue = 4;
        // this.angleValue = 120;
        // this.levels = 9;
        // this.rules = 'L: F, F: F-G+F+G-F, G: GG';
        // this.symbols = { ...{ 'G': 'F' }, ...this.symbols };
        // this.x = 600;
        // this.y = 500;
        // this.lineWidth = 1;

    }

    init() {
        this.textRules = [];
        this.rules.replace(/\s|\n/g, '').split(",").forEach((r) => { if (r.includes(':')) this.textRules.push(r.split(':')) });
        this.seed = this.textRules[0][0];
        this.ruleMap = {};
        this.textRules.forEach(r => this.ruleMap[r[0]] = r[1]);
        this._commands = this.expandChunk(this.levels, this.seed, '', 0, 0, 400000);
        this.commands = []
        this._commands.split('').forEach(c => {
            c = this.symbols[c];
            if (c && ['F', '+', '-', '[', ']', '!', '|', '<', '>', '(', ')'].includes(c)) this.commands.push(c);
        })
    }

    expandChunk(levelNum, levelExpr, acc, start, processed, count) {
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
    removeNonInstructions(expr) {
        return expr.split('').filter(function(e) {
            if (definitions[e]) {
                return true;
            }
        });
    }


    firstUpdated() {
        super.firstUpdated();
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
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
                'animation', 'orientation', 'sizeValue', 'sizeGrowth', 'angleValue', 'angleGrowth', 'lineWidth', 'lineColor', 'levels', 'rules', 'symbols', 'x', 'y'
            ].includes(propName));
            if (this._isReady && update) {
                this._updated();
                this.loop();
            }
        }
    }

    _updated() {
        this.rotate = 0;
        this._x = 989;
        this._y = 439.5;
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
    }

    static get styles() {
        return css`
            .header {
                font-size: xx-large;
                font-weight: 700;
            }
        `;
    }

    render() {
        return html`
            <li-layout-app sides="300,300,1,1" fill="#9f731350">
                 <img slot="app-top-left" src="${url.replace('l-system.js', 'li.png')}" style="max-width:64px;max-height:64px;padding:4px">
                 <div slot="app-top" class="header"><a target="_blank" href="https://ru.wikipedia.org/wiki/L-%D1%81%D0%B8%D1%81%D1%82%D0%B5%D0%BC%D0%B0">L-System</a></div>
                <div slot="app-left" style="padding-left:4px;">

                </div>
                <div slot="app-main">
                <canvas ref="canvas" slot="main" :width="innerWidth" :height="innerHeight"></canvas>
                </div>
                <div slot="app-right" style="padding-right:4px;display:flex;flex-direction:column; align-items: left; justify-content: center">
                    <li-property-grid label="oda-l-system" .io="${this}"></li-property-grid>
                </div>
            </li-layout-app>
            <li-monitor .hide="${!this.showMonitor}"></li-monitor>
        `
    }

    loop() {
        if (this.animation) {
            this.rotate = this.rotate += 1;
        } else {
            this.init();
            enhanceCanvas(this.canvas);
        }
        draw({ ...this.state }, this.commands, this.ctx, this.rotate);
        this.$update();

        if (this.animation)
            //LI.debounce('draw',() => this.loop(), 1000);
            requestAnimationFrame(this.loop.bind(this));
    }
});

function cloneState(c) {
    return {
        orientation: c.orientation,
        stepAngle: c.stepAngle,
        stepSize: c.stepSize,
        x: c.x,
        y: c.y
    }
}

function draw(state, commands, ctx, rotate) {
    const cmd = {
        'F': () => {
            let bounding;
            let ang = ((state.orientation % 360) / 180) * Math.PI;
            state.x += Math.cos(ang) * state.stepSize;
            state.y += Math.sin(ang) * state.stepSize;
            bounding = context.bounding;
            if (state.x < bounding.x1) {
                bounding.x1 = state.x;
            } else if (state.x > bounding.x2) {
                bounding.x2 = state.x;
            }
            if (state.y < bounding.y1) {
                bounding.y1 = state.y;
            } else if (state.y > bounding.y2) {
                bounding.y2 = state.y;
            }
            ctx.lineTo(state.x, state.y);
        },
        'S': () => { },
        '+': () => { state.orientation += (state.stepAngle + rotate) },
        '-': () => { state.orientation -= (state.stepAngle - rotate) },
        '[': () => { context.stack.push(cloneState(state)) },
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
    const context = {};
    context.stack = [];
    context.bounding = { x2: state.x, y2: state.y };
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = state.lineColor;
    ctx.lineWidth = state.lineWidth;
    ctx.beginPath();
    ctx.moveTo(state.x, state.y);
    commands.forEach(c => { cmd[c]() });
    ctx.stroke();
}

function enhanceCanvas(canvas) {
    let ratio = window.devicePixelRatio || 1,
        width = canvas.width = innerWidth,
        height = canvas.height = innerHeight;
    if (ratio > 1) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        this.ctx.scale(ratio, ratio);
    }
}
