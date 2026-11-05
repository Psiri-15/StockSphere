import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'Customer',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new seller
// @route   POST /api/auth/register-seller
// @access  Public
export const registerSeller = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      storeName,
      storeDescription,
      businessRegistrationNumber,
      taxId,
      storeAddress,
    } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and Store Name are mandatory for seller registration.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'Seller',
      sellerDetails: {
        storeName,
        storeDescription: storeDescription || '',
        businessRegistrationNumber: businessRegistrationNumber || '',
        taxId: taxId || '',
        storeAddress: storeAddress || '',
        approvalStatus: 'Pending',
      },
    });

    // Notify admins about the new seller registration
    const admins = await User.find({ role: 'Admin' });
    if (admins.length > 0) {
      const notifications = admins.map((admin) => ({
        recipient: admin._id,
        sender: user._id,
        title: 'New Seller Registration',
        message: `Store "${storeName}" by ${name} submitted an onboarding application for review.`,
        type: 'APPROVAL',
        link: '/admin/sellers',
      }));
      await Notification.insertMany(notifications);
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Seller account registered! Awaiting administrator approval.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        sellerDetails: user.sellerDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user including password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        sellerDetails: user.sellerDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    if (req.body.avatar) user.avatar = req.body.avatar;

    if (user.role === 'Seller' && req.body.sellerDetails) {
      user.sellerDetails.storeName = req.body.sellerDetails.storeName || user.sellerDetails.storeName;
      user.sellerDetails.storeDescription = req.body.sellerDetails.storeDescription !== undefined ? req.body.sellerDetails.storeDescription : user.sellerDetails.storeDescription;
      user.sellerDetails.storeAddress = req.body.sellerDetails.storeAddress !== undefined ? req.body.sellerDetails.storeAddress : user.sellerDetails.storeAddress;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
        sellerDetails: updatedUser.sellerDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};
