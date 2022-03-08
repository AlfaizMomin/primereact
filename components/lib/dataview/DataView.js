import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Paginator } from '../paginator/Paginator';
import { ObjectUtils, classNames } from '../utils/Utils';
import { Ripple } from '../ripple/Ripple';
import { localeOption } from '../api/Api';
import PrimeReact from '../api/Api';

export const DataViewLayoutOptions = (props) => {

    const changeLayout = (event, layoutMode) => {
        props.onChange({
            originalEvent: event,
            value: layoutMode
        });
        event.preventDefault();
    }
    
    const className = classNames('p-dataview-layout-options p-selectbutton p-buttonset', props.className);
    const buttonListClass = classNames('p-button p-button-icon-only', { 'p-highlight': props.layout === 'list' });
    const buttonGridClass = classNames('p-button p-button-icon-only', { 'p-highlight': props.layout === 'grid' });

    return (
        <div id={props.id} style={props.style} className={className}>
            <button type="button" className={buttonListClass} onClick={(event) => changeLayout(event, 'list')}>
                <i className="pi pi-bars"></i>
                <Ripple />
            </button>
            <button type="button" className={buttonGridClass} onClick={(event) => changeLayout(event, 'grid')}>
                <i className="pi pi-th-large"></i>
                <Ripple />
            </button>
        </div>
    );
}

export const DataViewItem = (props) => {
    return props.template(props.item, props.layout);
}

export const DataView = (props) => {

    const [first, setFirst] = useState(!props.onPage ? props.first : null);
    const [rows, setRows] = useState(!props.onPage ? props.rows : null);

    const getItemRenderKey = (value) => {
        return props.dataKey ? ObjectUtils.resolveFieldData(value, props.dataKey) : null;
    }

    const getTotalRecords = () => {
        if (props.totalRecords)
            return props.totalRecords;
        else
            return props.value ? props.value.length : 0;
    }

    const createPaginator = (position) => {
        const className = classNames('p-paginator-' + position, props.paginatorClassName);
        const _first = props.onPage ? props.first : first;
        const _rows = props.onPage ? props.rows : rows;
        const totalRecords = getTotalRecords();

        return (
            <Paginator first={_first} rows={_rows} pageLinkSize={props.pageLinkSize} className={className} onPageChange={onPageChange} template={props.paginatorTemplate}
                totalRecords={totalRecords} rowsPerPageOptions={props.rowsPerPageOptions} currentPageReportTemplate={props.currentPageReportTemplate}
                leftContent={props.paginatorLeft} rightContent={props.paginatorRight} alwaysShow={props.alwaysShowPaginator} dropdownAppendTo={props.paginatorDropdownAppendTo} />
        );
    }

    const onPageChange = (event) => {
        if (props.onPage) {
            props.onPage(event);
        }
        else {
            setFirst(event.first)
            setRows(event.rows);
        }
    }

    const isEmpty = () => {
        return (!props.value || props.value.length === 0);
    }

    const sort = () => {
        if (props.value) {
            const value = [...props.value];

            value.sort((data1, data2) => {
                let value1 = ObjectUtils.resolveFieldData(data1, props.sortField);
                let value2 = ObjectUtils.resolveFieldData(data2, props.sortField);
                return ObjectUtils.sort(value1, value2, props.sortOrder, PrimeReact.locale);
            });

            return value;
        }
        else {
            return null;
        }
    }

    const useLoader = () => {
        if (props.loading) {
            let iconClassName = classNames('p-dataview-loading-icon pi-spin', props.loadingIcon);

            return (
                <div className="p-dataview-loading-overlay p-component-overlay">
                    <i className={iconClassName}></i>
                </div>
            );
        }

        return null;
    }

    const useTopPaginator = () => {
        if (props.paginator && (props.paginatorPosition !== 'bottom' || props.paginatorPosition === 'both')) {
            return createPaginator('top');
        }

        return null;
    }

    
    const useBottomPaginator = () => {
        if (props.paginator && (props.paginatorPosition !== 'top' || props.paginatorPosition === 'both')) {
            return createPaginator('bottom');
        }

        return null;
    }

    const useEmptyMessage = () => {
        if (!props.loading) {
            const content = props.emptyMessage || localeOption('emptyMessage');

            return <div className="p-col-12 col-12 p-dataview-emptymessage">{content}</div>;
        }

        return null;
    }

    const useHeader = () => {
        if (props.header) {
            return <div className="p-dataview-header">{props.header}</div>;
        }

        return null;
    }

    const useFooter = () => {
        if (props.footer) {
            return <div className="p-dataview-footer"> {props.footer}</div>;
        }

        return null;
    }

    const useItems = (value) => {
        if (value && value.length) {
            if (props.paginator) {
                const _rows = props.onPage ? props.rows : rows;
                const _first = props.lazy ? 0 : props.onPage ? props.first : first;
                const totalRecords = getTotalRecords();
                const last = Math.min(_rows + _first, totalRecords);
                let items = [];

                for (let i = first; i < last; i++) {
                    const val = value[i];
                    val && items.push(<DataViewItem key={getItemRenderKey(value) || i} template={props.itemTemplate} layout={props.layout} item={val} />);
                }
                return items;
            }
            else {
                return (
                    value.map((item, index) => {
                        return <DataViewItem key={getItemRenderKey(item) || index} template={props.itemTemplate} layout={props.layout} item={item} />
                    })
                );
            }
        }
        else {
            return useEmptyMessage();
        }
    }

    const useContent = (value) => {
        const items = useItems(value);

        return (
            <div className="p-dataview-content">
                <div className="p-grid p-nogutter grid grid-nogutter">
                    {items}
                </div>
            </div>
        );
    }

    const processData = () => {
        let data = props.value;

        if (data && data.length) {
            if (props.sortField) {
                data = sort();
            }
        }

        return data;
    }

    const value = processData();
    const className = classNames('p-dataview p-component', { 'p-dataview-list': (props.layout === 'list'), 'p-dataview-grid': (props.layout === 'grid'), 'p-dataview-loading': props.loading }, props.className);
    const loader = useLoader();
    const topPaginator = useTopPaginator();
    const bottomPaginator = useBottomPaginator();
    const header = useHeader();
    const footer = useFooter();
    const content = useContent(value);

    return (
        <div id={props.id} style={props.style} className={className}>
            {loader}
            {header}
            {topPaginator}
            {content}
            {bottomPaginator}
            {footer}
        </div>
    );
}

DataView.defaultProps = {
    id: null,
    header: null,
    footer: null,
    value: null,
    layout: 'list',
    dataKey: null,
    rows: null,
    first: 0,
    totalRecords: null,
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
    emptyMessage: null,
    sortField: null,
    sortOrder: null,
    style: null,
    className: null,
    lazy: false,
    loading: false,
    loadingIcon: 'pi pi-spinner',
    itemTemplate: null,
    onPage: null
}

DataView.propTypes = {
    id: PropTypes.string,
    header: PropTypes.any,
    footer: PropTypes.any,
    value: PropTypes.array,
    layout: PropTypes.string,
    dataKey: PropTypes.string,
    rows: PropTypes.number,
    first: PropTypes.number,
    totalRecords: PropTypes.number,
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
    emptyMessage: PropTypes.string,
    sortField: PropTypes.string,
    sortOrder: PropTypes.number,
    style: PropTypes.object,
    className: PropTypes.string,
    lazy: PropTypes.bool,
    loading: PropTypes.bool,
    loadingIcon: PropTypes.string,
    itemTemplate: PropTypes.func.isRequired,
    onPage: PropTypes.func
}

DataViewItem.defaultProps = {
    template: null,
    item: null,
    layout: null
}

DataViewItem.propTypes = {
    template: PropTypes.func,
    item: PropTypes.any,
    layout: PropTypes.string
}

DataViewLayoutOptions.defaultProps = {
    id: null,
    style: null,
    className: null,
    layout: null,
    onChange: null
}

DataViewLayoutOptions.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    layout: PropTypes.string,
    onChange: PropTypes.func.isRequired
}