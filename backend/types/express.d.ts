declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        username: string;
        email: string;
        subscription: {
          tier: string;
        };
        projects: string[];
        usageStats: {
          projectsCreated: number;
          componentsGenerated: number;
        };
        save: () => Promise<void>;
      };
    }
  }
}

export {};
