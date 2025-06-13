import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils.js';

export const get_seller_request = createAsyncThunk(
    'seller/get_seller_request',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const { token } = getState().auth;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.get(
                `${api_url}/api/requests?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,
                config
            );
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An error occurred' });
        }
    }
);

export const get_seller = createAsyncThunk(
    'seller/get_seller',
    async (sellerId, { rejectWithValue, fulfillWithValue, getState }) => {
        const { token } = getState().auth;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.get(`${api_url}/api/profile/${sellerId}`, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An error occurred' });
        }
    }
);

export const seller_status_update = createAsyncThunk(
    'seller/seller_status_update',
    async (info, { rejectWithValue, fulfillWithValue, getState }) => {
        const { token } = getState().auth;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.post(`${api_url}/api/status`, info, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An error occurred' });
        }
    }
);

export const get_active_sellers = createAsyncThunk(
    'seller/get_active_sellers',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const { token } = getState().auth;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.get(
                `${api_url}/api/active?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,
                config
            );
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An error occurred' });
        }
    }
);

export const get_deactive_sellers = createAsyncThunk(
    'seller/get_deactive_sellers',  // Fixed the name to be unique
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const { token } = getState().auth;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.get(
                `${api_url}/api/get-deactive-sellers?page=${page}&searchValue=${searchValue}&parPage=${parPage}`,
                config
            );
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An error occurred' });
        }
    }
);

export const create_stripe_connect_account = createAsyncThunk(
    'seller/create_stripe_connect_account',
    async (_, { getState, rejectWithValue }) => {
        const { token, userInfo } = getState().auth;
        
        if (!userInfo?.id) {
            return rejectWithValue({ message: 'User information not available' });
        }

        try {
            const { data } = await axios.post(
                `${api_url}/api/connect-stripe`,
                { sellerId: userInfo.id },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (data.onboardingUrl) {
                window.location.href = data.onboardingUrl; // Redirect to Stripe onboarding
                return data;
            }
            throw new Error('No redirect URL received from server');
        } catch (error) {
            return rejectWithValue(error.response?.data || { 
                message: error.message || 'Failed to create Stripe account'
            });
        }
    }
);

export const active_stripe_connect_account = createAsyncThunk(
    'seller/active_stripe_connect_account',
    async (activeCode, { rejectWithValue, fulfillWithValue, getState }) => {
        const { token } = getState().auth;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        try {
            const { data } = await axios.put(
                `${api_url}/api/payment/active-stripe-connect-account/${activeCode}`,
                {},
                config
            );
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'An error occurred' });
        }
    }
);

const initialState = {
    successMessage: '',
    errorMessage: '',
    loader: false,
    sellers: [],
    totalSeller: 0,
    seller: null,
    deactiveSellers: [],
    totalDeactiveSeller: 0
};

export const sellerReducer = createSlice({
    name: 'seller',
    initialState,
    reducers: {
        messageClear: (state) => {
            state.errorMessage = "";
            state.successMessage = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(get_seller_request.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers;
                state.totalSeller = payload.totalSeller;
            })
            .addCase(get_seller.fulfilled, (state, { payload }) => {
                state.seller = payload.seller;
            })
            .addCase(seller_status_update.fulfilled, (state, { payload }) => {
                state.seller = payload.seller;
                state.successMessage = payload.message;
            })
            .addCase(get_active_sellers.fulfilled, (state, { payload }) => {
                state.sellers = payload.sellers;
                state.totalSeller = payload.totalSeller;
            })
            .addCase(get_deactive_sellers.fulfilled, (state, { payload }) => {
                state.deactiveSellers = payload.sellers;
                state.totalDeactiveSeller = payload.totalSeller;
            })
            .addCase(active_stripe_connect_account.pending, (state) => {
                state.loader = true;
            })
            .addCase(active_stripe_connect_account.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload?.message || 'Failed to activate Stripe account';
            })
            .addCase(active_stripe_connect_account.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message;
            });
    }
});

export const { messageClear } = sellerReducer.actions;
export default sellerReducer.reducer;