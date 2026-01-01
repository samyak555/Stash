import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  googleAuth: {
    type: Boolean,
    default: false,
  },
  emailConfig: {
    email: String,
    password: String,
    accessToken: String,
    host: String,
    port: Number,
    enabled: Boolean,
    lastSync: Date,
    authType: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);

