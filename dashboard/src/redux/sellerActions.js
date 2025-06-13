import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Update seller profile
export const updateSellerProfile = createAsyncThunk(
  'auth/updateSellerProfile',
  async ({ sellerId, userInfo, shopInfo }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.put(
        `/api/sellers/${sellerId}/profile`,
        { userInfo, shopInfo },
        config
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update profile'
      );
    }
  }
);

// Update seller password
export const updateSellerPassword = createAsyncThunk(
  'auth/updateSellerPassword',
  async ({ sellerId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.put(
        `/api/sellers/${sellerId}/password`,
        { currentPassword, newPassword },
        config
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update password'
      );
    }
  }
);

// Update seller email
export const updateSellerEmail = createAsyncThunk(
  'auth/updateSellerEmail',
  async ({ sellerId, newEmail, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const { data } = await axios.put(
        `/api/sellers/${sellerId}/email`,
        { newEmail, password },
        config
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update email'
      );
    }
  }
);

// Get seller profile
export const getSellerProfile = createAsyncThunk(
  'auth/getSellerProfile',
  async (sellerId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/sellers/${sellerId}/profile`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch profile'
      );
    }
  }
);