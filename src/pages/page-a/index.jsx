import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import Util from '../../utils/util';
import moment from 'moment';
import './index.scss'
import '../../static/img/icon.png'
import AnotherText from '../../components/another-text/index.jsx'
import ISTest from '../../components/intersection/index.jsx'
import withLazy from '../../components/lazy-hoc/index.jsx'

const SomeText = withLazy(lazy(() => import(/* webpackChunkName: "someText" */ '../../components/some-text/index.jsx')));

const MoreText = withLazy(lazy(() => import(/* webpackChunkName: "moreText" */ '../../components/more-text/index.jsx')));


class Index extends React.Component {
    constructor() {
        super();
        this.state = {
            showText: true
        }
        this.changeShow = this.changeShow.bind(this);
    }

    changeShow() {
        this.setState({
            showText: !this.state.showText
        })
    }

    render() {
        return (
            <div className="cp-a">
                <div onClick={this.changeShow}>
                    歌
                </div>
                <AnotherText content='上海彩虹室内合唱团' />
                <SomeText
                    content='白鹿穿林去'
                    fallback={
                        (<div className="some-text">
                            <div className="text-1 fallback"></div>
                            <img className="image fallback"/>
                        </div>)
                    }
                />
                <MoreText fallback={''} />
            </div>
        )
    }
}

ReactDOM.render(<Index />, document.getElementById('root'));
