import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, ObjectUtils, IconUtils, UniqueComponentId } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { useMountEffect } from '../hooks/Hooks';

export const AccordionTab = () => { }

export const Accordion = (props) => {
    const [idState, setIdState] = useState(props.id);
    const [activeIndexState, setActiveIndexState] = useState(null);
    const activeIndex = props.onTabChange ? props.activeIndex : activeIndexState;

    const shouldUseTab = (tab) => tab && tab.type === AccordionTab;

    const onTabHeaderClick = (event, tab, index) => {
        if (!tab.props.disabled) {
            const selected = isSelected(index);
            let newActiveIndex = null;

            if (props.multiple) {
                const indexes = activeIndex || [];
                newActiveIndex = selected ? indexes.filter(i => i !== index) : [...indexes, index];
            }
            else {
                newActiveIndex = selected ? null : index;
            }

            const callback = selected ? props.onTabClose : props.onTabOpen;
            callback && callback({ originalEvent: event, index: index });

            if (props.onTabChange) {
                props.onTabChange({
                    originalEvent: event,
                    index: newActiveIndex
                });
            }
            else {
                setActiveIndexState(newActiveIndex);
            }
        }

        event.preventDefault();
    }

    const isSelected = (index) => {
        return props.multiple ? (activeIndex && activeIndex.some(i => i === index)) : activeIndex === index;
    }

    useMountEffect(() => {
        if (!idState) {
            setIdState(UniqueComponentId());
        }
    });

    const useTabHeader = (tab, selected, index) => {
        const style = { ...(tab.props.style || {}), ...(tab.props.headerStyle || {}) };
        const className = classNames('p-accordion-header', {
            'p-highlight': selected,
            'p-disabled': tab.props.disabled
        }, tab.props.headerClassName, tab.props.className);
        const headerId = idState + '_header_' + index;
        const ariaControls = idState + '_content_' + index;
        const tabIndex = tab.props.disabled ? -1 : null;
        const header = tab.props.headerTemplate ? ObjectUtils.getJSXElement(tab.props.headerTemplate, tab.props) : <span className="p-accordion-header-text">{tab.props.header}</span>;
        const icon = IconUtils.getJSXIcon(selected ? props.collapseIcon : props.expandIcon, { className: 'p-accordion-toggle-icon' }, { props, selected });

        return (
            <div className={className} style={style}>
                <a href={'#' + ariaControls} id={headerId} className="p-accordion-header-link" aria-controls={ariaControls} role="tab" aria-expanded={selected} onClick={(e) => onTabHeaderClick(e, tab, index)} tabIndex={tabIndex}>
                    {icon}
                    {header}
                </a>
            </div>
        )
    }

    const useTabContent = (tab, selected, index) => {
        const style = { ...(tab.props.style || {}), ...(tab.props.contentStyle || {}) };
        const className = classNames('p-toggleable-content', tab.props.contentClassName, tab.props.className);
        const contentId = idState + '_content_' + index;
        const ariaLabelledby = idState + '_header_' + index;

        return (
            <CSSTransition classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={selected} unmountOnExit options={props.transitionOptions}>
                <div id={contentId} className={className} style={style} role="region" aria-labelledby={ariaLabelledby}>
                    <div className="p-accordion-content">
                        {tab.props.children}
                    </div>
                </div>
            </CSSTransition>
        )
    }

    const useTab = (tab, index) => {
        if (shouldUseTab(tab)) {
            const key = idState + '_' + index;
            const selected = isSelected(index);
            const tabHeader = useTabHeader(tab, selected, index);
            const tabContent = useTabContent(tab, selected, index);
            const tabClassName = classNames('p-accordion-tab', {
                'p-accordion-tab-active': selected
            });

            return (
                <div key={key} className={tabClassName}>
                    {tabHeader}
                    {tabContent}
                </div>
            )
        }

        return null;
    }

    const useTabs = () => {
        return React.Children.map(props.children, useTab);
    }

    const className = classNames('p-accordion p-component', props.className);
    const tabs = useTabs();

    return (
        <div id={idState} className={className} style={props.style}>
            {tabs}
        </div>
    )
}

AccordionTab.defaultProps = {
    header: null,
    disabled: false,
    style: null,
    className: null,
    headerStyle: null,
    headerClassName: null,
    headerTemplate: null,
    contentStyle: null,
    contentClassName: null
}

AccordionTab.propTypes = {
    header: PropTypes.any,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    headerStyle: PropTypes.object,
    headerClassName: PropTypes.string,
    headerTemplate: PropTypes.any,
    contentStyle: PropTypes.object,
    contentClassName: PropTypes.string
}

Accordion.defaultProps = {
    id: null,
    activeIndex: null,
    className: null,
    style: null,
    multiple: false,
    expandIcon: 'pi pi-chevron-right',
    collapseIcon: 'pi pi-chevron-down',
    transitionOptions: null,
    onTabOpen: null,
    onTabClose: null,
    onTabChange: null
}

Accordion.propTypes = {
    id: PropTypes.string,
    activeIndex: PropTypes.any,
    className: PropTypes.string,
    style: PropTypes.object,
    multiple: PropTypes.bool,
    expandIcon: PropTypes.any,
    collapseIcon: PropTypes.any,
    transitionOptions: PropTypes.object,
    onTabOpen: PropTypes.func,
    onTabClose: PropTypes.func,
    onTabChange: PropTypes.func
}
