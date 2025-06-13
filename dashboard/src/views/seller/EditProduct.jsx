import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PropagateLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import {
  BsCarFront, BsFuelPump, BsSpeedometer2, BsCalendar, BsCashCoin, BsImages, BsX,
} from 'react-icons/bs';
import { FaCarAlt, FaGasPump, FaMapMarkerAlt } from 'react-icons/fa';
import { GiCarWheel, GiGearStick } from 'react-icons/gi';
import { IoLocationOutline } from 'react-icons/io5';
import JoditEditor from 'jodit-react';
import { get_product, messageClear, update_product } from '../../store/Reducers/productReducer';
import { overrideStyle } from '../../utils/utils';

const EditProduct = () => {
  const editor = useRef(null);
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loader, errorMessage, successMessage } = useSelector(state => state.product || {});
  const { userInfo } = useSelector(state => state.auth);

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
    pays: '',
  });

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imageShow, setImageShow] = useState([]);

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const imageHandle = (e) => {
    const files = e.target.files;
    const newImages = [];
    const newImageShow = [];

    Array.from(files).forEach((file) => {
      newImages.push(file);
      newImageShow.push({ url: URL.createObjectURL(file) });
    });

    setImages([...images, ...newImages]);
    setImageShow([...imageShow, ...newImageShow]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImageShow(imageShow.filter((_, i) => i !== index));
  };

  useEffect(() => {
    console.log("productId:", productId);
    if (!productId || productId === "undefined") {
      toast.error("Invalid product ID");
      navigate("/seller/dashboard/products");
    } else {
      dispatch(get_product(productId));
    }
  }, [dispatch, productId, navigate]);

  const update = (e) => {
    e.preventDefault();

    if (!state.ville || !state.pays) {
      toast.error('Please select both city and country.');
      return;
    }

    if (!state.name || !state.brand || !state.category || !state.year || !state.pricePerDay) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const productData = {
      name: state.name,
      description: content,
      pricePerDay: Number(state.pricePerDay) || 0,
      category: state.category,
      ville: state.ville,
      pays: state.pays,
      discount: Number(state.discount) || 0,
      shopName: userInfo?.shopInfo?.shopName || '',
      brand: state.brand,
      year: Number(state.year) || undefined,
      mileage: Number(state.mileage) || undefined,
      transmission: state.transmission,
      fuelType: state.fuelType,
      location: state.location,
      seats: Number(state.seats) || undefined,
      color: state.color,
      engine: state.engine,
      features: state.features,
    };

    dispatch(update_product({ productId, productData }));
  };

  useEffect(() => {
    if (product && product.name) {
      setState({
        name: product.name || '',
        discount: product.discount || '',
        pricePerDay: product.price || '',
        brand: product.brand || '',
        category: product.category || '',
        year: product.year || '',
        mileage: product.mileage || '',
        transmission: product.transmission || 'Automatic',
        fuelType: product.fuelType || '',
        location: product.location || '',
        seats: product.seats || '',
        color: product.color || '',
        engine: product.engine || '',
        features: product.features || '',
        ville: product.ville || '',
        pays: product.pays || '',
      });
      setContent(product.description || '');
      if (product.images && product.images.length > 0) {
        setImageShow(product.images.map((img) => ({ url: img })));
      }
    }
  }, [product]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate('/seller/dashboard/products');
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'];
  const pays = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Espagne', 'Italie', 'Allemagne'];
  const categories = [
    'Sedan', 'SUV', 'Sports Car', 'Coupe', 'Hatchback', 'Convertible', 'Minivan', 'Pickup Truck', 'Luxury', 'Electric',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Rental Car</h1>
            <p className="text-gray-600">Update the details of your rental car</p>
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

        <form onSubmit={update} className="space-y-6">
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
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            <div className="rounded-md border border-gray-300 overflow-hidden">
              <JoditEditor
                ref={editor}
                value={content}
                onBlur={(newContent) => setContent(newContent)}
                onChange={() => {}}
                config={{
                  readonly: false,
                  toolbarAdaptive: false,
                  buttons: 'bold,italic,underline,ul,ol,font,fontsize,paragraph,lineHeight,link',
                  height: 300,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Describe the car features, condition, and any special notes for renters.</p>
          </div>
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
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <BsImages className="mr-2 text-indigo-600" />
              Images
            </h2>
            <div className="mb-4">
              <label
                htmlFor="images"
                className="block w-full text-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <BsImages className="mx-auto text-gray-400 text-2xl mb-2" />
                <span className="text-sm text-gray-600">Click to upload car images</span>
                <input
                  id="images"
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={imageHandle}
                  className="hidden"
                />
              </label>
            </div>
            {imageShow.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageShow.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Car ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <BsX size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">Note: Images are for display only and will not be saved.</p>
          </div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Rental Car
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;