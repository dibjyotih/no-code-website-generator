import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
  _id: string;
  name: string;
  description: string;
  components: Array<{
    name: string;
    code: string;
  }>;
  lastModified: string;
  createdAt: string;
}

interface ProjectManagerProps {
  token: string;
  onProjectSelect: (project: Project) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ token, onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data.projects);
      } catch {
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [token]);

    const createProject = async () => {
    if (!newProject.name.trim()) return;
    
    setCreating(true);
    try {
      const response = await axios.post(
        'http://localhost:3001/projects',
        newProject,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProjects([response.data.project, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      alert(errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await axios.delete(`http://localhost:3001/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter(p => p._id !== projectId));
    } catch {
      alert('Failed to delete project');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="project-manager-loading">
        <div className="spinner-large"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="project-manager">
      <div className="project-header">
        <div>
          <h1>My Projects</h1>
          <p className="project-count">{projects.length} projects</p>
        </div>
        <button className="create-project-btn" onClick={() => setShowCreateModal(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12m-6-6h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 20h48M20 12v-4M44 12v-4" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>No projects yet</h3>
            <p>Create your first project to get started</p>
            <button className="create-first-btn" onClick={() => setShowCreateModal(true)}>
              Create Project
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project._id);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4h12M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1h-7a1 1 0 01-1-1V4h9z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              
              <p className="project-description">
                {project.description || 'No description'}
              </p>
              
              <div className="project-stats">
                <div className="stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="9" y="4" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="2" y="11" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {project.components?.length || 0} components
                </div>
                <div className="stat">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Updated {formatDate(project.lastModified)}
                </div>
              </div>

              <button 
                className="open-project-btn"
                onClick={() => onProjectSelect(project)}
              >
                Open Project
              </button>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Awesome Website"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="A brief description of your project..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button 
                className="create-btn" 
                onClick={createProject}
                disabled={!newProject.name.trim() || creating}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .project-manager {
          padding: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .project-header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 4px 0;
        }

        .project-count {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .create-project-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .create-project-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .project-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .project-card:hover {
          border-color: #667eea;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .project-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 12px;
        }

        .project-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .project-description {
          color: #6b7280;
          font-size: 14px;
          margin: 0 0 16px 0;
          line-height: 1.5;
        }

        .project-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6b7280;
          font-size: 13px;
        }

        .open-project-btn {
          width: 100%;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          color: #374151;
          padding: 10px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .open-project-btn:hover {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0 0 24px 0;
        }

        .create-first-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #667eea;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .create-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .create-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .project-manager-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #6b7280;
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
