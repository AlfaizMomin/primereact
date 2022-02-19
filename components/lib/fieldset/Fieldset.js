import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, UniqueComponentId } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { Ripple } from '../ripple/Ripple';

export const Fieldset = (props) => {
    const [id, setId] = useState(props.id);
    const [collapsedState,setCollapsedState] = useState(props.collapsed);
    const className = classNames('p-fieldset p-component', props.className, { 'p-fieldset-toggleable': props.toggleable });
    const collapsed = props.toggleable ? (props.onToggle ? props.collapsed : collapsedState) : false;
    const contentRef = useRef(null);
    const headerId = id + '_header';
    const contentId = id + '_content';

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

    const useContent = ()=> {
        return (
            <CSSTransition nodeRef={contentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={!collapsed} unmountOnExit options={props.transitionOptions}>
                <div ref={contentRef} id={contentId} className="p-toggleable-content" aria-hidden={collapsed} role="region" aria-labelledby={headerId}>
                    <div className="p-fieldset-content">
                        {props.children}
                    </div>
                </div>
            </CSSTransition>
        );
    }

    const useToggleIcon = () => {
        if (props.toggleable) {
            const className = classNames('p-fieldset-toggler pi', { 'pi-plus': collapsed, 'pi-minus': !collapsed });

            return (
                <span className={className}></span>
            );
        }

        return null;
    }

    const useLegendContent = () => {
        if (props.toggleable) {
            const toggleIcon = useToggleIcon();

            return (
                <a href={'#' + contentId} aria-controls={contentId} id={headerId} aria-expanded={!collapsed} tabIndex={props.toggleable ? null : -1}>
                    {toggleIcon}
                    <span className="p-fieldset-legend-text">{props.legend}</span>
                    <Ripple />
                </a>
            );
        }

        return (
            <span className="p-fieldset-legend-text" id={headerId}>{props.legend}</span>
        );
    }

    const useLegend = () => {
        const legendContent = useLegendContent();
        if (props.legend != null || props.toggleable) {
            return (
                <legend className="p-fieldset-legend p-unselectable-text" onClick={toggle}>
                    {legendContent}
                </legend>
            );
        }
    }
    
    useEffect(() => {
        if (!props.id) {
            setId(UniqueComponentId());
        }
    }, []);

    const legend = useLegend();
    const content = useContent();

    return (
        <fieldset id={id} className={className} style={props.style} onClick={props.onClick}>
            {legend}
            {content}
        </fieldset>
    );
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
};

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
};