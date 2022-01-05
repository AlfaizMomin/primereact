import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ObjectUtils, classNames } from '../utils/Utils';

export const Card = (props) => {

    const useHeader = () => {
        if (props.header) {
            return <div className="p-card-header">{ObjectUtils.getJSXElement(props.header, props)}</div>;
        }

        return null;
    }

    const useBody = () => {
        const title = props.title && <div className="p-card-title">{ObjectUtils.getJSXElement(props.title, props)}</div>
        const subTitle = props.subTitle && <div className="p-card-subtitle">{ObjectUtils.getJSXElement(props.subTitle, props)}</div>
        const children = props.children && <div className="p-card-content">{props.children}</div>
        const footer = props.footer && <div className="p-card-footer">{ObjectUtils.getJSXElement(props.footer, props)}</div>;

        return (
            <div className="p-card-body">
                {title}
                {subTitle}
                {children}
                {footer}
            </div>
        )
    }

    const className = classNames('p-card p-component', props.className);

    const header = useHeader();
    const body = useBody();

    return (
        <div className={className} style={props.style} id={props.id}>
            {header}
            {body}
        </div>
    )
}

Card.defaultProps = {
    id: null,
    header: null,
    footer: null,
    title: null,
    subTitle: null,
    style: null,
    className: null
}

Card.propTypes = {
    id: PropTypes.string,
    header: PropTypes.any,
    footer: PropTypes.any,
    title: PropTypes.any,
    subTitle: PropTypes.any,
    style: PropTypes.object,
    className: PropTypes.string
}
