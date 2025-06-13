import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { PropagateLoader } from 'react-spinners';
import { BsImage } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import Pagination from '../Pagination';
import Search from '../components/Search';
import { categoryAdd, messageClear, get_category } from '../../store/Reducers/categoryReducer';

const Category = () => {
  const dispatch = useDispatch();
  const { loader, successMessage, errorMessage, categorys } = useSelector((state) => state.category);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [parPage, setParPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [imageShow, setImageShow] = useState('');
  const [state, setState] = useState({
    name: '',
    image: '',
    description: '',
  });

  // Handle image upload with drag-and-drop support
  const imageHandle = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length > 0) {
      setImageShow(URL.createObjectURL(files[0]));
      setState({ ...state, image: files[0] });
    }
  };

  // Drag-and-drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.target.classList.add('border-indigo-500');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.target.classList.remove('border-indigo-500');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    imageHandle(e);
    e.target.classList.remove('border-indigo-500');
  };

  // Add category
  const add_category = (e) => {
    e.preventDefault();
    dispatch(categoryAdd(state));
  };

  // Clear messages and reset form
  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      setState({ name: '', image: '', description: '' });
      setImageShow('');
      setShowModal(false);
    }
  }, [successMessage, errorMessage, dispatch]);

  // Fetch categories
  useEffect(() => {
    const obj = {
      parPage: parseInt(parPage),
      page: parseInt(currentPage),
      searchValue,
    };
    dispatch(get_category(obj));
  }, [searchValue, currentPage, parPage, dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Car Categories</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Search setParPage={setParPage} setSearchValue={setSearchValue} searchValue={searchValue} />
        <select
          className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-gray-800 dark:text-gray-200"
          onChange={(e) => setParPage(e.target.value)}
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
        </select>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorys.map((d, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <img src={d.image} alt={d.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{d.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{d.description || 'No description'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cars Available: {d.carCount || 'N/A'}</p>
              <div className="flex justify-end gap-2 mt-4">
                <button className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                  <FaEdit />
                </button>
                <button className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end">
        <Pagination
          pageNumber={currentPage}
          setPageNumber={setCurrentPage}
          totalItem={50}
          parPage={parPage}
          showItem={4}
        />
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Add Car Category</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 dark:text-gray-400">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={add_category}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Name
                </label>
                <input
                  value={state.name}
                  onChange={(e) => setState({ ...state, name: e.target.value })}
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 mt-1 bg-gray-100 dark:bg-gray-700 border rounded-lg text-gray-800 dark:text-gray-200"
                  placeholder="e.g., Sedan"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={state.description}
                  onChange={(e) => setState({ ...state, description: e.target.value })}
                  id="description"
                  className="w-full px-4 py-2 mt-1 bg-gray-100 dark:bg-gray-700 border rounded-lg text-gray-800 dark:text-gray-200"
                  placeholder="Describe this category"
                  rows="4"
                />
              </div>
              <div className="mb-4">
                <label
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-indigo-500"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  htmlFor="image"
                >
                  {imageShow ? (
                    <img src={imageShow} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
                      <BsImage className="text-2xl" />
                      <span>Drop or Click to Upload Image</span>
                    </div>
                  )}
                  <input
                    onChange={imageHandle}
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={loader}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center"
              >
                {loader ? <PropagateLoader color="#fff" size={10} /> : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;