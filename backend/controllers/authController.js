const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, vendorId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide name, email, password, and role.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    // If the user is a vendor, create a Vendor record and link the user to it
    if (role === 'VENDOR') {
      const { companyName, category, gstNumber, contactPhone, address } = req.body;

      if (!companyName || !gstNumber) {
        return res.status(400).json({ error: 'Vendor registration requires companyName and gstNumber.' });
      }

      // Check if vendor with this GST already exists
      const existingVendor = await prisma.vendor.findUnique({
        where: { gstNumber },
      });

      if (existingVendor) {
        return res.status(400).json({ error: 'A vendor with this GST Number is already registered.' });
      }

      // Create the vendor record
      const vendor = await prisma.vendor.create({
        data: {
          companyName,
          category: category || '',
          gstNumber,
          contactEmail: email,
          contactPhone: contactPhone || '',
          address: address || '',
          status: 'PENDING',
        },
      });

      userData.vendorId = vendor.id;
    } else if (role === 'VENDOR' && vendorId) {
      userData.vendorId = vendorId;
    }

    // Create the user
    const user = await prisma.user.create({
      data: userData,
    });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create JWT
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_fallback_key',
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};