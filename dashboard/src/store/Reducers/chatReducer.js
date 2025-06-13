import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { api_url } from '../../utils/utils'

// Helper function for API calls
const makeApiCall = async (url, method, data, token) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
  
  try {
    const response = method === 'get' 
      ? await axios.get(url, config)
      : await axios.post(url, data, config)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

// Thunks
export const get_customers = createAsyncThunk(
  'chat/get_customers',
  async (sellerId, { getState, rejectWithValue }) => {
    try {
      // Validate sellerId exists
      if (!sellerId) {
        throw new Error('Seller ID is required');
      }

      const token = getState().auth.token;
      if (!token) {
        throw new Error('Authentication token missing');
      }

      return await makeApiCall(
        `${api_url}/api/chat/seller/get-customers/${sellerId}`,
        'get',
        null,
        token
      );
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch customers');
    }
  }
);

export const get_customer_message = createAsyncThunk(
  'chat/get_customer_message',
  async (customerId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      return await makeApiCall(
        `${api_url}/api/chat/seller/get-customer-message/${customerId}`,
        'get',
        null,
        token
      )
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const send_message = createAsyncThunk(
  'chat/send_message',
  async (info, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      return await makeApiCall(
        `${api_url}/api/chat/seller/send-message-to-customer`,
        'post',
        info,
        token
      )
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const get_sellers = createAsyncThunk(
  'chat/get_sellers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      return await makeApiCall(
        `${api_url}/api/chat/admin/get-sellers`,
        'get',
        null,
        token
      )
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const send_message_seller_admin = createAsyncThunk(
  'chat/send_message_seller_admin',
  async (info, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      return await makeApiCall(
        `${api_url}/api/chat/message-send-seller-admin`,
        'post',
        info,
        token
      )
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const get_admin_message = createAsyncThunk(
  'chat/get_admin_message',
  async (receverId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      return await makeApiCall(
        `${api_url}/api/chat/get-admin-messages/${receverId}`,
        'get',
        null,
        token
      )
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const get_seller_message = createAsyncThunk(
  'chat/get_seller_message',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token
      return await makeApiCall(
        `${api_url}/api/chat/get-seller-messages`,
        'get',
        null,
        token
      )
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    loading: false,
    successMessage: '',
    errorMessage: '',
    customers: [],
    messages: [],
    activeCustomer: {},
    activeSeller: {},
    sellers: [],
    seller_admin_messages: [],
    currentSeller: {},
    currentCustomer: {},
    notifications: []
  },
  reducers: {
    messageClear: (state) => {
      state.errorMessage = ''
      state.successMessage = ''
    },
    addNewMessage: (state, action) => {
      state.messages.push(action.payload)
    },
    addNewAdminMessage: (state, action) => {
      state.seller_admin_messages.push(action.payload)
    },
    setActiveCustomer: (state, action) => {
      state.activeCustomer = action.payload
    },
    setActiveSeller: (state, action) => {
      state.activeSeller = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Customers
      .addCase(get_customers.pending, (state) => {
        state.loading = true
      })
      .addCase(get_customers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.customers || []
      })
      .addCase(get_customers.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to fetch customers'
      })
      
      // Get Customer Messages
      .addCase(get_customer_message.pending, (state) => {
        state.loading = true
      })
      .addCase(get_customer_message.fulfilled, (state, action) => {
        state.loading = false
        state.messages = action.payload.messages || []
        state.currentCustomer = action.payload.currentCustomer || {}
      })
      .addCase(get_customer_message.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to fetch messages'
      })
      
      // Send Message
      .addCase(send_message.pending, (state) => {
        state.loading = true
      })
      .addCase(send_message.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push(action.payload.message)
        state.successMessage = 'Message sent successfully'
        
        // Update customers list to bring the recent chat to top
        const customerIndex = state.customers.findIndex(
          c => c.fdId === action.payload.message.receverId
        )
        
        if (customerIndex > 0) {
          const [customer] = state.customers.splice(customerIndex, 1)
          state.customers.unshift(customer)
        }
      })
      .addCase(send_message.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to send message'
      })
      
      // Get Sellers
      .addCase(get_sellers.pending, (state) => {
        state.loading = true
      })
      .addCase(get_sellers.fulfilled, (state, action) => {
        state.loading = false
        state.sellers = action.payload.sellers || []
      })
      .addCase(get_sellers.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to fetch sellers'
      })
      
      // Send Seller-Admin Message
      .addCase(send_message_seller_admin.pending, (state) => {
        state.loading = true
      })
      .addCase(send_message_seller_admin.fulfilled, (state, action) => {
        state.loading = false
        state.seller_admin_messages.push(action.payload.message)
        state.successMessage = 'Message sent successfully'
      })
      .addCase(send_message_seller_admin.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to send message'
      })
      
      // Get Admin Messages
      .addCase(get_admin_message.pending, (state) => {
        state.loading = true
      })
      .addCase(get_admin_message.fulfilled, (state, action) => {
        state.loading = false
        state.seller_admin_messages = action.payload.messages || []
        state.currentSeller = action.payload.currentSeller || {}
      })
      .addCase(get_admin_message.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to fetch messages'
      })
      
      // Get Seller Messages
      .addCase(get_seller_message.pending, (state) => {
        state.loading = true
      })
      .addCase(get_seller_message.fulfilled, (state, action) => {
        state.loading = false
        state.seller_admin_messages = action.payload.messages || []
      })
      .addCase(get_seller_message.rejected, (state, action) => {
        state.loading = false
        state.errorMessage = action.payload?.message || 'Failed to fetch messages'
      })
  }
})

export const {
  messageClear,
  addNewMessage,
  addNewAdminMessage,
  setActiveCustomer,
  setActiveSeller,
  addNotification,
  clearNotifications
} = chatSlice.actions

export default chatSlice.reducer