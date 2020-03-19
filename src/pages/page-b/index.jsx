import React from 'react';
import ReactDOM from 'react-dom';
import Util from '../../utils/util';
import Net from '../../utils/net';
import moment from 'moment';

import './index.scss';

export default class Index extends React.Component {
    render() {
        return (
            <div className="cp-b">This is Component B</div>
        )
    }
}
ReactDOM.render(<Index />, document.getElementById('root'))