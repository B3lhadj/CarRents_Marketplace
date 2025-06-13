import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  MapPin,
  Calendar as CalendarIcon,
  Search as SearchIcon,
  Car,
  CreditCard,
  Key,
  Star,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Menu,
  LogIn,
  User,
  Check,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TextField, Button, InputAdornment, MenuItem, Select } from "@mui/material";
import { Link } from "react-router-dom";

export default function Home() {
  const { userInfo } = useSelector(state => state.auth);
  const [pickupDate, setPickupDate] = useState(new Date("2023-04-22T09:00:00"));
  const [returnDate, setReturnDate] = useState(new Date("2023-04-24T11:00:00"));
  const [location, setLocation] = useState("");
  const [carType, setCarType] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="font-sans bg-gray-50">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          body {
            font-family: 'Inter', sans-serif;
          }

          .scrollbar-hidden::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hidden {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .bg-hero-gradient {
            background: linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%);
          }
          .car-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .car-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
          }
          .testimonial-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .testimonial-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          .btn-primary {
            background: linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%);
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(29, 78, 216, 0.3);
          }
          .nav-link {
            position: relative;
          }
          .nav-link:after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -2px;
            left: 0;
            background: linear-gradient(90deg, #1D4ED8, #3B82F6);
            transition: width 0.3s ease;
          }
          .nav-link:hover:after {
            width: 100%;
          }
          .section-shadow {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }
          .image-gradient-overlay::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
            border-radius: 8px;
          }
        `}
      </style>

    
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-16 px-4 md:px-8 bg-hero-gradient">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 space-y-6">
            <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">
              Plan your trip now
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Save <span className="text-blue-600">big</span> with our <br />
              car rental
            </h1>
            <p className="text-lg text-gray-600">
              Rent the car of your dreams. Unbeatable prices, unlimited miles,
              flexible pick-up options, and much more.
            </p>
            <div className="flex gap-4">
              <Link
                to="/signup"
                className="btn-primary text-white font-semibold py-3 px-6 rounded-md flex items-center"
              >
                Book Ride
                <Check className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="#how-it-works"
                className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-md flex items-center transition-colors"
              >
                Learn More
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center relative">
            <div className="image-gradient-overlay">
              <img
                src="/images/Car rental-rafiki.png"
                alt="Luxury rental car"
                className="w-full max-w-md object-cover rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="relative z-10 bg-white rounded-xl section-shadow p-6">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="flex flex-col md:flex-row flex-wrap gap-4 items-center">
              <TextField
                placeholder="Search your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                size="small"
                sx={{
                  flex: 1,
                  minWidth: "200px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    backgroundColor: "#F9FAFB",
                    "&:hover fieldset": {
                      borderColor: "#1D4ED8",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MapPin className="text-gray-400 h-5 w-5" />
                    </InputAdornment>
                  ),
                }}
              />
              <Select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                size="small"
                sx={{
                  flex: 1,
                  minWidth: "150px",
                  borderRadius: "8px",
                  backgroundColor: "#F9FAFB",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E5E7EB",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1D4ED8",
                  },
                }}
                IconComponent={() => <ChevronDown className="text-gray-400 h-5 w-5 mr-2" />}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="suv">SUV</MenuItem>
                <MenuItem value="sedan">Sedan</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="luxury">Luxury</MenuItem>
              </Select>
              <DateTimePicker
                value={pickupDate}
                onChange={(newValue) => setPickupDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{
                      flex: 1,
                      minWidth: "180px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#F9FAFB",
                        "&:hover fieldset": {
                          borderColor: "#1D4ED8",
                        },
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon className="text-gray-400 h-5 w-5" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <DateTimePicker
                value={returnDate}
                onChange={(newValue) => setReturnDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    sx={{
                      flex: 1,
                      minWidth: "180px",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#F9FAFB",
                        "&:hover fieldset": {
                          borderColor: "#1D4ED8",
                        },
                      },
                    }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon className="text-gray-400 h-5 w-5" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Button
                variant="contained"
                size="medium"
                sx={{
                  minWidth: "150px",
                  background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 100%)",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                  "&:hover": {
                    background: "linear-gradient(90deg, #1E40AF 0%, #2563EB 100%)",
                  },
                }}
                className="btn-primary"
              >
                <SearchIcon className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </LocalizationProvider>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Rent with 3 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl section-shadow hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <SearchIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Search for a Car</h3>
              <p className="text-gray-600 text-sm">
                Browse a wide range of vehicles tailored to your needs.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl section-shadow hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Make a Reservation</h3>
              <p className="text-gray-600 text-sm">
                Secure your booking with our fast and safe payment system.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl section-shadow hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-3">Pick Up Your Car</h3>
              <p className="text-gray-600 text-sm">
                Collect your vehicle and hit the road with ease!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-8 bg-gray-50 border-t border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <img src="https://cdn.worldvectorlogo.com/logos/toyota-1.svg" alt="Toyota" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://cdn.worldvectorlogo.com/logos/volvo-2.svg" alt="Volvo" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://cdn.worldvectorlogo.com/logos/mercedes-benz-6.svg" alt="Mercedes" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://cdn.worldvectorlogo.com/logos/bmw-3.svg" alt="BMW" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://cdn.worldvectorlogo.com/logos/audi-2.svg" alt="Audi" className="h-10 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-choose-us" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="image-gradient-overlay">
                <img
                  src="https://images.unsplash.com/photo-1494972308805-463bc619d34e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1473&q=80"
                  alt="Luxury car"
                  className="rounded-lg object-cover shadow-xl w-full h-[400px]"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Best Rental Experience Guaranteed</h2>
              <p className="text-gray-600 mb-8">
                We strive to deliver a seamless car rental experience, from booking to driving.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Diverse Vehicle Selection</h3>
                    <p className="text-gray-600 text-sm">From economy to luxury, find your perfect ride.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">Flexible Rental Plans</h3>
                    <p className="text-gray-600 text-sm">Rent daily, weekly, or monthly at great rates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">24/7 Support</h3>
                    <p className="text-gray-600 text-sm">Our team is here to help anytime, anywhere.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Car Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Top Car Rental Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg section-shadow overflow-hidden car-card">
              <div className="h-48 relative">
                <img
                  src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  alt="Toyota RAV4"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">Toyota RAV4</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Car className="w-4 h-4 mr-1" />
                  <span>SUV • Automatic</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-600">$45</span>
                    <span className="text-gray-600 text-sm">/day</span>
                  </div>
                  <Link to="/signup" className="btn-primary text-white text-sm px-4 py-2 rounded-md">
                    Rent Now
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg section-shadow overflow-hidden car-card">
              <div className="h-48 relative">
                <img
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  alt="Honda Civic"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">Honda Civic</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Car className="w-4 h-4 mr-1" />
                  <span>Sedan • Automatic</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-600">$38</span>
                    <span className="text-gray-600 text-sm">/day</span>
                  </div>
                  <Link to="/signup" className="btn-primary text-white text-sm px-4 py-2 rounded-md">
                    Rent Now
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg section-shadow overflow-hidden car-card">
              <div className="h-48 relative">
                <img
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                  alt="BMW 3 Series"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">BMW 3 Series</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Car className="w-4 h-4 mr-1" />
                  <span>Luxury • Automatic</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-600">$65</span>
                    <span className="text-gray-600 text-sm">/day</span>
                  </div>
                  <Link to="/signup" className="btn-primary text-white text-sm px-4 py-2 rounded-md">
                    Rent Now
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg section-shadow overflow-hidden car-card">
              <div className="h-48 relative">
                <img
                  src="https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1555&q=80"
                  alt="Mercedes C-Class"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900">Mercedes C-Class</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Car className="w-4 h-4 mr-1" />
                  <span>Luxury • Automatic</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-blue-600">$70</span>
                    <span className="text-gray-600 text-sm">/day</span>
                  </div>
                  <Link to="/signup" className="btn-primary text-white text-sm px-4 py-2 rounded-md">
                    Rent Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8">
            <Link to="/cars" className="flex items-center text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium">
              View all cars <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">What Our Customers Say</h2>
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hidden pb-4"
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="bg-white p-6 rounded-lg section-shadow flex-shrink-0 w-full sm:w-96 snap-start testimonial-card">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">5.0</span>
                </div>
                <p className="text-gray-600 mb-6">
                  "The rental process was smooth and hassle-free. The car was in excellent condition and perfect for our family trip."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah Johnson" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                    <p className="text-xs text-gray-500">New York, USA</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg section-shadow flex-shrink-0 w-full sm:w-96 snap-start testimonial-card">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">5.0</span>
                </div>
                <p className="text-gray-600 mb-6">
                  "Great service and a wide selection of cars. Booking was easy, and the support team was very responsive."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael Lee" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Michael Lee</h4>
                    <p className="text-xs text-gray-500">Los Angeles, USA</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg section-shadow flex-shrink-0 w-full sm:w-96 snap-start testimonial-card">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">4.0</span>
                </div>
                <p className="text-gray-600 mb-6">
                  "Good experience overall. The car was clean, but the pickup process took a bit longer than expected."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden">
                    <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Emma Davis" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Emma Davis</h4>
                    <p className="text-xs text-gray-500">Chicago, USA</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 btn-primary text-white p-2 rounded-full shadow-md hidden sm:block"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 btn-primary text-white p-2 rounded-full shadow-md hidden sm:block"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="bg-blue-600 rounded-xl overflow-hidden shadow-xl">
            <div className="grid md:grid-cols-2 items-center">
              <div className="p-8 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Download Rentcars <br />mobile app for FREE
                </h2>
                <p className="text-blue-100 mb-6">
                  Get exclusive deals and manage your bookings on the go with our mobile app.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                    </svg>
                    App Store
                  </button>
                  <button className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35zm7 2.5h7c.83 0 1.5-.67 1.5-1.5v-13l-8.5 8.5v6c0 .83.67 1.5 1.5 1.5zm7.5-13l4.5 4.5v-9l-4.5 4.5z" />
                    </svg>
                    Google Play
                  </button>
                </div>
              </div>
              <div className="hidden md:block relative h-full">
                <img
                  src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Mobile app screenshot"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Column 1: Logo and Social Links */}
            <div className="min-w-[180px]">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="relative w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="absolute w-4 h-4 border-2 border-white rotate-45 transform translate-x-0.5"></div>
                </div>
                <span className="text-base text-white font-bold">RentCars</span>
              </Link>
              <p className="text-gray-400 text-sm mb-4">
                The best car rental platform for your travel needs.
              </p>
              <div className="flex space-x-4">
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            </div>
            {/* Column 2: Company and Support Links - Stacked */}
            <div className="min-w-[180px] grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-4 uppercase">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      How We Work
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-4 uppercase">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Rental Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            {/* Column 3: Newsletter */}
            <div className="min-w-[180px]">
              <h3 className="text-sm font-semibold mb-4 uppercase">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to stay updated with our latest offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 text-white text-sm px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors text-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          {/* Footer bottom */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm text-center md:text-left mb-4 md:mb-0">
                © {new Date().getFullYear()} RentCars. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}