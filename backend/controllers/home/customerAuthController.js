const customerModel = require('../../models/customerModel');
const orderModel = require('../../models/bookingModel');
const { responseReturn } = require('../../utiles/response');
const { createToken } = require('../../utiles/tokenCreate');
const sellerCustomerModel = require('../../models/chat/sellerCustomerModel');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

class customerAuthController {
    // Register new customer with address and phone
    customer_register = async (req, res) => {
        const { name, email, password, phone, address } = req.body;

        try {
            // Validate input
            if (!name || !email || !password) {
                return responseReturn(res, 400, { error: 'Name, email and password are required' });
            }

            // Validate email format
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return responseReturn(res, 400, { error: 'Invalid email format' });
            }

            // Check if email exists
            const customer = await customerModel.findOne({ email });
            if (customer) {
                return responseReturn(res, 409, { error: 'Email already exists' });
            }

            // Create new customer with address and phone
            const createCustomer = await customerModel.create({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: await bcrypt.hash(password, 10),
                method: 'manually',
                phone: phone || null,
                address: address || null
            });

            // Create chat profile
            await sellerCustomerModel.create({
                myId: createCustomer.id
            });

            // Generate JWT token
            const token = await createToken({
                id: createCustomer.id,
                name: createCustomer.name,
                email: createCustomer.email,
                method: createCustomer.method
            });

            // Set cookie and respond
            res.cookie('customerToken', token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return responseReturn(res, 201, { 
                message: 'Registration successful',
                token,
                customer: {
                    id: createCustomer.id,
                    name: createCustomer.name,
                    email: createCustomer.email,
                    phone: createCustomer.phone,
                    address: createCustomer.address
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            return responseReturn(res, 500, { error: 'Internal server error' });
        }
    }
 changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { currentPassword, newPassword } = req.body;

    // 1. Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required"
      });
    }

    // 2. Find customer
    const customer = await customerModel.findById(id).select('+password');
    if (!customer || !customer.password) {
      return res.status(404).json({
        success: false,
        message: "Customer not found or password not set"
      });
    }

    // 3. Debug logging (temporary)
    console.log("Comparing passwords:", {
      currentPassword,
      storedHash: customer.password
    });

    // 4. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // 5. Update password
    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
    // Customer login
    customer_login = async (req, res) => {
        const { email, password } = req.body;

        try {
            // Validate input
            if (!email || !password) {
                return responseReturn(res, 400, { error: 'Email and password are required' });
            }

            // Find customer with password
            const customer = await customerModel.findOne({ email: email.trim().toLowerCase() }).select('+password');
            if (!customer) {
                return responseReturn(res, 404, { error: 'Customer not found' });
            }

            // Verify password
            const match = await bcrypt.compare(password, customer.password);
            if (!match) {
                return responseReturn(res, 401, { error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = await createToken({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                method: customer.method
            });

            // Set cookie and respond
            res.cookie('customerToken', token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return responseReturn(res, 200, { 
                message: 'Login successful',
                token,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    address: customer.address
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return responseReturn(res, 500, { error: 'Internal server error' });
        }
    }

    // Customer logout
    customer_logout = async (req, res) => {
        try {
            res.cookie('customerToken', '', {
                expires: new Date(Date.now()),
                httpOnly: true
            });
            return responseReturn(res, 200, { message: 'Logout successful' });
        } catch (error) {
            console.error('Logout error:', error);
            return responseReturn(res, 500, { error: 'Internal server error' });
        }
    }

    // Get customer info
 get_customer_info = async (req, res) => {
    try {
        // Get ID from req.user (set by verifyToken middleware)
        const { id } = req.user; // Changed from req to req.user
        
        console.log('Fetching customer with ID:', id); // Debug log
        
        const customer = await customerModel.findById(id).select('-password');
        
        if (!customer) {
            console.log('Customer not found for ID:', id); // Debug log
            return responseReturn(res, 404, { error: 'Customer not found' });
        }
        
        console.log('Customer found:', customer.email); // Debug log
        return responseReturn(res, 200, { customer });
    } catch (error) {
        console.error('Get customer info error:', error);
        return responseReturn(res, 500, { error: 'Internal server error' });
    }
}

    // Update customer info with address and phone
update_customer_info = async (req, res) => {
    const { id } = req.user;
    const updateData = req.body;

    try {
        // Remove password field if present (should be updated separately)
        delete updateData.password;

        // Update customer with whatever data was sent
        const updatedCustomer = await customerModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedCustomer) {
            return responseReturn(res, 404, { error: 'Customer not found' });
        }

        return responseReturn(res, 200, { 
            message: 'Profile updated successfully',
            customer: updatedCustomer
        });

    } catch (error) {
        console.error('Update error:', error);
        return responseReturn(res, 500, { 
            error: 'Failed to update profile'
        });
    }
};

    // Get dashboard data with enhanced statistics
    get_dashboard_data = async (req, res) => {
        const { id } = req;

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return responseReturn(res, 400, { error: 'Invalid customer ID' });
            }

            // Get counts for different order statuses
            const [
                totalOrders, 
                pendingOrders, 
                cancelledOrders, 
                completedOrders,
                recentOrders,
                totalSpent
            ] = await Promise.all([
                orderModel.countDocuments({ customerId: id }),
                orderModel.countDocuments({ customerId: id, status: 'pending' }),
                orderModel.countDocuments({ customerId: id, status: 'cancelled' }),
                orderModel.countDocuments({ customerId: id, status: 'completed' }),
                orderModel.find({ customerId: id })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate({
                        path: 'products.productId',
                        select: 'name price images discount',
                        model: 'Product'
                    })
                    .lean(),
                orderModel.aggregate([
                    { $match: { customerId: mongoose.Types.ObjectId(id), status: 'completed' } },
                    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
                ])
            ]);

            // Format recent orders
            const formattedRecentOrders = recentOrders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
                products: order.products.map(product => ({
                    name: product.productId.name,
                    price: product.productId.price,
                    discount: product.productId.discount || 0,
                    image: product.productId.images[0],
                    quantity: product.quantity
                }))
            }));

            return responseReturn(res, 200, {
                stats: {
                    totalOrders,
                    pendingOrders,
                    cancelledOrders,
                    completedOrders,
                    totalSpent: totalSpent[0]?.total || 0
                },
                recentOrders: formattedRecentOrders
            });

        } catch (error) {
            console.error('Dashboard error:', error);
            return responseReturn(res, 500, { error: 'Failed to fetch dashboard data' });
        }
    }

    // Delete customer account
    delete_customer_account = async (req, res) => {
        const { id } = req;
        const { password } = req.body;

        try {
            if (!password) {
                return responseReturn(res, 400, { error: 'Password is required' });
            }

            const customer = await customerModel.findById(id).select('+password');
            if (!customer) {
                return responseReturn(res, 404, { error: 'Customer not found' });
            }

            // Verify password
            const match = await bcrypt.compare(password, customer.password);
            if (!match) {
                return responseReturn(res, 401, { error: 'Invalid password' });
            }

            // Soft delete (recommended) or hard delete
            await customerModel.findByIdAndUpdate(id, { 
                isDeleted: true,
                deletedAt: new Date() 
            });

            // Clear cookie
            res.cookie('customerToken', '', {
                expires: new Date(Date.now()),
                httpOnly: true
            });

            return responseReturn(res, 200, { 
                message: 'Account deleted successfully' 
            });

        } catch (error) {
            console.error('Delete account error:', error);
            return responseReturn(res, 500, { error: 'Failed to delete account' });
        }
    }
}

module.exports = new customerAuthController(); 