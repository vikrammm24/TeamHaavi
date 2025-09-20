declare module "../contexts/authContext" {
  export function useAuth(): { user?: unknown; userLoggedIn: boolean; loading: boolean };
  export const AuthProvider: React.ComponentType<{ children: React.ReactNode }>;
}
