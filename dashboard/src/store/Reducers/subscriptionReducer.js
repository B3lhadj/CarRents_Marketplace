import {
  SUBSCRIPTION_REQUEST,
  SUBSCRIPTION_SUCCESS,
  SUBSCRIPTION_FAIL,
  SUBSCRIPTION_RESET,
} from '../../Constants/subscriptionConstants';

export const sellerSubscriptionReducer = (state = { loading: false, subscription: null, error: null }, action) => {
  switch (action.type) {
    case SUBSCRIPTION_REQUEST:
      return { ...state, loading: true, error: null };
    case SUBSCRIPTION_SUCCESS:
      return { ...state, loading: false, subscription: action.payload, error: null };
    case SUBSCRIPTION_FAIL:
      return { ...state, loading: false, error: action.payload };
    case SUBSCRIPTION_RESET:
      return { loading: false, subscription: null, error: null };
    default:
      return state;
  }
};