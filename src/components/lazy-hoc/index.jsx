import React, { Suspense, lazy } from 'react';

export default function withLazy(WrappedComponent) {
    return class HOC extends React.Component {
        constructor(props) {
            super(props);
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
                <div ref={this.ref}>
                    {
                        this.state.show
                            ? <Suspense fallback={this.props.fallback}>
                                <WrappedComponent {...this.props}/>
                            </Suspense>
                            : this.props.fallback
                    }
                </div>
            )
        }
    }
}