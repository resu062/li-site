import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../layout-app/layout-app.js';
import '../property-grid/property-grid.js';
import '../monitor/monitor.js';
// import '../button/button.js';
// import '../checkbox/checkbox.js';

let url = import.meta.url;

customElements.define('li-l-system', class LiLSystem extends LiElement {
    static get properties() {
        return {
            animation: { type: Boolean },
            speed: { type: Number, default: 1 },
            level: { type: Number, default: 6 },
            step: { type: Number },
            angle: { type: Number },
            rules: { type: Object },
            symbols: { type: Object },
            rotate: { type: Number, default: 0 },
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            rotateStep: { type: Number, default: 0 },
            showMonitor: { type: Boolean },
        }
    }

    constructor() {
        super();

        this.level = 6;
        this.step = 9;
        this.angle = 25;
        this.rules = `
            L : X,
            X : F-[[X]+X]+F[+FX]-X,
            F : FF
        `;
        this.symbols = { 'F': 'F', 'X': 'S', '+': '+', '-': '-', '[': '[', ']': ']' };
        this.rotate = -60;
        this.y = 800;

        // this.level = 10;
        // this.step = 2;
        // this.angle = 60;
        // this.rules = `
        //     L : A,
        //     A : B-A-B,
        //     B : A+B+A
        // `;
        // this.symbols = { 'A': 'F', 'B': 'F', '+': '+', '-': '-', '[': '[', ']': ']' };
        // this.x = 500;
        // this.y = 950;

        // this.level = 10;
        // this.step = 2;
        // this.angle = 120;
        // this.rules = `
        //     L : F,
        //     F : F-G+F+G-F,
        //     G : GG
        // `;
        // this.symbols = { 'F': 'F', 'G': 'F', '+': '+', '-': '-', '[': '[', ']': ']' };
        // this.rotate = 60;
        // this.x = 500;
        // this.y = 950;


        // this.rules = `
        //     L : S,
        //     S : F>+[F-Y[S]]F)G,
        //     Y : --[|F-F--FY]-,
        //     G : FGF[+F]+Y,
        // `;
    }

    init() {
        this.textRules = [];
        this.rules.replace(/\s|\n/g, '').split(",").forEach((r) => { if (r.includes(':')) this.textRules.push(r.split(':')) });
        this.seed = this.textRules[0][0];
        this.ruleMap = {};
        this.textRules.forEach(r => this.ruleMap[r[0]] = r[1]);
        this._commands = this.expandChunk(this.level, this.seed, '', 0, 0, 400000);
        this.commands = []
        this._commands.split('').forEach(c => {
            c = this.symbols[c];
            if (c && ['F', '+', '-', '[', ']', '!'].includes(c)) this.commands.push(c);
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
        return evelExpr;
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
        setTimeout(() => {
            this.loop();
            this._isReady = true;
        }, 500);
    }

    updated(changedProperties) {
        if (this._isReady) {
            let update = false;
            changedProperties.forEach((oldValue, propName) =>  update = ['animation', 'axiom', 'step', 'angle', 'level', 'rules', 'symbols', 'x', 'y', 'rotate'].includes(propName) );
            if (this._isReady && update) this.loop();
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
            this.rotateStep = this.rotateStep < 360 ? this.rotateStep += this.speed : 0;
        } else {
            this.init();
            enhanceCanvas(this.canvas);
        }
        draw(this.commands, this.ctx, this.step, this.angle, this.x, this.y, this.rotate, this.rotateStep);
        this.$update();
        if (this.animation)
            requestAnimationFrame(this.loop.bind(this));
    }
});

function draw(commands, ctx, step, angle, _x, _y, rotate = 0, _rotate = 0) {
    const cmd = {
        'F': () => {
            const rad = (-angle) * toRad;
            x += step * Math.cos(rad);
            y += step * Math.sin(rad);
            ctx.lineTo(x, y);
        },
        'S': () => {
            const rad = (-angle) * toRad;
            x += step * Math.cos(rad);
            y += step * Math.sin(rad);
            //ctx.lineTo(x, y);
        },
        '+': () => {
            angle += _angel + _rotate;
        },
        '-': () => {
            angle -= _angel + _rotate;
        },
        '[': () => {
            stack.push({ x, y, angle })
        },
        ']': () => {
            let s = stack.pop();
            x = s.x;
            y = s.y;
            angle = s.angle;
            ctx.lineTo(x, y);
        },
        '|': () => {
            angle += _angel + 180;
        },
        '!': () => {
            angle = _angel * -1;
        }
    }
    let _angel = angle;
    let stack = [];
    const toRad = Math.PI / 180;
    let x = _x || ctx.canvas.width / 2;
    let y = _y || ctx.canvas.height / 2;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    //ctx.save();
    ctx.translate(x, y);
    x = 0;
    y = 0;
    ctx.rotate(rotate * toRad);
    ctx.beginPath();
    ctx.lineTo(x, y);
    commands.forEach(c => cmd[c]());
    ctx.stroke();
    //ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
