import authReducer from './Reducers/authReducer'
import categoryReducer from './Reducers/categoryReducer'
import productReducer from './Reducers/productReducer'
import sellerReducer from './Reducers/sellerReducer'
import chatReducer from './Reducers/chatReducer'
import OrderReducer from './Reducers/OrderReducer'
import PaymentReducer from './Reducers/PaymentReducer'
import dashboardIndexReducer from './Reducers/dashboardIndexReducer'
import bannerReducer from './Reducers/bannerReducer'
import carReducer from './Reducers/carsReducer';
import { sellerSubscriptionReducer } from './Reducers/subscriptionReducer';
import bookingReducer from './Reducers/bookingReducer';

const rootReducer = {
    auth: authReducer,
    category: categoryReducer,
    product: productReducer,
    seller: sellerReducer,
    chat: chatReducer,
    order: OrderReducer,
    payment: PaymentReducer,
    dashboardIndex: dashboardIndexReducer,
    cars: carReducer,
    subscription: sellerSubscriptionReducer,
    booking: bookingReducer,  // Make sure this matches what you use in selectors
    

}
export default rootReducer