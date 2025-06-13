import { configureStore } from '@reduxjs/toolkit';
import homeReducer from './reducers/homeReducer';
import authReducer from './reducers/authReducer';
import cardReducer from './reducers/cardReducer';
import orderReducer from './reducers/orderReducer';
import dashboardReducer from './reducers/dashboardReducer';
import chatReducer from './reducers/chatReducer';
import carReducer from './reducers/carReducer'; 
import bookingReducer from './reducers/bookingReducer';
// Add the carReducer import

// Combine all reducers into the rootReducers object
const rootReducers = {
  home: homeReducer,
  auth: authReducer,
  card: cardReducer,
  order: orderReducer,
  dashboard: dashboardReducer,
  chat: chatReducer,
  cars: carReducer,
  bookings: bookingReducer,
  // Add the cars reducer under the 'cars' key
};

// Create the Redux store with the combined reducers

export default rootReducers