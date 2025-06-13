import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/config';

// Fetch a single booking by ID
export const fetchBookingById = createAsyncThunk(
  'bookings/fetchBookingById',
  async (bookingId, { rejectWithValue }) => {
    const token = localStorage.getItem('customerToken');
    if (!token) return rejectWithValue('User not authenticated');
    
    try {
      const response = await axios.get(`${api_url}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  }
);

// Update booking status
export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ bookingId, status }, { rejectWithValue }) => {
    const token = localStorage.getItem('customerToken');
    if (!token) return rejectWithValue('User not authenticated');
    
    try {
      const response = await axios.put(
        `${api_url}/api/bookings/${bookingId}/cancel`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking status');
    }
  }
);

// Fetch all bookings for current user
export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('customerToken');
    if (!token) return rejectWithValue('User not authenticated');
    
    try {
      const response = await axios.get(`${api_url}/api/bookings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.bookings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  }
);

// Create a new booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    const token = localStorage.getItem('customerToken');
    if (!token) return rejectWithValue('User not authenticated');
    
    try {
      const response = await axios.post(`${api_url}/api/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.booking;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  }
);

// Initiate Stripe payment
export const initiatePayment = createAsyncThunk(
  'bookings/initiatePayment',
  async ({ bookingId, amount }, { rejectWithValue }) => {
    const token = localStorage.getItem('customerToken');
    if (!token) return rejectWithValue('User not authenticated');
    
    try {
      const response = await axios.post(
        `${api_url}/api/payments/initiate`,
        { bookingId, amount, currency: 'EUR' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (!response.data.url) throw new Error('No payment URL received');
      
      // Redirect to Stripe
      window.location.href = response.data.url;
      
      return { url: response.data.url, bookingId };
    } catch (error) {
      console.error('Payment initiation error:', {
        error: error.response?.data || error.message,
        config: error.config
      });
      return rejectWithValue(
        error.response?.data?.message || 
        'Payment initiation failed. Please try again.'
      );
    }
  }
);

// Verify payment status (using session ID)
// Updated verifyPayment thunk
export const verifyPayment = createAsyncThunk(
  'bookings/verifyPayment',
  async (sessionId, { rejectWithValue }) => {
    const token = localStorage.getItem('customerToken');
    if (!token) return rejectWithValue('User not authenticated');
    
    try {
      const response = await axios.get(
        `${api_url}/api/payments/verify/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Verification failed');
      }
      
      return {
        paid: response.data.paid,
        booking: response.data.booking,
        sessionId
      };
      
    } catch (error) {
      console.error('Payment verification error:', {
        error: error.response?.data || error.message,
        sessionId
      });
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
const initialState = {
  bookings: [],
  currentBooking: {
    data: null,
    loading: false,
    error: null,
    payment: {
      loading: false,
      error: null,
      status: 'idle', // 'idle' | 'pending' | 'success' | 'failed'
      sessionId: null
    }
  },
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = initialState.currentBooking;
    },
    resetPaymentStatus: (state) => {
      state.currentBooking.payment = initialState.currentBooking.payment;
    },
    setPaymentSessionId: (state, action) => {
      state.currentBooking.payment.sessionId = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Booking By ID
      .addCase(fetchBookingById.pending, (state) => {
        state.currentBooking.loading = true;
        state.currentBooking.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.currentBooking.loading = false;
        state.currentBooking.data = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.currentBooking.loading = false;
        state.currentBooking.error = action.payload;
      })
      
      // Update Booking Status
      .addCase(updateBookingStatus.pending, (state) => {
        state.currentBooking.loading = true;
        state.currentBooking.error = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.currentBooking.loading = false;
        state.currentBooking.data = action.payload;
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) state.bookings[index] = action.payload;
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.currentBooking.loading = false;
        state.currentBooking.error = action.payload;
      })
      
      // Fetch User Bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.currentBooking.payment = {
          loading: true,
          error: null,
          status: 'pending',
          sessionId: null
        };
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.currentBooking.payment = {
          loading: false,
          error: null,
          status: 'redirected',
          sessionId: action.payload.sessionId
        };
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.currentBooking.payment = {
          loading: false,
          error: action.payload,
          status: 'failed',
          sessionId: null
        };
      })
      
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.currentBooking.payment.loading = true;
        state.currentBooking.payment.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.currentBooking.payment = {
          loading: false,
          error: null,
          status: action.payload.paid ? 'completed' : 'pending',
          sessionId: state.currentBooking.payment.sessionId
        };
        if (action.payload.booking) {
          state.currentBooking.data = action.payload.booking;
        }
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.currentBooking.payment = {
          loading: false,
          error: action.payload,
          status: 'failed',
          sessionId: state.currentBooking.payment.sessionId
        };
      });
  },
});

export const { 
  clearCurrentBooking, 
  resetPaymentStatus,
  setPaymentSessionId
} = bookingSlice.actions;
export default bookingSlice.reducer;