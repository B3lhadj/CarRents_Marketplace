
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import store from './store';
import { NavbarProvider } from './context/NavbarContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shops from './pages/Shops';
import Card from './pages/Card';
import Details from './pages/Details';
import Register from './pages/Register';
import Login from './pages/Login';
import Shipping from './pages/Shipping';
import { useDispatch } from 'react-redux';
import { get_category } from './store/reducers/homeReducer';
import CategoryShops from './pages/CategoryShop';
import SearchProducts from './pages/SearchProducts';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import ProtectUser from './utils/ProtectUser';
import Index from './components/dashboard/Index';
import Orders from './components/dashboard/Orders';
import Wishlist from './components/dashboard/Wishlist';
import ChangePassword from './components/dashboard/ChangePassword';
import Order from './components/dashboard/Order';
import Chat from './components/dashboard/Chat';
import ConfirmOrder from './pages/ConfirmOrder';
import CarRental from './pages/CarRental';
import CarDetails from './pages/CarDetails';
import CarBooking from './pages/CarBooking';
import BookingView from './components/dashboard/BookingView';
import UserCarBookings from './pages/UserCarBookings';
// New pages for navbar links
/*import HowItWorks from './pages/HowItWorks';
import WhyChooseUs from './pages/WhyChooseUs';
import SellerRegister from './pages/SellerRegister';
import RentalDetails from './pages/RentalDetails';
import Support from './pages/Support';
//import About from './pages/About';
//import Contact from './pages/Contact';*/

function App() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState('light');

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#3B82F6' },
      background: {
        default: mode === 'dark' ? '#121212' : '#F5F5F5',
        paper: mode === 'dark' ? '#1e1e1e' : '#FFFFFF',
      },
    },
    shape: { borderRadius: 8 },
  });

  useEffect(() => {
    dispatch(get_category());
  }, [dispatch]);

  return (
    <Provider store={store}>
      <NavbarProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="max-w-screen min-h-screen">
            <BrowserRouter>
              <Routes>
                <Route element={<Layout setThemeMode={setMode} />}>
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Home />} />
                  <Route path="/shops" element={<Shops />} />
                  <Route path="/products" element={<CategoryShops />} />
                  <Route path="/products/search" element={<SearchProducts />} />
                  <Route path="/card" element={<Card />} />
                  <Route path="/order/confirm" element={<ConfirmOrder />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/product/details/:slug" element={<Details />} />

                  {/* Car Rental Routes */}
                  <Route path="/cars" element={<CarRental />} />
                  <Route path="/car/details/:id" element={<CarDetails />} />
                  <Route path="/car/booking/:id" element={<CarBooking />} />

                  {/* New Routes for Navbar Links
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/why-choose-us" element={<WhyChooseUs />} />
                  <Route path="/seller/register" element={<SellerRegister />} />
                  <Route path="/rental-details" element={<RentalDetails />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} /> */}

                  {/* User Dashboard Routes */}
                  <Route path="/dashboard" element={<ProtectUser />}>
                    <Route path="" element={<Dashboard />}>
                      <Route path="" element={<Index />} />
                      <Route path="my-orders" element={<Orders />} />
                      <Route path="request" element={<BookingView />} />
                      <Route path="my-wishlist" element={<Wishlist />} />
                      <Route path="order/details/:orderId" element={<Order />} />
                      <Route path="chage-password" element={<ChangePassword />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="chat/:sellerId" element={<Chat />} />
                      <Route path="my-car-bookings" element={<UserCarBookings />} />
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </div>
        </ThemeProvider>
      </NavbarProvider>
    </Provider>
  );
}

export default App;