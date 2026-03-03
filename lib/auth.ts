import { pb } from './pocketbase';

export interface UserRecord {
    id: string;
    username: string;
    email?: string;
    created: string;
    updated: string;
}

export async function loginUser(username: string, password: string) {
    const authData = await pb.collection('users').authWithPassword(username, password);
    return authData;
}

export async function registerUser(username: string, password: string, passwordConfirm: string) {
    const record = await pb.collection('users').create({
        username,
        password,
        passwordConfirm,
    });
    // Auto-login after registration
    await pb.collection('users').authWithPassword(username, password);
    return record;
}

export function logoutUser() {
    pb.authStore.clear();
}

export function getCurrentUser(): UserRecord | null {
    if (!pb.authStore.isValid) return null;
    return pb.authStore.record as unknown as UserRecord;
}

export function isAuthenticated(): boolean {
    return pb.authStore.isValid;
}
