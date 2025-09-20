// Type declarations for the JS authContext module for TS consumers
import type React from 'react';

export declare function useAuth(): { user?: unknown; userLoggedIn: boolean; loading: boolean };
export declare const AuthProvider: React.ComponentType<{ children: React.ReactNode }>;
