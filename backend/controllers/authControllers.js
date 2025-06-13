const adminModel = require('../models/adminModel');
const sellerModel = require('../models/sellerModel');
const sellerCustomerModel = require('../models/chat/sellerCustomerModel');
const bcrypt = require('bcrypt');
const formidable = require('formidable');
const cloudinary = require('cloudinary').v2;
const { responseReturn } = require('../utiles/response');
const { createToken } = require('../utiles/tokenCreate');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
  secure: true
});

class AuthControllers {
  // Common login handler
  async _handleLogin(model, req, res, userType) {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return responseReturn(res, 400, { error: 'Email and password are required' });
    }

    try {
      const user = await model.findOne({ email }).select('+password');
      if (!user) {
        return responseReturn(res, 401, { error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return responseReturn(res, 401, { error: 'Invalid credentials' });
      }

      const token = await createToken({
        id: user.id,
        role: user.role
      });

      res.cookie('accessToken', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      responseReturn(res, 200, { 
        token, 
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image
        }
      });
    } catch (error) {
      console.error(`${userType} login error:`, error);
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  }

  admin_login = async (req, res) => {
    await this._handleLogin(adminModel, req, res, 'admin');
  }

  seller_login = async (req, res) => {
    await this._handleLogin(sellerModel, req, res, 'seller');
  }

  seller_register = async (req, res) => {
    const {
      agencyName,
      email,
      password,
      phone,
      address,
      ville,
      postalCode,
      country,
      taxId,
      businessLicense,
      description,
      fleetSize,
      yearFounded,
      contactPerson,
      website
    } = req.body;

    if (!email || !password || !agencyName || !phone || !address || !ville || !postalCode || !country || !taxId || !businessLicense) {
      return responseReturn(res, 400, { error: 'Required fields are missing' });
    }

    try {
      const existingSeller = await sellerModel.findOne({ email });
      if (existingSeller) {
        return responseReturn(res, 400, { error: 'Email already exists' });
      }

      // Set subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 7); // Add 7 days to start date

      const seller = await sellerModel.create({
        name: contactPerson || agencyName,
        email,
        password: await bcrypt.hash(password, 10),
        phone,
        method: 'manually',
        status: 'pending',
        image: '',
        shopInfo: {
          agencyName,
          address: {
            street: address,
            city: ville,
            postalCode,
            country
          },
          taxId,
          businessLicense,
          description,
          fleetSize: fleetSize ? parseInt(fleetSize) : 0,
          yearFounded: yearFounded ? parseInt(yearFounded) : null,
          contactPerson,
          website
        },
        subscription: {
          plan: 'Free Trial',
          isTrial: true,
          carLimit: 2,
          startDate: startDate, // Set to current date
          endDate: endDate     // Set to 7 days from now
        }
      });

      await sellerCustomerModel.create({
        myId: seller.id
      });

      const token = await createToken({ 
        id: seller.id, 
        role: seller.role 
      });

      res.cookie('accessToken', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      responseReturn(res, 201, { 
        token, 
        message: 'Registration successful',
        user: {
          id: seller.id,
          name: seller.name,
          email: seller.email,
          role: seller.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  }

  getUser = async (req, res) => {
    const { id, role } = req;

    try {
      let user;
      if (role === 'admin') {
        user = await adminModel.findById(id);
      } else {
        user = await sellerModel.findById(id);
      }

      if (!user) {
        return responseReturn(res, 404, { error: 'User not found' });
      }

      responseReturn(res, 200, { 
        userInfo: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status:user.status,
          image: user.image,
          stripeCustomerId:user.stripeCustomerId,
          shopInfo: user.shopInfo,
          subscription: user.subscription
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  }

  profile_image_upload = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, _, files) => {
      if (err) {
        return responseReturn(res, 400, { error: 'Error parsing form data' });
      }

      const { image } = files;
      if (!image) {
        return responseReturn(res, 400, { error: 'No image provided' });
      }

      try {
        const result = await cloudinary.uploader.upload(image.filepath, { 
          folder: 'profile',
          resource_type: 'auto'
        });

        if (!result || !result.url) {
          return responseReturn(res, 500, { error: 'Image upload failed' });
        }

        const updatedUser = await sellerModel.findByIdAndUpdate(
          id,
          { image: result.secure_url },
          { new: true }
        ).select('-password');

        responseReturn(res, 200, { 
          message: 'Image uploaded successfully',
          userInfo: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            image: updatedUser.image,
            role: updatedUser.role
          }
        });
      } catch (error) {
        console.error('Image upload error:', error);
        responseReturn(res, 500, { error: 'Internal server error' });
      }
    });
  }

  profile_info_add = async (req, res) => {
    const { division, district, shopName, sub_district } = req.body;
    const { id } = req;

    if (!division || !district || !shopName) {
      return responseReturn(res, 400, { error: 'Required fields are missing' });
    }

    try {
      const updatedSeller = await sellerModel.findByIdAndUpdate(
        id,
        { 
          $set: { 
            'shopInfo.shopName': shopName,
            'shopInfo.division': division,
            'shopInfo.district': district,
            'shopInfo.sub_district': sub_district 
          } 
        },
        { new: true }
      );

      responseReturn(res, 200, { 
        message: 'Profile upffdated successfully',
        userInfo: {
          id: updatedSeller.id,
          shopInfo: updatedSeller.shopInfo
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  }

  logout = async (req, res) => {
    try {
      res.cookie('accessToken', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      responseReturn(res, 200, { message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      responseReturn(res, 500, { error: 'Internal server error' });
    }
  }
}

module.exports = new AuthControllers();