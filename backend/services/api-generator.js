import { generateText } from './gemini-service.js';

/**
 * Generate complete CRUD API routes for a data model
 * @param {Object} model - Database model/table definition
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} Array of API route definitions
 */
export async function generateAPIRoutes(model, options = {}) {
  const {
    authentication = true,
    validation = true,
    pagination = true,
  } = options;

  const systemPrompt = `
    You are an expert Node.js/Express API developer. Generate complete, production-ready REST API endpoints.
    
    Generate CRUD endpoints for the following model: ${JSON.stringify(model, null, 2)}
    
    Requirements:
    - Use Express.js
    - Include proper error handling
    - ${authentication ? 'Add JWT authentication middleware' : 'No authentication'}
    - ${validation ? 'Add request validation' : 'Skip validation'}
    - ${pagination ? 'Add pagination for list endpoints' : 'No pagination'}
    - Return TypeScript-compatible JSDoc comments
    - Use async/await
    - Include proper HTTP status codes
    
    Return a JSON array with this structure:
    [
      {
        "method": "GET|POST|PUT|DELETE",
        "path": "/api/resource/:id",
        "description": "Endpoint description",
        "code": "complete Express route handler code",
        "middleware": ["authMiddleware", "validationMiddleware"],
        "requestBody": { "example": "json" },
        "response": { "example": "json" }
      }
    ]
  `;

  try {
    const response = await generateText(systemPrompt);
    
    // Extract JSON array
    let jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const routes = JSON.parse(jsonMatch[0]);
    
    return {
      success: true,
      routes,
      routerCode: generateRouterFile(routes, model.name),
    };
  } catch (error) {
    console.error('API route generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate a complete Express router file
 */
function generateRouterFile(routes, modelName) {
  let code = `import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import ${modelName} from '../models/${modelName}.js';

const router = express.Router();

`;

  routes.forEach(route => {
    const middlewareStr = route.middleware && route.middleware.length > 0
      ? route.middleware.join(', ') + ', '
      : '';
    
    code += `// ${route.description}\n`;
    code += `router.${route.method.toLowerCase()}('${route.path}', ${middlewareStr}async (req, res) => {\n`;
    code += `  ${route.code}\n`;
    code += `});\n\n`;
  });

  code += `export default router;\n`;
  
  return code;
}

/**
 * Generate authentication setup code
 */
export async function generateAuthSystem(appType = 'nextjs') {
  const templates = {
    nextjs: generateNextAuthSetup(),
    express: generateExpressAuthSetup(),
    supabase: generateSupabaseAuthSetup(),
  };

  return templates[appType] || templates.express;
}

function generateNextAuthSetup() {
  return {
    files: [
      {
        path: 'app/api/auth/[...nextauth]/route.js',
        content: `import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`,
      },
      {
        path: 'lib/auth.js',
        content: `import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
`,
      }
    ],
    env: `
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
`,
  };
}

function generateExpressAuthSetup() {
  return {
    files: [
      {
        path: 'middleware/auth.js',
        content: `import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
`,
      }
    ],
    env: `
JWT_SECRET=your-jwt-secret-key
`,
  };
}

function generateSupabaseAuthSetup() {
  return {
    files: [
      {
        path: 'lib/supabase.js',
        content: `import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
`,
      }
    ],
    env: `
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
`,
  };
}
