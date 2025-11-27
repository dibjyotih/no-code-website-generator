import React, { useState } from 'react';
import { ProjectManager } from './ProjectManager';
import { useAuth } from '../../hooks/useAuth';
import Workspace from '../Layout/Workspace';

interface Project {
  _id: string;
  name: string;
  description: string;
  components: unknown[];
  lastModified: string;
  createdAt: string;
}

export const DashboardLayout: React.FC = () => {
  const { user, logout, token } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeView, setActiveView] = useState<'projects' | 'workspace'>('projects');

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveView('workspace');
  };

  const handleBackToProjects = () => {
    setActiveView('projects');
    setSelectedProject(null);
  };

  if (activeView === 'workspace' && selectedProject) {
    return (
      <div className="dashboard-workspace">
        <div className="workspace-header">
          <button className="back-btn" onClick={handleBackToProjects}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-8 6 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Projects
          </button>
          <div className="project-info">
            <h2>{selectedProject.name}</h2>
            <span className="project-id">Project ID: {selectedProject._id}</span>
          </div>
          <div className="user-menu">
            <span>{user?.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
        <Workspace onBackToLanding={handleBackToProjects} />
        <style>{`
          .dashboard-workspace {
            height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .workspace-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 24px;
            background: white;
            border-bottom: 1px solid #e5e7eb;
          }

          .back-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f3f4f6;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            cursor: pointer;
            transition: background 0.2s;
          }

          .back-btn:hover {
            background: #e5e7eb;
          }

          .project-info h2 {
            font-size: 18px;
            margin: 0 0 4px 0;
            color: #1a1a1a;
          }

          .project-id {
            font-size: 12px;
            color: #9ca3af;
            font-family: monospace;
          }

          .user-menu {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .user-menu span {
            font-size: 14px;
            color: #6b7280;
          }

          .logout-btn {
            background: #f3f4f6;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            cursor: pointer;
            transition: background 0.2s;
          }

          .logout-btn:hover {
            background: #e5e7eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path d="M10 12h12M10 16h8M10 20h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#667eea" />
                <stop offset="1" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <span>WebWeaver AI</span>
        </div>

        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{user?.username}</div>
              <div className="user-tier">{user?.subscription.tier} Plan</div>
            </div>
          </div>
          <button onClick={logout} className="nav-logout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M13 3h3a1 1 0 011 1v12a1 1 0 01-1 1h-3M7 10h10m-3-3l3 3-3 3" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        {token && <ProjectManager token={token} onProjectSelect={handleProjectSelect} />}
      </main>

      <style>{`
        .dashboard-layout {
          min-height: 100vh;
          background: #f9fafb;
        }

        .dashboard-nav {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-brand span {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .user-tier {
          font-size: 12px;
          color: #6b7280;
          text-transform: capitalize;
        }

        .nav-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: background 0.2s;
        }

        .nav-logout:hover {
          background: #e5e7eb;
        }

        .dashboard-main {
          min-height: calc(100vh - 73px);
        }
      `}</style>
    </div>
  );
};
