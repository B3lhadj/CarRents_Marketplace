import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api_url } from '../../utils/config';

export const fetchCars = createAsyncThunk(
  'cars/fetchCars',
  async (params, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    try {
      const {
        page = 1,
        limit = 12,
        search = '',
        ville = '',
        pays = '',
        priceRange = [0, 1000],
        carTypes = [],
        minRating = 0,
        transmission = [],
        fuelType = []
      } = params;

      const [minPrice, maxPrice] = Array.isArray(priceRange) && priceRange.length === 2
        ? priceRange.map(Number)
        : [0, 1000];

      const response = await axios.get(`${api_url}/api/cars`, {
        params: {
          page,
          limit,
          search,
          ville,
          pays,
          minPrice,
          maxPrice,
          categories: carTypes.join(','),
          minRating,
          transmission: transmission.join(','),
          fuelType: fuelType.join(',')
        },
        ...config
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cars');
    }
  }
);

export const fetchCarById = createAsyncThunk(
  'cars/fetchCarById',
  async (id, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    try {
      const response = await axios.get(`${api_url}/api/cars/${id}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch car details');
    }
  }
);

export const checkCarAvailability = createAsyncThunk(
  'cars/checkCarAvailability',
  async ({ carId, startDate, endDate }, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    try {
      const response = await axios.post(
        `${api_url}/api/bookings/check-availability`,
        { carId, startDate, endDate },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

export const createBookingRequest = createAsyncThunk(
  'cars/createBookingRequest',
  async (bookingData, { rejectWithValue, getState }) => {
    const token = getState().auth.token;
    const config = {
      headers: {
        'authorization': `Bearer ${token}`
      }
    };
    try {
      const response = await axios.post(`${api_url}/api/bookings`, bookingData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking request');
    }
  }
);

const initialState = {
  cars: [],
  car: null,
  loading: false,
  error: null,
  availabilityError: null,
  bookingSuccess: false,
  filters: {
    search: '',
    ville: '',
    pays: '',
    priceRange: [0, 1000],
    carTypes: [],
    minRating: 0,
    transmission: [],
    fuelType: []
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCars: 0
  }
};

const carSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      const newPriceRange = Array.isArray(action.payload.priceRange) && 
                           action.payload.priceRange.length === 2
        ? action.payload.priceRange.map(Number)
        : state.filters.priceRange;

      state.filters = {
        ...state.filters,
        ...action.payload,
        priceRange: newPriceRange
      };
      state.pagination.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearBookingStatus: (state) => {
      state.bookingSuccess = false;
      state.error = null;
      state.availabilityError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload?.cars ?? [];
        state.pagination = {
          currentPage: action.payload?.currentPage ?? 1,
          totalPages: action.payload?.totalPages ?? 1,
          totalCars: action.payload?.totalCars ?? 0
        };
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.cars = [];
      })
      .addCase(fetchCarById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.car = null;
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.loading = false;
        state.car = action.payload;
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.car = null;
      })
      .addCase(checkCarAvailability.pending, (state) => {
        state.loading = true;
        state.availabilityError = null;
      })
      .addCase(checkCarAvailability.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(checkCarAvailability.rejected, (state, action) => {
        state.loading = false;
        state.availabilityError = action.payload;
      })
      .addCase(createBookingRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(createBookingRequest.fulfilled, (state) => {
        state.loading = false;
        state.bookingSuccess = true;
      })
      .addCase(createBookingRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookingSuccess = false;
      });
  }
});

export const { setFilters, resetFilters, setPage, clearBookingStatus } = carSlice.actions;
export default carSlice.reducer;