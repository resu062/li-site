import { LitElement, html } from '../../lib/lit-element/lit-element.js';

class MyElement extends LitElement {
    static get properties() {
        return {
            myProp: {
                reflect: true,
                converter: {
                    toAttribute(value) {
                        console.log('myProp\'s toAttribute.');
                        console.log('Processing:', value, typeof (value));
                        let retVal = String(value);
                        console.log('Returning:', retVal, typeof (retVal));
                        return retVal;
                    },

                    fromAttribute(value) {
                        console.log('myProp\'s fromAttribute.');
                        console.log('Processing:', value, typeof (value));
                        let retVal = Number(value);
                        console.log('Returning:', retVal, typeof (retVal));
                        return retVal;
                    }
                }
            },

            theProp: {
                reflect: true,
                converter(value) {
                    console.log('theProp\'s converter.');
                    console.log('Processing:', value, typeof (value));

                    let retVal = Number(value);
                    console.log('Returning:', retVal, typeof (retVal));
                    return retVal;
                }
            },

            myProp2: { attribute: true },
            theProp2: { attribute: false },
            otherProp2: { attribute: 'other-prop2' },

            myProp3: { reflect: true }
        };
    }

    constructor() {
        super();
        this.myProp = 'myProp';
        this.theProp = 'theProp';

        this.myProp2 = 'myProp2';
        this.theProp2 = 'theProp2';
        this.otherProp2 = 'otherProp2';

        this.myProp3 = 'myProp3';
    }

    attributeChangedCallback(name, oldval, newval) {
        // console.log('attribute change: ', name, newval);
        console.log('attribute change: ', newval);
        super.attributeChangedCallback(name, oldval, newval);
    }

    render() {
        return html`
      <p>myProp ${this.myProp}</p>
      <p>theProp ${this.theProp}</p>

      <button @click="${this.changeProperties}">change properties</button>
      <button @click="${this.changeAttributes}">change attributes</button>

      <p>myProp2 ${this.myProp2}</p>
      <p>theProp2 ${this.theProp2}</p>
      <p>otherProp2 ${this.otherProp2}</p>

      <button @click="${this.changeAttributes2}">change attributes2</button>

      <p>${this.myProp3}</p>

      <button @click="${this.changeProperty3}">change property</button>
    `;
    }

    changeAttributes() {
        let randomString = Math.floor(Math.random() * 100).toString();
        this.setAttribute('myprop', 'myprop ' + randomString);
        this.setAttribute('theprop', 'theprop ' + randomString);
        this.requestUpdate();
    }

    changeProperties() {
        let randomString = Math.floor(Math.random() * 100).toString();
        this.myProp = 'myProp ' + randomString;
        this.theProp = 'theProp ' + randomString;
    }

    changeAttributes2() {
        let randomString = Math.floor(Math.random() * 100).toString();
        this.setAttribute('myprop2', 'myprop2 ' + randomString);
        this.setAttribute('theprop2', 'theprop2 ' + randomString);
        this.setAttribute('other-prop2', 'other-prop2 ' + randomString);
        this.requestUpdate();
    }

    updated(changedProperties) {
        changedProperties.forEach((oldValue, propName) => {
            console.log(`${propName} changed. oldValue: ${oldValue}`);
        });
    }

    changeProperty3() {
        let randomString = Math.floor(Math.random() * 100).toString();
        this.myProp3 = 'myProp3 ' + randomString;
    }
}
customElements.define('my-element', MyElement);
