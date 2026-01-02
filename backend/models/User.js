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
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  },
  age: {
    type: Number,
    min: 13,
    max: 100,
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
  },
  // Income fields kept for future dashboard onboarding (not required at signup)
  incomeSources: {
    type: [String],
    enum: [
      'Salary',
      'Business',
      'Freelancing',
      'Investments',
      'Rental Income',
      'Pension',
      'Scholarship',
      'Other',
    ],
  },
  incomeRange: {
    type: String,
    enum: [
      'Below ₹10,000',
      '₹10,000 – ₹25,000',
      '₹25,000 – ₹50,000',
      '₹50,000 – ₹1,00,000',
      '₹1,00,000 – ₹5,00,000',
      'Above ₹5,00,000',
    ],
  },
  monthlyIncome: {
    type: Number,
    default: null,
    min: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    default: null,
  },
  verificationTokenExpires: {
    type: Date,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

export default User;

