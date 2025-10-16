import { getVectorStore } from '../rag-system/index.js';

/**
 * Retrieves relevant component code snippets from the vector store.
 * This function now uses the globally initialized vector store for efficiency.
 * @param {string} query - The user's description of the component to generate.
 * @param {number} [k=3] - The number of relevant components to retrieve.
 * @returns {Promise<string>} A formatted string of relevant component code.
 */
export const retrieveRelevantComponents = async (query, k = 3) => {
  try {
    const vectorStore = getVectorStore();
    if (!vectorStore) {
      throw new Error('Vector store is not initialized. Cannot perform similarity search.');
    }

    console.log(`Performing similarity search for query: "${query}"`);
    const results = await vectorStore.similaritySearch(query, k);
    console.log(`Found ${results.length} relevant components.`);

    if (results.length === 0) {
      return [];
    }

    return results;

  } catch (error) {
    console.error('💥 Error retrieving relevant components:', error);
    // Re-throw the error to be caught by the calling service
    throw error;
  }
};
