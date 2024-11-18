import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.facebookId;
    }
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  avatar: {
    url: String,
    thumbnailUrl: String
  },
  bio: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleId: String,
  facebookId: String,
  lastSeen: Date,
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showLastSeen: { type: Boolean, default: true },
      showReadReceipts: { type: Boolean, default: true }
    }
  },
  deviceTokens: [String]
}, {
  timestamps: true
});

userSchema.index({ name: 'text', email: 'text' });

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.deviceTokens;
  return obj;
};

export default mongoose.model('User', userSchema);