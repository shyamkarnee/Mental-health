import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleCopy = () => {
    const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}`;
    navigator.clipboard.writeText(rules);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unexpected error occurred.';
      let isPermissionError = false;
      
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.operationType) {
          errorMessage = parsed.error;
        }
      } catch (e) {
        // Not a JSON error
      }

      if (errorMessage.includes('permission-denied') || errorMessage.includes('Missing or insufficient permissions')) {
        isPermissionError = true;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-2xl w-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Firestore Permission Denied</h2>
                <p className="text-slate-600 text-sm">Your database is blocking access.</p>
              </div>
            </div>

            {isPermissionError ? (
              <div className="space-y-4">
                <p className="text-slate-700">
                  Because you are using your own Firebase project (<code>ai-project-e6cb2</code>), I cannot automatically update your security rules for safety reasons. 
                  You must manually allow your app to read and write data.
                </p>
                
                <div className="bg-slate-900 rounded-xl p-4 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-slate-400">firestore.rules</span>
                    <button 
                      onClick={this.handleCopy}
                      className="flex items-center gap-1 text-xs text-slate-300 hover:text-white transition-colors bg-slate-800 px-2 py-1 rounded"
                    >
                      {this.state.copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {this.state.copied ? 'Copied!' : 'Copy Rules'}
                    </button>
                  </div>
                  <pre className="text-sm font-mono text-teal-400 overflow-x-auto whitespace-pre-wrap">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}`}
                  </pre>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                  <h3 className="font-semibold mb-1">How to fix this:</h3>
                  <ol className="list-decimal list-inside space-y-1 ml-1">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline font-medium">Firebase Console</a></li>
                    <li>Open your project (<strong>ai-project-e6cb2</strong>)</li>
                    <li>Click <strong>Firestore Database</strong> in the left menu</li>
                    <li>Click the <strong>Rules</strong> tab at the top</li>
                    <li>Paste the rules copied above and click <strong>Publish</strong></li>
                    <li>Come back here and reload the page</li>
                  </ol>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 mb-6 text-sm">{errorMessage}</p>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
