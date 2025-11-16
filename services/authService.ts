import type { User, UserRole } from '../types';

const USERS_STORAGE_KEY = 'pipe-counter-authorized-users';
const SESSION_STORAGE_KEY = 'pipe-counter-session';

const getAuthorizedUsers = (): User[] => {
  try {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (usersJson) {
      return JSON.parse(usersJson);
    }
  } catch (e) {
    console.error("Failed to parse authorized users from localStorage", e);
  }
  
  // Default: The first user becomes the Admin.
  const initialAdmin: User = { email: 'vvadlamudimouryan@gmail.com', role: 'Admin' };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([initialAdmin]));
  return [initialAdmin];
};

let authorizedUsers: User[] = getAuthorizedUsers();

const saveAuthorizedUsers = () => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(authorizedUsers));
};

export const login = (email: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase();
      const foundUser = authorizedUsers.find(u => u.email === normalizedEmail);

      if (foundUser) {
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(foundUser));
          resolve(foundUser);
        } catch (e) {
            reject(new Error("Could not save session. Please enable cookies/localStorage."));
        }
      } else {
        reject(new Error("Access denied. This email is not authorized."));
      }
    }, 500); // Simulate network delay
  });
};

export const logout = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session from localStorage", e);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(SESSION_STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    console.error("Failed to retrieve user from localStorage", e);
    return null;
  }
};

// --- Admin Functions ---

export const getUsers = (): User[] => {
    return [...authorizedUsers];
};

export const addUser = (email: string, role: UserRole): Promise<User> => {
    return new Promise((resolve, reject) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!normalizedEmail) {
            return reject(new Error("Email cannot be empty."));
        }
        if (authorizedUsers.some(u => u.email === normalizedEmail)) {
            return reject(new Error("User with this email already exists."));
        }
        
        const newUser: User = { email: normalizedEmail, role };
        authorizedUsers.push(newUser);
        saveAuthorizedUsers();
        resolve(newUser);
    });
};

export const removeUser = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === 'vvadlamudimouryan@gmail.com') {
            return reject(new Error("Cannot remove the primary administrator."));
        }
        const initialLength = authorizedUsers.length;
        authorizedUsers = authorizedUsers.filter(u => u.email !== normalizedEmail);

        if (authorizedUsers.length === initialLength) {
            return reject(new Error("User not found."));
        }

        saveAuthorizedUsers();
        resolve();
    });
};
