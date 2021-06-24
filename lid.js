

export class ITEM {
    _id;
    ulid = LI.ulid();
    label = '';
    items = [];
    templates = [];
    checked = false;
    expanded = false;
    constructor(props) {
        Object.keys(props || {}).forEach(k => {
            this[k] = props[k];
        })
        this.dates = LI.dates(LI.ulidToDateTime(this.ulid));
    }
}

class CLID {
    arrSetItems(item, prop, val) {
        if (!item || !prop) return;
        const arr = item?.items?.length ? item.items : item?.length ? item : [];
        arr.forEach(i => {
            this.arrSetItems(i, prop, val);
        })
        item[prop] = val;
    }
    arrFindItem(item, prop, val, res = {}) {
        if (!item || !prop) return;
        const arr = item?.items?.length ? item.items : item?.length ? item : [];
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
        const arr = items?.items?.length ? items.items : items?.length ? items : [];
        if (res.root) return res.root;
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
        if (arr.length) ch.push(...arr);
        arr.forEach(i => {
            this.arrAllChildren(i, ch);
        })
        return ch;
    }
}

globalThis.LID = globalThis.LID || new CLID();
