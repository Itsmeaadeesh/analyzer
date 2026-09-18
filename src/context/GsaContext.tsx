import React, { createContext, useContext, useState, useEffect } from 'react';
import { REGIONS, DEFAULT_THEME_ID } from '../themes';

interface GsaContextType {
  gid: string;
  setGid: (gid: string) => void;
  region: string;
  setRegion: (region: string) => void;
  themeId: string;
  setThemeId: (themeId: string) => void;
  serverConnected: boolean;
  hasGeminiKey: boolean;
}

const GsaContext = createContext<GsaContextType | undefined>(undefined);

export const GsaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gid, setGidState] = useState<string>(() => {
    return localStorage.getItem('gsa_gid') || '973';
  });

  const [region, setRegionState] = useState<string>(() => {
    return localStorage.getItem('gsa_region') || 'East-West India (ping)';
  });

  const [themeId, setThemeIdState] = useState<string>(() => {
    return localStorage.getItem('gsa_theme_id') || DEFAULT_THEME_ID;
  });

  const [serverConnected, setServerConnected] = useState<boolean>(true);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setServerConnected(true);
          setHasGeminiKey(Boolean(data.hasGeminiKey));
        } else {
          setServerConnected(false);
        }
      } catch {
        setServerConnected(false);
      }
    };
    checkServer();
  }, []);

  const setGid = (newGid: string) => {
    setGidState(newGid);
    localStorage.setItem('gsa_gid', newGid);
  };

  const setRegion = (newRegion: string) => {
    setRegionState(newRegion);
    localStorage.setItem('gsa_region', newRegion);
  };

  const setThemeId = (newThemeId: string) => {
    setThemeIdState(newThemeId);
    localStorage.setItem('gsa_theme_id', newThemeId);
  };

  return (
    <GsaContext.Provider
      value={{
        gid,
        setGid,
        region,
        setRegion,
        themeId,
        setThemeId,
        serverConnected,
        hasGeminiKey
      }}
    >
      {children}
    </GsaContext.Provider>
  );
};

export function useGsaSettings() {
  const context = useContext(GsaContext);
  if (!context) {
    throw new Error('useGsaSettings must be used within a GsaProvider');
  }
  return context;
}
