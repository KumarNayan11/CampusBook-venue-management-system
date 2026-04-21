import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  login as userServiceLogin, 
  register as userServiceRegister, 
  updateProfile as userServiceUpdateProfile,
  logout as userServiceLogout 
} from '../services/userService';

const AuthContext = createContext();
const DEV_ROLES = ['admin', 'dsw', 'hod', 'faculty'];
const DEV_DEPARTMENT = {
  _id: '69ca66489e472aac94f405cc',
  name: 'Development Department',
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth State from Local Storage
  useEffect(() => {
    const token = localStorage.getItem('campusbook_token');
    const storedUserStr = localStorage.getItem('campusbook_user');
    
    if (token && storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('campusbook_token');
        localStorage.removeItem('campusbook_user');
      }
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await userServiceLogin({ email, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    }
  };

  // Register handler
  const register = async (signUpData) => {
    try {
      const data = await userServiceRegister(signUpData);
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed.' 
      };
    }
  };

  const updateProfile = async (userData) => {
     try {
        const data = await userServiceUpdateProfile(userData);
        setUser(data);
        toast.success('System Profile Updated');
        return data;
     } catch (error) {
        toast.error(error.response?.data?.message || 'Update failed');
        throw error;
     }
  };

  const switchRole = (role) => {
    if (!DEV_ROLES.includes(role)) {
      toast.error('Unsupported development role');
      return;
    }

    const normalizedRole = role.toLowerCase();
    const mockUser = {
      _id: '000000000000000000000001',
      name: `Dev ${normalizedRole.toUpperCase()}`,
      email: `${normalizedRole}@dev.test`,
      role: normalizedRole,
      departmentId: DEV_DEPARTMENT,
    };

    localStorage.setItem('campusbook_token', `dev_mock_token:${normalizedRole}`);
    localStorage.setItem('campusbook_user', JSON.stringify(mockUser));
    setUser(mockUser);
    toast.success(`Development role switched to ${normalizedRole.toUpperCase()}`);
  };

  const logout = () => {
    userServiceLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
