window.globalThis = window.globalThis || window;

export default function LI(props = {}) {

}

globalThis.LI = LI;

LI.createComponent = async (comp, props = {}) => {
    comp = comp || {};
    if (typeof comp === 'string') {
        comp = comp.replace('li-', '');
        await import(`./li/${comp}/${comp}.js`);
        const cmp = document.createElement(`li-${comp}`);
        for (let p in props) cmp[p] = props[p];
        return cmp;
    }
    for (let p in props) comp[p] = props[p];
    return comp;
}

LI.show = async (host, comp, compProps = {}, hostProps = {}) => {
    host = await LI.createComponent(host, hostProps);
    comp = await LI.createComponent(comp, compProps);
    if (hostProps.data && hostProps.data.host) hostProps.data.host.push(host);
    return host.show(comp);
}

LI.fire = (target, event, detail = {}) => {
    target.dispatchEvent(new CustomEvent(event, { detail: { ...{}, ...detail } }));
    //console.log('fire - ' + event);
}

LI.listen = (event = '', callback, props = { target: this, once: false, useCapture: false }) => {
    props.target = props.target || this;
    event.split(',').forEach(i => {
        props.target.addEventListener(i.trim(), callback, props.useCapture);
        if (props.once) {
            const once = () => {
                props.target.removeEventListener(i.trim(), callback, props.useCapture)
                props.target.removeEventListener(i.trim(), once)
            }
            props.target.addEventListener(i.trim(), once)
        }
    });
}

LI.unlisten = (event = '', callback, props = { target: this, once: false, useCapture: false }) => {
    props.target = props.target || this;
    if (props.target) {
        if (callback) {
            event.split(',').forEach(i => {
                props.target.removeEventListener(i.trim(), callback, props.useCapture)
            });
        }
    }
}

window.LIRect = window.LIRect || class ODARect {
    constructor(element) {
        if (element && element.host)
            element = element.host;
        const pos = element ? element.getBoundingClientRect() : LI.mousePos;
        this.x = pos.x;
        this.y = pos.y;
        this.top = pos.top;
        this.bottom = pos.bottom;
        this.left = pos.left;
        this.right = pos.right;
        this.width = pos.width;
        this.height = pos.height;
    }
};
if (!window.DOMRect) {
    window.DOMRect = function (x, y, width, height) {
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
document.addEventListener('mousedown', e => {
    LI.mousePos = new DOMRect(e.pageX, e.pageY);
});