import { html, css } from '../../lib/lit-element/lit-element.js';
import { LiElement } from '../../li.js';
import '../button/button.js';

customElements.define('li-accordion', class LiAccordion extends LiElement {
    static get properties() {
        return {
            panels: { type: Array, default: [] },
            multiPanel: { type: Boolean, default: false, reflect: true }
        }
    }

    shouldUpdate(changedProperties) {
        if (!this.initialized) {
            this.panels = Array.from(this.children);
            this.panels.map(panel => panel.setAttribute('tabIndex', '0'));
            this.addEventListener('click', this.handleClick);
            this.addEventListener('keyup', this.handleKeyup);
            this.initialized = true;
        }
        return changedProperties;
    }

    static get styles() {
        return css`
            :host{
                width: 100%;
                display: flex;
                flex-direction: column;
                /* flex: 1 1 auto; */
                overflow: hidden;
                cursor: pointer;
            }
        `
    }

    render() {
        return html`
            <slot></slot>
        `
    }

    updatePanels(target) {
        this.panels.map(panel => {
            if (!this.multiPanel && panel.expanded && panel !== target) panel.expanded = false;
            else if (panel === target) panel.expanded = !panel.expanded;
        })
    }

    setNextPanel(target) {
        if (target !== this.panels[this.panels.length - 1]) return target.nextElementSibling;
        else return this.panels[0];
    }

    setPreviousPanel(target) {
        if (target !== this.panels[0]) return target.previousElementSibling;
        else return this.panels[this.panels.length - 1];
    }

    handleKeyup(event) {
        const { keyCode } = event;
        let { target } = event;
        event.preventDefault();
        switch (keyCode) {
            case 9:     // Tab.
                if (event.shiftKey) target = this.setPreviousPanel(target);
                else target = this.setNextPanel(target);
                break;
            case 40:    // Arrow down.
                target = this.setNextPanel(target);
                break;
            case 38:    // Arrow up.
                target = this.setPreviousPanel(target);
                break;
            case 13:    // Enter & Space.
            case 32:
                this.updatePanels(target);
                break;
            default:
                break;
        }
        target.focus();
    }

    handleClick(event) {
        const { target } = event;
        this.updatePanels(target);
    }
})

customElements.define('li-accordion-item', class LiAccordionItem extends LiElement {
    static get properties() {
        return {
            iconSize: { type: Number, default: 24 },
            label: { type: String, default: '' },
            iconName: { type: String, default: '' },
            expanded: { type: Boolean, default: false }
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                overflow: hidden;
                outline-color: gray;
            }
            .bar{
                display: flex;
                background-color: lightgray;
                align-items: center;
                min-height: 40px;
                margin: 1px 0px;
            }
        `;
    }

    render() {
        return html`
            <div class="bar">
                <li-icon .iconSize="${this.iconSize * .7}" .name="${this.iconName}" .icon="${this.icon}" style="opacity: .5"></li-icon>
                <div style="text-align:center; flex: 1">${this.label}</div>
                <li-button .iconSize="${this.iconSize * .7}" .name="${'chevron-right'}" style="opacity: .5;margin-right: 4px;" .toggled="${this.expanded}" toggledClass="right90" radius="50%" @click="${this.focus}"></li-button>
            </div>
            <div style="display:flex;flex-direction:column;overflow: hidden;flex:1;">
                <slot ?hidden="${!this.expanded}"></slot>
            </div>
        `
    }
})
