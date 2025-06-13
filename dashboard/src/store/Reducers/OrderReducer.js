import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils';

export const get_admin_orders = createAsyncThunk(
  'order/get_admin_orders',
  async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(
        `${api_url}/api/admin/all?page=${page}&parPage=${parPage}&searchValue=${searchValue}`,
        config
      );
      if (!data || !Array.isArray(data.bookings)) {
        return rejectWithValue({ message: 'Invalid response: bookings is not an array' });
      }
      return fulfillWithValue({
        orders: data.bookings, // Map bookings to orders
        totalOrder: data.count || 0, // Use count as totalOrder
      });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch orders' });
    }
  }
);

export const get_seller_orders = createAsyncThunk(
  'order/get_seller_orders',
  async ({ parPage, page, searchValue, sellerId }, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(
        `${api_url}/api/seller/orders/${sellerId}?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,
        config
      );
      if (!data || !Array.isArray(data.bookings)) {
        return rejectWithValue({ message: 'Invalid response: bookings is not an array' });
      }
      return fulfillWithValue({
        orders: data.bookings,
        totalOrder: data.count || 0,
      });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch seller orders' });
    }
  }
);

export const get_admin_order = createAsyncThunk(
  'order/get_admin_order',
  async (orderId, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(`${api_url}/api/admin/order/${orderId}`, config);
      if (!data || !data.booking) {
        return rejectWithValue({ message: 'Invalid response: booking not found' });
      }
      return fulfillWithValue({ order: data.booking });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch order' });
    }
  }
);

export const get_seller_order = createAsyncThunk(
  'order/get_seller_order',
  async (orderId, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.get(`${api_url}/api/seller/order/${orderId}`, config);
      if (!data || !data.booking) {
        return rejectWithValue({ message: 'Invalid response: booking not found' });
      }
      return fulfillWithValue({ order: data.booking });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch seller order' });
    }
  }
);

export const admin_order_status_update = createAsyncThunk(
  'order/admin_order_status_update',
  async ({ orderId, info }, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.put(
        `${api_url}/api/admin/order-status/update/${orderId}`,
        { status: info.status }, // Send status field
        config
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update order status' });
    }
  }
);

export const seller_order_status_update = createAsyncThunk(
  'order/seller_order_status_update',
  async ({ orderId, info }, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.put(
        `${api_url}/api/seller/order-status/update/${orderId}`,
        { status: info.status }, // Send status field
        config
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update seller order status' });
    }
  }
);

export const delete_product = createAsyncThunk(
  'product/delete_product',
  async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios.delete(`${api_url}/api/product-delete/${productId}`, config);
      return fulfillWithValue({ ...data, productId });
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete product' });
    }
  }
);

export const OrderReducer = createSlice({
  name: 'order',
  initialState: {
    successMessage: '',
    errorMessage: '',
    totalOrder: 0,
    order: {},
    myOrders: [],
    isLoading: false,
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = '';
      state.successMessage = '';
    },
  },
  extraReducers: {
    [get_admin_orders.pending]: (state) => {
      state.isLoading = true;
      state.errorMessage = '';
    },
    [get_admin_orders.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.myOrders = Array.isArray(payload.orders) ? payload.orders : [];
      state.totalOrder = payload.totalOrder || 0;
    },
    [get_admin_orders.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.errorMessage = payload?.message || 'Failed to fetch orders';
      state.myOrders = [];
      state.totalOrder = 0;
    },
    [get_seller_orders.pending]: (state) => {
      state.isLoading = true;
      state.errorMessage = '';
    },
    [get_seller_orders.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.myOrders = Array.isArray(payload.orders) ? payload.orders : [];
      state.totalOrder = payload.totalOrder || 0;
    },
    [get_seller_orders.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.errorMessage = payload?.message || 'Failed to fetch seller orders';
      state.myOrders = [];
      state.totalOrder = 0;
    },
    [get_admin_order.pending]: (state) => {
      state.isLoading = true;
      state.errorMessage = '';
    },
    [get_admin_order.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.order = payload.order || {};
    },
    [get_admin_order.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.errorMessage = payload?.message || 'Failed to fetch order';
      state.order = {};
    },
    [get_seller_order.pending]: (state) => {
      state.isLoading = true;
      state.errorMessage = '';
    },
    [get_seller_order.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.order = payload.order || {};
    },
    [get_seller_order.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.errorMessage = payload?.message || 'Failed to fetch seller order';
      state.order = {};
    },
    [admin_order_status_update.pending]: (state) => {
      state.isLoading = true;
      state.errorMessage = '';
    },
    [admin_order_status_update.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.successMessage = payload.message || 'Order status updated successfully';
    },
    [admin_order_status_update.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.errorMessage = payload?.message || 'Failed to update order status';
    },
    [seller_order_status_update.pending]: (state) => {
      state.isLoading = true;
      state.errorMessage = '';
    },
    [seller_order_status_update.fulfilled]: (state, { payload }) => {
      state.isLoading = false;
      state.successMessage = payload.message || 'Seller order status updated successfully';
    },
    [seller_order_status_update.rejected]: (state, { payload }) => {
      state.isLoading = false;
      state.errorMessage = payload?.message || 'Failed to update seller order status';
    },
  },
});

export const { messageClear } = OrderReducer.actions;
export default OrderReducer.reducer;