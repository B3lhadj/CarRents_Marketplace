// src/store/reducers/paymentReducer.js

// Initial state for payments
const initialState = {
    payments: [],
    loading: false,
    error: null,
  };
  
  // Reducer function
  const paymentReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_PAYMENT':
        return {
          ...state,
          payments: [...state.payments, action.payload],
          loading: false,
          error: null,
        };
      case 'UPDATE_PAYMENT':
        return {
          ...state,
          payments: state.payments.map((payment) =>
            payment.id === action.payload.id ? action.payload : payment
          ),
          loading: false,
          error: null,
        };
      case 'DELETE_PAYMENT':
        return {
          ...state,
          payments: state.payments.filter((payment) => payment.id !== action.payload),
          loading: false,
          error: null,
        };
      case 'SET_PAYMENT_LOADING':
        return {
          ...state,
          loading: true,
          error: null,
        };
      case 'SET_PAYMENT_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  // Add initiatePayment function (for testing Bookingview)
  export const initiatePayment = (paymentData) => {
    // Placeholder logic for testing
    console.log('Initiating payment:', paymentData);
    return {
      id: Date.now(),
      ...paymentData,
      status: 'pending',
    };
  };
  
  export default paymentReducer;