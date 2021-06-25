

export class ITEM {
    _label;
    _id;
    ulid = LI.ulid();
    parentId;
    type;
    items = [];
    templates = [];
    checked = false;
    expanded = false;
    constructor(props) {
        Object.keys(props || {}).forEach(k => {
            this[k] = props[k];
        })
        this.dates = LI.dates(LI.ulidToDateTime(this.ulid));
        if (this.type && !this._id) this._id = this.type + ':' + this.ulid;
    }
    get label() {
        return this._label;
    }
    set label(v) {
        if (this._label === v) return;
        this._label = v;
        this.changed = true;
    }
    get toSave() {
        const
            updates = this.updates || [],
            items = this.items,//.map(i => i._id) || [],
            templates = this.templates;//.map(i => i._id) || [];
        updates.push({
            dates: LI.dates(new Date()),
            owner: this.owner || 'anonim'
        })
        return {
            _id: this._id,
            ulid: this.ulid,
            parentId: this.parentId,
            type: this.type,
            label: this.label,
            dates: this.dates,
            items, templates, updates
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
