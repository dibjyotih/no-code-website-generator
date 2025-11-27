import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['vercel', 'netlify', 'railway', 'aws', 'custom'],
    required: true,
  },
  deploymentUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'building', 'deployed', 'failed'],
    default: 'pending',
  },
  buildLogs: {
    type: String,
    default: '',
  },
  errorMessage: {
    type: String,
    default: null,
  },
  environmentVariables: {
    type: Map,
    of: String,
    default: new Map(),
  },
  buildConfig: {
    nodeVersion: { type: String, default: '18.x' },
    buildCommand: { type: String, default: 'npm run build' },
    installCommand: { type: String, default: 'npm install' },
    outputDirectory: { type: String, default: 'dist' },
  },
  deploymentId: {
    type: String, // External platform deployment ID
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deployedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.model('Deployment', deploymentSchema);
