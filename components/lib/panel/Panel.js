import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from '../csstransition/CSSTransition';
import { ObjectUtils, classNames, IconUtils, UniqueComponentId } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const Panel = (props) => {
    const [id, setId] = useState(props.id);
    const [collapsed, setCollapsed] = useState(props.collapsed);
    const contentRef = useRef(null);

    const toggle = (event) => {
        if (props.toggleable) {
            const _collapsed = props.onToggle ? props.collapsed : collapsed;
            _collapsed ? expand(event) : collapse(event);

            if (props.onToggle) {
                props.onToggle({
                    originalEvent: event,
                    value: !_collapsed
                });
            }
        }

        event.preventDefault();
    }

    const expand = (event) => {
        if (!props.onToggle) {
            setCollapsed(false);
        }

        if (props.onExpand) {
            props.onExpand(event);
        }
    }

    const collapse = (event) => {
        if (!props.onToggle) {
            setCollapsed(true);
        }

        if (props.onCollapse) {
            props.onCollapse(event);
        }
    }

    const isCollapsed = () => {
        return props.toggleable ? (props.onToggle ? props.collapsed : collapsed) : false;
    }

    useEffect(() => {
        if (!id) {
            setId(UniqueComponentId());
        }
    }, []);

    const useToggleIcon = (_collapsed) => {
        if (props.toggleable) {
            const _id = id + '_label';
            const ariaControls = id + '_content';
            const toggleIcon = IconUtils.getJSXIcon((_collapsed ? props.expandIcon : props.collapseIcon), {}, { props: props, collapsed: _collapsed });

            return (
                <button id={_id} className="p-panel-header-icon p-panel-toggler p-link" onClick={toggle} aria-controls={ariaControls} aria-expanded={!_collapsed} role="tab">
                    {toggleIcon}
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useHeader = (_collapsed) => {
        const header = ObjectUtils.getJSXElement(props.header, props);
        const icons = ObjectUtils.getJSXElement(props.icons, props);
        const togglerElement = useToggleIcon(_collapsed);
        const titleElement = <span className="p-panel-title" id={id + '_header'}>{header}</span>;
        const iconsElement = (
            <div className="p-panel-icons">
                {icons}
                {togglerElement}
            </div>
        );
        const content = (
            <div className="p-panel-header">
                {titleElement}
                {iconsElement}
            </div>
        );

        if (props.headerTemplate) {
            const defaultContentOptions = {
                className: 'p-panel-header',
                titleClassName: 'p-panel-title',
                iconsClassName: 'p-panel-icons',
                togglerClassName: 'p-panel-header-icon p-panel-toggler p-link',
                togglerIconClassName: _collapsed ? props.expandIcon : props.collapseIcon,
                onTogglerClick: toggle,
                titleElement,
                iconsElement,
                togglerElement,
                element: content,
                props,
                collapsed: _collapsed
            };

            return ObjectUtils.getJSXElement(props.headerTemplate, defaultContentOptions);
        }
        else if (props.header || props.toggleable) {
            return content;
        }

        return null;
    }

    const useContent = (_collapsed) => {
        const _id = id + '_content';
        const ariaLabelledby = id + '_header';

        return (
            <CSSTransition nodeRef={contentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={!_collapsed} unmountOnExit options={props.transitionOptions}>
                <div ref={contentRef} className="p-toggleable-content" aria-hidden={_collapsed} role="region" id={_id} aria-labelledby={ariaLabelledby}>
                    <div className="p-panel-content">
                        {props.children}
                    </div>
                </div>
            </CSSTransition>
        );
    }

    const className = classNames('p-panel p-component', { 'p-panel-toggleable': props.toggleable }, props.className);
    const _collapsed = isCollapsed();
    const header = useHeader(_collapsed);
    const content = useContent(_collapsed);

    return (
        <div id={props.id} className={className} style={props.style}>
            {header}
            {content}
        </div>
    );
}

Panel.defaultProps = {
    id: null,
    header: null,
    headerTemplate: null,
    toggleable: null,
    style: null,
    className: null,
    collapsed: null,
    expandIcon: 'pi pi-plus',
    collapseIcon: 'pi pi-minus',
    icons: null,
    transitionOptions: null,
    onExpand: null,
    onCollapse: null,
    onToggle: null
}

Panel.propTypes = {
    id: PropTypes.string,
    header: PropTypes.any,
    headerTemplate: PropTypes.any,
    toggleable: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    collapsed: PropTypes.bool,
    expandIcon: PropTypes.string,
    collapseIcon: PropTypes.string,
    icons: PropTypes.any,
    transitionOptions: PropTypes.object,
    onExpand: PropTypes.func,
    onCollapse: PropTypes.func,
    onToggle: PropTypes.func
}
