import { createSlice } from '@reduxjs/toolkit';

// Helper to safely parse JSON from localStorage
const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const token = localStorage.getItem('token');
const refreshToken = localStorage.getItem('refreshToken');
const user = getUserFromStorage();

const initialState = {
  user: user,
  token: token,
  refreshToken: refreshToken,
  isAuthenticated: !!token && !!user, // Only authenticated if both token and user exist
  role: user?.role || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.role = action.payload.user.role;
      // Persist to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.role = null;
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update localStorage with merged user data
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
    // Action to restore auth state (useful after page refresh)
    restoreAuth: (state) => {
      const storedToken = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = getUserFromStorage();
      if (storedToken && storedUser) {
        state.token = storedToken;
        state.refreshToken = storedRefreshToken;
        state.user = storedUser;
        state.isAuthenticated = true;
        state.role = storedUser.role;
      }
    },
    // Action to set new tokens (used during token refresh)
    setTokens: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      // Persist to localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  restoreAuth,
  setTokens,
} = authSlice.actions;

export default authSlice.reducer;
