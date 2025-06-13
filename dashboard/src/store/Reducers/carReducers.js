// src/redux/reducers/carReducer.js

import {
  CREATE_CAR_REQUEST,
  CREATE_CAR_SUCCESS,
  CREATE_CAR_FAIL,
  GET_CARS_REQUEST,
  GET_CARS_SUCCESS,
  GET_CARS_FAIL,
} from '../actions/carActions';

// Initial state for car-related data
const initialState = {
  cars: [],
  car: null,
  loading: false,
  error: null,
};

// Car Reducer
const carReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CAR_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case CREATE_CAR_SUCCESS:
      return {
        ...state,
        loading: false,
        cars: [...state.cars, action.payload], // Add the new car to the list of cars
      };

    case CREATE_CAR_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case GET_CARS_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case GET_CARS_SUCCESS:
      return {
        ...state,
        loading: false,
        cars: action.payload,
      };

    case GET_CARS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default carReducer;
