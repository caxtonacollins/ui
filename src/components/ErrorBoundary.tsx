import React from "react";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback renderer. Receives the caught error and a reset function. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  /** Called when an error is caught. */
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary that catches synchronous rendering errors in child
 * components and displays a fallback UI.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With a custom fallback:
 * <ErrorBoundary fallback={(error, reset) => (
 *   <div>
 *     <p>{error.message}</p>
 *     <button onClick={reset}>Try again</button>
 *   </div>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error);
    // Log error info for debugging — suppressed in tests via vi.spyOn(console, 'error')
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset(): void {
    this.setState({ hasError: false, error: null });
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const error = this.state.error;

      if (this.props.fallback) {
        return this.props.fallback(error, this.reset);
      }

      return (
        <div
          role="alert"
          className="rounded-xl border border-error-dim-strong bg-error-dim p-6"
        >
          <h3 className="text-[14px] font-semibold text-ink mb-2">
            Something went wrong
          </h3>
          <p className="text-[13px] text-ink-2 mb-4">{error.message}</p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded-lg bg-brand text-white h-8 px-3.5 text-[12px] font-medium"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
