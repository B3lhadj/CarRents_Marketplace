import React from 'react';

const UpdateBusinessInfo = () => {
    return (
        <div className="px-4 lg:px-8 py-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Business Information</h2>
                {/* Add your business info update form here */}
                <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter business name"
                            />
                        </div>
                        {/* Add more business info fields as needed */}
                    </div>
                    <button
                        type="submit"
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Update Business Info
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateBusinessInfo;