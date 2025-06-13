const router = require('express').Router();
const { authMiddleware } = require('../../middlewares/authMiddleware');
const productController = require('../../controllers/dashboard/productController');

// Route for adding a product
router.post('/product-add', authMiddleware, productController.add_product);

// Route for getting all products
router.get('/products-get', authMiddleware, productController.products_get);

// Route for getting a single product
router.get('/product-get/:productId', authMiddleware, productController.product_get);

// Route for updating a product
router.put('/product-update/:productId', productController.product_update);

// Route for updating product images
//router.put('/product-image-update/:productId', authMiddleware, productController.product_image_update);

// Route for deleting a product
router.delete('/product-delete/:productId', productController.product_delete);

module.exports = router;