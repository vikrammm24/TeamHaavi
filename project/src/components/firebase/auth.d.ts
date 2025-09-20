interface FirebaseUser { uid: string; email?: string | null; displayName?: string | null }
interface UserCredential { user: FirebaseUser }
interface UserProfile { uid: string; email?: string | null; displayName?: string | null; role?: string }

export const doCreateUserWithEmailAndPassword: (email:string, password:string)=>Promise<UserCredential>;
export const doSignInWithEmailAndPassword: (email:string, password:string)=>Promise<UserCredential>;
export const doSignInWithGoogle: ()=>Promise<UserCredential>;
export const doSignUpWithGoogle: ()=>Promise<UserCredential>;
export const doSignOut: ()=>Promise<void>;
export const doPasswordReset: (email:string)=>Promise<void>;
export const doPasswordChange: (password:string)=>Promise<void>;
export const doSendEmailVerification: ()=>Promise<void>;
export const getUserProfile: (uid:string)=>Promise<UserProfile | null>;
export const setUserProfile: (uid:string, data:Partial<UserProfile>)=>Promise<void>;