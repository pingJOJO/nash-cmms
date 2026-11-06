import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'ADMINISTRATOR' | 'TECHNICIAN' | 'REQUESTER' | 'MANAGER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle: string;
  hourlyRate: number;
  avatar: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'USR-MGR-01',
    name: 'Dr. Elena Rostova',
    email: 'manager@nexcmms.com',
    role: 'ADMINISTRATOR',
    jobTitle: 'Director of Engineering & Facilities',
    hourlyRate: 65.00,
    avatar: 'M'
  },
  {
    id: 'USR-SUP-01',
    name: 'Eng. Omar Dabobash',
    email: 'supervisor@nexcmms.com',
    role: 'MANAGER',
    jobTitle: 'Maintenance Operations Supervisor',
    hourlyRate: 55.00,
    avatar: 'S'
  },
  {
    id: 'USR-TEC-01',
    name: 'Marcus Vance',
    email: 'tech@nexcmms.com',
    role: 'TECHNICIAN',
    jobTitle: 'Senior Field Maintenance Technician',
    hourlyRate: 45.00,
    avatar: 'T'
  },
  {
    id: 'USR-001',
    name: 'Omar Dabobash',
    email: 'omar@nexcmms.online',
    role: 'ADMINISTRATOR',
    jobTitle: 'Lead Facility & Operations Engineer',
    hourlyRate: 55.00,
    avatar: 'O'
  },
  {
    id: 'USR-004',
    name: 'Elena Rostova',
    email: 'elena@nexcmms.online',
    role: 'MANAGER',
    jobTitle: 'Biomedical & Infrastructure Manager',
    hourlyRate: 58.00,
    avatar: 'E'
  },
  {
    id: 'USR-005',
    name: 'Marcus Vance',
    email: 'marcus@nexcmms.online',
    role: 'TECHNICIAN',
    jobTitle: 'Senior Industrial Millwright & Hydraulic Tech',
    hourlyRate: 50.00,
    avatar: 'M'
  },
  {
    id: 'USR-003',
    name: 'Alex Chen',
    email: 'alex@nexcmms.online',
    role: 'TECHNICIAN',
    jobTitle: 'Mobile Fleet & Equipment Specialist',
    hourlyRate: 40.00,
    avatar: 'A'
  },
  {
    id: 'USR-006',
    name: 'David Miller',
    email: 'david@nexcmms.online',
    role: 'REQUESTER',
    jobTitle: 'Production Shift Supervisor & Requester',
    hourlyRate: 35.00,
    avatar: 'D'
  }
];

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => LoginResult;
  quickSwitchRole: (role: UserRole) => void;
  logout: () => void;
  can: (action: 'DELETE' | 'SETTINGS' | 'FINANCIALS' | 'BACKUP' | 'MANAGE_USERS') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem('nex_logged_out');
      if (isLoggedOut === 'true') return null;
      const saved = localStorage.getItem('nex_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Return null so unauthenticated users see the LoginView
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nex_auth_user', JSON.stringify(currentUser));
      localStorage.removeItem('nex_logged_out');
    } else {
      localStorage.removeItem('nex_auth_user');
    }
  }, [currentUser]);

  const login = (email: string, password?: string): LoginResult => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // 1. Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return {
        success: false,
        error: 'Please provide a valid email address (e.g. name@company.com).'
      };
    }

    // 2. Password validation
    if (!password || password.trim().length < 4) {
      return {
        success: false,
        error: 'Password is required and must be at least 4 characters.'
      };
    }

    // 3. Match against seeded demo users or allow internal domain accounts
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === trimmedEmail);
    if (found) {
      setCurrentUser(found);
      return { success: true };
    }

    // 4. Fallback for custom enterprise team members
    let detectedRole: UserRole = 'ADMINISTRATOR';
    let jobTitle = 'Enterprise Staff';
    if (trimmedEmail.includes('tech')) {
      detectedRole = 'TECHNICIAN';
      jobTitle = 'Maintenance Technician';
    } else if (trimmedEmail.includes('super')) {
      detectedRole = 'MANAGER';
      jobTitle = 'Maintenance Supervisor';
    } else if (trimmedEmail.includes('request') || trimmedEmail.includes('op')) {
      detectedRole = 'REQUESTER';
      jobTitle = 'Plant Operator / Requester';
    }

    const customUser: AuthUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: trimmedEmail.split('@')[0].replace(/[._]/g, ' '),
      email: trimmedEmail,
      role: detectedRole,
      jobTitle: jobTitle,
      hourlyRate: detectedRole === 'TECHNICIAN' ? 45.00 : 55.00,
      avatar: (trimmedEmail[0] || 'U').toUpperCase()
    };
    setCurrentUser(customUser);
    return { success: true };
  };

  const quickSwitchRole = (role: UserRole) => {
    const target = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(target);
  };

  const logout = () => {
    localStorage.setItem('nex_logged_out', 'true');
    localStorage.removeItem('nex_auth_user');
    setCurrentUser(null);
  };

  const can = (action: 'DELETE' | 'SETTINGS' | 'FINANCIALS' | 'BACKUP' | 'MANAGE_USERS'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'MANAGER') return true;
    
    switch (action) {
      case 'DELETE':
        return false; // Technicians & Requesters cannot delete critical records
      case 'SETTINGS':
        return false; // Only Admin can access settings
      case 'FINANCIALS':
        return false; // Hide labor rates from requesters
      case 'BACKUP':
        return false; // Only Admin can take database backups
      case 'MANAGE_USERS':
        return false;
      default:
        return true;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        quickSwitchRole,
        logout,
        can
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
