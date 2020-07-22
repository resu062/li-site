window.globalThis = window.globalThis || window;

export default function LI(props = {}) {

}

globalThis.LI = LI;

LI.createComponent = (comp, props = {}) => {
    let cmp = document.createElement(comp);
    for (let p in props) {
        cmp[p] = props[p];
    }
    return cmp;
}

LI.showDropdown = async (component, props = {}, hostProps = {}) => {
    let data = hostProps.data;
    await import('./components/containers/dropdown/dropdown.js');
    const comp = (typeof component === 'string') ? LI.createComponent(component, props) : component;
    const host = LI.createComponent('li-dropdown', hostProps);
    if (data) {
        data.comp.push(comp);
        data.host.push(host);
    }
    return host.show(comp);
}

LI.fire = (target, event, detail = {}) => {
    target.dispatchEvent(new CustomEvent(event, { detail: { ...{}, ...detail } }));
    console.log('fire - ' + event);
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