import { generateText } from './gemini-service.js';

/**
 * Generate a complete database schema from a natural language description
 * @param {string} prompt - User's description of the database requirements
 * @returns {Promise<Object>} Database schema with tables, fields, and relationships
 */
export async function generateDatabaseSchema(prompt) {
  const systemPrompt = `
    You are an expert database architect. Generate a complete PostgreSQL database schema based on the user's requirements.
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "tables": [
        {
          "name": "table_name",
          "fields": [
            {
              "name": "field_name",
              "type": "VARCHAR(255)" | "INTEGER" | "BOOLEAN" | "TEXT" | "TIMESTAMP" | "UUID" | "JSONB",
              "nullable": boolean,
              "unique": boolean,
              "primaryKey": boolean,
              "default": "value or null"
            }
          ],
          "indexes": [
            {
              "name": "idx_name",
              "fields": ["field1", "field2"],
              "unique": boolean
            }
          ]
        }
      ],
      "relationships": [
        {
          "type": "one-to-many" | "many-to-many" | "one-to-one",
          "from": "table1",
          "to": "table2",
          "foreignKey": "field_name",
          "onDelete": "CASCADE" | "SET NULL" | "RESTRICT"
        }
      ],
      "prismaSchema": "complete Prisma schema string"
    }
    
    Rules:
    - Always include common fields: id (UUID primary key), createdAt, updatedAt
    - Use proper data types and constraints
    - Create appropriate indexes for foreign keys
    - Generate a complete Prisma schema in the prismaSchema field
    - Think about scalability and best practices
  `;

  const fullPrompt = `${systemPrompt}\n\nUser Requirements:\n${prompt}`;

  try {
    const response = await generateText(fullPrompt);
    
    // Extract JSON from response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const schema = JSON.parse(jsonMatch[0]);
    
    // Generate SQL migration script
    schema.sqlMigration = generateSQLMigration(schema);
    
    return {
      success: true,
      schema,
    };
  } catch (error) {
    console.error('Database schema generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate SQL migration script from schema
 */
function generateSQLMigration(schema) {
  let sql = '-- Auto-generated migration\n\n';

  // Create tables
  schema.tables.forEach(table => {
    sql += `CREATE TABLE ${table.name} (\n`;
    
    const fields = table.fields.map(field => {
      let def = `  ${field.name} ${field.type}`;
      if (field.primaryKey) def += ' PRIMARY KEY';
      if (!field.nullable) def += ' NOT NULL';
      if (field.unique) def += ' UNIQUE';
      if (field.default) def += ` DEFAULT ${field.default}`;
      return def;
    });
    
    sql += fields.join(',\n');
    sql += '\n);\n\n';

    // Create indexes
    if (table.indexes && table.indexes.length > 0) {
      table.indexes.forEach(index => {
        const uniqueStr = index.unique ? 'UNIQUE ' : '';
        sql += `CREATE ${uniqueStr}INDEX ${index.name} ON ${table.name}(${index.fields.join(', ')});\n`;
      });
      sql += '\n';
    }
  });

  // Add foreign key constraints
  if (schema.relationships && schema.relationships.length > 0) {
    schema.relationships.forEach(rel => {
      sql += `ALTER TABLE ${rel.from} ADD CONSTRAINT fk_${rel.from}_${rel.to} `;
      sql += `FOREIGN KEY (${rel.foreignKey}) REFERENCES ${rel.to}(id) `;
      sql += `ON DELETE ${rel.onDelete};\n`;
    });
  }

  return sql;
}

/**
 * Generate Prisma schema from database description
 */
export async function generatePrismaSchema(databaseSchema) {
  let prismaSchema = `
// Auto-generated Prisma schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

`;

  databaseSchema.tables.forEach(table => {
    prismaSchema += `model ${capitalize(table.name)} {\n`;
    
    table.fields.forEach(field => {
      const prismaType = mapToPrismaType(field.type);
      const nullable = field.nullable ? '?' : '';
      const unique = field.unique ? ' @unique' : '';
      const defaultVal = field.default ? ` @default(${field.default})` : '';
      
      prismaSchema += `  ${field.name} ${prismaType}${nullable}${defaultVal}${unique}\n`;
    });
    
    prismaSchema += `  createdAt DateTime @default(now())\n`;
    prismaSchema += `  updatedAt DateTime @updatedAt\n`;
    prismaSchema += `}\n\n`;
  });

  return prismaSchema;
}

function mapToPrismaType(sqlType) {
  const typeMap = {
    'VARCHAR': 'String',
    'TEXT': 'String',
    'INTEGER': 'Int',
    'BOOLEAN': 'Boolean',
    'TIMESTAMP': 'DateTime',
    'UUID': 'String',
    'JSONB': 'Json',
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (sqlType.includes(key)) return value;
  }
  
  return 'String';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
