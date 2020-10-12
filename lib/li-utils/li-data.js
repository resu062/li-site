export class BaseItem {
    constructor($$id) {
        this._$$id = $$id;
        this.id = 'main';
        this.label = '';
        this._checked = true;
        this._expanded = false;
        this._selected = false;
        this._hover = false;
    }
    get $$id() { return this._$$id || this.$root._$$id }
    get $$() { return LI._$$[this.$$id]._$$ }
    get level() { return this._level || this.$root._level || this.id || 'main' }
    get actions() { return LI._$$[this.$$id]._$$.actions[this.level] }

    get checked() { return this._checked; }
    set checked(v) {
        this._checked = v;
        this._applyAction('hide', v);
    }
    get expanded() { return this._expanded; }
    set expanded(v) {
        this._expanded = v;
        this._applyAction('expanded', v);
    }
    get selected() { return this._selected; }
    set selected(v) {
        this._selected = v;
        this._applyAction('selected', v);
    }
    get hover() { return this._hover; }
    set hover(v) {
        this._hover = v;
        this._applyAction('hover', v);
    }
    setChecked(v) { this._checked = v }
    setExpanded(v) { this._expanded = v }
    setSelected(v) { this._selected = v }
    setHover(v) { this._hover = v }
    _applyAction(name, v) {
        const level = this.level2 || this.level;
        ldfn.applyAction(this, name, { item: this.id + '', value: v, level });
    }
}

export class LItem extends BaseItem {
    constructor(item, props = {}, root, owner, $$id) {
        super($$id);
        this.$item = item;
        if (item instanceof Array)
            this.$item = { id: 'main', label: 'root', items: item };
        this._expanded = item && item.expanded || false;
        this.$props = props;
        this.$root = root;
        this.$owner = owner;
        this.id = this.$item.id || this.$item[props.keyID] || LI.ulid();
        this.label = this.$item.label || this.$item[props.keyLabel] || '';
    }

    get items() {
        if (!this._items) {
            this._items = (this.$item.items || this.$item[this.$props.keyItems] || []).map(i => {
                return new LItem(i, this.$props, this, this);
            });
            if (this._items.length) {
                this._items.forEach(i => {
                    i._level = this.id;
                    i._$$id = this.$$id;
                });
                this._level = this.id;
                this.$$.actions = this.$$.actions || {};
                this.$$.actions[this.level] = [];
                this.level2 = this.$root.level;
                ldfn.applyAction(this, 'setItems');
            }
        }
        return this._items;
    }
}

export const ldfn = {};

ldfn.applyAction = (item, action, props) => {
    //console.log(item, action, props);
}

ldfn.focus = (e, item, item2) => {
    let selection = item.$$.selection || [];
    if (!item.$$.designMode) return;
    const source = item2 || e.target.item;
    if (!item.$$.selected || selection.length === 0) item.$$.selected = source;
    if (e.ctrlKey || e.metaKey) {
        if (item.$$.selected.$root !== source.$root) return;
        if (selection.includes(source)) {
            selection.splice(selection.indexOf(source), 1);
            return;
        }
        selection.splice(selection.length, 0, source)
    } else if (e.shiftKey) {
        if (item.$$.selected.$root !== source.$root) return;
        const from = item.$$.selected.$root.items.indexOf(item.$$.selected);
        const to = item.$$.selected.$root.items.indexOf(source);
        const arr = item.$$.selected.$root.items.slice((from < to ? from : to), (from > to ? from : to) + 1)
        selection.splice(0, selection.length, ...arr);
    } else {
        item.$$.selected = source;
        selection.splice(0, selection.length, source)
    }
    item.$$.selection = selection;
    item.$$.selectionID = selection.map(i => i.id);
}