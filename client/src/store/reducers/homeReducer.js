import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// ==================== PRODUCT THUNKS ====================
export const get_category = createAsyncThunk(
  'product/get_category',
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get('/home/get-categorys');
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const get_products = createAsyncThunk(
  'product/get_products',
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get('/home/get-products');
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const get_product = createAsyncThunk(
  'product/get_product',
  async (slug, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/home/get-product/${slug}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const price_range_product = createAsyncThunk(
  'product/price_range_product',
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get('/home/price-range-latest-product');
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const query_products = createAsyncThunk(
  'product/query_products',
  async (query, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/home/query-products?category=${query.category}&rating=${query.rating}&lowPrice=${query.low}&highPrice=${query.high}&sortPrice=${query.sortPrice}&pageNumber=${query.pageNumber}&searchValue=${query.searchValue || ''}`
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const customer_review = createAsyncThunk(
  'review/customer_review',
  async (info, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post('/home/customer/submit-review', info);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const get_reviews = createAsyncThunk(
  'review/get_reviews',
  async ({ productId, pageNumber }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/home/customer/get-reviews/${productId}?pageNo=${pageNumber}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

// ==================== CAR THUNKS ====================
export const search_cars = createAsyncThunk(
  'car/search_cars',
  async ({ startDate, endDate, ville, carType }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/cars/search?startDate=${startDate}&endDate=${endDate}&ville=${ville}&carType=${carType}`
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const get_car_details = createAsyncThunk(
  'car/get_car_details',
  async (carId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/cars/${carId}`);
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

export const get_car_types = createAsyncThunk(
  'car/get_car_types',
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get('/cars/types');
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue(error.response.data || error.response);
    }
  }
);

const initialState = {
  // Product state
  categorys: [],
  products: [],
  totalProduct: 0,
  parPage: 4,
  latest_product: [],
  topRated_product: [],
  discount_product: [],
  priceRange: { low: 0, high: 100 },
  product: {},
  relatedProducts: [],
  moreProducts: [],
  
  // Review state
  successMessage: '',
  errorMessage: '',
  totalReview: 0,
  rating_review: [],
  reviews: [],
  
  // Car state
  cars: [],
  carTypes: [],
  carDetails: null,
  carLoading: false,
  carError: null,
  
  // Banner state
  banners: []
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    messageClear: (state) => {
      state.successMessage = "";
      state.errorMessage = "";
    },
    clear_car_error: (state) => {
      state.carError = null;
    },
    clear_car_results: (state) => {
      state.cars = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== PRODUCT REDUCERS ====================
      .addCase(get_category.fulfilled, (state, { payload }) => {
        state.categorys = payload.categorys;
      })
      .addCase(get_products.fulfilled, (state, { payload }) => {
        state.products = payload.products;
        state.latest_product = payload.latest_product;
        state.topRated_product = payload.topRated_product;
        state.discount_product = payload.discount_product;
      })
      .addCase(get_product.fulfilled, (state, { payload }) => {
        state.product = payload.product;
        state.relatedProducts = payload.relatedProducts;
        state.moreProducts = payload.moreProducts;
      })
      .addCase(price_range_product.fulfilled, (state, { payload }) => {
        state.latest_product = payload.latest_product;
        state.priceRange = payload.priceRange;
      })
      .addCase(query_products.fulfilled, (state, { payload }) => {
        state.products = payload.products;
        state.totalProduct = payload.totalProduct;
        state.parPage = payload.parPage;
      })
      .addCase(customer_review.fulfilled, (state, { payload }) => {
        state.successMessage = payload.message;
      })
      .addCase(get_reviews.fulfilled, (state, { payload }) => {
        state.reviews = payload.reviews;
        state.totalReview = payload.totalReview;
        state.rating_review = payload.rating_review;
      })
      
      // ==================== CAR REDUCERS ====================
      .addCase(search_cars.pending, (state) => {
        state.carLoading = true;
        state.carError = null;
      })
      .addCase(search_cars.fulfilled, (state, { payload }) => {
        state.carLoading = false;
        state.cars = payload.cars;
      })
      .addCase(search_cars.rejected, (state, { payload }) => {
        state.carLoading = false;
        state.carError = payload?.message || 'Failed to search cars';
      })
      
      .addCase(get_car_details.pending, (state) => {
        state.carLoading = true;
        state.carError = null;
      })
      .addCase(get_car_details.fulfilled, (state, { payload }) => {
        state.carLoading = false;
        state.carDetails = payload.car;
      })
      .addCase(get_car_details.rejected, (state, { payload }) => {
        state.carLoading = false;
        state.carError = payload?.message || 'Failed to get car details';
      })
      
      .addCase(get_car_types.fulfilled, (state, { payload }) => {
        state.carTypes = payload.carTypes;
      });
  }
});

export const { 
  messageClear, 
  clear_car_error,
  clear_car_results
} = homeSlice.actions;

export default homeSlice.reducer;