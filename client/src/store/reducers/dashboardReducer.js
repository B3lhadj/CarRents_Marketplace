import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchCustomerBookings = createAsyncThunk(
  'dashboard/fetchCustomerBookings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await api.get('/bookings/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data.bookings;
    } catch (error) {
      console.error('Bookings fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  'dashboard/getStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await api.get('/bookings/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const initialState = {
  bookings: [],
  stats: {
    total: 0,
    pending: 0,
    cancelled: 0,
    completed: 0
  },
  loading: false,
  error: null,
  lastFetch: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    resetDashboard: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bookings
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.statsLoading = false;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearDashboardError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;