const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries (handled by unique constraint)

// Hash password before saving
userSchema.pre('save', function(next) {
  // Hash password if it exists and is not already hashed
  if (this.password && !this.password.startsWith('$2b$')) {
    console.log('Hashing password for user:', this.email || 'new user');
    const saltRounds = 12;
    bcrypt.hash(this.password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Password hashing error:', err);
        return next(err);
      }
      console.log('Password hashed successfully');
      this.password = hash;
      next();
    });
  } else {
    console.log('Password already hashed or not present');
    next();
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);