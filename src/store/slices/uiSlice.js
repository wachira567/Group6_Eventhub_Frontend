import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
  modals: {
    login: false,
    register: false,
    ticketPurchase: false,
  },
  sidebarOpen: false,
  searchOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  toggleSearch,
  setSearchOpen,
} = uiSlice.actions;

export default uiSlice.reducer;