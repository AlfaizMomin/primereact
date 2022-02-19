import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from '../csstransition/CSSTransition';
import { ObjectUtils, classNames, IconUtils, UniqueComponentId } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';

export const Panel = (props) => {
    const [id, setId] = useState(props.id);
    const [collapsedState,setCollapsedState] = useState(props.collapsed);
    const className = classNames('p-panel p-component', props.className, {'p-panel-toggleable': props.toggleable});
    const collapsed = props.toggleable ? (props.onToggle ? props.collapsed : collapsedState) : false;
    const contentRef = useRef(null);

    const toggle = (event) => {
        if (props.toggleable) {
            if (collapsed)
                expand(event);
            else
                collapse(event);

            if (props.onToggle) {
                props.onToggle({
                    originalEvent: event,
                    value: !collapsed
                });
            }
        }

        event.preventDefault();
    }

    const expand = (event) => {
        if (!props.onToggle) {
            setCollapsedState(false);
        }

        if (props.onExpand) {
            props.onExpand(event);
        }
    }

    const collapse = (event) => {
        if (!props.onToggle) {
            setCollapsedState(true);
        }

        if (props.onCollapse) {
            props.onCollapse(event);
        }
    }

    const useToggleIcon = () => {
        if (props.toggleable) {
            const buttonId = id + '_label';
            const ariaControlsId = id + '_content';
            const toggleIcon = collapsed ? props.expandIcon : props.collapseIcon;

            return (
                <button className="p-panel-header-icon p-panel-toggler p-link" onClick={toggle} id={buttonId} aria-controls={ariaControlsId} aria-expanded={!collapsed} role="tab">
                    {IconUtils.getJSXIcon(toggleIcon, {props: props, collapsed})}
                    <Ripple />
                </button>
            );
        }

        return null;
    }

    const useHeader = () => {
        const header = ObjectUtils.getJSXElement(props.header, props);
        const icons = ObjectUtils.getJSXElement(props.icons, props);
        const togglerElement = useToggleIcon();
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
                togglerIconClassName: collapsed ? props.expandIcon : props.collapseIcon,
                onTogglerClick: toggle,
                titleElement,
                iconsElement,
                togglerElement,
                element: content,
                props: props,
                collapsed
            };

            return ObjectUtils.getJSXElement(props.headerTemplate, defaultContentOptions);
        }
        else if (props.header || props.toggleable) {
            return content;
        }

        return null;
    }

    const useContent = () => {
        return (
            <CSSTransition nodeRef={contentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={!collapsed} unmountOnExit options={props.transitionOptions}>
                <div ref={contentRef} className="p-toggleable-content" aria-hidden={collapsed} role="region" id={id + '_content'} aria-labelledby={id + '_header'}>
                    <div className="p-panel-content">
                        {props.children}
                    </div>
                </div>
            </CSSTransition>
        );
    }

    useEffect(() => {
        if (!props.id) {
            setId(UniqueComponentId());
        }
    }, []);

    const header = useHeader();
    const content = useContent();

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