import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(_: Props, prev: State) {
    if (!prev.hasError && this.state.hasError) {
      window.location.replace('/error');
    }
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
