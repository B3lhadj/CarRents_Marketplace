const express = require('express');
const router = express.Router();
const cars = require('../../models/productModel'); // Adjust path to your model

// GET /api/cars - Fetch all cars with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search = '',
      minPrice = 0,
      maxPrice = 1000,
      carTypes = '',
      minRating = 0,
      transmission = '',
      fuelType = '',
      ville = '',
      pays = ''
    } = req.query;

    const query = { available: true }; // Add availability filter

    // Log the query parameters
    console.log('Query Parameters:', req.query);

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { 'sellerId.shopInfo.agencyName': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    query.pricePerDay = { $gte: Number(minPrice), $lte: Number(maxPrice) };

    // Car type filter
    if (carTypes) {
      query.category = { $in: carTypes.split(',') }; // Changed from carType to category to match your schema
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Transmission filter
    if (transmission) {
      query.transmission = { $in: transmission.split(',') };
    }

    // Fuel type filter
    if (fuelType) {
      query.fuelType = { $in: fuelType.split(',') };
    }

    // Ville (city) filter
    if (ville) {
      query.ville = { $regex: new RegExp(ville, 'i') }; // Case-insensitive search
    }

    // Pays (country) filter
    if (pays) {
      query.pays = { $regex: new RegExp(pays, 'i') }; // Case-insensitive search
    }

    // Log the constructed query
    console.log('MongoDB Query:', query);

    const carsList = await cars.find(query)
      .populate({
        path: 'sellerId',
        select: 'name email phone shopInfo image',
        model: 'sellers'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await cars.countDocuments(query);

    // Log the results
    console.log('Cars Found:', carsList.length);
    console.log('Total Count:', count);

    res.json({
      cars: carsList,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCars: count
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/cars/:id - Fetch a single car by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Log the requested ID
    console.log('Fetching car with ID:', id);

    // Find the car by ID and populate the sellerId field
    const car = await cars.findById(id)
      .populate({
        path: 'sellerId',
        select: 'name email phone shopInfo image',
        model: 'sellers'
      })
      .exec();

    // If car not found, return a 404 error
    if (!car) {
      console.log('Car not found for ID:', id);
      return res.status(404).json({ message: 'Car not found' });
    }

    // Log the found car
    console.log('Car Found:', car);

    // Return the car data
    res.json(car);
  } catch (error) {
    console.error('Error fetching car by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;