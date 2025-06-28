import {
  AlertTriangle,
  Database,
  Wifi,
  RefreshCw,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./Button";
import { testFirestoreConnection } from "@/utils/firestore-diagnostics";

interface DevStatusProps {
  className?: string;
}

interface ConnectionState {
  isChecking: boolean;
  isConnected: boolean | null;
  lastChecked: Date | null;
  error: string | null;
}

export function DevStatus({ className = "" }: DevStatusProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isChecking: false,
    isConnected: null,
    lastChecked: null,
    error: null
  });

  const isDev = import.meta.env.DEV;
  const hasRealFirebaseConfig =
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID !== "demo-project";

  // Debug logging for Firebase config detection
  console.log("🔍 DevStatus Firebase Config Check:", {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    hasRealFirebaseConfig,
    isDev
  });

  // Check connection on component mount
  useEffect(() => {
    const checkInitialConnection = async () => {
      if (!hasRealFirebaseConfig || connectionState.isConnected !== null)
        return;

      setConnectionState((prev) => ({
        ...prev,
        isChecking: true,
        error: null
      }));

      try {
        const status = await testFirestoreConnection();
        setConnectionState({
          isChecking: false,
          isConnected: status.isConnected,
          lastChecked: new Date(),
          error: null
        });
      } catch (error) {
        setConnectionState({
          isChecking: false,
          isConnected: false,
          lastChecked: new Date(),
          error:
            error instanceof Error ? error.message : "Connection test failed"
        });
      }
    };

    checkInitialConnection();
  }, [hasRealFirebaseConfig]); // Add hasRealFirebaseConfig as dependency

  const checkConnection = async () => {
    if (!hasRealFirebaseConfig) return;

    setConnectionState((prev) => ({ ...prev, isChecking: true, error: null }));

    try {
      const status = await testFirestoreConnection();
      setConnectionState({
        isChecking: false,
        isConnected: status.isConnected,
        lastChecked: new Date(),
        error: null
      });
    } catch (error) {
      setConnectionState({
        isChecking: false,
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "Connection test failed"
      });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    await checkConnection();
    setIsTestingConnection(false);
  };

  if (!isDev) return null;

  const getConnectionStatus = () => {
    if (!hasRealFirebaseConfig) {
      return {
        icon: <XCircle className="h-3 w-3 text-amber-600" />,
        text: "⚠ Using mock data (Firebase not configured)",
        color: "amber"
      };
    }

    if (connectionState.isChecking) {
      return {
        icon: <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />,
        text: "🔄 Checking connection...",
        color: "blue"
      };
    }

    if (connectionState.isConnected === true) {
      return {
        icon: <CheckCircle className="h-3 w-3 text-green-600" />,
        text: "✓ Firebase connected (live data)",
        color: "green"
      };
    }

    if (connectionState.isConnected === false) {
      return {
        icon: <XCircle className="h-3 w-3 text-red-600" />,
        text: "❌ Firebase connection failed (using mock data)",
        color: "red"
      };
    }

    return {
      icon: <Database className="h-3 w-3 text-gray-600" />,
      text: "❓ Connection status unknown",
      color: "gray"
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div
      className={`bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
            Development Mode
          </h3>
          <div className="space-y-2 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center space-x-2">
              {connectionStatus.icon}
              <span
                className={
                  connectionStatus.color === "green"
                    ? "text-green-600 dark:text-green-400"
                    : connectionStatus.color === "red"
                      ? "text-red-600 dark:text-red-400"
                      : connectionStatus.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-amber-600 dark:text-amber-400"
                }
              >
                {connectionStatus.text}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Wifi className="h-3 w-3" />
              <span>React Query with 3x retry enabled</span>
            </div>
            {connectionState.lastChecked && (
              <div className="text-xs text-gray-500">
                Last checked: {connectionState.lastChecked.toLocaleTimeString()}
              </div>
            )}
            {connectionState.error && (
              <div className="text-xs text-red-600 dark:text-red-400">
                Error: {connectionState.error}
              </div>
            )}
          </div>

          {!hasRealFirebaseConfig && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              To use real data, configure Firebase credentials in your
              environment variables.
            </p>
          )}

          {hasRealFirebaseConfig && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={isTestingConnection || connectionState.isChecking}
                className="text-xs h-6 px-2"
              >
                {isTestingConnection || connectionState.isChecking ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="h-3 w-3 mr-1" />
                    Test Connection
                  </>
                )}
              </Button>

              {connectionState.isConnected === true && (
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live data active
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Check browser console for detailed connection logs
          </p>
        </div>
      </div>
    </div>
  );
}
