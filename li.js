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

LI.showDropdown = async function (component, props = {}, hostProps = {}) {
    await import('./test/dialog-2/dialog.js');
    const cmp = (typeof component === 'string') ? LI.createComponent(component, props) : component;
    const host = LI.createComponent('li-dropdown', hostProps);
    return host.show(cmp);
}