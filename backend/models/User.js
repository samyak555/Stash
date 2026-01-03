import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    },
  },
  emailVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpiry: {
    type: Date,
    default: null,
  },
  resetTokenHash: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple nulls but enforce uniqueness when present
    index: true,
    required: function() {
      return this.authProvider === 'google';
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
  age: {
    type: Number,
    min: 13,
    max: 100,
    // NOT required during OAuth login - will be set during onboarding
    // Only validate if provided
    required: false,
  },
  profession: {
    type: String,
    enum: [
      'Student',
      'Salaried',
      'Business',
      'Freelancer',
      'Homemaker',
      'Retired',
      'Other',
    ],
    // NOT required during OAuth login - will be set during onboarding
    // Only validate if provided
    required: false,
  },
  monthlyIncome: {
    type: Number,
    default: null,
    min: 0,
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  expensesCompleted: {
    type: Boolean,
    default: false,
  },
  goalsCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetTokenHash: 1 });
userSchema.index({ googleId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
