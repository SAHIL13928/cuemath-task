"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
            <AlertTriangle className="h-8 w-8 text-danger" />
          </div>
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text">
            Something went wrong
          </h2>
          <p className="max-w-md text-sm text-text-secondary dark:text-dark-text-secondary">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
