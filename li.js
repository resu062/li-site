import { LitElement } from './lib/lit-element/lit-element.js';
import { AWN } from './lib/awesome-notifications/modern.var.js';

window.globalThis = window.globalThis || window;

export class LiElement extends LitElement {
    constructor() {
        super();
        for (let i in this.constructor.properties) this[i] = this.constructor.properties[i].default;
    }

    firstUpdated() {
        super.firstUpdated();
        this.$id = {};
        this.renderRoot.querySelectorAll('[id]').forEach(node => {
            this.$id[node.id] = node;
        });
    }
}

const camelToKebab = camel => camel.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, '$1$2-').toLowerCase();

export default function LI(props = {}) {

}

globalThis.LI = LI;

let awnOptions = {
    icons: {
        prefix: "<li-icon name='",
        success: "check-circle' fill='#40871d' size=32",
        tip: "star-border' fill='grey' size=32",
        info: "info' fill='#1c76a6' size=32",
        warning: "error' fill='#c26700' size=32",
        alert: "warning' fill='#a92019' size=32",
        suffix: "></li-icon>",
    }
}
LI.notifier = new AWN(awnOptions);

LI.createComponent = async (comp, props = {}) => {
    comp = comp || {};
    if (typeof comp === 'string') {
        comp = comp.replace('li-', '');
        await import(`./li/${comp}/${comp}.js`);
        const cmp = document.createElement(`li-${comp}`);
        for (let p in props) cmp[p] = props[p];
        return cmp;
    }
    for (let p in props) comp[p] = props[p];
    return comp;
}

LI.show = async (host, comp, compProps = {}, hostProps = {}) => {
    host = await LI.createComponent(host, hostProps);
    comp = await LI.createComponent(comp, compProps);
    if (hostProps.data && hostProps.data.host) hostProps.data.host.push(host);
    return host.show(comp);
}

LI.fire = (target, event, detail = {}) => {
    target.dispatchEvent(new CustomEvent(event, { detail: { ...{}, ...detail } }));
    //console.log('fire - ' + event);
}

LI.listen = (event = '', callback, props = { target: this, once: false, useCapture: false }) => {
    props.target = props.target || this;
    event.split(',').forEach(i => {
        props.target.addEventListener(i.trim(), callback, props.useCapture);
        if (props.once) {
            const once = () => {
                props.target.removeEventListener(i.trim(), callback, props.useCapture)
                props.target.removeEventListener(i.trim(), once)
            }
            props.target.addEventListener(i.trim(), once)
        }
    });
}

LI.unlisten = (event = '', callback, props = { target: this, once: false, useCapture: false }) => {
    props.target = props.target || this;
    if (props.target) {
        if (callback) {
            event.split(',').forEach(i => {
                props.target.removeEventListener(i.trim(), callback, props.useCapture)
            });
        }
    }
}

window.LIRect = window.LIRect || class LIRect {
    constructor(element) {
        if (element && element.host)
            element = element.host;
        const pos = element ? element.getBoundingClientRect() : LI.mousePos;
        if (pos) {
            this.ok = true
            this.x = pos.x;
            this.y = pos.y;
            this.top = pos.top;
            this.bottom = pos.bottom;
            this.left = pos.left;
            this.right = pos.right;
            this.width = pos.width;
            this.height = pos.height;
        } else {
            this.ok = false;
        }
    }
};
if (!window.DOMRect) {
    window.DOMRect = function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.top = y;
        this.bottom = y + height;
        this.left = x;
        this.right = x + width;
        this.width = width;
        this.height = height;
    }
}
document.addEventListener('mousedown', (e) => {
    LI.mousePos = new DOMRect(e.pageX, e.pageY);
});