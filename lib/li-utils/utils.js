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
