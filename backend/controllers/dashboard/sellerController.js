const sellers = require('../../models/sellerModel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { responseReturn } = require('../../utiles/response');
const carModel = require('../../models/productModel');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.stripe_key);

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class SellerController {
  getVehicleCount = async (req, res) => {
  try {
    const sellerId = req.user?._id;
    if (!sellerId) {
      return responseReturn(res, 401, { error: 'Authentication required' });
    }

    const count = await carModel.countDocuments({ sellerId });

    responseReturn(res, 200, { totalVehicles: count });
  } catch (error) {
    console.error('Error fetching vehicle count:', error);
    responseReturn(res, 500, {
      error: 'Server error while fetching vehicle count',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get booking counts
getBookingCounts = async (req, res) => {
  try {
    const sellerId = req.user?._id;
    if (!sellerId) {
      return responseReturn(res, 401, { error: 'Authentication required' });
    }

    const [totalBookings, pendingBookings] = await Promise.all([
      carModel.aggregate([
        { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'carId',
            as: 'bookings'
          }
        },
        { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },
        { $count: 'total' }
      ]),
      carModel.aggregate([
        { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'carId',
            as: 'bookings'
          }
        },
        { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },
        { $match: { 'bookings.status': 'pending' } },
        { $count: 'pending' }
      ])
    ]);

    responseReturn(res, 200, {
      totalBookings: totalBookings[0]?.total || 0,
      pendingBookings: pendingBookings[0]?.pending || 0
    });
  } catch (error) {
    console.error('Error fetching booking counts:', error);
    responseReturn(res, 500, {
      error: 'Server error while fetching booking counts',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
  // Get seller profile
  getProfile = async (req, res) => {
    try {
      const seller = await sellers.findById(req.params.sellerId)
        .select('-password -__v')
        .populate('subscription', 'plan status endDate carLimit');

      if (!seller) {
        return responseReturn(res, 404, { error: 'Seller not found' });
      }

      responseReturn(res, 200, { seller });
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      responseReturn(res, 500, { 
        error: 'Server error while fetching profile',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Update seller profile
  updateProfile = async (req, res) => {
    // Get seller ID from authenticated user (more secure than using params)
    const sellerId = req.user._id;  // Changed from req.id to req.user._id

    if (!sellerId) {
        return responseReturn(res, 400, { 
            error: 'Seller ID is missing or unauthorized',
            code: 'MISSING_SELLER_ID'
        });
    }

    const updateData = req.body;

    try {
        // Validate request body
        if (!updateData || Object.keys(updateData).length === 0) {
            return responseReturn(res, 400, {
                error: 'No update data provided',
                code: 'EMPTY_UPDATE_DATA'
            });
        }

        // List of protected fields that cannot be updated
        const protectedFields = [
            '_id', 'password', 'role', 'status', 
            'payment', 'subscription', 'email',
            'createdAt', 'updatedAt', 'tokens'
        ];

        // Remove protected fields from update data
        protectedFields.forEach(field => {
            if (updateData[field]) {
                delete updateData[field];
                console.warn(`Attempted to update protected field: ${field}`);
            }
        });

        // Validate specific fields if needed
        if (updateData.phone) {
            const phoneRegex = /^[0-9]{10,15}$/;
            if (!phoneRegex.test(updateData.phone)) {
                return responseReturn(res, 400, {
                    error: 'Invalid phone number format',
                    code: 'INVALID_PHONE'
                });
            }
        }

        const updatedSeller = await sellers.findByIdAndUpdate(
            sellerId,
            { $set: updateData },
            { 
                new: true,
                runValidators: true,
                context: 'query'  // Ensures validators run with the update
            }
        ).select('-password -__v -tokens');

        if (!updatedSeller) {
            return responseReturn(res, 404, {
                error: 'Seller not found',
                code: 'SELLER_NOT_FOUND'
            });
        }

        // Log the profile update
        console.log(`Profile updated for seller: ${sellerId}`);

        responseReturn(res, 200, {
            success: true,
            message: 'Profile updated successfully',
            seller: updatedSeller,
            updatedAt: updatedSeller.updatedAt
        });

    } catch (error) {
        console.error('Error updating seller profile:', error);
        
        // Handle specific Mongoose errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return responseReturn(res, 400, {
                error: 'Validation failed',
                details: errors,
                code: 'VALIDATION_ERROR'
            });
        }

        responseReturn(res, 500, { 
            error: 'Server error while updating profile',
            code: 'SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
  // Update seller password
  updatePassword = async (req, res) => {
    // Get seller ID from the authenticated user (set by authMiddleware)
    const sellerId = req.user._id; // Using req.user._id as set by your authMiddleware
    
    const { currentPassword, newPassword } = req.body;

    // Validate password fields exist
    if (!currentPassword || !newPassword) {
        return responseReturn(res, 400, { 
            error: 'Both currentPassword and newPassword are required' 
        });
    }

    // Validate password complexity (optional but recommended)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return responseReturn(res, 400, { 
            error: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
        });
    }

    try {
        const seller = await sellers.findById(sellerId).select('+password');
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, seller.password);
        if (!isMatch) {
            return responseReturn(res, 401, { error: 'Current password is incorrect' });
        }

        // Check if new password is different
        if (currentPassword === newPassword) {
            return responseReturn(res, 400, { 
                error: 'New password must be different from current password' 
            });
        }

        // Hash and save new password
        seller.password = await bcrypt.hash(newPassword, 10);
        await seller.save();

        // Send email notification (don't block if this fails)
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: seller.email,
                subject: 'Password Changed Successfully',
                html: `
                    <h2>Password Update Notification</h2>
                    <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
                    <p>If you didn't make this change, please contact support immediately.</p>
                `
            });
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        responseReturn(res, 200, { 
            message: 'Password updated successfully',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error updating password:', error);
        responseReturn(res, 500, { 
            error: 'Server error while updating password',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

  // Update seller email
  updateEmail = async (req, res) => {
    try {
        // Get seller ID from authenticated user (more secure than params)
        const sellerId = req.user._id;
        const { newEmail, currentPassword } = req.body;

        // Validate input
        if (!newEmail || !currentPassword) {
            return responseReturn(res, 400, { 
                error: 'Both newEmail and currentPassword are required',
                code: 'MISSING_FIELDS'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            return responseReturn(res, 400, {
                error: 'Invalid email format',
                code: 'INVALID_EMAIL'
            });
        }

        // Find seller with password
        const seller = await sellers.findById(sellerId).select('+password');
        if (!seller) {
            return responseReturn(res, 404, {
                error: 'Seller not found',
                code: 'SELLER_NOT_FOUND'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, seller.password);
        if (!isMatch) {
            return responseReturn(res, 401, {
                error: 'Current password is incorrect',
                code: 'INVALID_PASSWORD'
            });
        }

        // Check if email is actually changing
        if (seller.email === newEmail) {
            return responseReturn(res, 400, {
                error: 'New email must be different from current email',
                code: 'SAME_EMAIL'
            });
        }

        // Check if email exists (excluding current seller)
        const emailExists = await sellers.findOne({
            email: newEmail,
            _id: { $ne: sellerId }
        });

        if (emailExists) {
            return responseReturn(res, 409, {
                error: 'Email already in use by another account',
                code: 'EMAIL_IN_USE'
            });
        }

        // Update email and save
        seller.email = newEmail;
        seller.emailVerified = false; // Reset verification status
        await seller.save();

        // Send verification email (non-blocking)
        try {
            await sendVerificationEmail(newEmail, seller._id);
        } catch (emailError) {
            console.error('Verification email failed:', emailError);
        }

        // Prepare response
        const responseData = {
            _id: seller._id,
            email: seller.email,
            emailVerified: seller.emailVerified,
            updatedAt: seller.updatedAt
        };

        responseReturn(res, 200, {
            success: true,
            message: 'Email updated successfully. Verification email sent.',
            data: responseData
        });

    } catch (error) {
        console.error('Email update error:', error);
        
        // Handle specific errors
        if (error.name === 'ValidationError') {
            return responseReturn(res, 400, {
                error: 'Validation failed',
                details: error.message,
                code: 'VALIDATION_ERROR'
            });
        }

        responseReturn(res, 500, {
            error: 'Server error during email update',
            code: 'SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function for sending verification email
 sendVerificationEmail = async (email, sellerId) => {
    const verificationToken = jwt.sign(
        { id: sellerId, email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
        from: `"Account Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your New Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Email Update Verification</h2>
                <p>Please verify your new email address by clicking the link below:</p>
                <a href="${verificationLink}" 
                   style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p style="margin-top: 20px;">If you didn't request this change, please secure your account immediately.</p>
            </div>
        `
    });
};

  // Enhanced seller status update (Activate/Deactivate)
  sellerStatusUpdate = async (req, res) => {
    const { sellerId, status, reason } = req.body;
    
    if (!sellerId || !status) {
      return responseReturn(res, 400, { error: 'Missing required fields' });
    }

    try {
      const seller = await sellers.findById(sellerId);
      if (!seller) {
        return responseReturn(res, 404, { error: 'Seller not found' });
      }

      let updateData = { status };
      let emailSubject = '';
      let emailHtml = '';

      if (status === 'active') {
        const now = new Date();
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days trial
        
        updateData.subscription = {
          plan: 'Free Trial',
          isTrial: true,
          status: 'active',
          carLimit: 2,
          startDate: now,
          endDate
        };

        emailSubject = 'Your Seller Account Has Been Activated';
        emailHtml = `
          <h2>Welcome to Our Platform!</h2>
          <p>Your seller account has been activated with the following details:</p>
          <ul>
            <li><strong>Status:</strong> Active</li>
            <li><strong>Trial Period:</strong> 7 days (expires on ${endDate.toLocaleDateString()})</li>
            <li><strong>Car Limit:</strong> 2 vehicles during trial</li>
          </ul>
        `;
      } else if (status === 'deactive') {
        updateData.subscription = {
          status: 'inactive'
        };

        emailSubject = 'Your Seller Account Has Been Deactivated';
        emailHtml = `
          <h2>Account Deactivation Notice</h2>
          <p>Your seller account has been deactivated.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you believe this is an error, please contact our support team.</p>
        `;
      }

      const updatedSeller = await sellers.findByIdAndUpdate(
        sellerId,
        updateData,
        { new: true }
      ).select('-password');

      // Send notification email
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: updatedSeller.email,
          subject: emailSubject,
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
      }

      responseReturn(res, 200, { 
        seller: updatedSeller,
        message: `Seller status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating seller status:', error);
      responseReturn(res, 500, { 
        error: 'Server error while updating status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Enhanced get seller requests with pagination and search
  getSellerRequests = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', status = 'pending' } = req.query;
      const skip = (page - 1) * limit;

      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return responseReturn(res, 400, { error: 'Invalid status value' });
      }

      let query = { status };
    
      
      if (search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'shopInfo.agencyName': { $regex: search, $options: 'i' } },
          { 'shopInfo.phone': { $regex: search, $options: 'i' } }
        ];
      }

      const [sellersList, total] = await Promise.all([
        sellers.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 })
          .select('-password -__v'),
        sellers.countDocuments(query)
      ]);

      responseReturn(res, 200, { 
        sellers: sellersList,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        status
      });
    } catch (error) {
      console.error('Error fetching seller requests:', error);
      responseReturn(res, 500, { 
        error: 'Server error while fetching requests',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Process seller requests (approve/reject)
  processSellerRequest = async (req, res) => {
    const { sellerId, action, reason } = req.body;
    
    if (!sellerId || !action) {
      return responseReturn(res, 400, { error: 'Missing required fields' });
    }

    try {
      const validActions = ['approve', 'reject'];
      if (!validActions.includes(action)) {
        return responseReturn(res, 400, { error: 'Invalid action' });
      }

      const seller = await sellers.findById(sellerId);
      if (!seller) {
        return responseReturn(res, 404, { error: 'Seller not found' });
      }

      const newStatus = action === 'approve' ? 'active' : 'rejected';
      const updateData = { status: newStatus };

      if (action === 'approve') {
        const now = new Date();
        updateData.subscription = {
          plan: 'Free Trial',
          isTrial: true,
          status: 'active',
          carLimit: 2,
          startDate: now,
          endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
      }

      const updatedSeller = await sellers.findByIdAndUpdate(
        sellerId,
        updateData,
        { new: true }
      ).select('-password');

      // Send notification email
      try {
        const emailSubject = action === 'approve' 
          ? 'Your Seller Account Has Been Approved' 
          : 'Your Seller Application Has Been Rejected';

        const emailHtml = action === 'approve'
          ? `
              <h2>Account Approved</h2>
              <p>Congratulations! Your seller account has been approved.</p>
              <p>You can now log in and start using our platform.</p>
              <p>Trial period: 7 days</p>
              <p>Car limit during trial: 2 vehicles</p>
            `
          : `
              <h2>Application Rejected</h2>
              <p>We regret to inform you that your seller application has been rejected.</p>
              ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              <p>If you have any questions, please contact our support team.</p>
            `;

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: updatedSeller.email,
          subject: emailSubject,
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
      }

      responseReturn(res, 200, {
        message: `Seller request ${action}d successfully`,
        seller: updatedSeller
      });

    } catch (error) {
      console.error('Error processing seller request:', error);
      responseReturn(res, 500, { 
        error: 'Server error while processing request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Enhanced get active sellers
  getActiveSellers = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', includeInactive = true } = req.query;
      const skip = (page - 1) * limit;

      let query = { 
        status: includeInactive === 'true' ? { $in: ['active', 'deactivated'] } : 'active' 
      };
      
      if (search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'shopInfo.agencyName': { $regex: search, $options: 'i' } },
          { 'shopInfo.phone': { $regex: search, $options: 'i' } }
        ];
      }

      const [sellersList, total] = await Promise.all([
        sellers.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 })
          .select('-password -__v')
          .populate('subscription', 'plan status endDate carLimit'),
        sellers.countDocuments(query)
      ]);

      responseReturn(res, 200, { 
        sellers: sellersList,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        includeInactive: includeInactive === 'true'
      });
    } catch (error) {
      console.error('Error fetching active sellers:', error);
      responseReturn(res, 500, { 
        error: 'Server error while fetching active sellers',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
    getDesactiveSellers = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '', includeInactive = true } = req.query;
      const skip = (page - 1) * limit;

      let query = { 
        status: includeInactive === 'true' ? { $in: ['active', 'deactivated'] } : 'deactivated' 
      };
      
      if (search.trim()) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'shopInfo.agencyName': { $regex: search, $options: 'i' } },
          { 'shopInfo.phone': { $regex: search, $options: 'i' } }
        ];
      }

      const [sellersList, total] = await Promise.all([
        sellers.find(query)
          .skip(skip)
          .limit(parseInt(limit))
          .sort({ createdAt: -1 })
          .select('-password -__v')
          .populate('subscription', 'plan status endDate carLimit'),
        sellers.countDocuments(query)
      ]);

      responseReturn(res, 200, { 
        sellers: sellersList,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        includeInactive: includeInactive === 'true'
      });
    } catch (error) {
      console.error('Error fetching active sellers:', error);
      responseReturn(res, 500, { 
        error: 'Server error while fetching active sellers',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  // Add car with subscription check
  addCar = async (req, res) => {
    const { sellerId, carDetails } = req.body;
    
    try {
      const seller = await sellers.findById(sellerId);
      if (!seller) {
        return responseReturn(res, 404, { error: 'Seller not found' });
      }

      // Check subscription status
      if (seller.subscription?.status !== 'active') {
        return responseReturn(res, 403, { 
          error: 'Your subscription is not active. Please renew your subscription to add cars.' 
        });
      }

      // Check car limit
      const carCount = await carModel.countDocuments({ sellerId });
      if (carCount >= (seller.subscription?.carLimit || 0)) {
        return responseReturn(res, 403, { 
          error: `You have reached your car limit (${seller.subscription?.carLimit}). Please upgrade your plan to add more cars.` 
        });
      }

      // Add the car
      const newCar = new carModel({
        ...carDetails,
        sellerId,
        agencyName: seller.shopInfo?.agencyName || '',
        location: seller.shopInfo?.address?.city || ''
      });
      
      await newCar.save();
      
      responseReturn(res, 201, { 
        message: 'Car added successfully', 
        car: newCar,
        remainingSlots: (seller.subscription?.carLimit || 0) - carCount - 1
      });
    } catch (error) {
      console.error('Error adding car:', error);
      responseReturn(res, 500, { 
        error: 'Server error while adding car',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  sellerSubscribe = async (req, res) => {
    const { sellerId, plan } = req.body;
  
    try {
        // Define plan details with durations
        const planDetails = {
            Starter: {
                durationMonths: 3,
                price: 29.99,
                priceId: process.env.STRIPE_STARTER_PRICE_ID,
            },
            Pro: {
                durationMonths: 6,
                price: 79.99,
                priceId: process.env.STRIPE_PRO_PRICE_ID,
            },
            Elite: {
                durationMonths: 12,
                price: 149.99,
                priceId: process.env.STRIPE_ELITE_PRICE_ID,
            },
        };

        // Validate plan
        const selectedPlan = planDetails[plan];
        if (!selectedPlan) {
            return responseReturn(res, 400, { error: 'Invalid subscription plan' });
        }

        // Validate priceId
        if (!selectedPlan.priceId) {
            return responseReturn(res, 400, { error: 'Price ID is not configured for the selected plan' });
        }

        // Verify the price is recurring
        try {
            const price = await stripe.prices.retrieve(selectedPlan.priceId);
            if (!price.recurring) {
                return responseReturn(res, 400, { error: 'Price must be recurring for subscriptions' });
            }
            // Verify price amount matches expected
            if (price.unit_amount / 100 !== selectedPlan.price) {
                console.warn(`Price mismatch for ${plan}: expected $${selectedPlan.price}, got $${price.unit_amount / 100}`);
            }
        } catch (error) {
            return responseReturn(res, 400, { error: `Invalid price ID: ${error.message}` });
        }

        // Find seller
        const seller = await sellers.findById(sellerId);
        if (!seller) {
            return responseReturn(res, 404, { error: 'Seller not found' });
        }

        // Create or retrieve Stripe customer
        let customerId = seller.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: seller.email,
                name: seller.name,
                metadata: { sellerId: sellerId.toString() },
            });
            customerId = customer.id;
            await sellers.findByIdAndUpdate(sellerId, { stripeCustomerId: customerId });
        }

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + selectedPlan.durationMonths);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [{
                price: selectedPlan.priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/seller/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/seller/subscription?cancelled=true`,
            client_reference_id: sellerId.toString(),
            metadata: {
                plan,
                sellerId: sellerId.toString(),
                durationMonths: selectedPlan.durationMonths,
            },
            subscription_data: {
                metadata: {
                    plan,
                    sellerId: sellerId.toString(),
                    durationMonths: selectedPlan.durationMonths,
                },
            },
        });

        // Store subscription details
        await sellers.findByIdAndUpdate(sellerId, {
            $set: {
                'subscription.plan': plan,
                'subscription.status': 'pending',
                'subscription.isTrial': false,
                'subscription.stripeSessionId': session.id,
                'subscription.startDate': startDate,
                'subscription.endDate': endDate,
                'subscription.durationMonths': selectedPlan.durationMonths,
                'payment': 'pending',
            },
        });

        responseReturn(res, 200, { url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Subscription error:', error);
        responseReturn(res, error.statusCode || 500, {
            error: 'Failed to create subscription',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
  
  // Check subscription status (for polling)
   checkSubscriptionStatus = async (req, res) => {
    const { sessionId, sellerId } = req.query;
  
    try {
      // Validate inputs
      if (!sessionId || !sellerId) {
        return responseReturn(res, 400, { error: 'Session ID and Seller ID are required' });
      }
  
      // Find seller
      const seller = await sellers.findById(sellerId);
      if (!seller) {
        return responseReturn(res, 404, { error: 'Seller not found' });
      }
  
      // Retrieve checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      });
  
      // Check session status
      if (session.payment_status === 'paid' && session.subscription) {
        const subscription = session.subscription;
        // Update seller record to active
        await sellers.findByIdAndUpdate(sellerId, {
          $set: {
            'subscription.plan': seller.subscription.plan, // Retain plan from metadata
            'subscription.status': 'active',
            'subscription.isTrial': false,
            'subscription.stripeSubscriptionId': subscription.id,
            'subscription.carLimit': seller.subscription.carLimit,
            'subscription.startDate': new Date(),
            'subscription.endDate': new Date(subscription.current_period_end * 1000),
            'payment': 'completed',
          },
        });
        return responseReturn(res, 200, {
          status: 'active',
          message: 'Payment successful, subscription activated',
        });
      } else if (session.payment_status === 'unpaid' || session.status === 'canceled') {
        // Update seller record to failed
        await sellers.findByIdAndUpdate(sellerId, {
          $set: {
            'subscription.status': 'failed',
            'payment': 'failed',
          },
        });
        return responseReturn(res, 400, {
          status: 'failed',
          message: 'Payment failed or was canceled',
        });
      } else {
        // Still pending or processing
        return responseReturn(res, 200, {
          status: 'pending',
          message: 'Payment is still processing',
        });
      }
    } catch (error) {
      console.error('Check subscription status error:', error);
      responseReturn(res, error.statusCode || 500, {
        error: 'Failed to check subscription status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };
  

  // Check for trial expiry (to be called by a CRON job)
  checkTrialExpiry = async () => {
    try {
      const now = new Date();
      
      // Find sellers with expired trials
      const expiredSellers = await sellers.find({
        'subscription.endDate': { $lt: now },
        'subscription.isTrial': true,
        'subscription.status': 'active'
      });

      if (expiredSellers.length > 0) {
        // Update their status to expired
        await sellers.updateMany(
          {
            _id: { $in: expiredSellers.map(s => s._id) }
          },
          {
            'subscription.status': 'expired',
            payment: 'inactive'
          }
        );

        // Send expiration emails
        for (const seller of expiredSellers) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: seller.email,
              subject: 'Your Free Trial Has Expired',
              html: `
                <h2>Your Free Trial Has Ended</h2>
                <p>Dear ${seller.name},</p>
                <p>Your free trial period has expired on ${seller.subscription.endDate.toLocaleDateString()}.</p>
                <p>To continue using our platform and listing your vehicles, please subscribe to one of our plans.</p>
              `
            });
          } catch (emailError) {
            console.error(`Failed to send expiration email to ${seller.email}:`, emailError);
          }
        }
      }

      // Send reminders for trials expiring in 2 days
      const reminderDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      
      const expiringSoonSellers = await sellers.find({
        'subscription.endDate': { 
          $gte: now, 
          $lte: reminderDate 
        },
        'subscription.isTrial': true,
        'subscription.status': 'active'
      });

      if (expiringSoonSellers.length > 0) {
        for (const seller of expiringSoonSellers) {
          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: seller.email,
              subject: 'Your Free Trial Expires Soon',
              html: `
                <h2>Free Trial Ending Soon</h2>
                <p>Dear ${seller.name},</p>
                <p>Your free trial will expire on ${seller.subscription.endDate.toLocaleDateString()} (in 2 days).</p>
                <p>To avoid interruption of service, please consider subscribing to one of our plans.</p>
              `
            });
          } catch (emailError) {
            console.error(`Failed to send reminder email to ${seller.email}:`, emailError);
          }
        }
      }

      return {
        expiredCount: expiredSellers.length,
        expiringSoonCount: expiringSoonSellers.length
      };
    } catch (error) {
      console.error('Error checking trial expiry:', error);
      throw error;
    }
  };
  // Get deactivated sellers
  // Get deactivated sellers
  /*getDeactiveSellers = async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (page - 1) * limit;

      // Validate pagination parameters
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
        return responseReturn(res, 400, {
          error: 'Invalid page or limit parameters',
          code: 'INVALID_PAGINATION'
        });
      }

      // Build query for deactivated sellers
      const query = { status: 'deactive' };

      if (search.trim()) {
        query.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { 'shopInfo.agencyName': { $exists: true, $regex: search.trim(), $options: 'i' } },
          { 'shopInfo.phone': { $exists: true, $regex: search.trim(), $options: 'i' } }
        ];
      }

      // Fetch deactivated sellers and total count
      const [sellersList, total] = await Promise.all([
        sellers.find(query)
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .select('_id name email status createdAt image shopInfo subscription -password -__v')
          .populate({ path: 'subscription', select: 'plan status endDate carLimit', strictPopulate: false }),
        sellers.countDocuments(query)
      ]);

      // Format sellers to ensure consistent output
      const formattedSellers = sellersList.map(seller => ({
        _id: seller._id,
        name: seller.name || 'N/A',
        email: seller.email || 'N/A',
        status: seller.status || 'deactive',
        createdAt: seller.createdAt || new Date(),
        image: seller.image || null,
        shopInfo: seller.shopInfo || {},
        subscription: seller.subscription || {}
      }));

      responseReturn(res, 200, {
        success: true,
        sellers: formattedSellers,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error('Error fetching deactivated sellers:', {
        message: error.message,
        stack: error.stack,
        query: { page, limit, search }
      });
      responseReturn(res, 500, {
        error: 'Server error while fetching deactivated sellers',
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };*/
}

// Get vehicle count


module.exports = new SellerController();