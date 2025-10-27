import React from 'react';

type Ctx = {
  pushToken: string | null;
  setPushToken: (t: string | null) => void;
};

const PushTokenContext = React.createContext<Ctx | undefined>(undefined);

export function PushTokenProvider({ children }: { children: React.ReactNode }) {
  const [pushToken, setPushToken] = React.useState<string | null>(null);
  const value = React.useMemo(() => ({ pushToken, setPushToken }), [pushToken]);
  return <PushTokenContext.Provider value={value}>{children}</PushTokenContext.Provider>;
}

export function usePushToken() {
  const ctx = React.useContext(PushTokenContext);
  if (!ctx) throw new Error('usePushToken must be used within PushTokenProvider');
  return ctx;
}