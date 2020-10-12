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
        this._expanded = item && item.expanded || false;
        this.$item = item;
        this.$props = props;
        this.$root = root;
        this.$owner = owner;
        this.id = item.id || item[props.keyID] || LI.ulid();
        this.label = item.label || item[props.keyLabel] || '';
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
    console.log(item, action, props);
}