import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/utils';

// Add Product
export const add_product = createAsyncThunk(
    'product/add_product',
    async (product, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
        try {
            const { data } = await axios.post(`${api_url}/api/product-add`, product, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : { error: 'Something went wrong' });
        }
    }
);

// Update Product
export const update_product = createAsyncThunk(
    'product/updateProduct',
    async ({ productId, productData }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;

        if (!token) {
            return rejectWithValue({ error: 'No authentication token found' });
        }

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };

        try {
            const { data } = await axios.put(`${api_url}/api/product-update/${productId}`, productData, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response?.data || { error: 'Failed to update product' });
        }
    }
);

// Product Image Update
export const product_image_update = createAsyncThunk(
    'product/product_image_update',
    async ({ oldImage, newImage, productId }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
        try {
            const formData = new FormData();
            formData.append('oldImage', oldImage);
            formData.append('newImage', newImage);
            formData.append('productId', productId);
            const { data } = await axios.post(`${api_url}/api/product-image-update`, formData, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : { error: 'Something went wrong' });
        }
    }
);

// Get Products
export const get_products = createAsyncThunk(
    'product/get_products',
    async ({ parPage, page, searchValue }, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
        try {
            const { data } = await axios.get(`${api_url}/api/products-get?page=${page}&&searchValue=${searchValue}&&parPage=${parPage}`, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : { error: 'Something went wrong' });
        }
    }
);

// Get Product
export const get_product = createAsyncThunk(
    'product/get_product',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
        try {
            const { data } = await axios.get(`${api_url}/api/product-get/${productId}`, config);
            return fulfillWithValue(data);
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : { error: 'Something went wrong' });
        }
    }
);

// Delete Product
export const delete_product = createAsyncThunk(
    'product/delete_product',
    async (productId, { rejectWithValue, fulfillWithValue, getState }) => {
        const token = getState().auth.token;
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
        try {
            const { data } = await axios.delete(`${api_url}/api/product-delete/${productId}`, config);
            return fulfillWithValue({ productId, message: data.message });
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : { error: 'Something went wrong' });
        }
    }
);

export const productReducer = createSlice({
    name: 'product',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        products: [],
        product: '',
        totalProduct: 0,
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = '';
            state.successMessage = '';
        },
    },
    extraReducers: {
        [add_product.pending]: (state) => {
            state.loader = true;
        },
        [add_product.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload.error;
        },
        [add_product.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message;
        },
        [get_products.fulfilled]: (state, { payload }) => {
            state.totalProduct = payload.totalProduct;
            state.products = payload.products;
        },
        [get_product.fulfilled]: (state, { payload }) => {
            state.product = payload.product;
        },
        [update_product.pending]: (state) => {
            state.loader = true;
        },
        [update_product.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload.error;
        },
        [update_product.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.product = payload.product;
            state.successMessage = payload.message;
        },
        [product_image_update.fulfilled]: (state, { payload }) => {
            state.product = payload.product;
            state.successMessage = payload.message;
        },
        [delete_product.pending]: (state) => {
            state.loader = true;
        },
        [delete_product.rejected]: (state, { payload }) => {
            state.loader = false;
            state.errorMessage = payload.error;
        },
        [delete_product.fulfilled]: (state, { payload }) => {
            state.loader = false;
            state.successMessage = payload.message;
            // Remove the deleted product from the list
            state.products = state.products.filter((product) => product._id !== payload.productId);
        },
    },
});

export const { messageClear } = productReducer.actions;
export default productReducer.reducer;
