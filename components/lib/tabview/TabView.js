import React, { forwardRef, useEffect, useState, useImperativeHandle, useRef } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames, UniqueComponentId } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import { useUpdateEffect } from '../hooks/useUpdateEffect';

export const TabPanel = () => {}

export const TabView = forwardRef((props, ref) => {
    const [id,setId] = useState(props.id);
    const [backwardIsDisabled,setBackwardIsDisabled] = useState(true);
    const [forwardIsDisabled,setForwardIsDisabled] = useState(false);
    const [hiddenTabs,setHiddenTabs] = useState([]);
    const [activeIndexState,setActiveIndexState] = useState(props.activeIndex);
    const activeIndex = props.onTabChange ? props.activeIndex : activeIndexState;
    const contentRef = useRef(null);
    const navRef = useRef(null);
    const inkbarRef = useRef(null);
    const prevBtnRef = useRef(null);
    const nextBtnRef = useRef(null);
    const tabsRef = useRef({});

    const isSelected = (index) => index === activeIndex;

    const shouldUseTab = (tab, index) => {
        return tab && tab.type === TabPanel && hiddenTabs.every((_i) => _i !== index);
    }

    const findVisibleActiveTab = (i) => {
        const tabsInfo = React.Children.map(props.children, (tab, index) => {
            if (shouldUseTab(tab, index)) {
                return { tab, index };
            }
        });

        return tabsInfo.find(({ tab, index }) => !tab.props.disabled && index >= i) || tabsInfo.reverse().find(({ tab, index }) => !tab.props.disabled && i > index);
    }

    const onTabHeaderClose = (event, index) => {
        setHiddenTabs([...hiddenTabs, index]);

        if (props.onTabClose) {
            props.onTabClose({ originalEvent: event, index });
        }

        event.preventDefault();
    }

    const onTabHeaderClick = (event, tab, index) => {
        if (!tab.props.disabled) {
            if (props.onTabChange)
                props.onTabChange({ originalEvent: event, index: index });
            else
                setActiveIndexState(index);
        }

        updateScrollBar(index);

        if (event) {
            event.preventDefault();
        }
    }

    const onKeyDown = (event, tab, index) => {
        if(event.code === 'Enter') {
            onTabHeaderClick(event, tab, index);
        }
    }

    const updateInkBar = () => {
        const tabHeader = tabsRef.current[`tab_${activeIndex}`];

        inkbarRef.current.style.width = DomHandler.getWidth(tabHeader) + 'px';
        inkbarRef.current.style.left = DomHandler.getOffset(tabHeader).left - DomHandler.getOffset(navRef.current).left + 'px';
    }

    const updateScrollBar = (index) => {
        let tabHeader = tabsRef.current[`tab_${index}`];

        if (tabHeader && tabHeader.scrollIntoView) {
            tabHeader.scrollIntoView({ block: 'nearest' });
        }
    }

    const updateButtonState = () => {
        const { scrollLeft, scrollWidth } = contentRef.current;
        const width = DomHandler.getWidth(contentRef.current);

        setBackwardIsDisabled(scrollLeft === 0);
        setForwardIsDisabled(scrollLeft === scrollWidth - width);
    }

    const onScroll = (event) => {
        props.scrollable && updateButtonState();
        event.preventDefault();
    }

    const getVisibleButtonWidths = () => {
        return [prevBtnRef.current, nextBtnRef.current].reduce((acc, el) => el ? acc + DomHandler.getWidth(el) : acc, 0);
    }

    const navBackward = () => {
        const width = DomHandler.getWidth(contentRef.current) - getVisibleButtonWidths();
        const pos = contentRef.current.scrollLeft - width;

        contentRef.current.scrollLeft = pos <= 0 ? 0 : pos;
    }

    const navForward = () => {
        const width = DomHandler.getWidth(contentRef.current) - getVisibleButtonWidths();
        const pos = contentRef.current.scrollLeft + width;
        const lastPos = contentRef.current.scrollWidth - width;

        contentRef.current.scrollLeft = pos >= lastPos ? lastPos : pos;
    }

    const reset = () => {
        setBackwardIsDisabled(true);
        setForwardIsDisabled(false);
        setHiddenTabs([]);

        if (props.onTabChange)
            props.onTabChange({index: activeIndex});
        else
            setActiveIndexState(props.activeIndex);
    }

    useEffect(() => {
        if (!id) {
            setId(UniqueComponentId());
        }
    }, []);

    useEffect(() => {
        updateInkBar();
    });

    useUpdateEffect(() => {
        if (ObjectUtils.isNotEmpty(hiddenTabs)) {
            const tabInfo = findVisibleActiveTab(hiddenTabs[hiddenTabs.length - 1]);
            tabInfo && onTabHeaderClick(null, tabInfo.tab, tabInfo.index);
        }
    }, [hiddenTabs]);

    useUpdateEffect(() => {
        updateScrollBar(props.activeIndex);
    }, [props.activeIndex]);

    const useTabHeader = (tab, index) => {
        const selected = isSelected(index);
        const style = { ...(tab.props.headerStyle || {}), ...(tab.props.style || {}) };
        const className = classNames('p-unselectable-text', { 'p-tabview-selected p-highlight': selected, 'p-disabled': tab.props.disabled }, tab.props.headerClassName, tab.props.className);
        const headerId = id + '_header_' + index;
        const ariaControls = id + '_content_' + index;
        const tabIndex = tab.props.disabled ? null : 0;
        const leftIconElement = tab.props.leftIcon && <i className={tab.props.leftIcon}></i>;
        const titleElement = <span className="p-tabview-title">{tab.props.header}</span>;
        const rightIconElement = tab.props.rightIcon && <i className={tab.props.rightIcon}></i>;
        const closableIconElement = tab.props.closable && <i className="p-tabview-close pi pi-times" onClick={(e) => onTabHeaderClose(e, index)}></i>

        let content = (
            // eslint-disable /
            <a role="tab" className="p-tabview-nav-link" onClick={(e) => onTabHeaderClick(e, tab, index)} id={headerId} onKeyDown={(e) => onKeyDown(e, tab, index)}
                aria-controls={ariaControls} aria-selected={selected} tabIndex={tabIndex}>
                {leftIconElement}
                {titleElement}
                {rightIconElement}
                {closableIconElement}
                <Ripple />
            </a>
            // eslint-enable /
        );

        if (tab.props.headerTemplate) {
            const defaultContentOptions = {
                className: 'p-tabview-nav-link',
                titleClassName: 'p-tabview-title',
                onClick: (e) => onTabHeaderClick(e, tab, index),
                onKeyDown: (e) => onKeyDown(e, tab, index),
                leftIconElement,
                titleElement,
                rightIconElement,
                element: content,
                props: props,
                index,
                selected,
                ariaControls
            };

            content = ObjectUtils.getJSXElement(tab.props.headerTemplate, defaultContentOptions);
        }

        return (
            <li ref={(el) => tabsRef.current[`tab_${index}`] = el} className={className} style={style} role="presentation">
                {content}
            </li>
        )
    }

    const useTabHeaders = () => {
        return (
            React.Children.map(props.children, (tab, index) => {
                if (shouldUseTab(tab, index)) {
                    return useTabHeader(tab, index);
                }
            })
        )
    }

    const useNavigator = () => {
        const headers = useTabHeaders();

        return (
            <div ref={contentRef} id={id} className="p-tabview-nav-content" style={props.style} onScroll={onScroll}>
                <ul ref={navRef} className="p-tabview-nav" role="tablist">
                    {headers}
                    <li ref={inkbarRef} className="p-tabview-ink-bar"></li>
                </ul>
            </div>
        )
    }

    const useContent = () => {
        const contents = React.Children.map(props.children, (tab, index) => {
            if (shouldUseTab(tab, index) && (!props.renderActiveOnly || isSelected(index))) {
                const selected = isSelected(index);
                const style = { ...(tab.props.contentStyle || {}), ...(tab.props.style || {}) };
                const className = classNames(tab.props.contentClassName, tab.props.className, 'p-tabview-panel', { 'p-hidden': !selected });
                const contentId = id + '_content_' + index;
                const ariaLabelledBy = id + '_header_' + index;

                return (
                    <div id={contentId} aria-labelledby={ariaLabelledBy} aria-hidden={!selected} className={className} style={style} role="tabpanel">
                        {!props.renderActiveOnly ? tab.props.children : (selected && tab.props.children)}
                    </div>
                )
            }
        })

        return (
            <div className="p-tabview-panels">
                {contents}
            </div>
        )
    }

    const usePrevButton = () => {
        if (props.scrollable && !backwardIsDisabled) {
            return (
                <button ref={prevBtnRef} className="p-tabview-nav-prev p-tabview-nav-btn p-link" onClick={navBackward} type="button">
                    <span className="pi pi-chevron-left"></span>
                    <Ripple />
                </button>
            )
        }
        return null;
    }

    const useNextButton = () => {
        if (props.scrollable && !forwardIsDisabled) {
            return (
                <button ref={nextBtnRef} className="p-tabview-nav-next p-tabview-nav-btn p-link" onClick={navForward} type="button">
                    <span className="pi pi-chevron-right"></span>
                    <Ripple />
                </button>
            )
        }
    }

    useImperativeHandle(ref, () => ({
        reset
    }));

    const className = classNames('p-tabview p-component', props.className, { 'p-tabview-scrollable': props.scrollable });
    const navigator = useNavigator();
    const content = useContent();
    const prevButton = usePrevButton();
    const nextButton = useNextButton();

    return (
        <div className={className}>
            <div className="p-tabview-nav-container">
                {prevButton}
                {navigator}
                {nextButton}
            </div>
            {content}
        </div>
    );
})

TabPanel.defaultProps = {
    header: null,
    headerTemplate: null,
    leftIcon: null,
    rightIcon: null,
    closable: false,
    disabled: false,
    style: null,
    className: null,
    headerStyle: null,
    headerClassName: null,
    contentStyle: null,
    contentClassName: null
}

TabPanel.propTypes = {
    header: PropTypes.any,
    headerTemplate: PropTypes.any,
    leftIcon: PropTypes.string,
    rightIcon: PropTypes.string,
    closeable: PropTypes.bool,
    disabled: PropTypes.bool,
    style: PropTypes.object,
    className: PropTypes.string,
    headerStyle: PropTypes.object,
    headerClassName: PropTypes.string,
    contentStyle: PropTypes.object,
    contentClassName: PropTypes.string
}

TabView.defaultProps = {
    id: null,
    activeIndex: 0,
    style: null,
    className: null,
    renderActiveOnly: true,
    onTabChange: null,
    onTabClose: null,
    scrollable: false
}

TabView.propTypes = {
    id: PropTypes.string,
    activeIndex: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    renderActiveOnly: PropTypes.bool,
    onTabChange: PropTypes.func,
    onTabClose: PropTypes.func,
    scrollable: PropTypes.bool
}
