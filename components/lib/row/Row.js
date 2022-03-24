import React from 'react';
import PropTypes from 'prop-types';

export const Row = () => <tr>{props.children}</tr>

Row.defaultProps = {
    __TYPE: 'Row'
}

Row.propTypes = {
    __TYPE: PropTypes.string
}
