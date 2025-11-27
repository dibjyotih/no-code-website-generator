import mongoose from 'mongoose';

const componentSchema = new mongoose.Schema({
  name: String,
  code: String,
  createdAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  components: [componentSchema],
  databaseSchema: {
    type: String,
    default: null,
  },
  apiRoutes: [{
    method: String,
    path: String,
    code: String,
  }],
  authConfig: {
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ['nextauth', 'supabase', 'custom'], default: 'nextauth' },
    config: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  deploymentConfig: {
    platform: { type: String, enum: ['vercel', 'netlify', 'railway'], default: 'vercel' },
    url: { type: String, default: null },
    lastDeployed: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'deployed', 'failed'], default: 'pending' },
  },
  settings: {
    theme: { type: String, default: 'light' },
    framework: { type: String, enum: ['react', 'nextjs', 'vite'], default: 'react' },
    styling: { type: String, enum: ['inline', 'tailwind', 'css-modules'], default: 'inline' },
  },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
    addedAt: { type: Date, default: Date.now },
  }],
  versions: [{
    version: String,
    createdAt: { type: Date, default: Date.now },
    snapshot: mongoose.Schema.Types.Mixed,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Update lastModified on save
projectSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

export default mongoose.model('Project', projectSchema);
