import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, UniqueComponentId } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Ripple } from '../ripple/Ripple';

export const Fieldset = (props) => {
    const [id, setId] = useState(props.id);
    const [collapsed, setCollapsed] = useState(props.collapsed);
    const contentRef = useRef(null);

    const toggle = (event) => {
        if (props.toggleable) {
            const _collapsed = props.onToggle ? props.collapsed : collapsed;

            if (_collapsed)
                expand(event);
            else
                collapse(event);

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

    const useContent = (_collapsed) => {
        return (
            <CSSTransition nodeRef={contentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={!_collapsed} unmountOnExit options={props.transitionOptions}>
                <div ref={contentRef} id={id + '_content'} className="p-toggleable-content" aria-hidden={_collapsed} role="region" aria-labelledby={id + '_header'}>
                    <div className="p-fieldset-content">
                        {props.children}
                    </div>
                </div>
            </CSSTransition>
        )
    }

    const useToggleIcon = (collapsed) => {
        if (props.toggleable) {
            const className = classNames('p-fieldset-toggler pi', { 'pi-plus': collapsed, 'pi-minus': !collapsed });

            return (
                <span className={className}></span>
            )
        }

        return null;
    }

    const useLegendContent = (collapsed) => {
        if (props.toggleable) {
            const toggleIcon = useToggleIcon(collapsed);
            const ariaControls = id + '_content';

            return (
                <a href={'#' + ariaControls} aria-controls={ariaControls} id={id + '_header'} aria-expanded={!collapsed} tabIndex={props.toggleable ? null : -1}>
                    {toggleIcon}
                    <span className="p-fieldset-legend-text">{props.legend}</span>
                    <Ripple />
                </a>
            );
        }

        return (
            <span className="p-fieldset-legend-text" id={id + '_header'}>{props.legend}</span>
        )
    }

    const useLegend = (_collapsed) => {
        const legendContent = useLegendContent(_collapsed);
        if (props.legend != null || props.toggleable) {
            return (
                <legend className="p-fieldset-legend p-unselectable-text" onClick={toggle}>
                    {legendContent}
                </legend>
            );
        }
    }

    const className = classNames('p-fieldset p-component', props.className, { 'p-fieldset-toggleable': props.toggleable });
    const collapsed = isCollapsed();
    const legend = useLegend(collapsed);
    const content = useContent(collapsed);

    return (
        <fieldset id={props.id} className={className} style={props.style} onClick={props.onClick}>
            {legend}
            {content}
        </fieldset>
    )
}

Fieldset.defaultProps = {
    id: null,
    legend: null,
    className: null,
    style: null,
    toggleable: null,
    collapsed: null,
    transitionOptions: null,
    onExpand: null,
    onCollapse: null,
    onToggle: null,
    onClick: null
}

Fieldset.propTypes = {
    id: PropTypes.string,
    legend: PropTypes.any,
    className: PropTypes.string,
    style: PropTypes.object,
    toggleable: PropTypes.bool,
    collapsed: PropTypes.bool,
    transitionOptions: PropTypes.object,
    onExpand: PropTypes.func,
    onCollapse: PropTypes.func,
    onToggle: PropTypes.func,
    onClick: PropTypes.func
}
