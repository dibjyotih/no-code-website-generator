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
      
      const filePath = path.join(process.cwd(), 'backend', 'knowledge-base', 'components.json');
      const componentsJson = await fs.readFile(filePath, 'utf-8');
      const components = JSON.parse(componentsJson);

      const documents = components.map(component => new Document({
        pageContent: `Component Name: ${component.name}. Category: ${component.category}. Code: ${component.code}`,
        metadata: { name: component.name, category: component.category },
      }));

      vectorStore = await HNSWLib.fromDocuments(documents, embeddings);
      await vectorStore.save(persistDirectory);
      console.log('✅ New HNSWLib vector store created and persisted.');
    }

    isRagReady = true;
    console.log('RAG system is ready.');

  } catch (error) {
    console.error('💥 WARNING: Failed to initialize RAG system. Server will run without RAG capabilities.', error);
    isRagReady = false;
  }
};

/**
 * Returns the initialized vector store.
 * @returns {HNSWLib | undefined} The LangChain HNSWLib vector store instance.
 */
export const getVectorStore = () => {
    return vectorStore;
};

/**
 * Returns whether the RAG system is ready.
 * @returns {boolean}
 */
export const getRagStatus = () => {
    return isRagReady;
};

export default initializeRagSystem;
