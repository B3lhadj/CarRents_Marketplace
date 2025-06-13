import axios from 'axios';
import {
  SUBSCRIPTION_REQUEST,
  SUBSCRIPTION_SUCCESS,
  SUBSCRIPTION_FAIL,
} from '../../Constants/subscriptionConstants';
import { api_url } from '../../utils/utils';

export const subscribeSeller = ({ sellerId, plan }) => async (dispatch, getState) => {
  try {
    dispatch({ type: SUBSCRIPTION_REQUEST });

    const { auth: { userInfo } } = getState();
    console.log('Auth state in subscribeSeller:', userInfo); // Debug log
    console.log('Auth state in subscribeSeller:', userInfo); // Debug log
    console.log('Auth state in subscribeSeller:', plan); // Debug log
    sellerId=userInfo.id;
    console.log('Auth state iqsdn d:', sellerId); // Debug log

    // Validate required fields
    if (!sellerId || !plan) {
      const error = new Error('Seller ID and plan are required');
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const { data } = await axios.post(
      `${api_url}/api/seller/subscribe`,
      { sellerId, plan },
      config
    );

    if (!data?.url) {
      const error = new Error('Payment URL not received from server');
      error.code = 'MISSING_URL';
      throw error;
    }

    dispatch({
      type: SUBSCRIPTION_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    let errorMessage = 'Subscription failed';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.code) {
      errorCode = error.code;
      errorMessage = error.message;
    } else if (error.response) {
      errorCode = `HTTP_${error.response.status}`;
      errorMessage = error.response.data?.message || error.response.statusText;
    } else if (error.request) {
      errorCode = 'NO_RESPONSE';
      errorMessage = 'Server did not respond';
    } else {
      errorCode = 'REQUEST_ERROR';
      errorMessage = error.message;
    }

    console.error('Subscription error:', { errorMessage, errorCode, error });

    dispatch({
      type: SUBSCRIPTION_FAIL,
      payload: { message: errorMessage, code: errorCode },
    });

    const normalizedError = new Error(errorMessage);
    normalizedError.code = errorCode;
    throw normalizedError;
  }
};