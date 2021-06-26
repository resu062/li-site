import './lib/icaro/icaro.js';

class baseITEM {
    _id;
    ulid = LI.ulid();
    type;
    created;
    _data = icaro({});
    _observeKeys = ['label', '_deleted'];
    _fnListen = (e) => {
        this.changed = true;
        //console.log(this.label, e)
    }
    constructor(keys = [], props) {
        this._observeKeys = [...this._observeKeys, ...keys];
        Object.keys(props || {}).forEach(k => {
            if (!['_data', '_observeKeys', '_fnListen'].includes(k)) {
                if (this._observeKeys.includes(k))
                    this._data[k] = props[k];
                else if (Array.isArray(props[k])) {
                    this[k] = icaro([]);
                    this[k].listen(this._fnListen);
                    this[k] = [...props[k]];
                } else
                    this[k] = props[k];
            }
        })
        this.created = this.created || LI.dates(LI.ulidToDateTime(this.ulid));
        if (this.type && !this._id) this._id = this.type + ':' + this.ulid;
        this._data.listen(this._fnListen);
    }

    get label() { return this._data.label }
    set label(v) { this._data.label = v }
    get _deleted() { return this._data._deleted }
    set _deleted(v) { this._data._deleted = v }
}
export class ITEM extends baseITEM {
    items = icaro([]);
    templates = icaro([]);
    constructor(props) {
        super(['parent', 'parentId', 'expanded'], props);
        this.items.listen(this._fnListen);
        this.templates.listen(this._fnListen);
    }
    get parent() { return this._data.parent }
    set parent(v) { this._data.parent = v }
    get parentId() { return this._data.parentId }
    set parentId(v) { this._data.parentId = v }
    get expanded() { return this._data.expanded }
    set expanded(v) { this._data.expanded = v }

    get _itemsId() {
        return (this.items || []).map(i => i._id) || []
    }
    get _templatesId() {
        return (this.templates || []).map(i => i._id) || []
    }

    get doc() {
        return {
            _id: this._id,
            _ref: this._ref,
            ulid: this.ulid,
            type: this.type,
            created: this.created,
            parentId: this.parentId,
            label: this.label,
            itemsId: this._itemsId,
            templatesId: this.setEditors || !this.templatesId?.length ? this._templatesId : this.templatesId,
        }
    }
}
export class BOX extends baseITEM {
    constructor(props) {
        super(['h', 'show', 'hidden', 'value', 'htmlValue', 'name'], props);
    }

    get name() { return this._data.name }
    set name(v) { this._data.name = v }
    get h() { return this._data.h }
    set h(v) { this._data.h = v }
    get show() { return this._data.show }
    set show(v) { this._data.show = v }
    get hidden() { return this._data.hidden }
    set hidden(v) { this._data.hidden = v }
    get value() { return this._data.value }
    set value(v) { this._data.value = v }
    get htmlValue() { return this._data.htmlValue }
    set htmlValue(v) { this._data.htmlValue = v }

    get doc() {
        return {
            _id: this._id,
            _ref: this._ref,
            ulid: this.ulid,
            type: this.type,
            created: this.created,
            name: this.name,
            label: this.label,
            h: this.h,
            show: this.show,
            hidden: this.hidden,
            value: this.value,
            htmlValue: this.htmlValue,
        }
    }
}

class CLID {
    arrSetItems(item, prop, val) {
        if (!item || !prop) return;
        const arr = item.items?.length ? item.items : item.length ? item : [];
        if (arr?.forEach) {
            arr.forEach(i => {
                this.arrSetItems(i, prop, val);
            })
            item[prop] = val;
        }
    }
    arrGetItems(item, prop, val, res = []) {
        if (!item || !prop) return;
        if (item[prop] === val) res.push(item);
        const arr = item.items?.length ? item.items : item.length ? item : [];
        if (arr.forEach)
            arr.forEach(i => {
                this.arrGetItems(i, prop, val, res);
            })
        return res;
    }
    arrFindItem(item, prop, val, res = {}) {
        if (!item || !prop) return;
        const arr = item.items?.length ? item.items : item.length ? item : [];
        if (arr.forEach)
            arr.forEach(i => {
                if (i[prop] == val) {
                    res.item = i;
                    return;
                }
                this.arrFindItem(i, prop, val, res);
            })
        return res.item;
    }
    arrFindRoot(items, item, res = {}) {
        if (!items || !item) return;
        const arr = items.items?.length ? items.items : items.length ? items : [];
        if (res.root) return res.root;
        if (arr.forEach)
            arr.forEach(i => {
                if (i.items?.indexOf(item) > -1) {
                    res.root = i;
                    return;
                }
                this.arrFindRoot(i, item, res);
            });
        return res.root;
    }
    arrAllChildren(item, ch = []) {
        if (!item) return [];
        const arr = item?.items?.length ? item.items : item?.length ? item : [];
        if (arr.forEach)
            if (arr.length) ch.push(...arr);
        arr.forEach(i => {
            this.arrAllChildren(i, ch);
        })
        return ch;
    }
}

globalThis.LID = globalThis.LID || new CLID();
