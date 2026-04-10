/**
 * Code Analyzer Service
 * Analyzes generated code for quality metrics and feature detection
 */

import * as acorn from 'acorn';
import jsx from 'acorn-jsx';

const parser = acorn.Parser.extend(jsx());

export class CodeAnalyzer {
  /**
   * Analyze generated code for various quality metrics
   */
  static analyzeCode(code) {
    const results = {
      syntaxValid: false,
      functionalComplete: false,
      complexity: 'medium',
      features: {
        isEcommerce: false,
        hasCart: false,
        hasPricing: false,
        hasPayment: false,
        hasStateManagement: false,
        hasEventHandlers: false,
        hasDynamicCalculations: false
      },
      patterns: {
        hasUseState: false,
        hasUseEffect: false,
        hasDataElementId: false,
        hasInlineStyles: false
      },
      stats: {
        lines: 0,
        functions: 0,
        components: 0,
        stateVariables: 0
      }
    };

    try {
      // Basic stats
      results.stats.lines = code.split('\n').length;

      // Syntax validation
      try {
        parser.parse(code, {
          ecmaVersion: 2020,
          sourceType: 'module'
        });
        results.syntaxValid = true;
      } catch (syntaxError) {
        console.log('Syntax error detected:', syntaxError.message);
        return results;
      }

      // Pattern detection
      results.patterns.hasUseState = /useState\s*\(/.test(code);
      results.patterns.hasUseEffect = /useEffect\s*\(/.test(code);
      results.patterns.hasDataElementId = /data-element-id/.test(code);
      results.patterns.hasInlineStyles = /style=\{\{/.test(code);

      // Count state variables
      const useStateMatches = code.match(/useState\s*\(/g);
      results.stats.stateVariables = useStateMatches ? useStateMatches.length : 0;

      // Count functions
      const functionMatches = code.match(/(?:function\s+\w+|const\s+\w+\s*=\s*\(.*?\)\s*=>|const\s+\w+\s*=\s*async\s*\(.*?\)\s*=>)/g);
      results.stats.functions = functionMatches ? functionMatches.length : 0;

      // E-commerce feature detection (avoid false positives for generic landing/pricing pages)
      const lowerCode = code.toLowerCase();
      const hasCartSignal = /\bcart\b|addtocart|removefromcart|setcart\s*\(|cart\./i.test(lowerCode);
      const hasCheckoutSignal = /checkout|order\s*summary|place\s*order/i.test(lowerCode);
      const hasPaymentSignal = /payment|upi:\/\/|razorpay|paypal|stripe/i.test(lowerCode);
      const hasStoreSignal = /(e-?commerce|\bstore\b|\bshop\b)/i.test(lowerCode) && /(product|catalog|inventory)/i.test(lowerCode);
      results.features.isEcommerce = hasCartSignal || hasCheckoutSignal || hasPaymentSignal || hasStoreSignal;

      // Cart functionality
      results.features.hasCart = (
        /\bcart\b/i.test(code) &&
        (/addToCart|add.*cart/i.test(code) || /removeFromCart|remove.*cart/i.test(code))
      );

      // Pricing calculations
      results.features.hasPricing = (
        /price|subtotal|total|tax|shipping/i.test(code) &&
        /reduce\s*\(|map\s*\(.*price|price\s*\*|price\s*\+/i.test(code)
      );

      // Payment integration
      results.features.hasPayment = (
        /payment|razorpay|paypal|stripe|upi/i.test(code) &&
        (/window\.open|window\.location|href=/i.test(code) || /onClick.*payment/i.test(code))
      );

      // State management
      results.features.hasStateManagement = (
        results.patterns.hasUseState &&
        results.stats.stateVariables >= 1
      );

      // Event handlers (support both named handlers and inline arrow handlers)
      results.features.hasEventHandlers = (
        /onClick|onChange|onSubmit|onMouseEnter|onMouseLeave/i.test(code) &&
        (/const\s+handle\w+|function\s+handle\w+|=>\s*\{|\([^)]*\)\s*=>/i.test(code))
      );

      // Dynamic calculations
      results.features.hasDynamicCalculations = (
        /reduce\s*\(|filter\s*\(|map\s*\(/.test(code) &&
        /\*|\+|-|\//.test(code) &&
        (results.features.hasPricing || /calculate|compute|sum|total/i.test(code))
      );

      // Functional completeness check
      if (results.features.isEcommerce) {
        // E-commerce requires: cart, pricing, state, handlers
        results.functionalComplete = (
          results.features.hasCart &&
          results.features.hasPricing &&
          results.features.hasStateManagement &&
          results.features.hasEventHandlers
        );
      } else {
        // Non-ecommerce requires: state or handlers, valid structure
        results.functionalComplete = (
          (results.features.hasStateManagement || results.features.hasEventHandlers) &&
          results.stats.functions >= 1
        );
      }

      // Complexity assessment
      if (results.stats.lines < 300) {
        results.complexity = 'simple';
      } else if (results.stats.lines > 800) {
        results.complexity = 'complex';
      } else {
        results.complexity = 'medium';
      }

      return results;

    } catch (error) {
      console.error('Error analyzing code:', error.message);
      return results;
    }
  }

  /**
   * Check if modification preserved functionality
   */
  static checkModificationPreservation(originalCode, modifiedCode) {
    const originalFeatures = this.analyzeCode(originalCode);
    const modifiedFeatures = this.analyzeCode(modifiedCode);

    const preservedFunctionality = (
      modifiedFeatures.syntaxValid &&
      modifiedFeatures.features.hasStateManagement >= originalFeatures.features.hasStateManagement &&
      modifiedFeatures.features.hasEventHandlers >= originalFeatures.features.hasEventHandlers
    );

    const preservedIds = (
      originalFeatures.patterns.hasDataElementId ? 
        modifiedFeatures.patterns.hasDataElementId : 
        true // Not required if original didn't have it
    );

    return {
      preservedFunctionality,
      preservedIds,
      originalFeatures,
      modifiedFeatures
    };
  }

  /**
   * Get detailed analysis report
   */
  static getAnalysisReport(code) {
    const analysis = this.analyzeCode(code);
    
    return {
      valid: analysis.syntaxValid,
      functional: analysis.functionalComplete,
      complexity: analysis.complexity,
      score: this.calculateScore(analysis),
      details: {
        lines: analysis.stats.lines,
        functions: analysis.stats.functions,
        stateVariables: analysis.stats.stateVariables,
        features: analysis.features,
        patterns: analysis.patterns
      },
      recommendations: this.generateRecommendations(analysis)
    };
  }

  /**
   * Calculate overall quality score (0-100)
   */
  static calculateScore(analysis) {
    let score = 0;

    // Base score for syntax validity (40 points)
    if (analysis.syntaxValid) score += 40;

    // Functional completeness (30 points)
    if (analysis.functionalComplete) score += 30;

    // Features (20 points)
    const featureScore = Object.values(analysis.features).filter(Boolean).length;
    score += (featureScore / Object.keys(analysis.features).length) * 20;

    // Patterns (10 points)
    const patternScore = Object.values(analysis.patterns).filter(Boolean).length;
    score += (patternScore / Object.keys(analysis.patterns).length) * 10;

    return Math.round(score);
  }

  /**
   * Generate recommendations based on analysis
   */
  static generateRecommendations(analysis) {
    const recommendations = [];

    if (!analysis.syntaxValid) {
      recommendations.push('Fix syntax errors before deployment');
    }

    if (!analysis.patterns.hasUseState && analysis.features.isEcommerce) {
      recommendations.push('Add useState for cart management');
    }

    if (!analysis.patterns.hasDataElementId) {
      recommendations.push('Add data-element-id attributes for visual editing');
    }

    if (!analysis.features.hasEventHandlers) {
      recommendations.push('Add event handlers for interactivity');
    }

    if (analysis.features.isEcommerce && !analysis.features.hasPricing) {
      recommendations.push('Implement dynamic price calculations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Code looks good! Ready for deployment.');
    }

    return recommendations;
  }
}
