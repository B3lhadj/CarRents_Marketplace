import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils';

export const get_seller_dashboard_index_data = createAsyncThunk(
  'dashboardIndex/get_seller_dashboard_index_data',
  async (_, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(`${api_url}/api/seller/get-dashboard-index-data`, config);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch seller dashboard data' });
    }
  }
);

export const get_admin_dashboard_index_data = createAsyncThunk(
  'dashboardIndex/get_admin_dashboard_index_data',
  async ({ days }, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const [dashboardRes, stripeRes] = await Promise.all([
        axios.get(`${api_url}/api/admin/get-dashboard-index-data?days=${days}`, config),
        axios.get(`${api_url}/api/stripe/balance`, config),
      ]);

      return fulfillWithValue({
        ...dashboardRes.data,
        stripeData: stripeRes.data,
      });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch admin dashboard data' });
    }
  }
);

export const get_stripe_revenue_data = createAsyncThunk(
  'dashboardIndex/get_stripe_revenue_data',
  async (_, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(`${api_url}/api/stripe/revenue`, config);
      console.log('Stripe revenue API response:', data);
      return fulfillWithValue(data);
    } catch (error) {
      console.error('Stripe revenue API error:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch Stripe revenue data' });
    }
  }
);

const initialState = {
  totalSale: 0,
  totalOrder: 0,
  totalProduct: 0,
  totalPendingOrder: 0,
  totalSeller: 0,
  recentOrders: [],
  recentMessage: [],
  stripeData: {
    totalRevenue: 0,
    transactions: [],
    revenueByDay: [],
    available: 0,
    pending: 0,
  },
  errorMessage: '',
  successMessage: '',
  loader: false,
};

export const dashboardIndexReducer = createSlice({
  name: 'dashboardIndex',
  initialState,
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_seller_dashboard_index_data.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_seller_dashboard_index_data.fulfilled, (state, action) => {
        const { payload } = action;
        state.totalSale = payload.totalSale || 0;
        state.totalOrder = payload.totalOrder || 0;
        state.totalProduct = payload.totalProduct || 0;
        state.totalPendingOrder = payload.totalPendingOrder || 0;
        state.recentOrders = payload.recentOrders || [];
        state.recentMessage = payload.messages || [];
        state.errorMessage = '';
        state.successMessage = 'Seller dashboard data fetched successfully';
        state.loader = false;
      })
      .addCase(get_seller_dashboard_index_data.rejected, (state, action) => {
        state.errorMessage = action.payload?.message || 'Failed to fetch seller dashboard data';
        state.successMessage = '';
        state.loader = false;
      })
      .addCase(get_admin_dashboard_index_data.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_admin_dashboard_index_data.fulfilled, (state, action) => {
        const { payload } = action;
        console.log('Updating stripeData with get_admin_dashboard_index_data:', payload.stripeData);
        state.totalSale = payload.totalSale || 0;
        state.totalOrder = payload.totalOrder || 0;
        state.totalProduct = payload.totalProduct || 0;
        state.totalSeller = payload.totalSeller || 0;
        state.recentOrders = payload.recentOrders || [];
        state.recentMessage = payload.messages || [];
        state.stripeData = {
          ...state.stripeData,
          totalRevenue: payload.stripeData?.totalRevenue || state.stripeData.totalRevenue,
          transactions: payload.stripeData?.recentTransactions || state.stripeData.transactions,
          revenueByDay: payload.stripeData?.revenueTrend || state.stripeData.revenueByDay,
          available: payload.stripeData?.available || state.stripeData.available,
          pending: payload.stripeData?.pending || state.stripeData.pending,
        };
        state.errorMessage = '';
        state.successMessage = 'Admin dashboard data fetched successfully';
        state.loader = false;
      })
      .addCase(get_admin_dashboard_index_data.rejected, (state, action) => {
        state.errorMessage = action.payload?.message || 'Failed to fetch admin dashboard data';
        state.successMessage = '';
        state.loader = false;
      })
      .addCase(get_stripe_revenue_data.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_stripe_revenue_data.fulfilled, (state, action) => {
        const { payload } = action;
        console.log('Updating stripeData with get_stripe_revenue_data:', payload);
        const apiData = payload.data || {};
        state.stripeData = {
          totalRevenue: apiData.totalRevenue || 0,
          transactions: apiData.transactions || [],
          revenueByDay: apiData.revenueTrend || [],
          available: apiData.available || 0,
          pending: apiData.pending || 0,
        };
        state.errorMessage = '';
        state.successMessage = 'Stripe revenue data fetched successfully';
        state.loader = false;
      })
      .addCase(get_stripe_revenue_data.rejected, (state, action) => {
        state.errorMessage = action.payload?.message || 'Failed to fetch Stripe revenue data';
        state.successMessage = '';
        state.loader = false;
      });
  },
});

export const { messageClear } = dashboardIndexReducer.actions;
export default dashboardIndexReducer.reducer;