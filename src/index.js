import React from 'react';
import ReactDom from 'react-dom';

import ComponentA from './pages/page-a/index'
import ComponentB from './pages/page-b/index'


class App extends React.Component {
    render() {
        return (
            <div>
                <ComponentA />
                <ComponentB />
            </div>
        )
    }
}

ReactDom.render(<App />, document.getElementById('root'));