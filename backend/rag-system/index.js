import { HNSWLib } from '@langchain/community/vectorstores/hnswlib';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';
import { Document } from '@langchain/core/documents';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const persistDirectory = path.join(process.cwd(), 'backend', 'hnsw-data');

let vectorStore;
let isRagReady = false;

/**
 * Initializes the RAG system using HNSWLib and local HuggingFace embeddings.
 */
const initializeRagSystem = async () => {
  try {
    console.log('Initializing RAG system with local HuggingFace embeddings...');

    const embeddings = new HuggingFaceTransformersEmbeddings({
      model: 'Xenova/all-MiniLM-L6-v2',
    });

    const storeExists = existsSync(persistDirectory) && (await fs.readdir(persistDirectory)).length > 0;

    if (storeExists) {
      console.log('Loading existing HNSWLib vector store from disk...');
      vectorStore = await HNSWLib.load(persistDirectory, embeddings);
      console.log('✅ Existing vector store loaded.');
    } else {
      console.log('No existing HNSWLib store found. Creating a new one...');
      
      // Load standard components
      const componentsPath = path.join(process.cwd(), 'backend', 'knowledge-base', 'components.json');
      const componentsJson = await fs.readFile(componentsPath, 'utf-8');
      const components = JSON.parse(componentsJson);

      // Load fullstack templates
      const fullstackPath = path.join(process.cwd(), 'backend', 'knowledge-base', 'fullstack-templates.json');
      let fullstackTemplates = [];
      try {
        const fullstackJson = await fs.readFile(fullstackPath, 'utf-8');
        fullstackTemplates = JSON.parse(fullstackJson);
        console.log(`✅ Loaded ${fullstackTemplates.length} fullstack templates`);
      } catch (err) {
        console.log('No fullstack templates found, using components only');
      }

      // Combine all templates
      const allTemplates = [...components, ...fullstackTemplates];

      const documents = allTemplates.map(component => new Document({
        pageContent: `Component Name: ${component.name}. Category: ${component.category}. Description: ${component.description || ''}. Keywords: ${component.keywords?.join(', ') || ''}. Code: ${component.code}`,
        metadata: { 
          name: component.name, 
          category: component.category,
          keywords: component.keywords || []
        },
      }));

      vectorStore = await HNSWLib.fromDocuments(documents, embeddings);
      await vectorStore.save(persistDirectory);
      console.log(`✅ New HNSWLib vector store created with ${documents.length} templates and persisted.`);
    }

    isRagReady = true;
    console.log('RAG system is ready.');

  } catch (error) {
    console.error('💥 WARNING: Failed to initialize RAG system. Server will run without RAG capabilities.', error);
    isRagReady = false;
  }
};

/**
 * Retrieves relevant documents from the vector store.
 * @param {string} query - The query to search for.
 * @param {number} k - The number of documents to retrieve.
 * @returns {Promise<Document[]>} A promise that resolves to an array of documents.
 */
const retrieve = async (query, k = 5) => {
  if (!vectorStore) {
    console.warn('Vector store not initialized. Cannot retrieve documents.');
    return [];
  }
  const retriever = vectorStore.asRetriever(k);
  return await retriever.getRelevantDocuments(query);
};

/**
 * Returns the initialized vector store.
 * @returns {HNSWLib | undefined} The LangChain HNSWLib vector store instance.
 */
export const ragSystem = {
  isReady: () => isRagReady,
  getStore: () => vectorStore,
  retrieve,
};

export { initializeRagSystem };
