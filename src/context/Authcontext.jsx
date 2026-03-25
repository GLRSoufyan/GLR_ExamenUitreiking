import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const CODES = {
  TEST:  'user',
  ADMIN: 'admin',
};

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // null | 'user' | 'admin'

  function login(code) {
    const r = CODES[code.trim().toUpperCase()];
    if (r) {
      setRole(r);
      return true;
    }
    return false;
  }

  function logout() {
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ role, isLoggedIn: !!role, isAdmin: role === 'admin', login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}