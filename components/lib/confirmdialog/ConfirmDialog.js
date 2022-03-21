import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DomHandler, ObjectUtils, classNames, IconUtils } from '../utils/Utils';
import { Dialog } from '../dialog/Dialog';
import { Button } from '../button/Button';
import { localeOption } from '../api/Api';
import { Portal } from '../portal/Portal';
import { useUpdateEffect } from '../hooks/Hooks';

export function confirmDialog(props) {
    let appendTo = props.appendTo || document.body;

    let confirmDialogWrapper = document.createDocumentFragment();
    DomHandler.appendChild(confirmDialogWrapper, appendTo);

    props = {...props, ...{visible: props.visible === undefined ? true : props.visible}};

    let confirmDialogEl = React.createElement(ConfirmDialog, props);
    ReactDOM.render(confirmDialogEl, confirmDialogWrapper);

    let updateConfirmDialog = (newProps) => {
        props = { ...props, ...newProps };
        ReactDOM.render(React.cloneElement(confirmDialogEl, props), confirmDialogWrapper);
    };

    return {
        _destroy: () => {
            ReactDOM.unmountComponentAtNode(confirmDialogWrapper);
        },
        show: () => {
            updateConfirmDialog({ visible: true, onHide: () => {
                updateConfirmDialog({ visible: false }); // reset
            }});
        },
        hide: () => {
            updateConfirmDialog({ visible: false });
        },
        update: (newProps) => {
            updateConfirmDialog(newProps);
        }
    }
}


export const ConfirmDialog = (props) => {

    const [visible, setVisible] = useState(props.visible);
    const currentResult = useRef('');

    const acceptLabel = () => {
        return props.acceptLabel || localeOption('accept');
    }

    const rejectLabel = () => {
        return props.rejectLabel || localeOption('reject');
    }

    const accept = () => {
        if (props.accept) {
            props.accept();
        }

        hide('accept');
    }

    const reject = () => {
        if (props.reject) {
            props.reject();
        }

        hide('reject');
    }

    const show = () => {
        setVisible(true)
    }

    const hide = (result) => {
        currentResult.current = result;
        setVisible(false);
    }

    useUpdateEffect(() => {
        if (!visible) {
            if (props.onHide) {
                props.onHide(currentResult.current);
            }
        }
    }, [visible]);

    useUpdateEffect(() => {
        setVisible(props.visible);
    }, [props.visible]);


    const useFooter = () => {
        const acceptClassName = classNames('p-confirm-dialog-accept', props.acceptClassName);
        const rejectClassName = classNames('p-confirm-dialog-reject', {
            'p-button-text': !props.rejectClassName
        }, props.rejectClassName);
        const content = (
            <>
                <Button label={rejectLabel()} icon={props.rejectIcon} className={rejectClassName} onClick={reject} />
                <Button label={acceptLabel()} icon={props.acceptIcon} className={acceptClassName} onClick={accept} autoFocus />
            </>
        );

        if (props.footer) {
            const defaultContentOptions = {
                accept: accept,
                reject: reject,
                acceptClassName,
                rejectClassName,
                acceptLabel: acceptLabel(),
                rejectLabel: rejectLabel(),
                element: content,
                props: props
            };

            return ObjectUtils.getJSXElement(props.footer, defaultContentOptions);
        }

        return content;
    }

    const useElement = () => {
        const className = classNames('p-confirm-dialog', props.className);
        const dialogProps = ObjectUtils.findDiffKeys(props, ConfirmDialog.defaultProps);
        const message = ObjectUtils.getJSXElement(props.message, props);
        const footer = useFooter();

        return (
            <Dialog visible={visible} {...dialogProps} className={className} footer={footer} onHide={hide} breakpoints={props.breakpoints}>
                {IconUtils.getJSXIcon(props.icon, { className: 'p-confirm-dialog-icon' }, { props: props })}
                <span className="p-confirm-dialog-message">{message}</span>
            </Dialog>
        );
    }

    const element = useElement();

    return <Portal element={element} appendTo={props.appendTo} />;

}

ConfirmDialog.defaultProps = {
    __TYPE: 'ConfirmDialog',
    visible: false,
    message: null,
    rejectLabel: null,
    acceptLabel: null,
    icon: null,
    rejectIcon: null,
    acceptIcon: null,
    rejectClassName: null,
    acceptClassName: null,
    className: null,
    appendTo: null,
    footer: null,
    breakpoints: null,
    onHide: null,
    accept: null,
    reject: null
}

ConfirmDialog.propTypes = {
    __TYPE: PropTypes.string,
    visible: PropTypes.bool,
    message: PropTypes.any,
    rejectLabel: PropTypes.string,
    acceptLabel: PropTypes.string,
    icon: PropTypes.any,
    rejectIcon: PropTypes.any,
    acceptIcon: PropTypes.any,
    rejectClassName: PropTypes.string,
    acceptClassName: PropTypes.string,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    className: PropTypes.string,
    footer: PropTypes.any,
    breakpoints: PropTypes.object,
    onHide: PropTypes.func,
    accept: PropTypes.func,
    reject: PropTypes.func
}
