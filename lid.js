

export class ITEM {
    constructor(ulid, item) {
        this._ulid = ulid || LI.ulid();
        this._item = item;
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
}

globalThis.LID = globalThis.LID || new CLID();
