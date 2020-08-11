import { LitElement } from './lib/lit-element/lit-element.js';
import { directive } from "./lib/lit-html/lib/directive.js"
import { AWN } from './lib/awesome-notifications/modern.var.js';
let urlLI = import.meta.url;

window.globalThis = window.globalThis || window;

let eventNameForProperty = function(name, { notify, attribute } = {}) {
    if (notify && typeof notify === 'string') {
        return notify;
    } else if (attribute && typeof attribute === 'string') {
        return `${attribute}-changed`;
    } else {
        return `${name.toLowerCase()}-changed`;
    }
}

export class LiElement extends LitElement {
    constructor() {
        super();

        this.$props = this.constructor._classProperties;
        for (const k of this.$props.keys()) {
            const prop = this.$props.get(k)
            if (!prop || prop.default === undefined) continue;
            this[k] = prop.default;
        }

        // double binding - sync : https://github.com/morbidick/lit-element-notify
        this.sync = directive((property, eventName) => (part) => {
            part.setValue(this[property]);
            // mark the part so the listener is only attached once
            if (!part.syncInitialized) {
                part.syncInitialized = true;

                const notifyingElement = part.committer.element;
                const notifyingProperty = part.committer.name;
                const notifyingEvent = eventName || eventNameForProperty(notifyingProperty);

                notifyingElement.addEventListener(notifyingEvent, (e) => {
                    const oldValue = this[property];
                    this[property] = e.detail.value;
                    if (this.__lookupSetter__(property) === undefined) {
                        this.updated(new Map([[property, oldValue]]));
                    }
                });
            }
        });
        const name = this.localName.replace('li-', '');
        let url = `${urlLI.replace('li.js', '')}li/${name}/${name}.js`;
        this.$url = url;
        if (this._useInfo) {
            url = `${urlLI.replace('li.js', '')}li/${name}/$info/$info.js`;
            this.$urlInfo = url;
        }
    }

    firstUpdated() {
        super.firstUpdated();
        this.$id = {};
        this.renderRoot.querySelectorAll('[id]').forEach(node => {
            this.$id[node.id] = node;
        });
    }

    // notify : https://github.com/morbidick/lit-element-notify
    update(changedProps) {
        super.update(changedProps);

        for (const prop of changedProps.keys()) {
            const declaration = this.constructor._classProperties.get(prop);

            if (this._setTabulatorData) this._setTabulatorData(prop, this[prop]);

            if (!declaration || !declaration.notify) continue;
            const type = eventNameForProperty(prop, declaration);
            const value = this[prop];
            this.dispatchEvent(new CustomEvent(type, {
                detail: { value },
                bubbles: false,
                composed: true
            }));
            console.log(type);
        }
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
LI.$url = urlLI;

LI.createComponent = async (comp, props = {}) => {
    comp = comp || {};
    if (typeof comp === 'string') {
        comp = comp.replace('li-', '');
        let url = `${urlLI.replace('li.js', '')}li/${comp}/${comp}.js`;
        await import(url);
        const cmp = document.createElement(`li-${comp}`);
        for (let p in props) cmp[p] = props[p];
        return cmp;
    }
    for (let p in props) comp[p] = props[p];
    return comp;
}

// LI.createComponent('li-tester');

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
    window.DOMRect = function(x, y, width, height) {
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

LI.$temp = {};
LI.$temp.throttles = new Map();
LI.$temp.debounces = new Map();
LI.throttle = (key, func, delay = 0, immediate = false) => {
    let pending = LI.$temp.throttles.get(key);
    if (pending) return;
    if (immediate) func();
    pending = setTimeout(() => {
        LI.$temp.throttles.delete(key);
        if (!immediate) func();
    }, delay);
    LI.$temp.throttles.set(key, pending);
}
LI.debounce = (key, func, delay = 0, immediate = false) => {
    let pending = LI.$temp.debounces.get(key);
    if (pending) clearTimeout(pending);
    if (!pending && immediate) func();
    pending = setTimeout(() => {
        LI.$temp.debounces.delete(key);
        func();
    }, delay);
    LI.$temp.debounces.set(key, pending)
}
