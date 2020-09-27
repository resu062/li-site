import { LitElement } from './lib/lit-element/lit-element.js';
import { directive } from './lib/lit-html/lib/directive.js';
import { AWN } from './lib/awesome-notifications/modern.var.js';
import { ulid, decodeTime } from './lib/ulid/ulid.js';
import './lib/icaro/icaro.js';
import './lib/pouchdb/pouchdb-7.2.1.js';

const urlLI = import.meta.url;

window.globalThis = window.globalThis || window;

const camelToKebab = camel => camel.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, '$1$2-').toLowerCase();

Object.defineProperty(Array.prototype, 'has', { enumerable: false, value: Array.prototype.includes });
Object.defineProperty(Array.prototype, 'clear', { enumerable: false, value: function() { this.splice(0); } });
Object.defineProperty(Array.prototype, 'last', { enumerable: false, get() { return this[this.length - 1]; } });
Object.defineProperty(Array.prototype, 'add', { enumerable: false, value: function(...item) { for (let i of item) { if (this.includes(i)) continue; this.push(i); } } });
Object.defineProperty(Array.prototype, 'remove', { enumerable: false, value: function(...items) { for (const item of items) { const idx = this.indexOf(item); if (idx < 0) continue; this.splice(idx, 1); } } });

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


const eventNameForProperty = function(name, { notify, attribute } = {}) {
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
            if (!LI._$$[this.$$id])
                LI._$$[this.$$id] = {
                    _$$: {}
                };
            LI._$$[this.$$id]._observe = icaro({})
            LI._$$[this.$$id]._observe.update = icaro({ updateCount: 0 })
        }
    }
    connectedCallback() {
        super.connectedCallback();
        const $$id = this.$props.get('_$$id') || this.$props.get('$$id') || undefined;
        if ($$id != undefined && $$id.update)
            this._observe.update.listen(() => this.requestUpdate());
    }
    disconnectedCallback() {
        const $$id = this.$props.get('_$$id') || this.$props.get('$$id') || undefined;
        if ($$id != undefined && $$id.update)
            this._observe.update.unlisten(this.requestUpdate());
        if (this._$$id)
            delete LI._$$[this.$$id];
        super.disconnectedCallback();
    }

    get $$() { return this.$$id ? LI._$$[this.$$id]['_$$'] : undefined }
    set $$(v) { return }
    get _observe() { return this.$$id ? LI._$$[this.$$id]['_observe'] : undefined }
    set _observe(v) { return }
    $$update(property, value) {
        if (!property)
            this.requestUpdate();
        if (this.$$id)
            LI.$$update.call(this, property, value);
    }
    $$observe(property, callback) { LI.$$observe.call(this, property, callback) }
    $$unobserve(property) { LI.$$unobserve.call(this, property, this) }

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


const _$$ = { $$: {}, _$$: {} };
_$$._observe = icaro({ updateCount: 0 });
const _$temp = {};
_$temp.throttles = new Map();
_$temp.debounces = new Map();
class CLI {
    constructor() {
        this.ulid = ulid;
        this.icaro = icaro;
        this.PouchDB = PouchDB;
        this.awnOptions = {
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
        this.notifier = new AWN(this.awnOptions);
        this.$url = urlLI;
    }
    get _$$() {
        return _$$._$$;
    }
    get $$() {
        return _$$.$$;
    }
    get _observe() {
        return _$$._observe;
    }

    $$update(property, value) {
        if (!this._observe) return;
        if (!property)
            if (this.$$id)
                ++this._observe.update.updateCount;
            else
                ++this._observe.updateCount;
        else
            this._observe[property] = value;
    }
    $$observe(property, callback) {
        if (!this._observe || !property) return;
        const fn = (e) => {
            const res = e.get(property);
            callback(res);
            console.log('observe: ' + property + ' = ' + res);
        }
        this.$$unlisten(property, fn);
        this._observe.listen((e) => fn(e));
    }
    $$unlisten(property, fn) {
        if (this._observe && property in this._observe) {
            this._observe.unlisten(fn);
        }
    }
    ulidToDateTime(ulid) {
        return new Date(decodeTime(ulid));
    }
    async createComponent(comp, props = {}) {
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
    async show(host, comp, compProps = {}, hostProps = {}) {
        host = await this.createComponent(host, hostProps);
        comp = await this.createComponent(comp, compProps);
        if (hostProps.data && hostProps.data.host) hostProps.data.host.push(host);
        return host.show(comp);
    }

    listen(target, event, callback, options) {
        if (target && event && callback) event.split(',').forEach(i => target.addEventListener(i.trim(), callback, options));
    }

    unlisten(target, event, callback, options) {
        if (target && event && callback) event.split(',').forEach(i => target.removeEventListener(i.trim(), callback, options));
    }

    fire(target, event, detail = {}) {
        if (target && event) target.dispatchEvent(new CustomEvent(event, { detail }));
    }

    throttle(key, func, delay = 0, immediate = false) {
        let pending = _$temp.throttles.get(key);
        if (pending) return;
        if (immediate) func();
        pending = setTimeout(() => {
            _$temp.throttles.delete(key);
            if (!immediate) func();
        }, delay);
        _$temp.throttles.set(key, pending);
    }
    debounce(key, func, delay = 0, immediate = false) {
        let pending = _$temp.debounces.get(key);
        if (pending) clearTimeout(pending);
        if (!pending && immediate) func();
        pending = setTimeout(() => {
            _$temp.debounces.delete(key);
            func();
        }, delay);
        _$temp.debounces.set(key, pending)
    }

    action(act) {
        const dates = this.dates();
        const ulid = this.ulid();
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
                        console.log(this.ulid());
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

    dates(d = new Date()) {
        const utc = d.toISOString();
        const local = new Date(d.getTime() - (d.getTimezoneOffset()) * 60 * 1000).toISOString().slice(0, -5).replace('T', ' ');
        return { utc, local };
    }
}
globalThis.LI = new CLI();