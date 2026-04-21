import { createContext, useContext, useState, useCallback, useRef } from "react";

const BrowserBridgeContext = createContext(null);

export function BrowserBridgeProvider({ children }) {
  const [browserCommand, setBrowserCommand] = useState(null);
  const listenersRef = useRef([]);

  // Agent calls this to push a browser action
  const pushBrowserAction = useCallback((action) => {
    setBrowserCommand(action);
    listenersRef.current.forEach(fn => fn(action));
  }, []);

  // Browser subscribes to agent actions
  const onBrowserAction = useCallback((fn) => {
    listenersRef.current.push(fn);
    return () => {
      listenersRef.current = listenersRef.current.filter(f => f !== fn);
    };
  }, []);

  return (
    <BrowserBridgeContext.Provider value={{ browserCommand, pushBrowserAction, onBrowserAction }}>
      {children}
    </BrowserBridgeContext.Provider>
  );
}

export function useBrowserBridge() {
  return useContext(BrowserBridgeContext);
}