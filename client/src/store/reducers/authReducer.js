import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';
import jwtDecode from 'jwt-decode';

// Decode token to get userInfo
const decodeToken = (token) => {
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }
  return null;
};

// Async Actions
export const customer_register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/customer-register', userData);
      localStorage.setItem('customerToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const customer_login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/customer-login', credentials);
      localStorage.setItem('customerToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const get_customer_info = createAsyncThunk(
  'auth/getInfo',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('No token found');
      
      const { data } = await api.get('/get-customer-info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    } catch (error) {
      localStorage.removeItem('customerToken');
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch info');
    }
  }
);

export const update_customer_info = createAsyncThunk(
  'auth/updateInfo',
  async (userData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('No token found');

      // Send JSON payload directly
      const { data } = await api.put('/update-customer-info', userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return data;
    } catch (error) {
      let errorMessage = 'Failed to update customer info';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired - please login again';
          localStorage.removeItem('customerToken');
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const change_password = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('No token found');

      const { data } = await api.patch(
        '/change-password',
        { currentPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (error) {
      let errorMessage = 'Password change failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const customer_logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.get('/customer-logout');
      localStorage.removeItem('customerToken');
      return { message: 'Logged out successfully' };
    } catch (error) {
      localStorage.removeItem('customerToken');
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: decodeToken(localStorage.getItem('customerToken')),
    loading: false,
    error: null,
    success: null,
    passwordChange: {
      loading: false,
      error: null,
      success: null,
    },
  },
  reducers: {
    messageClear: (state) => {
      state.error = null;
      state.success = null;
      state.passwordChange.error = null;
      state.passwordChange.success = null;
    },
    user_reset: (state) => {
      state.userInfo = null;
      state.loading = false;
      state.error = null;
      state.success = null;
      state.passwordChange = {
        loading: false,
        error: null,
        success: null,
      };
      localStorage.removeItem('customerToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(customer_register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(customer_register.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = decodeToken(localStorage.getItem('customerToken'));
        state.success = payload.message || 'Registration successful';
      })
      .addCase(customer_register.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Login
      .addCase(customer_login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(customer_login.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = decodeToken(localStorage.getItem('customerToken'));
        state.success = payload.message || 'Login successful';
      })
      .addCase(customer_login.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get Customer Info
      .addCase(get_customer_info.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(get_customer_info.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload.customer;
      })
      .addCase(get_customer_info.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.userInfo = null;
      })
      // Update Customer Info
      .addCase(update_customer_info.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(update_customer_info.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload.customer;
        state.success = payload.message || 'Profile updated successfully';
      })
      .addCase(update_customer_info.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Change Password
      .addCase(change_password.pending, (state) => {
        state.passwordChange.loading = true;
        state.passwordChange.error = null;
        state.passwordChange.success = null;
      })
      .addCase(change_password.fulfilled, (state, { payload }) => {
        state.passwordChange.loading = false;
        state.passwordChange.success = payload.message || 'Password changed successfully';
      })
      .addCase(change_password.rejected, (state, { payload }) => {
        state.passwordChange.loading = false;
        state.passwordChange.error = payload;
      })
      // Logout
      .addCase(customer_logout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(customer_logout.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.success = 'Logged out successfully';
      })
      .addCase(customer_logout.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.userInfo = null;
      });
  },
});

export const { messageClear, user_reset } = authSlice.actions;
export default authSlice.reducer;