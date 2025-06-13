import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { api_url } from '../../utils/utils';

// Helper function to extract role from token
const getRoleFromToken = (token) => {
  if (!token) return '';
  
  try {
    const decoded = jwt_decode(token);
    const expireTime = new Date(decoded.exp * 1000);
    
    if (new Date() > expireTime) {
      localStorage.removeItem('accessToken');
      return '';
    }
    return decoded.role;
  } catch (error) {
    localStorage.removeItem('accessToken');
    return '';
  }
};

// Async Thunks
export const admin_login = createAsyncThunk(
  'auth/admin_login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${api_url}/api/admin-login`, credentials);
      localStorage.setItem('accessToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);

export const seller_login = createAsyncThunk(
  'auth/seller_login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${api_url}/api/seller-login`, credentials, {
        withCredentials: true
      });
      localStorage.setItem('accessToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);

export const seller_register = createAsyncThunk(
  'auth/seller_register',
  async (sellerData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${api_url}/api/seller-register`, sellerData, {
        withCredentials: true
      });
      localStorage.setItem('accessToken', data.token);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Registration failed' });
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async ({ navigate, role }, { rejectWithValue }) => {
    try {
      localStorage.removeItem('accessToken');
      navigate(role === 'admin' ? '/admin/login' : '/login');
      return { message: 'Logged out successfully' };
    } catch (error) {
      return rejectWithValue({ error: 'Logout failed' });
    }
  }
);

export const profile_image_upload = createAsyncThunk(
  'auth/profile_image_upload',
  async (image, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const { data } = await axios.post(`${api_url}/api/profile-image-upload`, image, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Image upload failed' });
    }
  }
);

export const get_user_info = createAsyncThunk(
  'auth/get_user_info',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const { data } = await axios.get(`${api_url}/api/get-user`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch user info' });
    }
  }
);

export const update_business_info = createAsyncThunk(
  'auth/update_business_info',
  async (businessInfo, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const userId = getState().auth.userInfo?._id;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.put(
        `${api_url}/api/profile`, 
        businessInfo, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Business info update failed' });
    }
  }
);

export const update_password = createAsyncThunk(
  'auth/update_password',
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.put(
        `${api_url}/api/password`, 
        passwordData, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Password update failed' });
    }
  }
);

export const update_email = createAsyncThunk(
  'auth/update_email',
  async (emailData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.put(
        `${api_url}/api/email`, 
        emailData, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Email update failed' });
    }
  }
);

export const send_verification_email = createAsyncThunk(
  'auth/send_verification_email',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const { data } = await axios.post(
        `${api_url}/api/send-verification-email`, 
        {}, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to send verification email' });
    }
  }
);

export const create_stripe_connect_account = createAsyncThunk(
  'auth/create_stripe_connect_account',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const { data } = await axios.post(
        `${api_url}/api/connect-stripe`, 
        {}, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Stripe connection failed' });
    }
  }
);

export const add_car = createAsyncThunk(
  'auth/add_car',
  async (carData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post(
        `${api_url}/api/cars`, 
        carData, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to add car' });
    }
  }
);

export const seller_subscribe = createAsyncThunk(
  'auth/seller_subscribe',
  async (subscriptionData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const { data } = await axios.post(
        `${api_url}/api/subscribe`, 
        subscriptionData, 
        config
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Subscription failed' });
    }
  }
);

const initialState = {
  loader: false,
  userInfo: null,
  role: getRoleFromToken(localStorage.getItem('accessToken')),
  token: localStorage.getItem('accessToken'),
  successMessage: '',
  errorMessage: '',
  stripeLoading: false,
  stripeError: '',
  carLoading: false,
  subscriptionLoading: false,
  emailVerificationSent: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    messageClear: (state) => {
      state.successMessage = '';
      state.errorMessage = '';
      state.stripeError = '';
    },
    resetAuthState: (state) => {
      Object.assign(state, initialState);
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Common loading state
    
      
      // Admin login
      .addCase(admin_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.token = payload.token;
        state.role = getRoleFromToken(payload.token);
        state.successMessage = payload.message;
      })
      
      // Seller login
      .addCase(seller_login.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.token = payload.token;
        state.role = getRoleFromToken(payload.token);
        state.successMessage = payload.message;
      })
      
      // Seller registration
      .addCase(seller_register.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.token = payload.token;
        state.role = getRoleFromToken(payload.token);
        state.successMessage = payload.message;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.userInfo = null;
        state.role = '';
      })
      
      // Profile image upload
      .addCase(profile_image_upload.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = { 
          ...state.userInfo, 
          image: payload.imageUrl 
        };
        state.successMessage = 'Profile image updated successfully';
      })
      
      // Get user info
      .addCase(get_user_info.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = payload.userInfo;
      })
      
      // Update business info
    .addCase(update_business_info.fulfilled, (state, { payload }) => {
  state.loader = false;
  state.userInfo = {
    ...state.userInfo, // Keep existing info
    ...payload.updatedUser, // Merge all updated fields from server
    shopInfo: {
      ...state.userInfo?.shopInfo, // Keep existing shop info
      ...payload.shopInfo // Merge updated shop info
    }
  };
  state.successMessage = payload.message;
})

      
      // Update password
      .addCase(update_password.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
      })
      
      // Update email
      .addCase(update_email.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.userInfo = {
          ...state.userInfo,
          email: payload.newEmail,
          
          emailVerified: false
        };
        state.successMessage = payload.message;
      })
      
      // Send verification email
      .addCase(send_verification_email.fulfilled, (state) => {
        state.loader = false;
        state.emailVerificationSent = true;
        state.successMessage = 'Verification email sent';
      })
      
      // Stripe connect account
      .addCase(create_stripe_connect_account.pending, (state) => {
        state.stripeLoading = true;
      })
      .addCase(create_stripe_connect_account.fulfilled, (state, { payload }) => {
        state.stripeLoading = false;
        state.userInfo = {
          ...state.userInfo,
          stripeAccountId: payload.accountId,
          stripeAccountStatus: payload.status
        };
        state.successMessage = payload.message;
      })
      .addCase(create_stripe_connect_account.rejected, (state, { payload }) => {
        state.stripeLoading = false;
        state.stripeError = payload?.error || 'Stripe connection failed';
      })
      
      // Add car
      .addCase(add_car.pending, (state) => {
        state.carLoading = true;
      })
      .addCase(add_car.fulfilled, (state, { payload }) => {
        state.carLoading = false;
        state.successMessage = payload.message;
      })
      .addCase(add_car.rejected, (state, { payload }) => {
        state.carLoading = false;
        state.errorMessage = payload?.error || 'Failed to add car';
      })
      
      // Seller subscription
      .addCase(seller_subscribe.pending, (state) => {
        state.subscriptionLoading = true;
      })
      .addCase(seller_subscribe.fulfilled, (state, { payload }) => {
        state.subscriptionLoading = false;
        state.userInfo = {
          ...state.userInfo,
          subscription: payload.subscription
        };
        state.successMessage = payload.message;
      })
      .addCase(seller_subscribe.rejected, (state, { payload }) => {
        state.subscriptionLoading = false;
        state.errorMessage = payload?.error || 'Subscription failed';
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loader = true;
        }
      )
      // Common error handling
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loader = false;
          state.errorMessage = action.payload?.error || 'An error occurred';
          
          // Handle token expiration
          if (action.payload?.error === 'Token expired' || 
              action.payload?.error === 'Invalid token') {
            state.token = null;
            state.userInfo = null;
            state.role = '';
            localStorage.removeItem('accessToken');
          }
        }
      );
  }
});

export const { messageClear, resetAuthState, setUserInfo } = authSlice.actions;
export default authSlice.reducer;