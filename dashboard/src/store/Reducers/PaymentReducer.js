import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils';

const initialState = {
  withdrawals: [],
  requests: [],
  loading: false,
  error: null,
  success: null,
  stats: {
    total: 0,       // in cents
    pending: 0,     // in cents
    completed: 0,   // in cents
    available: 0    // in cents
  },
  lastUpdated: null
};

// Helper function to process amounts and convert to cents if needed
const processAmounts = (data) => {
  if (!data) return data;
  
  const process = (amount) => {
    if (typeof amount !== 'number') return 0;
    return amount < 1000 ? Math.round(amount * 100) : amount;
  };

  if (data.stats) {
    return {
      ...data,
      stats: {
        total: process(data.stats.total),
        pending: process(data.stats.pending),
        completed: process(data.stats.completed),
        available: process(data.stats.available),
      }
    };
  }
  return data;
};

// Fetch seller balance
export const fetchSellerBalance = createAsyncThunk(
  'payment/fetchBalance',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue({ message: 'Authentication required' });
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${api_url}/api/payments/balance`, 
        config
      );
      
      return {
        total: Math.round(response.data.balance.total * 100),
        available: Math.round(response.data.balance.available * 100),
        pending: Math.round(response.data.balance.pending * 100),
      };
      
    } catch (error) {
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Failed to fetch balance'
      });
    }
  }
);

// Get seller payment details
export const getSellerPaymentDetails = createAsyncThunk(
  'payment/getSellerDetails',
  async (sellerId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue({ message: 'Authentication required' });
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${api_url}/api/payments/seller/${sellerId}`, 
        config
      );
      
      return processAmounts(response.data);
    } catch (error) {
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Failed to fetch payment details'
      });
    }
  }
);

// Send withdrawal request
export const sendWithdrawalRequest = createAsyncThunk(
  'payment/sendRequest',
  async ({ amount, sellerId, method }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue({ message: 'Authentication required' });
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.post(
        `${api_url}/api/payments/withdrawals`,
        { amount, sellerId, method },
        config
      );
      
      return processAmounts(response.data);
    } catch (error) {
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Withdrawal request failed'
      });
    }
  }
);

// Get payment requests
export const getPaymentRequests = createAsyncThunk(
  'payment/getRequests',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue({ message: 'Authentication required' });
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${api_url}/api/payments/withdrawals/history`, 
        config
      );
      
      return processAmounts(response.data);
    } catch (error) {
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Failed to load payment history'
      });
    }
  }
);

// Confirm payment request (admin)
export const confirmPaymentRequest = createAsyncThunk(
  'payment/confirmRequest',
  async (requestId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue({ message: 'Authentication required' });
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.patch(
        `${api_url}/api/payments/withdrawals/${requestId}/process`,
        {}, // Empty body since status is handled in controller
        config
      );
      
      return processAmounts(response.data);
    } catch (error) {
      return rejectWithValue({ 
        message: error.response?.data?.message || 'Failed to process payment'
      });
    }
  }
);
export const getAllWithdrawals = createAsyncThunk(
  'payment/getAllWithdrawals',
  async ({ page = 1, status = '', sellerId = '' }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${api_url}/api/payments/admin/withdrawals?page=${page}&status=${status}&sellerId=${sellerId}`,
        config
      );
      
      return {
        withdrawals: response.data.withdrawals,
        pagination: {
          page: response.data.page,
          pages: response.data.pages,
          total: response.data.total
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getWithdrawalDetails = createAsyncThunk(
  'payment/getWithdrawalDetails',
  async (withdrawalId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${api_url}/api/admin/withdrawals/${withdrawalId}`,
        config
      );
      
      return response.data.withdrawal;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const processWithdrawal = createAsyncThunk(
  'payment/processWithdrawal',
  async ({ withdrawalId, action, adminNote }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.patch(
        `${api_url}/api/payments/admin/withdrawals/${withdrawalId}/process`,
        { action, adminNote },
        config
      );
      
      return response.data.withdrawal;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getWithdrawalStats = createAsyncThunk(
  'payment/getWithdrawalStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const response = await axios.get(
        `${api_url}/api/payments/admin/withdrawals/stats`,
        config
      );
      
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    resetPaymentState: () => initialState,
  },
  extraReducers: (builder) => {
    // First: Handle all specific action cases with addCase()
    builder
      // Seller endpoints
      .addCase(fetchSellerBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = { ...state.stats, ...action.payload };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getSellerPaymentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests || [];
        state.stats = action.payload.stats || initialState.stats;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(sendWithdrawalRequest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.request) {
          state.requests.unshift(action.payload.request);
        }
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
        state.success = action.payload.message || 'Withdrawal requested successfully';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getPaymentRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests || [];
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
        state.lastUpdated = new Date().toISOString();
      })
      
      // Admin endpoints
      .addCase(getAllWithdrawals.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals = action.payload.withdrawals;
        state.pagination = action.payload.pagination;
      })
      .addCase(getWithdrawalDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals = state.withdrawals.map(w => 
          w._id === action.payload._id ? action.payload : w
        );
      })
      .addCase(processWithdrawal.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawals = state.withdrawals.map(w => 
          w._id === action.payload._id ? action.payload : w
        );
        state.success = 'Withdrawal processed successfully';
      })
      .addCase(getWithdrawalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.adminStats = action.payload;
      });

    // Then: Add matchers after all cases
    builder
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('payment/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload.message || 'Request failed';
        }
      );
  }
});

export const { clearMessages, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;