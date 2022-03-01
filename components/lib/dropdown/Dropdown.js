import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames, ZIndexUtils } from '../utils/Utils';
import { DropdownPanel } from './DropdownPanel';
import { tip } from '../tooltip/Tooltip';
import { OverlayService } from '../overlayservice/OverlayService';
import PrimeReact, { FilterService } from '../api/Api';
import { useOverlayListener } from '../hooks/useOverlayListener';

export const Dropdown = memo((props) => {
    const [filter, setFilter] = useState('');
    const [focused, setFocused] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const elementRef = useRef(null);
    const overlayRef = useRef(null);
    const inputRef = useRef(props.inputRef);
    const tooltipRef = useRef(null);
    const focusInputRef = useRef(null);
    const searchTimeout = useRef(null);
    const searchValue = useRef(null);
    const isLazy = props.virtualScrollerOptions && props.virtualScrollerOptions.lazy;
    const hasFilter = filter && filter.trim().length > 0;
    const appendTo = props.appendTo || PrimeReact.appendTo;

    const visibleOptions = useMemo(() => {
        if (hasFilter && !isLazy) {
            let filterValue = filter.trim().toLocaleLowerCase(props.filterLocale)
            let searchFields = props.filterBy ? props.filterBy.split(',') : [props.optionLabel || 'label'];

            if (props.optionGroupLabel) {
                let filteredGroups = [];
                for (let optgroup of props.options) {
                    let filteredSubOptions = FilterService.filter(getOptionGroupChildren(optgroup), searchFields, filterValue, props.filterMatchMode, props.filterLocale);
                    if (filteredSubOptions && filteredSubOptions.length) {
                        filteredGroups.push({ ...optgroup, ...{ items: filteredSubOptions } });
                    }
                }
                return filteredGroups;
            }
            else {
                return FilterService.filter(props.options, searchFields, filterValue, props.filterMatchMode, props.filterLocale);
            }
        }
        else {
            return props.options;
        }
    }, [hasFilter, isLazy, props.options]);

    const [bindOverlayListener, unbindOverlayListener] = useOverlayListener({ target: elementRef, overlay: overlayRef, listener: (event, type) => {
        if (type === 'outside')
            !isClearClicked(event) && hide();
        else
            hide();
    }, when: overlayVisible });

    const isClearClicked = (event) => {
        return DomHandler.hasClass(event.target, 'p-dropdown-clear-icon') || DomHandler.hasClass(event.target, 'p-dropdown-filter-clear-icon');
    }

    const onClick = (event) => {
        if (props.disabled) {
            return;
        }

        if (DomHandler.hasClass(event.target, 'p-dropdown-clear-icon') || event.target.tagName === 'INPUT') {
            return;
        }
        else if (!overlayRef.current || !(overlayRef.current && overlayRef.current.contains(event.target))) {
            focusInputRef.current.focus();
            overlayVisible ? hide() : show();
        }
    }

    const onInputFocus = (event) => {
        if (props.showOnFocus && !overlayVisible) {
            show();
        }

        setFocused(true);
        props.onFocus && props.onFocus(event);
    }

    const onInputBlur = (event) => {
        setFocused(false);
        props.onBlur && props.onBlur(event);
    }

    const onPanelClick = (event) => {
        OverlayService.emit('overlay-click', {
            originalEvent: event,
            target: elementRef.current
        });
    }

    const onInputKeyDown = (event) => {
        switch (event.which) {
            //down
            case 40:
                onDownKey(event);
                break;

            //up
            case 38:
                onUpKey(event);
                break;

            //space
            case 32:
                overlayVisible ? hide() : show();

                event.preventDefault();
                break;

            //enter
            case 13:
                hide();
                event.preventDefault();
                break;

            //escape and tab
            case 27:
            case 9:
                hide();
                break;

            default:
                search(event);
                break;
        }
    }

    const onFilterInputKeyDown = (event) => {
        switch (event.which) {
            //down
            case 40:
                onDownKey(event);
                break;

            //up
            case 38:
                onUpKey(event);
                break;

            //enter and escape
            case 13:
            case 27:
                hide();
                event.preventDefault();
                break;

            default:
                break;
        }
    }

    const onUpKey = (event) => {
        if (visibleOptions) {
            let prevOption = findPrevOption(getSelectedOptionIndex());
            if (prevOption) {
                selectItem({
                    originalEvent: event,
                    option: prevOption
                });
            }
        }

        event.preventDefault();
    }

    const onDownKey = (event) => {
        if (visibleOptions) {
            if (!overlayVisible && event.altKey) {
                show();
            }
            else {
                let nextOption = findNextOption(getSelectedOptionIndex());
                if (nextOption) {
                    selectItem({
                        originalEvent: event,
                        option: nextOption
                    });
                }
            }
        }

        event.preventDefault();
    }

    const findNextOption = (index) => {
        if (props.optionGroupLabel) {
            let groupIndex = index === -1 ? 0 : index.group;
            let optionIndex = index === -1 ? -1 : index.option;
            let option = findNextOptionInList(getOptionGroupChildren(visibleOptions[groupIndex]), optionIndex);

            if (option)
                return option;
            else if ((groupIndex + 1) !== visibleOptions.length)
                return findNextOption({ group: (groupIndex + 1), option: -1 });
            else
                return null;
        }
        else {
            return findNextOptionInList(visibleOptions, index);
        }
    }

    const findNextOptionInList = (list, index) => {
        let i = index + 1;
        if (i === list.length) {
            return null;
        }

        let option = list[i];
        if (isOptionDisabled(option))
            return findNextOptionInList(i);
        else
            return option;
    }

    const findPrevOption = (index) => {
        if (index === -1) {
            return null;
        }

        if (props.optionGroupLabel) {
            let groupIndex = index.group;
            let optionIndex = index.option;
            let option = findPrevOptionInList(getOptionGroupChildren(visibleOptions[groupIndex]), optionIndex);

            if (option)
                return option;
            else if (groupIndex > 0)
                return findPrevOption({ group: (groupIndex - 1), option: getOptionGroupChildren(visibleOptions[groupIndex - 1]).length });
            else
                return null;
        }
        else {
            return findPrevOptionInList(visibleOptions, index);
        }
    }

    const findPrevOptionInList = (list, index) => {
        let i = index - 1;
        if (i < 0) {
            return null;
        }

        let option = list[i];
        if (isOptionDisabled(option))
            return findPrevOption(i);
        else
            return option;
    }

    const search = (event) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        const char = event.key;
        previousSearchChar = currentSearchChar;
        currentSearchChar = char;

        if (previousSearchChar === currentSearchChar)
            searchValue.current = currentSearchChar;
        else
            searchValue.current = searchValue.current ? searchValue.current + char : char;

        if (searchValue.current) {
            let searchIndex = getSelectedOptionIndex();
            let newOption = props.optionGroupLabel ? searchOptionInGroup(searchIndex) : searchOption(++searchIndex);
            if (newOption) {
                selectItem({
                    originalEvent: event,
                    option: newOption
                });
            }
        }

        searchTimeout.current = setTimeout(() => {
            searchValue.current = null;
        }, 250);
    }

    const searchOption = (index) => {
        let option;

        if (searchValue.current) {
            option = searchOptionInRange(index, visibleOptions.length);

            if (!option) {
                option = searchOptionInRange(0, index);
            }
        }

        return option;
    }

    const searchOptionInRange = (start, end) => {
        for (let i = start; i < end; i++) {
            let opt = visibleOptions[i];
            if (matchesSearchValue(opt)) {
                return opt;
            }
        }

        return null;
    }

    const searchOptionInGroup = (index) => {
        let searchIndex = index === -1 ? { group: 0, option: -1 } : index;

        for (let i = searchIndex.group; i < visibleOptions.length; i++) {
            let groupOptions = getOptionGroupChildren(visibleOptions[i]);
            for (let j = (searchIndex.group === i ? searchIndex.option + 1 : 0); j < groupOptions.length; j++) {
                if (matchesSearchValue(groupOptions[j])) {
                    return groupOptions[j];
                }
            }
        }

        for (let i = 0; i <= searchIndex.group; i++) {
            let groupOptions = getOptionGroupChildren(visibleOptions[i]);
            for (let j = 0; j < (searchIndex.group === i ? searchIndex.option : groupOptions.length); j++) {
                if (matchesSearchValue(groupOptions[j])) {
                    return groupOptions[j];
                }
            }
        }

        return null;
    }

    const matchesSearchValue = (option) => {
        let label = getOptionLabel(option).toLocaleLowerCase(props.filterLocale);
        return label.startsWith(searchValue.current.toLocaleLowerCase(props.filterLocale));
    }

    const onEditableInputChange = (event) => {
        if (props.onChange) {
            props.onChange({
                originalEvent: event.originalEvent,
                value: event.target.value,
                stopPropagation: () => { },
                preventDefault: () => { },
                target: {
                    name: props.name,
                    id: props.id,
                    value: event.target.value,
                }
            });
        }
    }

    const onEditableInputFocus = (event) => {
        setFocused(true);
        hide();
        props.onFocus && props.onFocus(event);
    }

    const onOptionClick = (event) => {
        const option = event.option;

        if (!option.disabled) {
            selectItem(event);
            focusInputRef.current.focus();
        }

        hide();
    }

    const onFilterInputChange = (event) => {
        const _filter = event.target.value;

        setFilter(_filter);

        if (props.onFilter) {
            props.onFilter({
                originalEvent: event,
                filter: _filter
            });
        }
    }

    const onFilterClearIconClick = (callback) => {
        resetFilter(callback);
    }

    const resetFilter = (callback) => {
        setFilter('');
        props.onFilter && props.onFilter({ filter: '' });
        callback && callback();
    }

    const clear = (event) => {
        if (props.onChange) {
            props.onChange({
                originalEvent: event,
                value: undefined,
                stopPropagation: () => { },
                preventDefault: () => { },
                target: {
                    name: props.name,
                    id: props.id,
                    value: undefined
                }
            });
        }

        updateEditableLabel();
    }

    const selectItem = (event) => {
        if (selectedOption !== event.option) {
            updateEditableLabel(event.option);
            const optionValue = getOptionValue(event.option);

            if (props.onChange) {
                props.onChange({
                    originalEvent: event.originalEvent,
                    value: optionValue,
                    stopPropagation: () => { },
                    preventDefault: () => { },
                    target: {
                        name: props.name,
                        id: props.id,
                        value: optionValue
                    }
                });
            }
        }
    }

    const getSelectedOptionIndex = () => {
        if (props.value != null && visibleOptions) {
            if (props.optionGroupLabel) {
                for (let i = 0; i < visibleOptions.length; i++) {
                    let selectedOptionIndex = findOptionIndexInList(props.value, getOptionGroupChildren(visibleOptions[i]));
                    if (selectedOptionIndex !== -1) {
                        return { group: i, option: selectedOptionIndex };
                    }
                }
            }
            else {
                return findOptionIndexInList(props.value, visibleOptions);
            }
        }

        return -1;
    }

    const equalityKey = () => {
        return props.optionValue ? null : props.dataKey;
    }

    const findOptionIndexInList = (value, list) => {
        const key = equalityKey();
        for (let i = 0; i < list.length; i++) {
            if ((ObjectUtils.equals(value, getOptionValue(list[i]), key))) {
                return i;
            }
        }

        return -1;
    }

    const isSelected = (option) => {
        return ObjectUtils.equals(props.value, getOptionValue(option), equalityKey());
    }

    const show = () => {
        setOverlayVisible(true);
    }

    const hide = () => {
        setOverlayVisible(false);
    }

    const onOverlayEnter = (callback) => {
        ZIndexUtils.set('overlay', overlayRef.current, PrimeReact.autoZIndex, PrimeReact.zIndex['overlay']);
        alignOverlay();
        callback && callback();
    }

    const onOverlayEntered = (callback) => {
        callback && callback();
        bindOverlayListener();

        props.onShow && props.onShow();
    }

    const onOverlayExit = () => {
        unbindOverlayListener();
    }

    const onOverlayExited = () => {
        if (props.filter && props.resetFilterOnHide) {
            resetFilter();
        }

        ZIndexUtils.clear(overlayRef.current);

        props.onHide && props.onHide();
    }

    const alignOverlay = () => {
        DomHandler.alignOverlay(overlayRef.current, inputRef.current.parentElement, props.appendTo || PrimeReact.appendTo);
    }

    const scrollInView = () => {
        const highlightItem = DomHandler.findSingle(overlayRef.current, 'li.p-highlight');
        if (highlightItem && highlightItem.scrollIntoView) {
            highlightItem.scrollIntoView({ block: 'nearest', inline: 'start' });
        }
    }

    const updateEditableLabel = (option) => {
        if (inputRef.current) {
            inputRef.current.value = (option ? getOptionLabel(option) : props.value || '');
        }
    }

    const getOptionLabel = (option) => {
        return props.optionLabel ? ObjectUtils.resolveFieldData(option, props.optionLabel) : (option && option['label'] !== undefined ? option['label'] : option);
    }

    const getOptionValue = (option) => {
        return props.optionValue ? ObjectUtils.resolveFieldData(option, props.optionValue) : (option && option['value'] !== undefined ? option['value'] : option);
    }

    const getOptionRenderKey = (option) => {
        return props.dataKey ? ObjectUtils.resolveFieldData(option, props.dataKey) : getOptionLabel(option);
    }

    const isOptionDisabled = (option) => {
        if (props.optionDisabled) {
            return ObjectUtils.isFunction(props.optionDisabled) ? props.optionDisabled(option) : ObjectUtils.resolveFieldData(option, props.optionDisabled);
        }

        return (option && option['disabled'] !== undefined ? option['disabled'] : false);
    }

    const getOptionGroupRenderKey = (optionGroup) => {
        return ObjectUtils.resolveFieldData(optionGroup, props.optionGroupLabel);
    }

    const getOptionGroupLabel = (optionGroup) => {
        return ObjectUtils.resolveFieldData(optionGroup, props.optionGroupLabel);
    }

    const getOptionGroupChildren = (optionGroup) => {
        return ObjectUtils.resolveFieldData(optionGroup, props.optionGroupChildren);
    }

    const updateInputField = () => {
        if (props.editable && inputRef.current) {
            const label = selectedOption ? getOptionLabel(selectedOption) : null;
            const value = label || props.value || '';
            inputRef.current.value = value;
        }
    }

    const selectedOption = useMemo(() => {
        let index = getSelectedOptionIndex();

        return index !== -1 ? (props.optionGroupLabel ? getOptionGroupChildren(visibleOptions[index.group])[index.option] : visibleOptions[index]) : null;
    }, [visibleOptions, props.value]);

    useEffect(() => {
        ObjectUtils.combinedRefs(inputRef, props.inputRef);
    }, [inputRef]);

    useEffect(() => {
        if (tooltipRef.current) {
            tooltipRef.current.update({ content: props.tooltip, ...(props.tooltipOptions || {}) });
        }
        else if (props.tooltip) {
            tooltipRef.current = tip({
                target: elementRef.current,
                content: props.tooltip,
                options: props.tooltipOptions
            });
        }

        return () => {
            if (tooltipRef.current) {
                tooltipRef.current.destroy();
                tooltipRef.current = null;
            }
        }
    }, [props.tooltip, props.tooltipOptions]);

    useEffect(() => {
        if (props.autoFocus && focusInputRef.current) {
            focusInputRef.current.focus();
        }

        updateInputField();
        if (inputRef.current) {
            inputRef.current.selectedIndex = 1;
        }

        return () => {
            ZIndexUtils.clear(overlayRef.current);
        }
    }, []);

    useEffect(() => {
        if (overlayVisible && props.value) {
            scrollInView();
        }
    }, [overlayVisible, props.value]);

    useEffect(() => {
        if (overlayVisible && props.filter) {
            alignOverlay();
        }
    }, [overlayVisible, props.filter]);

    useEffect(() => {
        if (filter && (!props.options || props.options.length === 0)) {
            setFilter('');
        }

        updateInputField();
        if (inputRef.current) {
            inputRef.current.selectedIndex = 1;
        }
    });

    const useHiddenSelect = () => {
        const placeHolderOption = <option value="">{props.placeholder}</option>;
        const option = selectedOption ? <option value={selectedOption.value}>{getOptionLabel(selectedOption)}</option> : null;

        return (
            <div className="p-hidden-accessible p-dropdown-hidden-select">
                <select ref={inputRef} required={props.required} name={props.name} tabIndex={-1} aria-hidden="true">
                    {placeHolderOption}
                    {option}
                </select>
            </div>
        )
    }

    const useKeyboardHelper = () => {
        return (
            <div className="p-hidden-accessible">
                <input ref={focusInputRef} id={props.inputId} type="text" readOnly aria-haspopup="listbox"
                    onFocus={onInputFocus} onBlur={onInputBlur} onKeyDown={onInputKeyDown}
                    disabled={props.disabled} tabIndex={props.tabIndex} aria-label={props.ariaLabel} aria-labelledby={props.ariaLabelledBy} />
            </div>
        )
    }

    const useLabel = () => {
        const label = ObjectUtils.isNotEmpty(selectedOption) ? getOptionLabel(selectedOption) : null;

        if (props.editable) {
            const value = label || props.value || '';

            return (
                <input ref={inputRef} type="text" defaultValue={value} className="p-dropdown-label p-inputtext" disabled={props.disabled}
                    placeholder={props.placeholder} maxLength={props.maxLength} onInput={onEditableInputChange}
                    onFocus={onEditableInputFocus} onBlur={onInputBlur} aria-label={props.ariaLabel} aria-labelledby={props.ariaLabelledBy}
                    aria-haspopup="listbox" />
            )
        }
        else {
            const className = classNames('p-dropdown-label p-inputtext', {
                'p-placeholder': label === null && props.placeholder,
                'p-dropdown-label-empty': label === null && !props.placeholder
            });

            const content = props.valueTemplate ? ObjectUtils.getJSXElement(props.valueTemplate, selectedOption, props) : (label || props.placeholder || 'empty');

            return (
                <span ref={inputRef} className={className}>{content}</span>
            )
        }
    }

    const useClearIcon = () => {
        if (props.value != null && props.showClear && !props.disabled) {
            return (
                <i className="p-dropdown-clear-icon pi pi-times" onClick={clear}></i>
            )
        }

        return null;
    }

    const useDropdownIcon = () => {
        const iconClassName = classNames('p-dropdown-trigger-icon p-clickable', props.dropdownIcon);

        return (
            <div className="p-dropdown-trigger" role="button" aria-haspopup="listbox" aria-expanded={overlayVisible}>
                <span className={iconClassName}></span>
            </div>
        )
    }

    const className = classNames('p-dropdown p-component p-inputwrapper', props.className, {
        'p-disabled': props.disabled,
        'p-focus': focused,
        'p-dropdown-clearable': props.showClear && !props.disabled,
        'p-inputwrapper-filled': props.value,
        'p-inputwrapper-focus': focused || overlayVisible
    });

    const hiddenSelect = useHiddenSelect();
    const keyboardHelper = useKeyboardHelper();
    const labelElement = useLabel();
    const dropdownIcon = useDropdownIcon();
    const clearIcon = useClearIcon();

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style} onClick={onClick}
            onMouseDown={props.onMouseDown} onContextMenu={props.onContextMenu}>
            {keyboardHelper}
            {hiddenSelect}
            {labelElement}
            {clearIcon}
            {dropdownIcon}
            <DropdownPanel ref={overlayRef} visibleOptions={visibleOptions} {...props} appendTo={appendTo} onClick={onPanelClick} onOptionClick={onOptionClick}
                filterValue={filter} hasFilter={hasFilter} onFilterClearIconClick={onFilterClearIconClick} onFilterInputKeyDown={onFilterInputKeyDown} onFilterInputChange={onFilterInputChange}
                getOptionLabel={getOptionLabel} getOptionRenderKey={getOptionRenderKey} isOptionDisabled={isOptionDisabled}
                getOptionGroupChildren={getOptionGroupChildren} getOptionGroupLabel={getOptionGroupLabel} getOptionGroupRenderKey={getOptionGroupRenderKey}
                isSelected={isSelected} getSelectedOptionIndex={getSelectedOptionIndex}
                in={overlayVisible} onEnter={onOverlayEnter} onEntered={onOverlayEntered} onExit={onOverlayExit} onExited={onOverlayExited} />
        </div>
    )
})

Dropdown.defaultProps = {
    id: null,
    inputRef: null,
    name: null,
    value: null,
    options: null,
    optionLabel: null,
    optionValue: null,
    optionDisabled: null,
    optionGroupLabel: null,
    optionGroupChildren: null,
    optionGroupTemplate: null,
    valueTemplate: null,
    itemTemplate: null,
    style: null,
    className: null,
    virtualScrollerOptions: null,
    scrollHeight: '200px',
    filter: false,
    filterBy: null,
    filterMatchMode: 'contains',
    filterPlaceholder: null,
    filterLocale: undefined,
    emptyMessage: null,
    emptyFilterMessage: null,
    editable: false,
    placeholder: null,
    required: false,
    disabled: false,
    appendTo: null,
    tabIndex: null,
    autoFocus: false,
    filterInputAutoFocus: true,
    resetFilterOnHide: false,
    showFilterClear: false,
    panelClassName: null,
    panelStyle: null,
    dataKey: null,
    inputId: null,
    showClear: false,
    maxLength: null,
    tooltip: null,
    tooltipOptions: null,
    ariaLabel: null,
    ariaLabelledBy: null,
    transitionOptions: null,
    dropdownIcon: 'pi pi-chevron-down',
    showOnFocus: false,
    onChange: null,
    onFocus: null,
    onBlur: null,
    onMouseDown: null,
    onContextMenu: null,
    onShow: null,
    onHide: null,
    onFilter: null
}

Dropdown.propTypes = {
    id: PropTypes.string,
    inputRef: PropTypes.any,
    name: PropTypes.string,
    value: PropTypes.any,
    options: PropTypes.array,
    optionLabel: PropTypes.string,
    optionValue: PropTypes.string,
    optionDisabled: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    optionGroupLabel: PropTypes.string,
    optionGroupChildren: PropTypes.string,
    optionGroupTemplate: PropTypes.any,
    valueTemplate: PropTypes.any,
    itemTemplate: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string,
    virtualScrollerOptions: PropTypes.object,
    scrollHeight: PropTypes.string,
    filter: PropTypes.bool,
    filterBy: PropTypes.string,
    filterMatchMode: PropTypes.string,
    filterPlaceholder: PropTypes.string,
    filterLocale: PropTypes.string,
    emptyMessage: PropTypes.any,
    emptyFilterMessage: PropTypes.any,
    editable: PropTypes.bool,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    tabIndex: PropTypes.number,
    autoFocus: PropTypes.bool,
    filterInputAutoFocus: PropTypes.bool,
    resetFilterOnHide: PropTypes.bool,
    showFilterClear: PropTypes.bool,
    panelClassName: PropTypes.string,
    panelStyle: PropTypes.object,
    dataKey: PropTypes.string,
    inputId: PropTypes.string,
    showClear: PropTypes.bool,
    maxLength: PropTypes.number,
    tooltip: PropTypes.string,
    tooltipOptions: PropTypes.object,
    ariaLabel: PropTypes.string,
    ariaLabelledBy: PropTypes.string,
    transitionOptions: PropTypes.object,
    dropdownIcon: PropTypes.string,
    showOnFocus: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onMouseDown: PropTypes.func,
    onContextMenu: PropTypes.func,
    onShow: PropTypes.func,
    onHide: PropTypes.func,
    onFilter: PropTypes.func
}
