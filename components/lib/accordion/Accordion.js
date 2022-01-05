import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { classNames, ObjectUtils, IconUtils, UniqueComponentId } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';

export const AccordionTab = () => {
    // NOOP
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

export const Accordion = (props) => {
    const [id, setId] = useState(props.id);
    const [activeIndex, setActiveIndex] = useState(props.activeIndex);

    const shouldTabRender = (tab) => {
        return tab && tab.type === AccordionTab;
    }

    const onTabHeaderClick = (event, tab, index) => {
        if (!tab.props.disabled) {
            const selected = isSelected(index);
            let newActiveIndex = null;

            if (props.multiple) {
                let indexes = (props.onTabChange ? props.activeIndex : activeIndex) || [];
                if (selected)
                    indexes = indexes.filter(i => i !== index);
                else
                    indexes = [...indexes, index];

                newActiveIndex = indexes;
            }
            else {
                newActiveIndex = selected ? null : index;
            }

            let callback = selected ? props.onTabClose : props.onTabOpen;
            if (callback) {
                callback({ originalEvent: event, index });
            }

            if (props.onTabChange) {
                props.onTabChange({
                    originalEvent: event,
                    index: newActiveIndex
                })
            }
            else {
                setActiveIndex(newActiveIndex);
            }
        }

        event.preventDefault();
    }

    const isSelected = (index) => {
        const _activeIndex = props.onTabChange ? props.activeIndex : activeIndex;

        return props.multiple ? (_activeIndex && _activeIndex.indexOf(index) >= 0) : _activeIndex === index;
    }

    useEffect(() => {
        if (!id) {
            setId(UniqueComponentId());
        }
    }, []);

    const useTabHeader = (tab, selected, index) => {
        const style = { ...(tab.props.headerStyle || {}), ...(tab.props.style || {}) };
        const className = classNames('p-accordion-header', { 'p-highlight': selected, 'p-disabled': tab.props.disabled }, tab.props.headerClassName, tab.props.className);
        const _id = id + '_header_' + index;
        const ariaControls = id + '_content_' + index;
        const tabIndex = tab.props.disabled ? -1 : null;
        const header = tab.props.headerTemplate ? ObjectUtils.getJSXElement(tab.props.headerTemplate, tab.props) : <span className="p-accordion-header-text">{tab.props.header}</span>;
        const icon = IconUtils.getJSXIcon((selected ? props.collapseIcon : props.expandIcon), { className: 'p-accordion-toggle-icon' }, { props: props, selected });

        return (
            <div className={className} style={style}>
                <a href={'#' + ariaControls} id={_id} className="p-accordion-header-link" aria-controls={ariaControls} role="tab" aria-expanded={selected} onClick={(event) => onTabHeaderClick(event, tab, index)} tabIndex={tabIndex}>
                    {icon}
                    {header}
                </a>
            </div>
        );
    }

    const useTabContent = (tab, selected, index) => {
        const style = { ...(tab.props.contentStyle || {}), ...(tab.props.style || {}) };
        const className = classNames('p-toggleable-content', tab.props.contentClassName, tab.props.className);
        const _id = id + '_content_' + index;
        const ariaLabelledby = id + '_header_' + index;
        const toggleableContentRef = useRef(null);

        return (
            <CSSTransition nodeRef={toggleableContentRef} classNames="p-toggleable-content" timeout={{ enter: 1000, exit: 450 }} in={selected} unmountOnExit options={props.transitionOptions}>
                <div ref={toggleableContentRef} id={_id} className={className} style={style} role="region" aria-labelledby={ariaLabelledby}>
                    <div className="p-accordion-content">
                        {tab.props.children}
                    </div>
                </div>
            </CSSTransition>
        );
    }

    const useTab = (tab, index) => {
        const selected = isSelected(index);
        const tabHeader = useTabHeader(tab, selected, index);
        const tabContent = useTabContent(tab, selected, index);
        const tabClassName = classNames('p-accordion-tab', {
            'p-accordion-tab-active': selected
        });

        return (
            <div key={tab.props.header} className={tabClassName}>
                {tabHeader}
                {tabContent}
            </div>
        );
    }

    const useTabs = () => {
        return (
            React.Children.map(props.children, (tab, index) => {
                if (shouldTabRender(tab)) {
                    return useTab(tab, index);
                }
            })
        )
    }

    const className = classNames('p-accordion p-component', props.className);
    const tabs = useTabs();

    return (
        <div id={props.id} className={className} style={props.style}>
            {tabs}
        </div>
    );
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
