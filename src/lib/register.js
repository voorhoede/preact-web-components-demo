/**
 * Heavily based on https://github.com/preactjs/preact-custom-element
 * Added functionality:
 * - inject styles
 * - transform event callbacks starting with "on" custom events and emit them
 */

import { createElement, cloneElement } from 'react';
import { render } from 'react-dom';
import { camelCaseIt } from 'case-it/camel'
import { kebabCaseIt } from 'case-it/kebab'
import baseStyles from '../index.css?inline'

export function register({
    component: Component,
    tagName,
    propNames,
    eventNames,
    shadow,
    styles,
}) {
    function PreactElement() {
        const inst = Reflect.construct(HTMLElement, [], PreactElement);
        inst._vdomComponent = Component;
        inst._root = shadow ? inst.attachShadow({ mode: 'open' }) : inst;
        inst._eventNames = eventNames;
        inst._styles = styles;
        inst._propNames = propNames;
        inst._shadow = shadow;
        return inst;
    }

    PreactElement.prototype = Object.create(HTMLElement.prototype);
    PreactElement.prototype.constructor = PreactElement;
    PreactElement.prototype.connectedCallback = connectedCallback;
    PreactElement.prototype.attributeChangedCallback = attributeChangedCallback;
    PreactElement.prototype.disconnectedCallback = disconnectedCallback;
    PreactElement.observedAttributes = propNames;

    propNames.forEach((name) => {
		Object.defineProperty(PreactElement.prototype, name, {
			get() {
				return this._vdom.props[name];
			},
			set(v) {
				if (this._vdom) {
					this.attributeChangedCallback(name, null, v);
				} else {
					if (!this._props) this._props = {};
					this._props[name] = v;
					this.connectedCallback();
				}

				const type = typeof v;
				if (
					v == null ||
					type === 'string' ||
					type === 'boolean' ||
					type === 'number'
				) {
					this.setAttribute(name, v);
				}
			},
		});
	});

    return customElements.define(tagName, PreactElement);
}

function ContextProvider(props) {
    this.getChildContext = () => props.context || {};
    const { context, children, ...rest } = props;
    return cloneElement(children, rest);
}

function connectedCallback() {
    const event = new CustomEvent('_preact', {
        detail: {},
        bubbles: true,
        cancelable: true,
    });
    this.dispatchEvent(event);
    const context = event.detail.context;

    if (this._shadow && this._styles) {
        const sheets = [
            baseStyles,
            ...this._styles,
        ].map((styles) => {
            const sheet = new CSSStyleSheet();

            sheet.replaceSync(styles);

            return sheet;
        });

        this._root.adoptedStyleSheets = sheets;
    }

    const eventCallbacks = proxyEvents(this._props, this._eventNames, this._root);

    this._vdom = createElement(
        ContextProvider,
        { ...this._props, ...eventCallbacks, context },
        toVdom(this, this._vdomComponent, this._propNames)
    );

    render(this._vdom, this._root);
}

function attributeChangedCallback(name, oldValue, newValue) {
	if (!this._vdom) return;

	newValue = newValue == null ? undefined : newValue;

	const props = {};

	props[name] = newValue;
	props[camelCaseIt(name)] = newValue;

	this._vdom = cloneElement(this._vdom, props);

	render(this._vdom, this._root);
}

function disconnectedCallback() {
    render((this._vdom = null), this._root);
}

function Slot(
    props,
    context
) {
    const ref = (r) => {
        if (!r) {
            if (this.ref) {
                this.ref.removeEventListener('_preact', this._listener);
            }
        } else {
            if (this.ref) {
                this.ref = r;
            }

            if (!this._listener) {
                this._listener = (event) => {
                    event.stopPropagation();
                    (event).detail.context = context;
                };

                r.addEventListener('_preact', this._listener);
            }
        }
    };

    return createElement('slot', { ...props, ref });
}

function proxyEvents(props, eventNames, root) {
    const callbacks = {};

    (eventNames || []).forEach((name) => {
        const customName = kebabCaseIt(name.replace('on', 'acme'));
        let existingCallback = () => null;

        if (props && props[name]) {
            existingCallback = props[name].bind({});
        }

        const customCb = (event) => {
            const { value } = event.target;

            const customEvent = new CustomEvent(customName, {
                ...event,
                composed: true,
                bubbles: true,
                detail: {
                    value: value !== undefined || null ? value : event,
                    ...(event.target?.checked
                        ? { checked: event.target?.checked }
                        : {}),
                },
            });

            root.dispatchEvent(customEvent);

            existingCallback();
        };

        callbacks[name] = customCb;
    });

    return callbacks;
}

function toVdom(
    element,
    nodeName,
    propNames,
) {
    if (element.nodeType === 3) return element.data;
    if (element.nodeType !== 1) return null;
    const children = [];
    const props = {};
    const a = element.attributes;
    const cn = element.childNodes;
    let i = 0;

    for (i = a.length; i--;) {
        if (a[i].name !== 'slot') {
            if (propNames.find((propName) => propName === camelCaseIt(a[i].name))) {
                props[camelCaseIt(a[i].name)] = a[i].value;
            } else {
                props[a[i].name] = a[i].value;
            }
        }
    }

    for (i = cn.length; i--;) {
        const ReactNode = toVdom(cn[i], null, propNames);
        const name = cn[i].slot;

        if (name) {
            props[name] = createElement(Slot, { name }, ReactNode);
        } else {
            children[i] = ReactNode;
        }
    }

    const wrappedChildren = nodeName ? createElement(Slot, null, children) : children;

    return createElement(nodeName || element.nodeName.toLowerCase(), props, wrappedChildren);
}
