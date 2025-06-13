const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const cars = require('../../models/productModel');
const { responseReturn } = require('../../utiles/response');
const mongoose = require('mongoose');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true,
});

class ProductController {
  // Add new car product with complete validation
 add_product = async (req, res) => {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return responseReturn(res, 500, { error: 'Error parsing form data' });
      }

      try {
        // Enhanced required field validation
        const requiredFields = {
          name: { name: 'Car name', type: 'string' },
          brand: { name: 'Brand', type: 'string' },
          pricePerDay: { name: 'Price per day', type: 'number', min: 1 },
          transmission: { 
            name: 'Transmission', 
            type: 'enum', 
            values: ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'] 
          },
          fuelType: { 
            name: 'Fuel type', 
            type: 'enum', 
            values: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'] 
          },
          ville: { name: 'City', type: 'string' },
          pays: { name: 'Country', type: 'string' }
        };

        // Validate all required fields
        const validationErrors = [];
        const validatedFields = {};

        for (const [field, config] of Object.entries(requiredFields)) {
          if (!fields[field]) {
            validationErrors.push(`${config.name} is required`);
            continue;
          }

          switch (config.type) {
            case 'number':
              const numValue = parseFloat(fields[field]);
              if (isNaN(numValue)) {
                validationErrors.push(`${config.name} must be a number`);
              } else if (config.min !== undefined && numValue < config.min) {
                validationErrors.push(`${config.name} must be at least ${config.min}`);
              } else {
                validatedFields[field] = numValue;
              }
              break;

            case 'enum':
              if (!config.values.includes(fields[field])) {
                validationErrors.push(
                  `${config.name} must be one of: ${config.values.join(', ')}`
                );
              } else {
                validatedFields[field] = fields[field];
              }
              break;

            default: // string
              validatedFields[field] = fields[field].toString().trim();
          }
        }

        if (validationErrors.length > 0) {
          return responseReturn(res, 400, { 
            error: 'Validation failed',
            details: validationErrors
          });
        }

        // Process images
        let images = [];
        if (files.images) {
          const filesArray = Array.isArray(files.images) ? files.images : [files.images];
          
          for (const file of filesArray) {
            if (!file.mimetype.startsWith('image/')) {
              return responseReturn(res, 400, { 
                error: 'Only image files are allowed (JPEG, PNG, etc.)' 
              });
            }
            
            const result = await cloudinary.uploader.upload(file.filepath, {
              folder: 'cars',
              quality: 'auto:good',
              width: 1200,
              height: 800,
              crop: 'fill'
            });
            images.push(result.secure_url);
          }
        }

        // Process optional numeric fields with defaults
        const optionalNumericFields = {
          discount: { min: 0, max: 100, default: 0 },
          stock: { min: 1, default: 1 },
          year: { min: 1900, max: new Date().getFullYear() + 1 },
          mileage: { min: 0, default: 0 },
          seats: { min: 1, max: 12, default: 5 },
          rating: { min: 0, max: 5, default: 0 }
        };

        for (const [field, config] of Object.entries(optionalNumericFields)) {
          let value = parseFloat(fields[field]) || config.default;
          value = Math.max(config.min, value);
          if (config.max !== undefined) {
            value = Math.min(config.max, value);
          }
          validatedFields[field] = value;
        }

        // Create slug
        const cleanName = validatedFields.name.replace(/[^a-zA-Z0-9\s-]/g, '');
        const slug = cleanName.split(' ').join('-').toLowerCase();

        // Check for existing slug
        const existingCar = await cars.findOne({ slug });
        if (existingCar) {
          return responseReturn(res, 400, { 
            error: 'A car with this name already exists' 
          });
        }

        // Create car document
        const newCar = await cars.create({
          sellerId: req.id,
          name: cleanName,
          slug,
          brand: validatedFields.brand,
          pricePerDay: validatedFields.pricePerDay,
          transmission: validatedFields.transmission,
          fuelType: validatedFields.fuelType,
          ville: validatedFields.ville,
          pays: validatedFields.pays,
          images,
          discount: validatedFields.discount,
          stock: validatedFields.stock,
          year: validatedFields.year,
          mileage: validatedFields.mileage,
          seats: validatedFields.seats,
          rating: validatedFields.rating,
          // Optional fields
          category: fields.category?.trim(),
          description: fields.description?.trim(),
          shopName: fields.shopName?.trim() || 'My Car Shop',
          location: fields.location?.trim(),
          color: fields.color?.trim(),
          engine: fields.engine?.trim(),
          available: fields.available !== 'false',
          features: fields.features 
            ? fields.features.split(',').map(f => f.trim()).filter(f => f)
            : []
        });

        responseReturn(res, 201, { 
          message: "Car added successfully",
          product: newCar 
        });

      } catch (error) {
        console.error('Add product error:', error);
        responseReturn(res, 500, { 
          error: error.message || 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    });
  };

  // Get all products with pagination and filtering
  products_get = async (req, res) => {
    try {
      const { page = 1, perPage = 10, search, minPrice, maxPrice, brand, transmission } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(perPage);
      
      const query = { sellerId: req.id };
      
      // Search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.pricePerDay = {};
        if (minPrice) query.pricePerDay.$gte = parseFloat(minPrice);
        if (maxPrice) query.pricePerDay.$lte = parseFloat(maxPrice);
      }

      // Additional filters
      if (brand) query.brand = brand;
      if (transmission) query.transmission = transmission;

      const [products, total] = await Promise.all([
        cars.find(query)
          .skip(skip)
          .limit(parseInt(perPage))
          .sort({ createdAt: -1 }),
        cars.countDocuments(query)
      ]);

      responseReturn(res, 200, {
        products,
        pagination: {
          total,
          page: parseInt(page),
          perPage: parseInt(perPage),
          totalPages: Math.ceil(total / parseInt(perPage))
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      responseReturn(res, 500, { 
        error: 'Failed to fetch products',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Get single product details
  product_get = async (req, res) => {
    try {
      const product = await cars.findById(req.params.productId);
      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }
      
      // Get related products (same brand or category)
      const relatedProducts = await cars.find({
        $or: [
          { brand: product.brand },
          { category: product.category }
        ],
        _id: { $ne: product._id }
      }).limit(4).select('name brand pricePerDay images slug');

      responseReturn(res, 200, { 
        product,
        relatedProducts 
      });
    } catch (error) {
      console.error('Get product error:', error);
      responseReturn(res, 500, { 
        error: 'Failed to fetch product details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Update product details
product_update = async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body; // Direct JSON payload

        const updatedCar = await cars.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true }
        );

        res.status(200).json({ 
            message: "Car updated successfully",
            product: updatedCar 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
  // Delete product
  product_delete = async (req, res) => {
    try {
      const product = await cars.findById(req.params.productId);
      if (!product) {
        return responseReturn(res, 404, { error: "Product not found" });
      }

      // Delete images from Cloudinary
      await Promise.all(
        product.images.map(img => {
          const publicId = img.split('/').slice(-2).join('/').split('.')[0];
          return cloudinary.uploader.destroy(publicId).catch(console.error);
        })
      );

      await cars.findByIdAndDelete(req.params.productId);

      responseReturn(res, 200, { message: "Product deleted successfully" });
    } catch (error) {
      console.error('Delete product error:', error);
      responseReturn(res, 500, { 
        error: 'Failed to delete product',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

module.exports = new ProductController();