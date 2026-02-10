import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  myTickets: [],
  loading: false,
  error: null,
  checkoutStatus: 'idle', // 'idle', 'processing', 'success', 'failed'
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.cart.find(
        item => item.ticketTypeId === action.payload.ticketTypeId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(
        item => item.ticketTypeId !== action.payload
      );
    },
    updateCartQuantity: (state, action) => {
      const item = state.cart.find(
        item => item.ticketTypeId === action.payload.ticketTypeId
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    checkoutStart: (state) => {
      state.checkoutStatus = 'processing';
      state.error = null;
    },
    checkoutSuccess: (state) => {
      state.checkoutStatus = 'success';
      state.cart = [];
    },
    checkoutFailure: (state, action) => {
      state.checkoutStatus = 'failed';
      state.error = action.payload;
    },
    resetCheckoutStatus: (state) => {
      state.checkoutStatus = 'idle';
    },
    fetchMyTicketsStart: (state) => {
      state.loading = true;
    },
    fetchMyTicketsSuccess: (state, action) => {
      state.loading = false;
      state.myTickets = action.payload;
    },
    fetchMyTicketsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  checkoutStart,
  checkoutSuccess,
  checkoutFailure,
  resetCheckoutStatus,
  fetchMyTicketsStart,
  fetchMyTicketsSuccess,
  fetchMyTicketsFailure,
} = ticketsSlice.actions;

export default ticketsSlice.reducer;
