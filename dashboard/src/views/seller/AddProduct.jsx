import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BsImages, BsCarFront, BsFuelPump, BsSpeedometer2, BsCalendar, BsCashCoin } from 'react-icons/bs';
import { IoCloseSharp, IoLocationOutline } from 'react-icons/io5';
import { FaCarAlt, FaGasPump, FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { GiCarWheel, GiGearStick } from 'react-icons/gi';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { PropagateLoader } from 'react-spinners';
import JoditEditor from 'jodit-react';
import { overrideStyle } from '../../utils/utils';
import { add_product, messageClear } from '../../store/Reducers/productReducer';

const AddProduct = () => {
  const editor = useRef(null);
  const [content, setContent] = useState('');
  
  const dispatch = useDispatch();
  const { successMessage, errorMessage, loader } = useSelector(state => state.product || {}); 
  const { userInfo } = useSelector(state => state.auth);

  // State for input values
  const [state, setState] = useState({
    name: '',
    discount: '',
    pricePerDay: '',
    brand: '',
    category: '',
    year: '',
    mileage: '',
    transmission: 'Automatic',
    fuelType: '',
    location: '',
    seats: '',
    color: '',
    engine: '',
    features: '',
    ville: '',
    pays: ''
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  // Images state
  const [images, setImages] = useState([]);
  const [imageShow, setImageShow] = useState([]);

  const imageHandle = (e) => {
    const files = e.target.files;
    const length = files.length;
    if (length > 0) {
      if (images.length + length > 10) {
        toast.error('You can upload maximum 10 images');
        return;
      }
      setImages([...images, ...files]);
      let imageUrl = [];
      for (let i = 0; i < length; i++) {
        imageUrl.push({ url: URL.createObjectURL(files[i]) });
      }
      setImageShow([...imageShow, ...imageUrl]);
    }
  };

  const changeImage = (img, index) => {
    if (img) {
      let tempUrl = [...imageShow];
      let tempImages = [...images];
      tempImages[index] = img;
      tempUrl[index] = { url: URL.createObjectURL(img) };
      setImages(tempImages);
      setImageShow(tempUrl);
    }
  };

  const removeImage = (i) => {
    const filterImage = images.filter((img, index) => index !== i);
    const filterImageUrl = imageShow.filter((img, index) => index !== i);
    setImages(filterImage);
    setImageShow(filterImageUrl);
  };

  const add = (e) => {
    e.preventDefault();
  
    if (!state.ville || !state.pays) {
      toast.error('Please select both city and country.');
      return;
    }
  
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
  
    const formData = new FormData();
    formData.append('name', state.name);
    formData.append('description', content);
    formData.append('pricePerDay', state.pricePerDay ? Number(state.pricePerDay) : 0);
    formData.append('category', state.category);
    formData.append('ville', state.ville);
    formData.append('pays', state.pays);
    formData.append('discount', state.discount ? Number(state.discount) : 0);
    formData.append('shopName', userInfo?.shopInfo?.shopName);
    formData.append('brand', state.brand);
    formData.append('year', state.year);
    formData.append('mileage', state.mileage);
    formData.append('transmission', state.transmission);
    formData.append('fuelType', state.fuelType);
    formData.append('location', state.location);
    formData.append('seats', state.seats);
    formData.append('color', state.color);
    formData.append('engine', state.engine);
    formData.append('features', state.features);
    
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }
  
    dispatch(add_product(formData));
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      // Reset form state
      setState({
        name: '',
        discount: '',
        pricePerDay: '',
        brand: '',
        category: '',
        year: '',
        mileage: '',
        transmission: 'Automatic',
        fuelType: '',
        location: '',
        seats: '',
        color: '',
        engine: '',
        features: '',
        ville: '',
        pays: ''
      });
      setImageShow([]);
      setImages([]);
      setContent('');
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [errorMessage, dispatch]);

  // Sample data for villes and pays
  const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'];
  const pays = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Espagne', 'Italie', 'Allemagne'];
  
  // Car categories
  const categories = [
    'Sedan',
    'SUV',
    'Sports Car',
    'Coupe',
    'Hatchback',
    'Convertible',
    'Minivan',
    'Pickup Truck',
    'Luxury',
    'Electric'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Add Rental Car</h1>
            <p className="text-gray-600">Fill in the details of your rental car</p>
          </div>
          <Link 
            to="/seller/dashboard/products" 
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>

        <form onSubmit={add} className="space-y-6">
          {/* Car Basic Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaCarAlt className="mr-2 text-indigo-600" />
              Car Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Car Model Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsCarFront className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={state.name}
                    onChange={inputHandle}
                    placeholder="e.g. Toyota Camry 2022"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCarAlt className="text-gray-400" />
                  </div>
                  <input
                    id="brand"
                    type="text"
                    name="brand"
                    value={state.brand}
                    onChange={inputHandle}
                    placeholder="e.g. Toyota, Honda, etc."
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={state.category}
                  onChange={inputHandle}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsCalendar className="text-gray-400" />
                  </div>
                  <input
                    id="year"
                    type="number"
                    name="year"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={state.year}
                    onChange={inputHandle}
                    placeholder="Manufacturing year"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  id="color"
                  type="text"
                  name="color"
                  value={state.color}
                  onChange={inputHandle}
                  placeholder="e.g. Red, Black, etc."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  required
                />
              </div>
            </div>
          </div>

          {/* Car Specifications Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <GiCarWheel className="mr-2 text-indigo-600" />
              Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                  Mileage (km)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BsSpeedometer2 className="text-gray-400" />
                  </div>
                  <input
                    id="mileage"
                    type="number"
                    name="mileage"
                    min="0"
                    value={state.mileage}
                    onChange={inputHandle}
                    placeholder="Current mileage"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GiGearStick className="text-gray-400" />
                  </div>
                  <select
                    id="transmission"
                    name="transmission"
                    value={state.transmission}
                    onChange={inputHandle}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                    <option value="CVT">CVT</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGasPump className="text-gray-400" />
                  </div>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={state.fuelType}
                    onChange={inputHandle}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <input
                  id="seats"
                  type="number"
                  name="seats"
                  min="1"
                  max="20"
                  value={state.seats}
                  onChange={inputHandle}
                  placeholder="e.g. 4, 5, 7"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  required
                />
              </div>

              <div>
                <label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">
                  Engine Capacity (cc)
                </label>
                <input
                  id="engine"
                  type="text"
                  name="engine"
                  value={state.engine}
                  onChange={inputHandle}
                  placeholder="e.g. 2000cc, 1.5L"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  required
                />
              </div>
            </div>
          </div>

          {/* Rental Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BsCashCoin className="mr-2 text-indigo-600" />
              Rental Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Day ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="pricePerDay"
                    type="number"
                    name="pricePerDay"
                    min="0"
                    step="0.01"
                    value={state.pricePerDay}
                    onChange={inputHandle}
                    placeholder="e.g. 50.00"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                  <input
                    id="discount"
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={state.discount}
                    onChange={inputHandle}
                    placeholder="e.g. 10"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoLocationOutline className="text-gray-400" />
                  </div>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={state.location}
                    onChange={inputHandle}
                    placeholder="Specific pickup address"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-indigo-600" />
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-gray-700 mb-1">
                  City (Ville)
                </label>
                <select
                  id="ville"
                  name="ville"
                  value={state.ville}
                  onChange={inputHandle}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  required
                >
                  <option value="">Select a city</option>
                  {villes.map((ville, index) => (
                    <option key={index} value={ville}>{ville}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="pays" className="block text-sm font-medium text-gray-700 mb-1">
                  Country (Pays)
                </label>
                <select
                  id="pays"
                  name="pays"
                  value={state.pays}
                  onChange={inputHandle}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                  required
                >
                  <option value="">Select a country</option>
                  {pays.map((pays, index) => (
                    <option key={index} value={pays}>{pays}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            <div className="rounded-md border border-gray-300 overflow-hidden">
              <JoditEditor
                ref={editor}
                value={content}
                onBlur={newContent => setContent(newContent)}
                onChange={() => {}}
                config={{
                  readonly: false,
                  toolbarAdaptive: false,
                  buttons: 'bold,italic,underline,ul,ol,font,fontsize,paragraph,lineHeight,link,image',
                  height: 300,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Describe the car features, condition, and any special notes for renters.</p>
          </div>

          {/* Features Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Features</h2>
            <textarea
              id="features"
              name="features"
              value={state.features}
              onChange={inputHandle}
              placeholder="List features separated by commas (e.g. GPS, Bluetooth, Sunroof, Heated Seats)"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border min-h-[100px]"
            />
          </div>

          {/* Images Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BsImages className="mr-2 text-indigo-600" />
              Car Images
            </h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                id="images"
                type="file"
                onChange={imageHandle}
                multiple
                accept="image/*"
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center text-center">
                  <BsImages className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload high-quality images (JPEG, PNG, WEBP) up to 10MB each
                  </p>
                  <p className="text-xs text-gray-500">Minimum 3 images recommended</p>
                </div>
              </label>
            </div>

            {imageShow.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Images ({imageShow.length}/10)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imageShow.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img.url} 
                        alt={`Preview ${index}`} 
                        className="h-32 w-full object-cover rounded-md border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-white bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <IoCloseSharp className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loader}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loader ? (
                <PropagateLoader size={10} color="#ffffff" cssOverride={overrideStyle} />
              ) : (
                <>
                  <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Rental Car
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;