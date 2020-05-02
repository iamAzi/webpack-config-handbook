import React, { Suspense, lazy } from 'react';

const SomeText = lazy(() => import(/* webpackChunkName: "someText" */ '../some-text/index.jsx'));

export default class Index extends React.Component {
    constructor() {
        super();
        this.ref = React.createRef();
        this.state = {
            show: false
        }
    }

    componentDidMount() {
        const io = new IntersectionObserver(entries => {
            console.log(entries)
            const entry = entries[0];
            if (entry.isIntersecting) {
                this.setState({
                    show: true
                })
            }
        })
        io.observe(this.ref.current)
    }

    render() {
        return (
            <div ref={this.ref} className="lazy-wrapper">
                {
                    this.state.show
                        ? <Suspense fallback={''}>
                            <SomeText content='白鹿' />
                            <SomeText content='我心如白鹿' />
                            <SomeText content='流连溪水边' />
                            <SomeText content='陌上独行客' />
                            <SomeText content='思忆难从容' />
                        </Suspense>
                        : null
                }
            </div>
        )
    }
}
