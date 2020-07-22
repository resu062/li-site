window.globalThis = window.globalThis || window;

export default function LI(props = {}) {

}

LI.createComponent = (comp, props = {}) => {
    let cmp = document.createElement(comp);
    for (let p in props) {
        cmp[p] = props[cmp];
    }
    return cmp;
}
