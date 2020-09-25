import { LitElement } from './lib/lit-element/lit-element.js';
import { directive } from './lib/lit-html/lib/directive.js';
import { AWN } from './lib/awesome-notifications/modern.var.js';
import { ulid, decodeTime } from './lib/ulid/ulid.js';
import icaro from './lib/icaro/icaro.js';
import './lib/pouchdb/pouchdb-7.2.1.js';

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
        this._init$$()
    }

    _init$$() {
        if (this._$$id !== undefined) {
            this._$$id = this._$$id || LI.ulid();
            this.$$id = this._$$id;
            if (!LI.$$[this.$$id]) {
                LI.$$[this.$$id] = {
                    _icaro: {},
                    '_': { $$id: this.$$id }
                };
                LI.$$[this.$$id]._icaro.requestUpdateCount = LI.icaro({ requestUpdateCount: 0 });
            }
        }
        // if(this.$$id !== undefined) {
        //     const i = this.$props.get('_$$id') || this.$props.get('$$id');
        //     if (i && i.update && !this._isObserve ) {
        //         this.$$observe();
        //         this._isObserve = true;
        //     }
        // }
    }
    connectedCallback() {
        super.connectedCallback();
        this._init$$();
    }
    disconnectedCallback() {
        if (this._$$id) {
            delete LI.$$[this.$$id];
        }
        super.disconnectedCallback();
    }

    get $$() {
        return this.$$id ? LI.$$[this.$$id]['_'] : undefined;
    }
    set $$(v) {
        if (!this.$$id) return;
    }
    get _icaro() {
        return LI.$$[this.$$id]._icaro || undefined;
    }
    listen(property = 'update', callback, obj) {
        if (!this._icaro) return;
        // if (property === 'update') {
        //     callback = (changes) => {
        //         this.requestUpdate();
        //         console.log(this._icaro.update.updateCount);
        //     }
        //     obj = { updateCount: 0 };
        // }
        this._icaro[property] = LI.icaro(obj || {});
        this._icaro[property].listen(callback)
    }
    unlisten(property) {
        if (!this._icaro) return;
        this._icaro.unlisten(property);
    }
    $$update() {
        if (!this._icaro) return;
        if (!this._icaro.update) this.listen();
        ++this._icaro.update.updateCount;
    }

    firstUpdated() {
        super.firstUpdated();
        this.$id = {};
        this.renderRoot.querySelectorAll('[id]').forEach(node => {
            this.$id[node.id] = node;
        });
    }
    get $root() {
        return this.getRootNode().host;
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
            //console.log(type);
        }
    }
}

const camelToKebab = camel => camel.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, '$1$2-').toLowerCase();

export default function LI(props = {}) {

}

globalThis.LI = LI;

LI.icaro = icaro;
LI.$$ = {};
LI.ulid = ulid;
LI.ulidToDateTime = (ulid) => { return new Date(decodeTime(ulid)) };

LI.PouchDB = PouchDB;

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

LI.listen = (target, event, callback, options) => {
    if (target && event && callback) event.split(',').forEach(i => target.addEventListener(i.trim(), callback, options));
}

LI.unlisten = (target, event, callback, options) => {
    if (target && event && callback) event.split(',').forEach(i => target.removeEventListener(i.trim(), callback, options));
}

LI.fire = (target, event, detail = {}) => {
    if (target && event) target.dispatchEvent(new CustomEvent(event, { detail }));
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

LI.action = (act) => {
    const dates = LI.dates();
    const ulid = LI.ulid();
    const creator = 'User-0001';
    if (typeof act === 'string') {
        switch (act) {
            case 'addItem':
                let id = ulid + ':$';
                let db = new PouchDB('http://admin:54321@127.0.0.1:5984/lidb');

                // console.log(act, id);
                // console.dir(db);
                db.put({
                    _id: id,
                    ulid,
                    utcDate: dates.utc,
                    locDate: dates.local,
                    creator,
                    type: '#',
                    name: '',
                    label: ''
                }).then(function(response) {
                    console.log('ok');
                }).catch(function(err) {
                    console.log(err);
                });

                PouchDB.sync('lidb', 'http://admin:54321@127.0.0.1:5984/lidb');

                var changes = db.changes({
                    since: 'now',
                    live: true,
                    include_docs: true
                }).on('change', function(change) {
                    console.log(change)
                }).on('complete', function(info) {
                    console.log(info)
                }).on('error', function(err) {
                    console.log(err);
                });

                break;
            case 'ulid':
                for (let index = 0; index < 10; index++) {
                    console.log(LI.ulid());
                }
                break;
            case 'toISOString':
                console.log(dates.utc);
                console.log(dates.local);
                break;
            default:
                break;
        }
    }
}

LI.dates = (d = new Date()) => {
    const utc = d.toISOString();
    const local = new Date(d.getTime() - (d.getTimezoneOffset()) * 60 * 1000).toISOString().slice(0, -5).replace('T', ' ');
    return { utc, local };
}


Object.defineProperty(Array.prototype, 'has', { enumerable: false, value: Array.prototype.includes });
Object.defineProperty(Array.prototype, 'clear', { enumerable: false, value: function() { this.splice(0); } });
Object.defineProperty(Array.prototype, 'last', { enumerable: false, get() { return this[this.length - 1]; } });
Object.defineProperty(Array.prototype, 'add', { enumerable: false, value: function(...item) { for (let i of item) { if (this.includes(i)) continue; this.push(i); } } });
Object.defineProperty(Array.prototype, 'remove', { enumerable: false, value: function(...items) { for (const item of items) { const idx = this.indexOf(item); if (idx < 0) continue; this.splice(idx, 1); } } });