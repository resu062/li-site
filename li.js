import { LitElement } from './lib/lit-element/lit-element.js'
import { directive } from './lib/lit-html/lib/directive.js'
import { AWN } from './lib/awesome-notifications/modern.var.js'
import { ulid, decodeTime } from './lib/ulid/ulid.js'
import './lib/icaro/icaro.js'
import './lib/pouchdb/pouchdb-7.2.1.js'

const urlLI = import.meta.url

window.globalThis = window.globalThis || window

const camelToKebab = camel => camel.replace(/([a-z](?=[A-Z]))|([A-Z](?=[A-Z][a-z]))/g, '$1$2-').toLowerCase()

Object.defineProperty(Array.prototype, 'has', { enumerable: false, value: Array.prototype.includes })
Object.defineProperty(Array.prototype, 'clear', { enumerable: false, value: function() { this.splice(0) } })
Object.defineProperty(Array.prototype, 'first', { enumerable: false, get() { return this[0] } })
Object.defineProperty(Array.prototype, 'last', { enumerable: false, get() { return this[this.length - 1] } })
Object.defineProperty(Array.prototype, 'add', { enumerable: false, value: function(...item) { for (let i of item) { if (this.includes(i)) continue; this.push(i) } } })
Object.defineProperty(Array.prototype, 'remove', { enumerable: false, value: function(...items) { for (const item of items) { const idx = this.indexOf(item); if (idx < 0) continue; this.splice(idx, 1) } } })

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
        } else
            this.ok = false;
    }
}
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
document.addEventListener('mousedown', (e) => LI.mousePos = new DOMRect(e.pageX, e.pageY));

const eventNameForProperty = function(name, { notify, attribute } = {}) {
    if (notify && typeof notify === 'string') return notify;
    else if (attribute && typeof attribute === 'string') return `${attribute}-changed`;
    else return `${name.toLowerCase()}-changed`;
}
export class LiElement extends LitElement {
    constructor() {
        super();

        this.$properties = this.constructor._classProperties;
        for (const k of this.$properties.keys()) {
            const prop = this.$properties.get(k)
            if (prop?.save) {
                this.__saves = this.__saves || [];
                this.__saves.push(k);
            }
            if (prop?.local) {
                this.__locals = this.__locals || [];
                this.__locals.push(k);
            }
            if (prop?.global) {
                this.__globals = this.__globals || [];
                this.__globals.push(k);
            }
            if (prop?.default !== undefined) this[k] = prop.default;
        }

        const name = this.localName.replace('li-', '');
        this.$url = `${urlLI.replace('li.js', '')}li/${name}/${name}.js`;
        this.$ulid = this.$ulid || LI.ulid();
        if (this._useInfo) this.$urlInfo = `${urlLI.replace('li.js', '')}li/${name}/$info/$info.js`;
    }
    connectedCallback() {
        super.connectedCallback();
        this._initBus();
        if (this.$$) {
            this.$$.update.listen(this.fnUpdate);
        }
        if (this.$$ && this.__saves) {
            this.__saves.forEach(i => {
                const v = JSON.parse(localStorage.getItem(this._saveFileName));
                if (v) this.$$[i] = this.$$[i] = this[i] = v[this.localName + '.' + i];
            });
            this.__enableSave = true;
        }
        if (this.$$ && this.__locals) {
            this.$$.listen(this.fnLocals);
            this.__locals.forEach(i => {
                if (this.$$[i] === undefined) this.$$[i] = this[i];
                else this[i] = this.$$[i];
            });

        }
        if (this.$$ && this.__globals) {
            LI.$$.listen(this.fnGlobals);
            this.__globals.forEach(i => {
                if (LI.$$[i] === undefined) LI.$$[i] = this[i];
                else this[i] = LI.$$[i];
            });

        }
        this._partid = this._partid || this.partid;

        //this._icaro.listen(this.fnProps);
        this._icaro.$props.listen(this.fnProps);
    }
    disconnectedCallback() {
        if (this.$$?.update) this.$$.update.unlisten(this.fnUpdate);
        if (this.$$ && this.__locals) this.$$.unlisten(this.fnLocals);
        if (LI.$$ && this.__globals) LI.$$.unlisten(this.fnGlobals);
        this._icaro.$props.unlisten(this.fnProps);
        super.disconnectedCallback();
    }
    _initBus() {
        if (!this.$$ && (this.$properties.get('_partid') || this.__saves || !this.$root || this.__locals || this.__globals)) {
            if (this.$$?.update) this.$$.update.unlisten(this.fnUpdate);
            this._partid = this._partid || this.id || this.$ulid || this.localName;
            if (!LI._$$[this._partid]) {
                LI._$$[this._partid] = { _$$: {}, _$$: {} };
                LI._$$[this._partid]._$$ = icaro({});
                LI._$$[this._partid]._$$.update = icaro({ value: 0 });
            }
            //this.$$.update.listen(this.fnUpdate);
        }
        this._icaro = icaro({});
        this._icaro.$props = icaro({});
    }
    fnUpdate = (e) => { this.requestUpdate() }
    fnLocals = (e) => { if (this.__locals) this.__locals.forEach(i => { if (e.has(i)) this[i] = e.get(i) }) }
    fnGlobals = (e) => { if (this.__globals) this.__globals.forEach(i => { if (e.has(i)) this[i] = e.get(i) }) }
    fnListen = (e, property, fn) => { if (e.has(property)) fn() }
    fnProps = (e) => { if (this.$props) Object.keys(this.$props).forEach(k => this[k] = this.$props[k]) }

    _setPartid(_partid) {
        if (this._partid !== _partid) {
            this._PARTID = _partid;
            this.$$.update.listen(this.fnUpdate);
        }
    }
    get partid() { return this._PARTID || this.$root?.partid || this._partid || undefined }
    get $$() { return this.partid && LI._$$[this.partid] && LI._$$[this.partid]['_$$'] ? LI._$$[this.partid]['_$$'] : undefined }
    get $root() { return this.getRootNode().host; }
    get _saveFileName() { return ((this.id || this.partid || this.localName.replace('li-', '')) + '.saves') }
    get $props() { return this._icaro?.$props || undefined }
    set $props(v) { if (this._icaro && v)  Object.keys(v).forEach(k => this.$props[k] = v[k]) }

    firstUpdated() {
        super.firstUpdated();
        if (this.args)
            Object.keys(this.args).forEach(k => this[k] = this.args[k]);
        this.$id = {};
        this.renderRoot.querySelectorAll('[id]').forEach(node => this.$id[node.id] = node);
        this.$refs = {};
        this.renderRoot.querySelectorAll('[ref]').forEach(node => this.$refs[node.getAttribute('ref')] = node);
        this.__isFirstUpdated = true;
    }

    update(changedProps) {
        super.update(changedProps);
        if (!changedProps) return;
        if (changedProps.has('_partid')) {
            this._initBus();
            this.$$.update.listen(this.fnUpdate);
        }
        if (this.args && changedProps.has('args'))
            Object.keys(this.args).forEach(k => this[k] = this.args[k]);
        for (const prop of changedProps.keys()) {
            if (this.__enableSave && this.__saves && this.__saves.includes(prop)) {
                let v = JSON.parse(localStorage.getItem(this._saveFileName));
                v = v || {};
                v[this.localName + '.' + prop] = this[prop];
                localStorage.setItem(this._saveFileName, JSON.stringify(v));
            }
            if (this.__isFirstUpdated) {
                if (this.$$ && this.__locals && this.__locals.includes(prop))
                    this.$$[prop] = this[prop];
                if (this.$$ && this.__globals && this.__globals.includes(prop))
                    LI.$$[prop] = this[prop];
            }

            // notify : https://github.com/morbidick/lit-element-notify
            const declaration = this.constructor._classProperties.get(prop);
            if (declaration?.notify) {
                const type = eventNameForProperty(prop, declaration);
                const value = this[prop];
                this.dispatchEvent(new CustomEvent(type, { detail: { value }, bubbles: false, composed: true }))
            }
        }
    }

    $update(property, value) { LI.$update.call(this, property, value) }
    $listen(property, fn) {
        if (!this.$$) {
            this._initBus();
            this.$$.update.listen(this.fnUpdate);
        }
        this.__locals = this.__locals || [];
        if (this.$$[property] === undefined) this.$$[property] = this[property] || '';
        if (!this.__locals.includes(property)) this.__locals.push(property);
        this._fnListeners = this._fnListeners || new WeakMap();
        this._fnListeners.set(fn, (e) => this.fnListen(e, property, fn));
        this.$$.listen(this._fnListeners.get(fn))
    }
    $unlisten(property, fn) {
        if (this._fnListeners.has(fn)) {
            this.$$.unlisten(this._fnListeners.get(fn));
            this._fnListeners.delete(fn);
            this.__locals.splice(this.__locals.indexOf(property), 1);
        }
    }
    $fire(property, value) { if (this.$$ && property) this.$$[property] = value }

    listen(event, callback, options) { if (event && callback) event.split(',').forEach(i => this.addEventListener(i.trim(), callback, options)) }
    unlisten(event, callback, options) { if (event && callback) event.split(',').forEach(i => this.removeEventListener(i.trim(), callback, options)) }
    fire(event, detail = {}) { if (event) this.dispatchEvent(new CustomEvent(event, { detail })) }
}

const __$$ = { _$$: {}, $$: {} };
__$$.$$ = icaro({});
__$$.$$.update = icaro({ value: 0 });
const _$temp = {};
_$temp.throttles = new Map();
_$temp.debounces = new Map();
class CLI {
    constructor() {
        this.ulid = ulid;
        this.icaro = icaro;
        this.PouchDB = PouchDB;
        this.awnOptions = {
            position: 'bottom-right',
            durations: {
                success: 2000,
                tip: 2000,
                warning: 2000,
                alert: 2000,
                info: 2000
            },
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
    get _$$() { return __$$._$$; }
    get $$() { return __$$.$$; }
    $update(property, value) {
        if (!this.$$) {
            this.requestUpdate();
            return;
        }
        if (!property && this.$$.update) ++this.$$.update.value;
        else if (this.$$[property]) this.$$[property]['value'] = value;
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

    listen(target, event, callback, options) { if (target && event && callback) event.split(',').forEach(i => target.addEventListener(i.trim(), callback, options)) }
    unlisten(target, event, callback, options) { if (target && event && callback) event.split(',').forEach(i => target.removeEventListener(i.trim(), callback, options)) }
    fire(target, event, detail = {}) { if (target && event) target.dispatchEvent(new CustomEvent(event, { detail })) }

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

    dates(d = new Date()) {
        const utc = d.toISOString();
        const local = new Date(d.getTime() - (d.getTimezoneOffset()) * 60 * 1000).toISOString().slice(0, -5).replace('T', ' ');
        return { utc, local };
    }
    ulidToDateTime(ulid) {
        return new Date(decodeTime(ulid));
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
}
globalThis.LI = new CLI();
