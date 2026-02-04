import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  featuredEvents: [],
  currentEvent: null,
  filters: {
    category: null,
    location: '',
    dateRange: null,
    priceRange: null,
    searchQuery: '',
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
  },
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventsSuccess: (state, action) => {
      state.loading = false;
      state.events = action.payload.events;
      state.pagination.total = action.payload.total;
    },
    fetchEventsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchFeaturedEventsSuccess: (state, action) => {
      state.featuredEvents = action.payload;
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    createEventSuccess: (state, action) => {
      state.events.unshift(action.payload);
    },
    updateEventSuccess: (state, action) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEventSuccess: (state, action) => {
      state.events = state.events.filter(e => e.id !== action.payload);
    },
  },
});

export const {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  fetchFeaturedEventsSuccess,
  setCurrentEvent,
  setFilters,
  clearFilters,
  setPage,
  createEventSuccess,
  updateEventSuccess,
  deleteEventSuccess,
} = eventsSlice.actions;

export default eventsSlice.reducer;
