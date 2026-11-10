import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="splash">
          <div className="splash__logo"><strong>VELOOP</strong></div>
          <h1>Something went wrong in the demo</h1>
          <p className="muted">{String(this.state.error.message || this.state.error)}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              window.location.hash = '#/';
              window.location.reload();
            }}
          >
            Reload the demo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
