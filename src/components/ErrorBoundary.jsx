import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col justify-center items-center min-h-screen bg-gray-600 text-white p-4">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">เกิดข้อผิดพลาด</h2>
                        <p className="text-gray-300 mb-4">ขออภัย มีบางอย่างผิดพลาด</p>
                        <button
                            onClick={this.resetError}
                            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            ลองใหม่
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 