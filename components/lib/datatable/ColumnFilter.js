import React, { memo, useEffect, useRef, useState } from 'react';
import PrimeReact, { localeOption, FilterOperator, FilterMatchMode } from '../api/Api';
import { classNames, DomHandler, ObjectUtils, ZIndexUtils } from '../utils/Utils';
import { CSSTransition } from '../csstransition/CSSTransition';
import { OverlayService } from '../overlayservice/OverlayService';
import { Portal } from '../portal/Portal';
import { InputText } from '../inputtext/InputText';
import { Dropdown } from '../dropdown/Dropdown';
import { Button } from '../button/Button';
import { useEventListener } from '../hooks/useEventListener';
import { useResizeListener } from '../hooks/useResizeListener';
import { useOverlayScrollListener } from '../hooks/useOverlayScrollListener';

export const ColumnFilter = memo((props) => {
    const [overlayVisible, setOverlayVisible] = useState(false);
    const overlayRef = useRef(null);
    const iconRef = useRef(null);
    const selfClick = useRef(false);
    const overlayEventListener = useRef(null);

    const [bindDocumentClick, unbindDocumentClick] = useEventListener({ type: 'click', listener: event => {
        if (!selfClick.current && isOutsideClicked(event.target)) {
            hide();
        }
        selfClick.current = false;
    }});
    const [bindWindowResize, unbindWindowResize] = useResizeListener({ listener: () => {
        if (overlayVisible && !DomHandler.isTouchDevice()) {
            hide();
        }
    }});
    const [bindOverlayScroll, unbindOverlayScroll] = useOverlayScrollListener({ target: iconRef, listener: () => {
        overlayVisible && hide();
    }});

    const hasFilter = () => {
        return filterStoreModel && (filterStoreModel.operator ? !isFilterBlank(filterStoreModel.constraints[0].value) : !isFilterBlank(filterStoreModel.value));
    }

    const hasRowFilter = () => {
        return filterModel && !isFilterBlank(filterModel.value);
    }

    const isFilterBlank = (filter) => {
        return ObjectUtils.isEmpty(filter);
    }

    const isRowMatchModeSelected = (matchMode) => {
        return filterModel && filterModel.matchMode === matchMode;
    }

    const showMenuButton = () => {
        return getColumnProp('showFilterMenu') && (props.display === 'row' ? getColumnProp('dataType') !== 'boolean' : true);
    }

    const matchModes = () => {
        return getColumnProp('filterMatchModeOptions') || PrimeReact.filterMatchModeOptions[findDataType()].map(key => ({ label: localeOption(key), value: key }));
    }

    const isShowMatchModes = () => {
        return getColumnProp('dataType') !== 'boolean' && getColumnProp('showFilterMatchModes') && matchModes() && getColumnProp('showFilterMenuOptions');
    }

    const isShowOperator = () => {
        return getColumnProp('showFilterOperator') && filterModel && filterModel.operator && getColumnProp('showFilterMenuOptions');
    }

    const showRemoveIcon = () => {
        return fieldConstraints().length > 1;
    }

    const isShowAddConstraint = () => {
        return getColumnProp('showAddButton') && filterModel && filterModel.operator && (fieldConstraints() && fieldConstraints().length < getColumnProp('maxConstraints')) && getColumnProp('showFilterMenuOptions');
    }

    const isOutsideClicked = (target) => {
        return !isTargetClicked(target) && overlayRef && overlayRef.current && !(overlayRef.current.isSameNode(target) || overlayRef.current.contains(target));
    }

    const isTargetClicked = (target) => {
        return iconRef.current && (iconRef.current.isSameNode(target) || iconRef.current.contains(target));
    }

    const getColumnProp = (prop) => {
        return props.column.props[prop];
    }

    const getDefaultConstraint = () => {
        if (filterStoreModel) {
            if (filterStoreModel.operator) {
                return {
                    matchMode: filterStoreModel.constraints[0].matchMode,
                    operator: filterStoreModel.operator
                };
            }
            else {
                return {
                    matchMode: filterStoreModel.matchMode
                };
            }
        }
    }

    const findDataType = () => {
        const dataType = getColumnProp('dataType');
        const matchMode = getColumnProp('filterMatchMode');
        const hasMatchMode = (key) => PrimeReact.filterMatchModeOptions[key].some(mode => mode === matchMode);

        if (matchMode === 'custom' && !hasMatchMode(dataType)) {
            PrimeReact.filterMatchModeOptions[dataType].push(FilterMatchMode.CUSTOM);

            return dataType;
        }
        else if (matchMode) {
            return Object.keys(PrimeReact.filterMatchModeOptions).find(key => hasMatchMode(key)) || dataType;
        }

        return dataType;
    }

    const clearFilter = () => {
        const filterClearCallback = getColumnProp('onFilterClear');
        const defaultConstraint = getDefaultConstraint();
        let filters = { ...props.filters };
        if (filters[field].operator) {
            filters[field].constraints.splice(1);
            filters[field].operator = defaultConstraint.operator;
            filters[field].constraints[0] = { value: null, matchMode: defaultConstraint.matchMode };
        }
        else {
            filters[field].value = null;
            filters[field].matchMode = defaultConstraint.matchMode;
        }

        filterClearCallback && filterClearCallback();
        props.onFilterChange(filters);
        props.onFilterApply();
        hide();
    }

    const applyFilter = () => {
        const filterApplyClickCallback = getColumnProp('onFilterApplyClick');

        filterApplyClickCallback && filterApplyClickCallback({ field: field, constraints: filterModel });
        props.onFilterApply();
        hide();
    }

    const toggleMenu = () => {
        setOverlayVisible((prevVisible) => !prevVisible);
    }

    const onToggleButtonKeyDown = (event) => {
        switch (event.key) {
            case 'Escape':
            case 'Tab':
                hide();
                break;

            case 'ArrowDown':
                if (overlayVisible) {
                    const focusable = DomHandler.getFirstFocusableElement(overlayRef.current);
                    focusable && focusable.focus();
                    event.preventDefault();
                }
                else if (event.altKey) {
                    setOverlayVisible(true);
                    event.preventDefault();
                }
                break;

            default:
                break;
        }
    }

    const onContentKeyDown = (event) => {
        if (event.key === 'Escape') {
            hide();
            iconRef.current && iconRef.current.focus();
        }
    }

    const onInputChange = (event, index) => {
        let filters = { ...props.filters };
        let value = event.target.value;

        if (props.display === 'menu') {
            filters[field].constraints[index].value = value;
        }
        else {
            filters[field].value = value;
        }

        props.onFilterChange(filters);

        if (!getColumnProp('showApplyButton') || props.display === 'row') {
            props.onFilterApply();
        }
    }

    const onRowMatchModeChange = (matchMode) => {
        const filterMatchModeChangeCallback = getColumnProp('onFilterMatchModeChange');
        let filters = { ...props.filters };
        filters[field].matchMode = matchMode;

        filterMatchModeChangeCallback && filterMatchModeChangeCallback({ field: field, matchMode });
        props.onFilterChange(filters);
        props.onFilterApply();
        hide();
    }

    const onRowMatchModeKeyDown = (event, matchMode, clear) => {
        let item = event.target;

        switch (event.key) {
            case 'ArrowDown':
                const nextItem = findNextItem(item);
                if (nextItem) {
                    item.removeAttribute('tabindex');
                    nextItem.tabIndex = 0;
                    nextItem.focus();
                }

                event.preventDefault();
                break;

            case 'ArrowUp':
                const prevItem = findPrevItem(item);
                if (prevItem) {
                    item.removeAttribute('tabindex');
                    prevItem.tabIndex = 0;
                    prevItem.focus();
                }

                event.preventDefault();
                break;

            case 'Enter':
                clear ? clearFilter() : onRowMatchModeChange(matchMode.value);

                event.preventDefault();
                break;

            default:
                break;
        }
    }

    const onOperatorChange = (e) => {
        const filterOperationChangeCallback = getColumnProp('onFilterOperatorChange');
        let value = e.value;
        let filters = { ...props.filters };
        filters[field].operator = value;
        props.onFilterChange(filters);

        filterOperationChangeCallback && filterOperationChangeCallback({ field: field, operator: value });
        if (!getColumnProp('showApplyButton')) {
            props.onFilterApply();
        }
    }

    const onMenuMatchModeChange = (value, index) => {
        const filterMatchModeChangeCallback = getColumnProp('onFilterMatchModeChange');
        let filters = { ...props.filters };
        filters[field].constraints[index].matchMode = value;
        props.onFilterChange(filters);
        filterMatchModeChangeCallback && filterMatchModeChangeCallback({ field: field, matchMode: value, index: index });

        if (!getColumnProp('showApplyButton')) {
            props.onFilterApply();
        }
    }

    const addConstraint = () => {
        const filterConstraintAddCallback = getColumnProp('onFilterConstraintAdd');
        const defaultConstraint = getDefaultConstraint();
        let filters = { ...props.filters };
        let newConstraint = { value: null, matchMode: defaultConstraint.matchMode };
        filters[field].constraints.push(newConstraint);
        filterConstraintAddCallback && filterConstraintAddCallback({ field: field, constraint: newConstraint });
        props.onFilterChange(filters);

        if (!getColumnProp('showApplyButton')) {
            props.onFilterApply();
        }
    }

    const removeConstraint = (index) => {
        const filterConstraintRemoveCallback = getColumnProp('onFilterConstraintRemove');
        let filters = { ...props.filters };
        let removedConstraint = filters[field].constraints.splice(index, 1);
        filterConstraintRemoveCallback && filterConstraintRemoveCallback({ field: field, constraint: removedConstraint });
        props.onFilterChange(filters);

        if (!getColumnProp('showApplyButton')) {
            props.onFilterApply();
        }
    }

    const findNextItem = (item) => {
        let nextItem = item.nextElementSibling;

        if (nextItem)
            return DomHandler.hasClass(nextItem, 'p-column-filter-separator') ? findNextItem(nextItem) : nextItem;
        else
            return item.parentElement.firstElementChild;
    }

    const findPrevItem = (item) => {
        let prevItem = item.previousElementSibling;

        if (prevItem)
            return DomHandler.hasClass(prevItem, 'p-column-filter-separator') ? findPrevItem(prevItem) : prevItem;
        else
            return item.parentElement.lastElementChild;
    }

    const hide = () => {
        setOverlayVisible(false);
    }

    const onContentClick = (event) => {
        selfClick.current = true;

        OverlayService.emit('overlay-click', {
            originalEvent: event,
            target: overlayRef.current
        });
    }

    const onContentMouseDown = () => {
        selfClick.current = true;
    }

    const onOverlayEnter = () => {
        ZIndexUtils.set('overlay', overlayRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
        DomHandler.alignOverlay(overlayRef.current, iconRef.current, PrimeReact.appendTo, false);
        bindDocumentClick();
        bindWindowResize();
        bindOverlayScroll();

        overlayEventListener.current = (e) => {
            if (!isOutsideClicked(e.target)) {
                selfClick.current = true;
            }
        }
        OverlayService.on('overlay-click', overlayEventListener.current);
    }

    const onOverlayExit = () => {
        onOverlayHide();
    }

    const onOverlayExited = () => {
        ZIndexUtils.clear(overlayRef.current);
    }

    const onOverlayHide = () => {
        unbindDocumentClick();
        unbindWindowResize();
        unbindOverlayScroll();
        OverlayService.off('overlay-click', overlayEventListener.current);
        overlayEventListener.current = null;
        selfClick.current = false;
    }

    const fieldConstraints = () => {
        return filterModel ? filterModel.constraints || [filterModel] : [];
    }

    const operator = () => {
        return filterModel.operator;
    }

    const operatorOptions = () => {
        return [
            { label: localeOption('matchAll'), value: FilterOperator.AND },
            { label: localeOption('matchAny'), value: FilterOperator.OR }
        ];
    }

    const noFilterLabel = () => {
        return localeOption('noFilter');
    }

    const removeRuleButtonLabel = () => {
        return localeOption('removeRule');
    }

    const addRuleButtonLabel = () => {
        return localeOption('addRule');
    }

    const clearButtonLabel = () => {
        return localeOption('clear');
    }

    const applyButtonLabel = () => {
        return localeOption('apply');
    }

    const filterCallback = (value, index = 0) => {
        let filters = { ...props.filters };
        let meta = filters[field];

        props.display === 'menu' && meta && meta.operator ? (filters[field].constraints[index].value = value) : (filters[field].value = value);
        props.onFilterChange(filters);
    }

    const filterApplyCallback = (...args) => {
        args && filterCallback(args[0], args[1]);

        props.onFilterApply();
    }

    useEffect(() => {
        if (props.display === 'menu' && overlayVisible) {
            DomHandler.alignOverlay(overlayRef.current, iconRef.current, PrimeReact.appendTo, false);
        }

        return () => {
            if (overlayEventListener.current) {
                OverlayService.off('overlay-click', overlayEventListener.current);
                overlayEventListener.current = null;
            }

            if (overlayRef.current) {
                ZIndexUtils.clear(overlayRef.current);
                onOverlayHide();
            }
        }
    }, []);

    const useFilterElement = (model, index) => {
        const value = model ? model.value : null;

        return getColumnProp('filterElement') ?
            ObjectUtils.getJSXElement(getColumnProp('filterElement'), { field: field, index, filterModel: model, value, filterApplyCallback: filterApplyCallback, filterCallback: filterCallback })
            : <InputText type={getColumnProp('filterType')} value={value || ''} onChange={(e) => onInputChange(e, index)} className="p-column-filter" placeholder={getColumnProp('filterPlaceholder')} maxLength={getColumnProp('filterMaxLength')} />;
    }

    const useRowFilterElement = () => {
        if (props.display === 'row') {
            const content = useFilterElement(filterModel, 0);

            return (
                <div className="p-fluid p-column-filter-element">
                    {content}
                </div>
            )

        }

        return null;
    }

    const useMenuFilterElement = (fieldConstraint, index) => {
        if (props.display === 'menu') {
            return useFilterElement(fieldConstraint, index);
        }

        return null;
    }

    const useMenuButton = () => {
        if (showMenuButton()) {
            const className = classNames('p-column-filter-menu-button p-link', {
                'p-column-filter-menu-button-open': overlayVisible,
                'p-column-filter-menu-button-active': hasFilter()
            });

            return (
                <button ref={iconRef} type="button" className={className} aria-haspopup aria-expanded={overlayVisible} onClick={toggleMenu} onKeyDown={onToggleButtonKeyDown}>
                    <span className="pi pi-filter-icon pi-filter"></span>
                </button>
            )
        }

        return null;
    }

    const useClearButton = () => {
        if (getColumnProp('showClearButton') && props.display === 'row') {
            const className = classNames('p-column-filter-clear-button p-link', {
                'p-hidden-space': !hasRowFilter()
            });

            return (
                <button className={className} type="button" onClick={clearFilter}>
                    <span className="pi pi-filter-slash"></span>
                </button>
            )
        }

        return null;
    }

    const useRowItems = () => {
        if (isShowMatchModes()) {
            const _matchModes = matchModes();
            const _noFilterLabel = noFilterLabel();

            return (
                <ul className="p-column-filter-row-items">
                    {
                        _matchModes.map((matchMode, i) => {
                            const { value, label } = matchMode;
                            const className = classNames('p-column-filter-row-item', { 'p-highlight': isRowMatchModeSelected(value) });
                            const tabIndex = i === 0 ? 0 : null;

                            return (
                                <li className={className} key={label} onClick={() => onRowMatchModeChange(value)} onKeyDown={(e) => onRowMatchModeKeyDown(e, matchMode)} tabIndex={tabIndex}>
                                    {label}
                                </li>
                            )
                        })
                    }
                    <li className="p-column-filter-separator"></li>
                    <li className="p-column-filter-row-item" onClick={clearFilter} onKeyDown={(e) => onRowMatchModeKeyDown(e, null, true)}>{_noFilterLabel}</li>
                </ul>
            )
        }

        return null;
    }

    const useOperator = () => {
        if (isShowOperator()) {
            const options = operatorOptions();
            const value = operator();

            return (
                <div className="p-column-filter-operator">
                    <Dropdown options={options} value={value} onChange={onOperatorChange} className="p-column-filter-operator-dropdown" />
                </div>
            )
        }

        return null;
    }

    const useMatchModeDropdown = (constraint, index) => {
        if (isShowMatchModes()) {
            const options = matchModes();

            return (
                <Dropdown options={options} value={constraint.matchMode} onChange={(e) => onMenuMatchModeChange(e.value, index)} className="p-column-filter-matchmode-dropdown" />
            )
        }

        return null;
    }

    const useRemoveButton = (index) => {
        if (showRemoveIcon()) {
            const removeRuleLabel = removeRuleButtonLabel();

            return (
                <Button type="button" icon="pi pi-trash" className="p-column-filter-remove-button p-button-text p-button-danger p-button-sm" onClick={() => removeConstraint(index)} label={removeRuleLabel} />
            )
        }

        return null;
    }

    const useConstraints = () => {
        const _fieldConstraints = fieldConstraints();

        return (
            <div className="p-column-filter-constraints">
                {
                    _fieldConstraints.map((fieldConstraint, i) => {
                        const matchModeDropdown = useMatchModeDropdown(fieldConstraint, i)
                        const menuFilterElement = useMenuFilterElement(fieldConstraint, i);
                        const removeButton = useRemoveButton(i);

                        return (
                            <div key={i} className="p-column-filter-constraint">
                                {matchModeDropdown}
                                {menuFilterElement}
                                <div>
                                    {removeButton}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    const useAddRule = () => {
        if (isShowAddConstraint()) {
            const addRuleLabel = addRuleButtonLabel();
            return (
                <div className="p-column-filter-add-rule">
                    <Button type="button" label={addRuleLabel} icon="pi pi-plus" className="p-column-filter-add-button p-button-text p-button-sm" onClick={addConstraint} />
                </div>
            )
        }

        return null;
    }

    const useFilterClearButton = () => {
        if (getColumnProp('showClearButton')) {
            if (!getColumnProp('filterClear')) {
                const clearLabel = clearButtonLabel();
                return (
                    <Button type="button" className="p-button-outlined p-button-sm" onClick={clearFilter} label={clearLabel} />
                )
            }

            return ObjectUtils.getJSXElement(getColumnProp('filterClear'), { field: field, filterModel: filterModel, filterClearCallback: clearFilter });
        }

        return null;
    }

    const useFilterApplyButton = () => {
        if (getColumnProp('showApplyButton')) {
            if (!getColumnProp('filterApply')) {
                const applyLabel = applyButtonLabel();
                return (
                    <Button type="button" className="p-button-sm" onClick={applyFilter} label={applyLabel} />
                )
            }

            return ObjectUtils.getJSXElement(getColumnProp('filterApply'), { field: field, filterModel: filterModel, filterApplyCallback: applyFilter });
        }

        return null
    }

    const useButtonBar = () => {
        const clearButton = useFilterClearButton();
        const applyButton = useFilterApplyButton();

        return (
            <div className="p-column-filter-buttonbar">
                {clearButton}
                {applyButton}
            </div>
        )
    }

    const useItems = () => {
        const operator = useOperator();
        const constraints = useConstraints();
        const addRule = useAddRule();
        const buttonBar = useButtonBar();

        return (
            <>
                {operator}
                {constraints}
                {addRule}
                {buttonBar}
            </>
        )
    }

    const useOverlay = () => {
        const style = getColumnProp('filterMenuStyle');
        const className = classNames('p-column-filter-overlay p-component p-fluid', getColumnProp('filterMenuClassName'), {
            'p-column-filter-overlay-menu': props.display === 'menu',
            'p-input-filled': PrimeReact.inputStyle === 'filled',
            'p-ripple-disabled': PrimeReact.ripple === false
        });
        const filterHeader = ObjectUtils.getJSXElement(getColumnProp('filterHeader'), { field: field, filterModel: filterModel, filterApplyCallback: filterApplyCallback });
        const filterFooter = ObjectUtils.getJSXElement(getColumnProp('filterFooter'), { field: field, filterModel: filterModel, filterApplyCallback: filterApplyCallback });
        const items = props.display === 'row' ? useRowItems() : useItems();

        return (
            <Portal>
                <CSSTransition nodeRef={overlayRef} classNames="p-connected-overlay" in={overlayVisible} timeout={{ enter: 120, exit: 100 }}
                    unmountOnExit onEnter={onOverlayEnter} onExit={onOverlayExit} onExited={onOverlayExited}>
                    <div ref={overlayRef} style={style} className={className} onKeyDown={onContentKeyDown} onClick={onContentClick} onMouseDown={onContentMouseDown}>
                        {filterHeader}
                        {items}
                        {filterFooter}
                    </div>
                </CSSTransition>
            </Portal>
        )
    }

    const field = getColumnProp('filterField') || getColumnProp('field');
    const filterModel = props.filters[field];
    const filterStoreModel = props.filtersStore && props.filtersStore[field];

    const className = classNames('p-column-filter p-fluid', {
        'p-column-filter-row': props.display === 'row',
        'p-column-filter-menu': props.display === 'menu'
    });
    const rowFilterElement = useRowFilterElement();
    const menuButton = useMenuButton();
    const clearButton = useClearButton();
    const overlay = useOverlay();

    return (
        <div className={className}>
            {rowFilterElement}
            {menuButton}
            {clearButton}
            {overlay}
        </div>
    )
})
