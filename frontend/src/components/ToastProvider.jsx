import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // {id, type, text}

  const push = useCallback((type, text, ms = 2500) => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, type, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ms);
  }, []);

  const api = {
    success: (msg, ms) => push("success", msg, ms),
    error: (msg, ms) => push("error", msg, ms),
    info: (msg, ms) => push("info", msg, ms),
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setToasts([]);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div style={{
        position:"fixed", right:16, bottom:16, display:"grid", gap:8, zIndex:9999,
        maxWidth: 360
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding:"10px 12px", borderRadius:10, color:"#fff",
            background: t.type==="success" ? "#16a34a" :
                        t.type==="error" ? "#dc2626" : "#2563eb",
            boxShadow:"0 8px 24px rgba(0,0,0,.18)", fontSize:14, lineHeight:1.4
          }}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
