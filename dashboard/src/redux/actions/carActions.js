// src/redux/actions/carActions.js

import axios from 'axios';

// Action Types
export const CREATE_CAR_REQUEST = 'CREATE_CAR_REQUEST';
export const CREATE_CAR_SUCCESS = 'CREATE_CAR_SUCCESS';
export const CREATE_CAR_FAIL = 'CREATE_CAR_FAIL';
export const GET_CARS_REQUEST = 'GET_CARS_REQUEST';
export const GET_CARS_SUCCESS = 'GET_CARS_SUCCESS';
export const GET_CARS_FAIL = 'GET_CARS_FAIL';

// Create car action
export const createCar = (carData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_CAR_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post('/api/cars/create', carData, config);

    dispatch({
      type: CREATE_CAR_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CREATE_CAR_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Get all cars action
export const getCars = () => async (dispatch) => {
  try {
    dispatch({ type: GET_CARS_REQUEST });

    const { data } = await axios.get('/api/cars');

    dispatch({
      type: GET_CARS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_CARS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
