import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, info)
    }
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display font-bold text-2xl mb-2">Something went wrong</h1>
          <p className="text-white/60 text-sm max-w-md mb-6">
            An unexpected error occurred. Please try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            className="btn-primary px-5 py-2.5 text-xs rounded-lg"
          >
            Back to Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
