import React from 'react';
import './index.scss'
import avatar from '../../static/img/icon.png'

export default class Index extends React.Component {
    render() {
        return (
            <div className="some-text">
                <div className="text-1">{this.props.content}</div>
                <img className="image" src={avatar}/>
            </div>
        )
    }
}
