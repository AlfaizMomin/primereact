import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import PrimeReact, { FilterService } from '../api/Api';
import { ObjectUtils, DomHandler, classNames } from '../utils/Utils';
import { Paginator } from '../paginator/Paginator';
import { TreeTableHeader } from './TreeTableHeader';
import { TreeTableBody } from './TreeTableBody';
import { TreeTableFooter } from './TreeTableFooter';
import { TreeTableScrollableView } from './TreeTableScrollableView';
import { useEventListener } from '../hooks/Hooks';

export const TreeTable = forwardRef((props, ref) => {
    const [expandedKeys, setExpandedKeys] = useState(props.expandedKeys);
    const [first, setFirst] = useState(props.first);
    const [rows, setRows] = useState(props.rows);
    const [sortField, setSortField] = useState(props.sortField);
    const [sortOrder, setSortOrder] = useState(props.sortOrder);
    const [multiSortMeta, setMultiSortMeta] = useState(props.multiSortMeta);
    const [filters, setFilters] = useState(props.filters);
    const [columnOrder, setColumnOrder] = useState([]);
    const elementRef = useRef(null);
    const resizerHelperRef = useRef(null);
    const reorderIndicatorUpRef = useRef(null);
    const reorderIndicatorDownRef = useRef(null);
    const columnResizing = useRef(null);
    const resizeColumn = useRef(null);
    const resizeColumnProps = useRef(null);
    const lastResizerHelperX = useRef(0);
    const iconWidth = useRef(0);
    const iconHeight = useRef(0);
    const draggedColumnEl = useRef(null);
    const draggedColumn = useRef(null);
    const dropPosition = useRef(null);
    const columnSortable = useRef(null);
    const columnSortFunction = useRef(null);
    const columnField = useRef(null);

    const [bindDocumentMouseMove, unbindDocumentMouseMove] = useEventListener({ type: 'mousemove', listener: (event) => {
        if (columnResizing.current) {
            onColumnResize(event);
        }
    }});

    const [bindDocumentMouseUp, unbindDocumentMouseUp] = useEventListener({ type: 'mouseup', listener: (event) => {
        if (columnResizing.current) {
            columnResizing.current = false;
            onColumnResizeEnd(event);
        }
    }});

    const onToggle = (event) => {
        if (props.onToggle) {
            props.onToggle(event);
        }
        else {
            setExpandedKeys(event.value);
        }
    }

    const onPageChange = (event) => {
        if (props.onPage) {
            props.onPage(event);
        }
        else {
            setFirst(event.first);
            setRows(event.rows);
        }
    }

    const onSort = (event) => {
        let _sortField = event.sortField;
        let _sortOrder = props.defaultSortOrder;
        let _multiSortMeta;
        let eventMeta;

        columnSortable.current = event.sortable;
        columnSortFunction.current = event.sortFunction;
        columnField.current = event.sortField;

        if (props.sortMode === 'multiple') {
            let metaKey = event.originalEvent.metaKey || event.originalEvent.ctrlKey;
            _multiSortMeta = getMultiSortMeta();

            if (_multiSortMeta && _multiSortMeta instanceof Array) {
                const sortMeta = _multiSortMeta.find(sortMeta => sortMeta.field === _sortField);
                _sortOrder = sortMeta ? getCalculatedSortOrder(sortMeta.order) : _sortOrder;
            }

            const newMetaData = { field: _sortField, order: _sortOrder };

            if (_sortOrder) {
                if (!_multiSortMeta || !metaKey) {
                    _multiSortMeta = [];
                }

                addSortMeta(newMetaData, _multiSortMeta);
            }
            else if (props.removableSort && _multiSortMeta) {
                removeSortMeta(newMetaData, _multiSortMeta);
            }

            eventMeta = {
                multiSortMeta: _multiSortMeta
            };
        }
        else {
            _sortOrder = (getSortField() === _sortField) ? getCalculatedSortOrder(getSortOrder()) : _sortOrder;

            if (props.removableSort) {
                _sortField = _sortOrder ? _sortField : null;
            }

            eventMeta = {
                sortField: _sortField,
                sortOrder: _sortOrder
            };
        }

        if (props.onSort) {
            props.onSort(eventMeta);
        }
        else {
            setFirst(0);
            setSortField(eventMeta.sortField);
            setSortOrder(eventMeta.sortOrder);
            setMultiSortMeta(eventMeta.multiSortMeta);
        }
    }

    const getCalculatedSortOrder = (currentOrder) => {
        return props.removableSort ? (props.defaultSortOrder === currentOrder ? currentOrder * -1 : 0) : currentOrder * -1;
    }

    const addSortMeta = (meta, _multiSortMeta) => {
        let index = -1;
        for (let i = 0; i < _multiSortMeta.length; i++) {
            if (_multiSortMeta[i].field === meta.field) {
                index = i;
                break;
            }
        }

        if (index >= 0)
            _multiSortMeta[index] = meta;
        else
            _multiSortMeta.push(meta);
    }

    const removeSortMeta = (meta, _multiSortMeta) => {
        let index = -1;
        for (let i = 0; i < _multiSortMeta.length; i++) {
            if (_multiSortMeta[i].field === meta.field) {
                index = i;
                break;
            }
        }

        if (index >= 0) {
            _multiSortMeta.splice(index, 1);
        }

        _multiSortMeta = _multiSortMeta.length > 0 ? _multiSortMeta : null;
    }

    const sortSingle = (data) => {
        return sortNodes(data);
    }

    const sortNodes = (data) => {
        let value = [...data];

        if (columnSortable.current && columnSortable.current === 'custom' && columnSortFunction.current) {
            value = columnSortFunction.current({
                field: getSortField(),
                order: getSortOrder()
            });
        }
        else {
            value.sort((node1, node2) => {
                const _sortField = getSortField();
                const value1 = ObjectUtils.resolveFieldData(node1.data, _sortField);
                const value2 = ObjectUtils.resolveFieldData(node2.data, _sortField);
                return ObjectUtils.sort(value1, value2, getSortOrder(), PrimeReact.locale);
            });

            for (let i = 0; i < value.length; i++) {
                if (value[i].children && value[i].children.length) {
                    value[i].children = sortNodes(value[i].children);
                }
            }
        }

        return value;
    }

    const sortMultiple = (data) => {
        let _multiSortMeta = getMultiSortMeta();

        if (_multiSortMeta)
            return sortMultipleNodes(data, _multiSortMeta);
        else
            return data;
    }

    const sortMultipleNodes = (data, _multiSortMeta) => {
        let value = [...data];
        value.sort((node1, node2) => {
            return multisortField(node1, node2, _multiSortMeta, 0);
        });

        for (let i = 0; i < value.length; i++) {
            if (value[i].children && value[i].children.length) {
                value[i].children = sortMultipleNodes(value[i].children, _multiSortMeta);
            }
        }

        return value;
    }

    const multisortField = (node1, node2, _multiSortMeta, index) => {
        const value1 = ObjectUtils.resolveFieldData(node1.data, _multiSortMeta[index].field);
        const value2 = ObjectUtils.resolveFieldData(node2.data, _multiSortMeta[index].field);
        let result = null;

        if (value1 == null && value2 != null)
            result = -1;
        else if (value1 != null && value2 == null)
            result = 1;
        else if (value1 == null && value2 == null)
            result = 0;
        else {
            if (value1 === value2) {
                return (_multiSortMeta.length - 1) > (index) ? (multisortField(node1, node2, _multiSortMeta, index + 1)) : 0;
            }
            else {
                if ((typeof value1 === 'string' || value1 instanceof String) && (typeof value2 === 'string' || value2 instanceof String))
                    return (_multiSortMeta[index].order * value1.localeCompare(value2, PrimeReact.locale, { numeric: true }));
                else
                    result = (value1 < value2) ? -1 : 1;
            }
        }

        return (_multiSortMeta[index].order * result);
    }

    const filter = (value, field, mode) => {
        onFilter({
            value: value,
            field: field,
            matchMode: mode
        });
    }

    const onFilter = (event) => {
        let currentFilters = getFilters();
        let newFilters = currentFilters ? { ...currentFilters } : {};

        if (!isFilterBlank(event.value))
            newFilters[event.field] = { value: event.value, matchMode: event.matchMode };
        else if (newFilters[event.field])
            delete newFilters[event.field];

        if (props.onFilter) {
            props.onFilter({
                filters: newFilters
            });
        }
        else {
            setFirst(0);
            setFilters(newFilters);
        }
    }

    const hasFilter = () => {
        let _filters = getFilters();

        return _filters && Object.keys(_filters).length > 0;
    }

    const isFilterBlank = (filter) => {
        if (filter !== null && filter !== undefined) {
            if ((typeof filter === 'string' && filter.trim().length === 0) || (filter instanceof Array && filter.length === 0))
                return true;
            else
                return false;
        }
        return true;
    }

    const onColumnResizeStart = (event) => {
        let containerLeft = DomHandler.getOffset(elementRef.current).left;
        resizeColumn.current = event.columnEl;
        resizeColumnProps.current = event.column;
        columnResizing.current = true;
        lastResizerHelperX.current = (event.originalEvent.pageX - containerLeft + elementRef.current.scrollLeft);

        bindColumnResizeEvents();
    }

    const onColumnResize = (event) => {
        let containerLeft = DomHandler.getOffset(elementRef.current).left;
        DomHandler.addClass(elementRef.current, 'p-unselectable-text');
        resizerHelperRef.current.style.height = elementRef.current.offsetHeight + 'px';
        resizerHelperRef.current.style.top = 0 + 'px';
        resizerHelperRef.current.style.left = (event.pageX - containerLeft + elementRef.current.scrollLeft) + 'px';

        resizerHelperRef.current.style.display = 'block';
    }

    const onColumnResizeEnd = (event) => {
        let delta = resizerHelperRef.current.offsetLeft - lastResizerHelperX.current;
        let columnWidth = resizeColumn.current.offsetWidth;
        let newColumnWidth = columnWidth + delta;
        let minWidth = resizeColumn.current.style.minWidth || 15;

        if (columnWidth + delta > parseInt(minWidth, 10)) {
            if (props.columnResizeMode === 'fit') {
                let nextColumn = resizeColumn.current.nextElementSibling;
                let nextColumnWidth = nextColumn.offsetWidth - delta;

                if (newColumnWidth > 15 && nextColumnWidth > 15) {
                    if (props.scrollable) {
                        let scrollableView = findParentScrollableView(resizeColumn.current);
                        let scrollableBodyTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-body-table');
                        let scrollableHeaderTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-header-table');
                        let scrollableFooterTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-footer-table');
                        let resizeColumnIndex = DomHandler.index(resizeColumn.current);

                        resizeColGroup(scrollableHeaderTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
                        resizeColGroup(scrollableBodyTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
                        resizeColGroup(scrollableFooterTable, resizeColumnIndex, newColumnWidth, nextColumnWidth);
                    }
                    else {
                        resizeColumn.current.style.width = newColumnWidth + 'px';
                        if (nextColumn) {
                            nextColumn.style.width = nextColumnWidth + 'px';
                        }
                    }
                }
            }
            else if (props.columnResizeMode === 'expand') {
                if (props.scrollable) {
                    let scrollableView = findParentScrollableView(resizeColumn.current);
                    let scrollableBodyTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-body-table');
                    let scrollableHeaderTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-header-table');
                    let scrollableFooterTable = DomHandler.findSingle(scrollableView, 'table.p-treetable-scrollable-footer-table');
                    scrollableBodyTable.style.width = scrollableBodyTable.offsetWidth + delta + 'px';
                    scrollableHeaderTable.style.width = scrollableHeaderTable.offsetWidth + delta + 'px';
                    if (scrollableFooterTable) {
                        scrollableFooterTable.style.width = scrollableHeaderTable.offsetWidth + delta + 'px';
                    }
                    let resizeColumnIndex = DomHandler.index(resizeColumn.current);

                    resizeColGroup(scrollableHeaderTable, resizeColumnIndex, newColumnWidth, null);
                    resizeColGroup(scrollableBodyTable, resizeColumnIndex, newColumnWidth, null);
                    resizeColGroup(scrollableFooterTable, resizeColumnIndex, newColumnWidth, null);
                }
                else {
                    table.style.width = table.offsetWidth + delta + 'px';
                    resizeColumn.current.style.width = newColumnWidth + 'px';
                }
            }

            if (props.onColumnResizeEnd) {
                props.onColumnResizeEnd({
                    element: resizeColumn.current,
                    column: resizeColumnProps.current,
                    delta: delta
                });
            }
        }

        resizerHelperRef.current.style.display = 'none';
        resizeColumn.current = null;
        resizeColumnProps.current = null;
        DomHandler.removeClass(elementRef.current, 'p-unselectable-text');

        unbindColumnResizeEvents();
    }

    const findParentScrollableView = (column) => {
        if (column) {
            let parent = column.parentElement;
            while (parent && !DomHandler.hasClass(parent, 'p-treetable-scrollable-view')) {
                parent = parent.parentElement;
            }

            return parent;
        }
        else {
            return null;
        }
    }

    const resizeColGroup = (table, resizeColumnIndex, newColumnWidth, nextColumnWidth) => {
        if (table) {
            let colGroup = table.children[0].nodeName === 'COLGROUP' ? table.children[0] : null;

            if (colGroup) {
                let col = colGroup.children[resizeColumnIndex];
                let nextCol = col.nextElementSibling;
                col.style.width = newColumnWidth + 'px';

                if (nextCol && nextColumnWidth) {
                    nextCol.style.width = nextColumnWidth + 'px';
                }
            }
            else {
                throw new Error("Scrollable tables require a colgroup to support resizable columns");
            }
        }
    }

    const bindColumnResizeEvents = () => {
        bindDocumentMouseMove();
        bindDocumentMouseUp();
    }

    const unbindColumnResizeEvents = () => {
        unbindDocumentMouseMove();
        unbindDocumentMouseUp();
    }

    const onColumnDragStart = (e) => {
        const { originalEvent: event, column } = e;

        if (columnResizing.current) {
            event.preventDefault();
            return;
        }

        iconWidth.current = DomHandler.getHiddenElementOuterWidth(reorderIndicatorUpRef.current);
        iconHeight.current = DomHandler.getHiddenElementOuterHeight(reorderIndicatorUpRef.current);

        draggedColumnEl.current = findParentHeader(event.currentTarget);
        draggedColumn.current = column;
        event.dataTransfer.setData('text', 'b'); // Firefox requires this to make dragging possible
    }

    const onColumnDragOver = (e) => {
        const event = e.originalEvent;
        const dropHeader = findParentHeader(event.currentTarget);
        if (props.reorderableColumns && draggedColumnEl.current && dropHeader) {
            event.preventDefault();
            let containerOffset = DomHandler.getOffset(elementRef.current);
            let dropHeaderOffset = DomHandler.getOffset(dropHeader);

            if (draggedColumnEl.current !== dropHeader) {
                let targetLeft = dropHeaderOffset.left - containerOffset.left;
                //let targetTop =  containerOffset.top - dropHeaderOffset.top;
                let columnCenter = dropHeaderOffset.left + dropHeader.offsetWidth / 2;

                reorderIndicatorUpRef.current.style.top = dropHeaderOffset.top - containerOffset.top - (iconHeight.current - 1) + 'px';
                reorderIndicatorDownRef.current.style.top = dropHeaderOffset.top - containerOffset.top + dropHeader.offsetHeight + 'px';

                if (event.pageX > columnCenter) {
                    reorderIndicatorUpRef.current.style.left = (targetLeft + dropHeader.offsetWidth - Math.ceil(iconWidth.current / 2)) + 'px';
                    reorderIndicatorDownRef.current.style.left = (targetLeft + dropHeader.offsetWidth - Math.ceil(iconWidth.current / 2)) + 'px';
                    dropPosition.current = 1;
                }
                else {
                    reorderIndicatorUpRef.current.style.left = (targetLeft - Math.ceil(iconWidth.current / 2)) + 'px';
                    reorderIndicatorDownRef.current.style.left = (targetLeft - Math.ceil(iconWidth.current / 2)) + 'px';
                    dropPosition.current = -1;
                }

                reorderIndicatorUpRef.current.style.display = 'block';
                reorderIndicatorDownRef.current.style.display = 'block';
            }
        }
    }

    const onColumnDragLeave = (e) => {
        const event = e.originalEvent;
        if (props.reorderableColumns && draggedColumnEl.current) {
            event.preventDefault();
            reorderIndicatorUpRef.current.style.display = 'none';
            reorderIndicatorDownRef.current.style.display = 'none';
        }
    }

    const onColumnDrop = (e) => {
        const { originalEvent: event, column } = e;

        event.preventDefault();
        if (draggedColumnEl.current) {
            let dragIndex = DomHandler.index(draggedColumnEl.current);
            let dropIndex = DomHandler.index(findParentHeader(event.currentTarget));
            let allowDrop = (dragIndex !== dropIndex);
            if (allowDrop && ((dropIndex - dragIndex === 1 && dropPosition.current === -1) || (dragIndex - dropIndex === 1 && dropPosition.current === 1))) {
                allowDrop = false;
            }

            if (allowDrop) {
                let columns = columnOrder ? getColumns() : React.Children.toArray(props.children);
                let isSameColumn = (col1, col2) => (col1.props.columnKey || col2.props.columnKey) ? ObjectUtils.equals(col1, col2, 'props.columnKey') : ObjectUtils.equals(col1, col2, 'props.field');
                let dragColIndex = columns.findIndex((child) => isSameColumn(child, draggedColumn.current));
                let dropColIndex = columns.findIndex((child) => isSameColumn(child, column));

                if (dropColIndex < dragColIndex && dropPosition.current === 1) {
                    dropColIndex++;
                }

                if (dropColIndex > dragColIndex && dropPosition.current === -1) {
                    dropColIndex--;
                }

                ObjectUtils.reorderArray(columns, dragColIndex, dropColIndex);

                let _columnOrder = [];
                for (let column of columns) {
                    _columnOrder.push(column.props.columnKey || column.props.field);
                }

                setColumnOrder(_columnOrder);

                if (props.onColReorder) {
                    props.onColReorder({
                        dragIndex: dragColIndex,
                        dropIndex: dropColIndex,
                        columns: columns
                    });
                }
            }

            reorderIndicatorUpRef.current.style.display = 'none';
            reorderIndicatorDownRef.current.style.display = 'none';
            draggedColumnEl.current.draggable = false;
            draggedColumnEl.current = null;
            dropPosition.current = null;
        }
    }

    const findParentHeader = (element) => {
        if (element.nodeName === 'TH') {
            return element;
        }
        else {
            let parent = element.parentElement;
            while (parent.nodeName !== 'TH') {
                parent = parent.parentElement;
                if (!parent) break;
            }
            return parent;
        }
    }

    const getExpandedKeys = () => {
        return props.onToggle ? props.expandedKeys : expandedKeys;
    }

    const getFirst = () => {
        return props.onPage ? props.first : first;
    }

    const getRows = () => {
        return props.onPage ? props.rows : rows;
    }

    const getSortField = () => {
        return props.onSort ? props.sortField : sortField;
    }

    const getSortOrder = () => {
        return props.onSort ? props.sortOrder : sortOrder;
    }

    const getMultiSortMeta = () => {
        return props.onSort ? props.multiSortMeta : multiSortMeta;
    }

    const getFilters = () => {
        return props.onFilter ? props.filters : filters;
    }

    const findColumnByKey = (columns, key) => {
        if (columns && columns.length) {
            for (let i = 0; i < columns.length; i++) {
                let child = columns[i];
                if (child.props.columnKey === key || child.props.field === key) {
                    return child;
                }
            }
        }

        return null;
    }

    const getColumns = () => {
        let columns = React.Children.toArray(props.children);

        if (columns && columns.length) {
            if (props.reorderableColumns && columnOrder) {
                let orderedColumns = [];
                for (let columnKey of columnOrder) {
                    let column = findColumnByKey(columns, columnKey);
                    if (column) {
                        orderedColumns.push(column);
                    }
                }

                return [...orderedColumns, ...columns.filter((item) => {
                    return orderedColumns.indexOf(item) < 0;
                })];
            }
            else {
                return columns;
            }
        }

        return null;
    }

    const getTotalRecords = (data) => {
        return props.lazy ? props.totalRecords : data ? data.length : 0;
    }

    const isSingleSelectionMode = () => {
        return props.selectionMode && props.selectionMode === 'single';
    }

    const isMultipleSelectionMode = () => {
        return props.selectionMode && props.selectionMode === 'multiple';
    }

    const isRowSelectionMode = () => {
        return isSingleSelectionMode() || isMultipleSelectionMode();
    }

    const getFrozenColumns = (columns) => {
        let frozenColumns = null;

        for (let col of columns) {
            if (col.props.frozen) {
                frozenColumns = frozenColumns || [];
                frozenColumns.push(col);
            }
        }

        return frozenColumns;
    }

    const getScrollableColumns = (columns) => {
        let scrollableColumns = null;

        for (let col of columns) {
            if (!col.props.frozen) {
                scrollableColumns = scrollableColumns || [];
                scrollableColumns.push(col);
            }
        }

        return scrollableColumns;
    }

    const filterLocal = (value) => {
        let filteredNodes = [];
        let _filters = getFilters();
        let columns = React.Children.toArray(props.children);
        const isStrictMode = props.filterMode === 'strict';

        for (let node of value) {
            let copyNode = { ...node };
            let localMatch = true;
            let globalMatch = false;

            for (let j = 0; j < columns.length; j++) {
                let col = columns[j];
                let filterMeta = _filters ? _filters[col.props.field] : null;
                let filterField = col.props.field;
                let filterValue, filterConstraint, paramsWithoutNode, options;

                //local
                if (filterMeta) {
                    let filterMatchMode = filterMeta.matchMode || col.props.filterMatchMode || 'startsWith';
                    filterValue = filterMeta.value;
                    filterConstraint = filterMatchMode === 'custom' ? col.props.filterFunction : FilterService.filters[filterMatchMode];
                    options = {
                        rowData: node,
                        filters: _filters,
                        props: props,
                        column: {
                            filterMeta,
                            filterField,
                            props: col.props
                        }
                    };

                    paramsWithoutNode = { filterField, filterValue, filterConstraint, isStrictMode, options };
                    if ((isStrictMode && !(findFilteredNodes(copyNode, paramsWithoutNode) || isFilterMatched(copyNode, paramsWithoutNode))) ||
                        (!isStrictMode && !(isFilterMatched(copyNode, paramsWithoutNode) || findFilteredNodes(copyNode, paramsWithoutNode)))) {
                        localMatch = false;
                    }

                    if (!localMatch) {
                        break;
                    }
                }

                //global
                if (props.globalFilter && !globalMatch) {
                    let copyNodeForGlobal = { ...copyNode };
                    filterValue = props.globalFilter;
                    filterConstraint = FilterService.filters['contains'];
                    paramsWithoutNode = { filterField, filterValue, filterConstraint, isStrictMode };
                    if ((isStrictMode && (findFilteredNodes(copyNodeForGlobal, paramsWithoutNode) || isFilterMatched(copyNodeForGlobal, paramsWithoutNode))) ||
                        (!isStrictMode && (isFilterMatched(copyNodeForGlobal, paramsWithoutNode) || findFilteredNodes(copyNodeForGlobal, paramsWithoutNode)))) {
                        globalMatch = true;
                        copyNode = copyNodeForGlobal;
                    }
                }
            }

            let matches = localMatch;
            if (props.globalFilter) {
                matches = localMatch && globalMatch;
            }

            if (matches) {
                filteredNodes.push(copyNode);
            }
        }

        return filteredNodes;
    }

    const findFilteredNodes = (node, paramsWithoutNode) => {
        if (node) {
            let matched = false;
            if (node.children) {
                let childNodes = [...node.children];
                node.children = [];
                for (let childNode of childNodes) {
                    let copyChildNode = { ...childNode };
                    if (isFilterMatched(copyChildNode, paramsWithoutNode)) {
                        matched = true;
                        node.children.push(copyChildNode);
                    }
                }
            }

            if (matched) {
                return true;
            }
        }
    }

    const isFilterMatched = (node, { filterField, filterValue, filterConstraint, isStrictMode, options }) => {
        let matched = false;
        let dataFieldValue = ObjectUtils.resolveFieldData(node.data, filterField);
        if (filterConstraint(dataFieldValue, filterValue, props.filterLocale, options)) {
            matched = true;
        }

        if (!matched || (isStrictMode && !isNodeLeaf(node))) {
            matched = findFilteredNodes(node, { filterField, filterValue, filterConstraint, isStrictMode }) || matched;
        }

        return matched;
    }

    const isNodeLeaf = (node) => {
        return node.leaf === false ? false : !(node.children && node.children.length);
    }

    const processValue = () => {
        let data = props.value;

        if (!props.lazy) {
            if (data && data.length) {
                if (getSortField() || getMultiSortMeta()) {
                    if (props.sortMode === 'single')
                        data = sortSingle(data);
                    else if (props.sortMode === 'multiple')
                        data = sortMultiple(data);
                }

                let localFilters = getFilters();
                if (localFilters || props.globalFilter) {
                    data = filterLocal(data, localFilters);
                }
            }
        }

        return data;
    }

    useImperativeHandle(ref, () => ({
        filter
    }));

    const useTableHeader = (columns, columnGroup) => {
        return (
            <TreeTableHeader columns={columns} columnGroup={columnGroup} tabIndex={props.tabIndex}
                onSort={onSort} sortField={getSortField()} sortOrder={getSortOrder()} multiSortMeta={getMultiSortMeta()}
                resizableColumns={props.resizableColumns} onResizeStart={onColumnResizeStart}
                reorderableColumns={props.reorderableColumns} onDragStart={onColumnDragStart}
                onDragOver={onColumnDragOver} onDragLeave={onColumnDragLeave} onDrop={onColumnDrop}
                onFilter={onFilter} filters={getFilters()} filterDelay={props.filterDelay} />
        )
    }

    const useTableFooter = (columns, columnGroup) => {
        return (
            <TreeTableFooter columns={columns} columnGroup={columnGroup} />
        )
    }

    const useTableBody = (value, columns) => {
        return (
            <TreeTableBody value={value} columns={columns} expandedKeys={getExpandedKeys()} selectOnEdit={props.selectOnEdit}
                onToggle={onToggle} onExpand={props.onExpand} onCollapse={props.onCollapse}
                paginator={props.paginator} first={getFirst()} rows={getRows()}
                selectionMode={props.selectionMode} selectionKeys={props.selectionKeys} onSelectionChange={props.onSelectionChange}
                metaKeySelection={props.metaKeySelection} onRowClick={props.onRowClick} onSelect={props.onSelect} onUnselect={props.onUnselect}
                propagateSelectionUp={props.propagateSelectionUp} propagateSelectionDown={props.propagateSelectionDown}
                lazy={props.lazy} rowClassName={props.rowClassName} emptyMessage={props.emptyMessage} loading={props.loading}
                contextMenuSelectionKey={props.contextMenuSelectionKey} onContextMenuSelectionChange={props.onContextMenuSelectionChange} onContextMenu={props.onContextMenu} />
        )
    }

    const usePaginator = (position, totalRecords) => {
        const className = classNames('p-paginator-' + position, props.paginatorClassName);

        return (
            <Paginator first={getFirst()} rows={getRows()} pageLinkSize={props.pageLinkSize} className={className}
                onPageChange={onPageChange} template={props.paginatorTemplate}
                totalRecords={totalRecords} rowsPerPageOptions={props.rowsPerPageOptions} currentPageReportTemplate={props.currentPageReportTemplate}
                leftContent={props.paginatorLeft} rightContent={props.paginatorRight} alwaysShow={props.alwaysShowPaginator} dropdownAppendTo={props.paginatorDropdownAppendTo} />
        )
    }

    const useScrollableView = (value, columns, frozen, headerColumnGroup, footerColumnGroup) => {
        const header = useTableHeader(columns, headerColumnGroup);
        const footer = useTableFooter(columns, footerColumnGroup);
        const body = useTableBody(value, columns);

        return (
            <TreeTableScrollableView columns={columns} header={header} body={body} footer={footer}
                scrollHeight={props.scrollHeight} frozen={frozen} frozenWidth={props.frozenWidth} />
        )
    }

    const useScrollableTable = (value) => {
        const columns = getColumns();
        let frozenColumns = getFrozenColumns(columns);
        let scrollableColumns = frozenColumns ? getScrollableColumns(columns) : columns;
        let frozenView, scrollableView;
        if (frozenColumns) {
            frozenView = useScrollableView(value, frozenColumns, true, props.frozenHeaderColumnGroup, props.frozenFooterColumnGroup);
        }

        scrollableView = useScrollableView(value, scrollableColumns, false, props.headerColumnGroup, props.footerColumnGroup);

        return (
            <div className="p-treetable-scrollable-wrapper">
                {frozenView}
                {scrollableView}
            </div>
        )
    }

    const useRegularTable = (value) => {
        const columns = getColumns();
        const header = useTableHeader(columns, props.headerColumnGroup);
        const footer = useTableFooter(columns, props.footerColumnGroup);
        const body = useTableBody(value, columns);

        return (
            <div className="p-treetable-wrapper">
                <table style={props.tableStyle} className={props.tableClassName} ref={el => table = el}>
                    {header}
                    {footer}
                    {body}
                </table>
            </div>
        )
    }

    const useTable = (value) => {
        if (props.scrollable)
            return useScrollableTable(value);
        else
            return useRegularTable(value);
    }

    const useLoader = () => {
        if (props.loading) {
            const iconClassName = classNames('p-treetable-loading-icon pi-spin', props.loadingIcon);

            return (
                <div className="p-treetable-loading">
                    <div className="p-treetable-loading-overlay p-component-overlay">
                        <i className={iconClassName}></i>
                    </div>
                </div>
            )
        }

        return null;
    }

    const value = processValue();
    const className = classNames('p-treetable p-component', {
        'p-treetable-hoverable-rows': props.rowHover,
        'p-treetable-selectable': isRowSelectionMode(),
        'p-treetable-resizable': props.resizableColumns,
        'p-treetable-resizable-fit': (props.resizableColumns && props.columnResizeMode === 'fit'),
        'p-treetable-auto-layout': props.autoLayout,
        'p-treetable-striped': props.stripedRows,
        'p-treetable-gridlines': props.showGridlines
    }, props.className);
    const table = useTable(value);
    const totalRecords = getTotalRecords(value);
    const headerFacet = props.header && <div className="p-treetable-header">{props.header}</div>;
    const footerFacet = props.footer && <div className="p-treetable-footer">{props.footer}</div>;
    const paginatorTop = props.paginator && props.paginatorPosition !== 'bottom' && usePaginator('top', totalRecords);
    const paginatorBottom = props.paginator && props.paginatorPosition !== 'top' && usePaginator('bottom', totalRecords);
    const loader = useLoader();
    const resizeHelper = props.resizableColumns && <div ref={resizerHelperRef} className="p-column-resizer-helper" style={{ display: 'none' }}></div>;
    const reorderIndicatorUp = props.reorderableColumns && <span ref={reorderIndicatorUpRef} className="pi pi-arrow-down p-datatable-reorder-indicator-up" style={{ position: 'absolute', display: 'none' }} />
    const reorderIndicatorDown = props.reorderableColumns && <span ref={reorderIndicatorDownRef} className="pi pi-arrow-up p-datatable-reorder-indicator-down" style={{ position: 'absolute', display: 'none' }} />;

    return (
        <div ref={elementRef} id={props.id} className={className} style={props.style} data-scrollselectors=".p-treetable-scrollable-body">
            {loader}
            {headerFacet}
            {paginatorTop}
            {table}
            {paginatorBottom}
            {footerFacet}
            {resizeHelper}
            {reorderIndicatorUp}
            {reorderIndicatorDown}
        </div>
    )
})

TreeTable.defaultProps = {
    id: null,
    value: null,
    header: null,
    footer: null,
    style: null,
    className: null,
    tableStyle: null,
    tableClassName: null,
    expandedKeys: null,
    paginator: false,
    paginatorPosition: 'bottom',
    alwaysShowPaginator: true,
    paginatorClassName: null,
    paginatorTemplate: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
    paginatorLeft: null,
    paginatorRight: null,
    paginatorDropdownAppendTo: null,
    pageLinkSize: 5,
    rowsPerPageOptions: null,
    currentPageReportTemplate: '({currentPage} of {totalPages})',
    first: null,
    rows: null,
    totalRecords: null,
    lazy: false,
    sortField: null,
    sortOrder: null,
    multiSortMeta: null,
    sortMode: 'single',
    defaultSortOrder: 1,
    removableSort: false,
    selectionMode: null,
    selectionKeys: null,
    contextMenuSelectionKey: null,
    metaKeySelection: true,
    selectOnEdit: true,
    propagateSelectionUp: true,
    propagateSelectionDown: true,
    autoLayout: false,
    rowClassName: null,
    loading: false,
    loadingIcon: 'pi pi-spinner',
    tabIndex: 0,
    scrollable: false,
    scrollHeight: null,
    reorderableColumns: false,
    headerColumnGroup: null,
    footerColumnGroup: null,
    frozenHeaderColumnGroup: null,
    frozenFooterColumnGroup: null,
    frozenWidth: null,
    resizableColumns: false,
    columnResizeMode: 'fit',
    emptyMessage: null,
    filters: null,
    globalFilter: null,
    filterMode: 'lenient',
    filterDelay: 300,
    filterLocale: undefined,
    rowHover: false,
    showGridlines: false,
    stripedRows: false,
    onFilter: null,
    onExpand: null,
    onCollapse: null,
    onToggle: null,
    onPage: null,
    onSort: null,
    onSelect: null,
    onUnselect: null,
    onRowClick: null,
    onSelectionChange: null,
    onContextMenuSelectionChange: null,
    onColumnResizeEnd: null,
    onColReorder: null,
    onContextMenu: null
}

TreeTable.propTypes = {
    id: PropTypes.string,
    value: PropTypes.any,
    header: PropTypes.any,
    footer: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string,
    tableStyle: PropTypes.any,
    tableClassName: PropTypes.string,
    expandedKeys: PropTypes.object,
    paginator: PropTypes.bool,
    paginatorPosition: PropTypes.string,
    alwaysShowPaginator: PropTypes.bool,
    paginatorClassName: PropTypes.string,
    paginatorTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    paginatorLeft: PropTypes.any,
    paginatorRight: PropTypes.any,
    paginatorDropdownAppendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    pageLinkSize: PropTypes.number,
    rowsPerPageOptions: PropTypes.array,
    currentPageReportTemplate: PropTypes.string,
    first: PropTypes.number,
    rows: PropTypes.number,
    totalRecords: PropTypes.number,
    lazy: PropTypes.bool,
    sortField: PropTypes.string,
    sortOrder: PropTypes.number,
    multiSortMeta: PropTypes.array,
    sortMode: PropTypes.string,
    defaultSortOrder: PropTypes.number,
    removableSort: PropTypes.bool,
    selectionMode: PropTypes.string,
    selectionKeys: PropTypes.any,
    contextMenuSelectionKey: PropTypes.any,
    metaKeySelection: PropTypes.bool,
    selectOnEdit: PropTypes.bool,
    propagateSelectionUp: PropTypes.bool,
    propagateSelectionDown: PropTypes.bool,
    autoLayout: PropTypes.bool,
    rowClassName: PropTypes.func,
    loading: PropTypes.bool,
    loadingIcon: PropTypes.string,
    tabIndex: PropTypes.number,
    scrollable: PropTypes.bool,
    scrollHeight: PropTypes.string,
    reorderableColumns: PropTypes.bool,
    headerColumnGroup: PropTypes.any,
    footerColumnGroup: PropTypes.any,
    frozenHeaderColumnGroup: PropTypes.any,
    frozenFooterColumnGroup: PropTypes.any,
    frozenWidth: PropTypes.string,
    resizableColumns: PropTypes.bool,
    columnResizeMode: PropTypes.string,
    emptyMessage: PropTypes.string,
    filters: PropTypes.object,
    globalFilter: PropTypes.any,
    filterMode: PropTypes.string,
    filterDelay: PropTypes.number,
    filterLocale: PropTypes.string,
    rowHover: PropTypes.bool,
    showGridlines: PropTypes.bool,
    stripedRows: PropTypes.bool,
    onFilter: PropTypes.func,
    onExpand: PropTypes.func,
    onCollapse: PropTypes.func,
    onToggle: PropTypes.func,
    onPage: PropTypes.func,
    onSort: PropTypes.func,
    onSelect: PropTypes.func,
    onUnselect: PropTypes.func,
    onRowClick: PropTypes.func,
    onSelectionChange: PropTypes.func,
    onContextMenuSelectionChange: PropTypes.func,
    onColumnResizeEnd: PropTypes.func,
    onColReorder: PropTypes.func,
    onContextMenu: PropTypes.func
}
