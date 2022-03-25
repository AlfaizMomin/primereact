import React, { memo } from 'react';

export const TreeTableFooter = memo((props) => {

    const useFooterCell = (column, index) => {
        return (
            <td key={column.field || index} className={column.props.footerClassName || column.props.className} style={column.props.footerStyle || column.props.style}
                rowSpan={column.props.rowSpan} colSpan={column.props.colSpan}>
                {column.props.footer}
            </td>
        )
    }

    const useFooterRow = (row, index) => {
        const rowColumns = React.Children.toArray(row.props.children);
        const rowFooterCells = rowColumns.map(useFooterCell);

        return (
            <tr key={index}>{rowFooterCells}</tr>
        )
    }

    const useColumnGroup = () => {
        let rows = React.Children.toArray(props.columnGroup.props.children);

        return rows.map(useFooterRow);
    }

    const useColumns = (columns) => {
        if (columns) {
            const headerCells = columns.map(useFooterCell);
            return <tr>{headerCells}</tr>
        }
        else {
            return null;
        }
    }

    const hasFooter = () => {
        if (props.columnGroup) {
            return true;
        }
        else {
            for (let i = 0; i < props.columns.length; i++) {
                if (props.columns[i].props.footer) {
                    return true;
                }
            }
        }

        return false;
    }

    const content = props.columnGroup ? useColumnGroup() : useColumns(props.columns);

    if (hasFooter()) {
        return (
            <tfoot className="p-treetable-tfoot">
                {content}
            </tfoot>
        )
    }
    else {
        return null;
    }
})
