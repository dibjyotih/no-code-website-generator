/**
 * Performance Monitoring Service
 * Tracks real-time metrics for generation quality, speed, and system performance
 */

import fs from 'fs/promises';
import path from 'path';

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      generation: {
        total: 0,
        successful: 0,
        failed: 0,
        syntaxValid: 0,
        functionalComplete: 0,
        averageTime: 0,
        totalTime: 0,
        byComplexity: {
          simple: { count: 0, avgTime: 0, totalTime: 0 },
          medium: { count: 0, avgTime: 0, totalTime: 0 },
          complex: { count: 0, avgTime: 0, totalTime: 0 }
        }
      },
      rag: {
        totalQueries: 0,
        averageRetrievalTime: 0,
        totalRetrievalTime: 0,
        averageSimilarityScore: 0,
        totalSimilarityScore: 0
      },
      api: {
        totalRequests: 0,
        averageLatency: 0,
        totalLatency: 0,
        byEndpoint: {}
      },
      quality: {
        syntaxCorrectness: 0, // percentage
        functionalCompleteness: 0, // percentage
        featureClassification: {
          tp: 0,
          fp: 0,
          fn: 0,
          tn: 0,
          precision: 0,
          recall: 0,
          f1Score: 0
        },
        ecommerceFeatures: {
          total: 0,
          withCart: 0,
          withPricing: 0,
          withPayment: 0
        },
        modifications: {
          total: 0,
          preservedFunctionality: 0,
          preservedIds: 0
        }
      },
      errors: [],
      sessionStart: Date.now(),
      lastUpdate: Date.now()
    };

    this.metricsFile = path.join(process.cwd(), 'backend', 'metrics-data.json');
    this.loadMetrics();
  }

  async loadMetrics() {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf-8');
      const loaded = JSON.parse(data);
      // Merge loaded metrics with current structure
      this.metrics = { ...this.metrics, ...loaded };

      // Backfill newly introduced nested fields for backward compatibility
      if (!this.metrics.quality) this.metrics.quality = {};
      if (!this.metrics.quality.featureClassification) {
        this.metrics.quality.featureClassification = {
          tp: 0,
          fp: 0,
          fn: 0,
          tn: 0,
          precision: 0,
          recall: 0,
          f1Score: 0
        };
      }
      if (!this.metrics.generation?.byComplexity) {
        this.metrics.generation.byComplexity = {
          simple: { count: 0, avgTime: 0, totalTime: 0 },
          medium: { count: 0, avgTime: 0, totalTime: 0 },
          complex: { count: 0, avgTime: 0, totalTime: 0 }
        };
      }

      this.updateQualityMetrics();
      console.log('📊 Loaded existing metrics from disk');
    } catch (error) {
      console.log('📊 Starting fresh metrics collection');
    }
  }

  async saveMetrics() {
    try {
      await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('Failed to save metrics:', error.message);
    }
  }

  // Track code generation
  async trackGeneration(duration, complexity, success, syntaxValid, functionalComplete, features = {}) {
    this.metrics.generation.total++;
    this.metrics.generation.totalTime += duration;
    this.metrics.generation.averageTime = this.metrics.generation.totalTime / this.metrics.generation.total;

    if (success) {
      this.metrics.generation.successful++;
    } else {
      this.metrics.generation.failed++;
    }

    if (syntaxValid) {
      this.metrics.generation.syntaxValid++;
    }

    if (functionalComplete) {
      this.metrics.generation.functionalComplete++;
    }

    // Track by complexity
    const complexityLevel = complexity || 'medium';
    if (this.metrics.generation.byComplexity[complexityLevel]) {
      this.metrics.generation.byComplexity[complexityLevel].count++;
      this.metrics.generation.byComplexity[complexityLevel].totalTime += duration;
      this.metrics.generation.byComplexity[complexityLevel].avgTime =
        this.metrics.generation.byComplexity[complexityLevel].totalTime /
        this.metrics.generation.byComplexity[complexityLevel].count;
    }

    // Track e-commerce features
    if (features.isEcommerce) {
      this.metrics.quality.ecommerceFeatures.total++;
      if (features.hasCart) this.metrics.quality.ecommerceFeatures.withCart++;
      if (features.hasPricing) this.metrics.quality.ecommerceFeatures.withPricing++;
      if (features.hasPayment) this.metrics.quality.ecommerceFeatures.withPayment++;
    }

    // Update quality percentages
    this.updateQualityMetrics();
    this.metrics.lastUpdate = Date.now();
    
    await this.saveMetrics();
  }

  // Track RAG retrieval
  async trackRAGRetrieval(duration, similarityScore) {
    this.metrics.rag.totalQueries++;
    this.metrics.rag.totalRetrievalTime += duration;
    this.metrics.rag.averageRetrievalTime = this.metrics.rag.totalRetrievalTime / this.metrics.rag.totalQueries;
    
    if (similarityScore) {
      this.metrics.rag.totalSimilarityScore += similarityScore;
      this.metrics.rag.averageSimilarityScore = this.metrics.rag.totalSimilarityScore / this.metrics.rag.totalQueries;
    }

    this.metrics.lastUpdate = Date.now();
    await this.saveMetrics();
  }

  // Track API request
  async trackAPIRequest(endpoint, duration) {
    this.metrics.api.totalRequests++;
    this.metrics.api.totalLatency += duration;
    this.metrics.api.averageLatency = this.metrics.api.totalLatency / this.metrics.api.totalRequests;

    if (!this.metrics.api.byEndpoint[endpoint]) {
      this.metrics.api.byEndpoint[endpoint] = {
        count: 0,
        totalLatency: 0,
        averageLatency: 0
      };
    }

    this.metrics.api.byEndpoint[endpoint].count++;
    this.metrics.api.byEndpoint[endpoint].totalLatency += duration;
    this.metrics.api.byEndpoint[endpoint].averageLatency =
      this.metrics.api.byEndpoint[endpoint].totalLatency /
      this.metrics.api.byEndpoint[endpoint].count;

    this.metrics.lastUpdate = Date.now();
    await this.saveMetrics();
  }

  // Track modification
  async trackModification(preservedFunctionality, preservedIds) {
    this.metrics.quality.modifications.total++;
    if (preservedFunctionality) {
      this.metrics.quality.modifications.preservedFunctionality++;
    }
    if (preservedIds) {
      this.metrics.quality.modifications.preservedIds++;
    }

    this.updateQualityMetrics();
    this.metrics.lastUpdate = Date.now();
    await this.saveMetrics();
  }

  // Track feature classification for precision/recall/F1/hallucination metrics
  async trackFeatureClassification({ tp = 0, fp = 0, fn = 0, tn = 0 }) {
    this.metrics.quality.featureClassification.tp += tp;
    this.metrics.quality.featureClassification.fp += fp;
    this.metrics.quality.featureClassification.fn += fn;
    this.metrics.quality.featureClassification.tn += tn;

    this.updateQualityMetrics();
    this.metrics.lastUpdate = Date.now();
    await this.saveMetrics();
  }

  // Track error
  async trackError(type, message, details = {}) {
    const error = {
      type,
      message,
      details,
      timestamp: Date.now()
    };

    this.metrics.errors.push(error);

    // Keep only last 100 errors
    if (this.metrics.errors.length > 100) {
      this.metrics.errors = this.metrics.errors.slice(-100);
    }

    this.metrics.lastUpdate = Date.now();
    await this.saveMetrics();
  }

  // Update quality metrics percentages
  updateQualityMetrics() {
    const successful = this.metrics.generation.successful;
    if (successful > 0) {
      this.metrics.quality.syntaxCorrectness = 
        (this.metrics.generation.syntaxValid / successful) * 100;
      this.metrics.quality.functionalCompleteness = 
        (this.metrics.generation.functionalComplete / successful) * 100;
    } else {
      this.metrics.quality.syntaxCorrectness = 0;
      this.metrics.quality.functionalCompleteness = 0;
    }

    const c = this.metrics.quality.featureClassification;
    const tpFp = c.tp + c.fp;
    const tpFn = c.tp + c.fn;

    c.precision = tpFp > 0 ? (c.tp / tpFp) * 100 : 0;
    c.recall = tpFn > 0 ? (c.tp / tpFn) * 100 : 0;

    const p = c.precision / 100;
    const r = c.recall / 100;
    c.f1Score = (p + r) > 0 ? ((2 * p * r) / (p + r)) * 100 : 0;
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.metrics.sessionStart;
    return {
      ...this.metrics,
      uptime,
      uptimeFormatted: this.formatUptime(uptime)
    };
  }

  // Get summary statistics
  getSummary() {
    const metrics = this.getMetrics();
    const fc = metrics.quality?.featureClassification || {
      tp: 0,
      fp: 0,
      fn: 0,
      tn: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    };

    return {
      generation: {
        totalGenerated: metrics.generation.total,
        successRate: metrics.generation.total > 0 
          ? ((metrics.generation.successful / metrics.generation.total) * 100).toFixed(2) + '%'
          : '0%',
        averageTime: metrics.generation.averageTime.toFixed(2) + 's',
        simpleTime: metrics.generation.byComplexity.simple.count > 0
          ? metrics.generation.byComplexity.simple.avgTime.toFixed(2) + 's'
          : 'N/A',
        mediumTime: metrics.generation.byComplexity.medium.count > 0
          ? metrics.generation.byComplexity.medium.avgTime.toFixed(2) + 's'
          : 'N/A',
        complexTime: metrics.generation.byComplexity.complex.count > 0
          ? metrics.generation.byComplexity.complex.avgTime.toFixed(2) + 's'
          : 'N/A',
        syntaxCorrectness: metrics.quality.syntaxCorrectness.toFixed(2) + '%',
        functionalCompleteness: metrics.quality.functionalCompleteness.toFixed(2) + '%'
      },
      quality: {
        precision: fc.precision.toFixed(2) + '%',
        recall: fc.recall.toFixed(2) + '%',
        f1Score: fc.f1Score.toFixed(2) + '%',
        confusionMatrix: {
          tp: fc.tp,
          fp: fc.fp,
          fn: fc.fn,
          tn: fc.tn
        }
      },
      rag: {
        totalQueries: metrics.rag.totalQueries,
        averageRetrievalTime: metrics.rag.averageRetrievalTime.toFixed(2) + 'ms',
        averageSimilarity: metrics.rag.averageSimilarityScore.toFixed(3)
      },
      api: {
        totalRequests: metrics.api.totalRequests,
        averageLatency: metrics.api.averageLatency.toFixed(2) + 'ms'
      },
      ecommerce: {
        total: metrics.quality.ecommerceFeatures.total,
        cartFunctionality: metrics.quality.ecommerceFeatures.total > 0
          ? ((metrics.quality.ecommerceFeatures.withCart / metrics.quality.ecommerceFeatures.total) * 100).toFixed(2) + '%'
          : '0%',
        pricingCalculations: metrics.quality.ecommerceFeatures.total > 0
          ? ((metrics.quality.ecommerceFeatures.withPricing / metrics.quality.ecommerceFeatures.total) * 100).toFixed(2) + '%'
          : '0%',
        paymentIntegration: metrics.quality.ecommerceFeatures.total > 0
          ? ((metrics.quality.ecommerceFeatures.withPayment / metrics.quality.ecommerceFeatures.total) * 100).toFixed(2) + '%'
          : '0%'
      },
      system: {
        uptime: metrics.uptimeFormatted,
        lastUpdate: new Date(metrics.lastUpdate).toISOString()
      }
    };
  }

  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Reset metrics
  async resetMetrics() {
    this.metrics = {
      generation: {
        total: 0,
        successful: 0,
        failed: 0,
        syntaxValid: 0,
        functionalComplete: 0,
        averageTime: 0,
        totalTime: 0,
        byComplexity: {
          simple: { count: 0, avgTime: 0, totalTime: 0 },
          medium: { count: 0, avgTime: 0, totalTime: 0 },
          complex: { count: 0, avgTime: 0, totalTime: 0 }
        }
      },
      rag: {
        totalQueries: 0,
        averageRetrievalTime: 0,
        totalRetrievalTime: 0,
        averageSimilarityScore: 0,
        totalSimilarityScore: 0
      },
      api: {
        totalRequests: 0,
        averageLatency: 0,
        totalLatency: 0,
        byEndpoint: {}
      },
      quality: {
        syntaxCorrectness: 0,
        functionalCompleteness: 0,
        featureClassification: {
          tp: 0,
          fp: 0,
          fn: 0,
          tn: 0,
          precision: 0,
          recall: 0,
          f1Score: 0
        },
        ecommerceFeatures: {
          total: 0,
          withCart: 0,
          withPricing: 0,
          withPayment: 0
        },
        modifications: {
          total: 0,
          preservedFunctionality: 0,
          preservedIds: 0
        }
      },
      errors: [],
      sessionStart: Date.now(),
      lastUpdate: Date.now()
    };

    await this.saveMetrics();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
