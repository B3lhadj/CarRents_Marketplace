import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils';

export const get_seller_dashboard_index_data = createAsyncThunk(
  'dashboardIndex/get_seller_dashboard_index_data',
  async (_, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    if (!token) {
      console.error('No auth token found in state');
      return rejectWithValue({ message: 'Authentication token missing. Please log in.' });
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10-second timeout
    };

    const endpoints = [
      { name: 'balance', url: `${api_url}/api/payments/balance`, key: 'totalSale', field: 'balance.total' }, // Modified to access balance.total
      { name: 'bookings', url: `${api_url}/api/bookings/count`, keys: ['totalOrder', 'totalPendingOrder'], fields: ['totalBookings', 'pendingBookings'] },
      { name: 'vehicles', url: `${api_url}/api/vehicles/count`, key: 'totalProduct', field: 'count' },
    ];

    const dashboardData = {
      totalSale: 0,
      totalProduct:0,
      totalOrder: 0,
      totalPendingOrder: 0,
    };

    try {
      console.log('Fetching dashboard data with token:', token);
      const results = await Promise.allSettled(
        endpoints.map(async ({ name, url, key, keys, field, fields }) => {
          try {
            console.log(`Requesting ${name} from: ${url}`);
            const { data } = await axios.get(url, config);
            console.log(`${name} API response:`, data);
            return { name, data, key, keys, field, fields, status: 'fulfilled' };
          } catch (error) {
            const errorDetails = {
              message: error.response?.data?.error || `Failed to fetch ${name} data`,
              status: error.response?.status,
              data: error.response?.data,
              error: error.message,
              code: error.code,
            };
            console.error(`${name} API error:`, errorDetails);
            return { name, error: errorDetails, status: 'rejected' };
          }
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { name, data, key, keys, field, fields } = result.value;
          
          // Handle nested fields (like balance.total)
          const getNestedValue = (obj, path) => {
            return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
          };
          
          if (key && field) {
            const value = getNestedValue(data, field);
            if (value !== undefined) {
              dashboardData[key] = value;
            }
          } else if (keys && fields) {
            keys.forEach((k, i) => {
              const value = getNestedValue(data, fields[i]);
              if (value !== undefined) {
                dashboardData[k] = value;
              }
            });
          }
        } else {
          console.warn(`Skipping ${result.value.name} due to error`);
        }
      });

      console.log('Aggregated dashboard data:', dashboardData);

      if (results.every((r) => r.status === 'rejected')) {
        const errors = results.map((r) => r.value.error);
        return rejectWithValue({
          message: 'All dashboard data requests failed',
          errors,
        });
      }

      return fulfillWithValue(dashboardData);
    } catch (error) {
      const errorDetails = {
        message: error.message || 'Unexpected error fetching dashboard data',
        error: error.message,
        code: error.code,
      };
      console.error('Unexpected error in dashboard fetch:', errorDetails);
      return rejectWithValue(errorDetails);
    }
  }
);

const initialState = {
  totalSale: 0,
  totalProduct: 0,
  totalOrder: 0,
  totalPendingOrder: 0,
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
      state.loader = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(get_seller_dashboard_index_data.pending, (state) => {
        state.loader = true;
        state.errorMessage = '';
        state.successMessage = '';
      })
      .addCase(get_seller_dashboard_index_data.fulfilled, (state, action) => {
        state.loader = false;
        const { payload } = action;
        state.totalSale = payload.totalSale || 0;
        state.totalProduct = payload.totalProduct || 1;
        state.totalOrder = payload.totalOrder || 0;
        state.totalPendingOrder = payload.totalPendingOrder || 0;
        state.successMessage = 'Seller dashboard data fetched successfully';
        state.errorMessage = '';
      })
      .addCase(get_seller_dashboard_index_data.rejected, (state, action) => {
        state.loader = false;
        state.errorMessage = action.payload?.message || 'Failed to fetch seller dashboard data';
        state.successMessage = '';
      });
  },
});

export const { messageClear } = dashboardIndexReducer.actions;
export default dashboardIndexReducer.reducer;