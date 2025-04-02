import React, { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, errorInfo: null };

  // This lifecycle method is called when an error is thrown in a component.
  static getDerivedStateFromError(error) {
    return { hasError: true }; // Update state to render fallback UI
  }

  // This method will be called with the error and component stack information.
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Error caught in ErrorBoundary:", error, errorInfo); // Log error info (you can send this to an error logging service)
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children; // If no error, render children as normal
  }
}

export default ErrorBoundary;
