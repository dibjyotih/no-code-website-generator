import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  usageStats: {
    componentsGenerated: { type: Number, default: 0 },
    projectsCreated: { type: Number, default: 0 },
    deploymentsCount: { type: Number, default: 0 },
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check subscription limits
userSchema.methods.canGenerateComponent = function() {
  const limits = {
    free: 50,
    pro: 1000,
    enterprise: Infinity,
  };
  
  return this.usageStats.componentsGenerated < limits[this.subscriptionTier];
};

export default mongoose.model('User', userSchema);
