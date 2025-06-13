import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('No access token found in localStorage');
    throw new Error('No access token found');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const fetchSellerBookings = createAsyncThunk(
  'sellerBookings/fetchSellerBookings',
  async (page = 1, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.get(
        `${api_url}/api/bookings/seller?page=${page}&limit=10`,
        config
      );

      console.log('Fetch Seller Bookings Response:', response.data);

      const bookingsData = response.data.bookings || response.data;
      const normalizedBookings = Array.isArray(bookingsData)
        ? bookingsData.map(booking => ({
            ...booking,
            status: booking.status.toLowerCase(),
          }))
        : [];

      const paginationData = response.data.pagination || {
        currentPage: page,
        totalPages: Math.ceil((response.data.total || normalizedBookings.length) / 10),
        totalItems: response.data.total || normalizedBookings.length,
      };

      return {
        bookings: normalizedBookings,
        pagination: paginationData,
      };
    } catch (error) {
      console.error('Fetch Seller Bookings Error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch seller bookings',
        status: error.response?.status,
      });
    }
  }
);

export const getBookingStatus = createAsyncThunk(
  'sellerBookings/getBookingStatus',
  async (bookingId, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.get(
        `${api_url}/api/bookings/${bookingId}/payment-status`,
        config
      );
      console.log('Get Booking Status Response:', response.data);
      return {
        bookingId,
        status: response.data.bookingStatus.toLowerCase(),
        paymentStatus: response.data.paymentStatus,
        paymentUrl: response.data.paymentUrl,
        expiresAt: response.data.expiresAt,
      };
    } catch (error) {
      console.error('Get Booking Status Error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch booking status',
        status: error.response?.status,
      });
    }
  }
);

export const acceptSellerBooking = createAsyncThunk(
  'sellerBookings/acceptSellerBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.put(
        `${api_url}/api/bookings/${bookingId}/accept`,
        {},
        config
      );
      console.log('Accept Booking Response:', response.data);
      return {
        _id: bookingId,
        status: 'accepted',
        paymentUrl: response.data.paymentUrl,
        expiresAt: response.data.expiresAt,
      };
    } catch (error) {
      console.error('Accept Booking Error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to accept booking',
        status: error.response?.status,
      });
    }
  }
);

export const cancelSellerBooking = createAsyncThunk(
  'sellerBookings/cancelSellerBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.put(
        `${api_url}/api/bookings/${bookingId}/cancel`,
        {},
        config
      );
      console.log('Cancel Booking Response:', response.data);
      return {
        _id: bookingId,
        status: response.data.booking.status.toLowerCase(),
      };
    } catch (error) {
      console.error('Cancel Booking Error:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to cancel booking',
        status: error.response?.status,
      });
    }
  }
);

const initialState = {
  sellerBookings: [],
  bookingDetails: {},
  loading: false,
  error: null,
  statusUpdateLoading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

const sellerBookingSlice = createSlice({
  name: 'sellerBookings',
  initialState,
  reducers: {
    clearSellerBookingError: (state) => {
      state.error = null;
    },
    resetSellerBookings: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerBookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
        console.log('Redux state after fetch:', {
          sellerBookings: state.sellerBookings,
          loading: state.loading,
          pagination: state.pagination,
        });
      })
      .addCase(fetchSellerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        if (action.payload.status === 401) {
          localStorage.removeItem('accessToken');
        }
      })
      .addCase(getBookingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingDetails[action.payload.bookingId] = action.payload;
        console.log('Booking details updated:', state.bookingDetails);
      })
      .addCase(getBookingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
        if (action.payload.status === 401) {
          localStorage.removeItem('accessToken');
        }
      })
      .addCase(acceptSellerBooking.pending, (state) => {
        state.statusUpdateLoading = true;
        state.error = null;
      })
      .addCase(acceptSellerBooking.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        const index = state.sellerBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.sellerBookings[index].status = action.payload.status;
          state.sellerBookings[index].payment = {
            url: action.payload.paymentUrl,
            expiresAt: action.payload.expiresAt,
          };
        }
        if (state.bookingDetails[action.payload._id]) {
          state.bookingDetails[action.payload._id].status = action.payload.status;
          state.bookingDetails[action.payload._id].paymentUrl = action.payload.paymentUrl;
          state.bookingDetails[action.payload._id].expiresAt = action.payload.expiresAt;
        }
        console.log('Redux state after accept:', {
          sellerBookings: state.sellerBookings,
          bookingDetails: state.bookingDetails,
        });
      })
      .addCase(acceptSellerBooking.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.error = action.payload.message;
        if (action.payload.status === 401) {
          localStorage.removeItem('accessToken');
        }
      })
      .addCase(cancelSellerBooking.pending, (state) => {
        state.statusUpdateLoading = true;
        state.error = null;
      })
      .addCase(cancelSellerBooking.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;
        const index = state.sellerBookings.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.sellerBookings[index].status = action.payload.status;
        }
        if (state.bookingDetails[action.payload._id]) {
          state.bookingDetails[action.payload._id].status = action.payload.status;
        }
        console.log('Redux state after cancel:', {
          sellerBookings: state.sellerBookings,
          bookingDetails: state.bookingDetails,
        });
      })
      .addCase(cancelSellerBooking.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.error = action.payload.message;
        if (action.payload.status === 401) {
          localStorage.removeItem('accessToken');
        }
      });
  },
});

export const { clearSellerBookingError, resetSellerBookings } = sellerBookingSlice.actions;
export default sellerBookingSlice.reducer;