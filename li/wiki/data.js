class baseITEM {
    _id;
    ulid = LI.ulid();
    _data = LI.icaro({});
    _observeKeys = ['label', '_deleted'];
    _fnListen = (e) => {
        let changed;
        this._observeKeys.forEach(i => { if (e.has(i)) changed = true });
        if (changed) LI.fire(document, 'needSave', { type: 'changed', _id: this._id, e });
    }
    constructor(keys = [], props) {
        this._observeKeys = [...this._observeKeys, ...keys];
        Object.keys(props || {}).forEach(k => {
            if (!['_data', '_observeKeys', '_fnListen'].includes(k)) {
                if (this._observeKeys.includes(k)) this._data[k] = props[k];
                else this[k] = props[k];
            }
        })
        this.created = this.created || LI.dates(LI.ulidToDateTime(this.ulid));
        if (this.type && !this._id) this._id = this.type + ':' + this.ulid;
        this._data.listen(this._fnListen);
    }

    get label() { return this._data.label }
    set label(v) { this._data.label = v }
    get _deleted() { return this._data._deleted }
    set _deleted(v) {
        if (v) {
            LI.fire(document, 'needSave', { type: '_deleted', _id: this._id });
            if (this.items) this.items.forEach(i => { if (i.checked) i._delete = true });
            if (this.parts) this.parts.forEach(i => { if (i.checked) i._delete = true });
        }
        this._data._deleted = v;
    }
}
export class ITEM extends baseITEM {
    items = LI.icaro([]);
    parts = LI.icaro([]);
    _fnCheckTemplates = (e) => {
        if (this._partsId.join(',') !== (this.partsId || []).join(',')) {
            LI.fire(document, 'needSave', { type: 'changed', _id: this._id, e });
            //console.log(this.label, this.changed, this._partsId.join(','), this.partsId.join(','))
        }
    }
    constructor(props) {
        super(['parentId'], props);
        this.parts.listen(this._fnCheckTemplates);
    }

    get parentId() { return this._data.parentId }
    set parentId(v) { this._data.parentId = v }

    get _partsId() {
        if (!this.parts || !this.parts.map) return [];
        const res = [];
        this.parts.map(i => { if (!i._deleted) res.add(i._id) });
        return res;
    }

    get doc() {
        return {
            _id: this._id,
            _ref: this._ref,
            ulid: this.ulid,
            type: this.type,
            label: this.label,
            created: this.created,
            parentId: this.parentId,
            partsId: this.partsLoaded || !this.partsId?.length ? this._partsId : this.partsId
        }
    }
}
export class BOX extends baseITEM {
    show = true;
    hidden = false;
    constructor(props) {
        super(['h', 'value', 'htmlValue'], props);
    }

    get h() { return this._data.h }
    set h(v) { this._data.h = v }
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
            name: this.name,
            label: this.label,
            created: this.created,
            h: this.h,
            value: this.value,
            htmlValue: this.htmlValue
        }
    }
}
