import React, { memo, useEffect, useState } from 'react';
import { classNames, DomHandler, ObjectUtils } from '../utils/Utils';

export const FooterCell = memo((props) => {
    const [styleObject, setStyleObject] = useState({});

    const getColumnProp = (prop) => {
        return props.column.props[prop];
    }

    const getStyle = () => {
        const footerStyle = getColumnProp('footerStyle');
        const columnStyle = getColumnProp('style');

        return getColumnProp('frozen') ? Object.assign({}, columnStyle, footerStyle, styleObject) : Object.assign({}, columnStyle, footerStyle);
    }

    const updateStickyPosition = () => {
        if (getColumnProp('frozen')) {
            let _styleObject = { ...styleObject };
            let align = getColumnProp('alignFrozen');
            if (align === 'right') {
                let right = 0;
                let next = el.nextElementSibling;
                if (next) {
                    right = DomHandler.getOuterWidth(next) + parseFloat(next.style.right || 0);
                }
                _styleObject['right'] = right + 'px';
            }
            else {
                let left = 0;
                let prev = el.previousElementSibling;
                if (prev) {
                    left = DomHandler.getOuterWidth(prev) + parseFloat(prev.style.left || 0);
                }
                _styleObject['left'] = left + 'px';
            }

            setStyleObject(_styleObject);
        }
    }

    useEffect(() => {
        if (getColumnProp('frozen')) {
            updateStickyPosition();
        }
    });

    const style = getStyle();
    const align = getColumnProp('align');
    const className = classNames(getColumnProp('footerClassName'), getColumnProp('className'), {
        'p-frozen-column': getColumnProp('frozen'),
        [`p-align-${align}`]: !!align
    });
    const colSpan = getColumnProp('colSpan');
    const rowSpan = getColumnProp('rowSpan');

    let content = ObjectUtils.getJSXElement(getColumnProp('footer'), { props: props.tableProps });

    return (
        <td ref={el => el = el} style={style} className={className} role="cell" colSpan={colSpan} rowSpan={rowSpan}>
            {content}
        </td>
    )
})
