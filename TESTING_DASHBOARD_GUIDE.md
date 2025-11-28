# Performance Testing Dashboard Guide

## Overview

This document explains how to use the automated testing suite and performance dashboard to validate the metrics claimed in the research paper with empirical data.

## Components

### 1. Performance Monitoring Service
**File:** `backend/services/performance-monitor.js`

Tracks real-time metrics including:
- **Generation Metrics**: Time, success rate, syntax validity, functional completeness
- **RAG Performance**: Retrieval time, similarity scores
- **API Latency**: Response time per endpoint
- **Quality Metrics**: Syntax correctness %, functional completeness %
- **E-commerce Features**: Cart, pricing, payment integration detection

**Data Storage:** `backend/metrics-data.json` (auto-created)

### 2. Code Analyzer
**File:** `backend/services/code-analyzer.js`

Uses Acorn AST parser to analyze:
- Syntax validity
- Functional completeness
- Complexity level (simple/medium/complex)
- E-commerce feature detection (cart, pricing, payment)
- React patterns (useState, useEffect, data-element-ids)

### 3. Test Suite
**File:** `backend/test-suite.js`

Runs comprehensive tests with 10 diverse prompts:
- **Simple (3)**: Contact form, navigation bar, hero section
- **Medium (3)**: Product card, pricing table, testimonials
- **Complex E-commerce (4)**: Full stores with cart/checkout/payment

**Test Categories:**
1. RAG Retrieval Performance (5 queries)
2. Code Generation Quality (10 prompts)
3. Modification Accuracy (2 test cases)
4. Concurrent System Performance (10 simultaneous requests)

**Output:** `backend/test-results.json`

### 4. Performance Dashboard
**File:** `dashboard.html`

Live dashboard showing:
- Key metrics (syntax correctness, functional completeness, generation time, API latency)
- Generation statistics by complexity
- E-commerce feature detection rates
- RAG system performance
- Comparison with baseline methods
- System information and uptime

## Quick Start

### Step 1: Start Backend Server

```bash
cd /home/maverick/major-project/no-code-website-generator
npm run dev:server
```

The server will start on `http://localhost:3001` with these endpoints:
- `GET /metrics` - Current performance metrics
- `GET /metrics/detailed` - Detailed metrics data
- `POST /metrics/reset` - Reset all metrics
- `GET /test-results` - View test results
- `POST /run-tests` - Execute full test suite
- `GET /dashboard` - Serve dashboard HTML

### Step 2: Open Dashboard

**Option A: Using Python HTTP Server**
```bash
# In a new terminal
cd /home/maverick/major-project/no-code-website-generator
python3 -m http.server 8080
```
Then open: `http://localhost:8080/dashboard.html`

**Option B: Direct File Access**
```bash
# Open the file directly in your browser
xdg-open /home/maverick/major-project/no-code-website-generator/dashboard.html
```

### Step 3: Run Tests

**From Dashboard:**
1. Click "▶️ Run Full Test Suite" button
2. Wait for tests to complete (~2-5 minutes)
3. Dashboard will auto-update with real metrics

**From Terminal:**
```bash
cd /home/maverick/major-project/no-code-website-generator
node backend/test-suite.js
```

**Via API:**
```bash
curl -X POST http://localhost:3001/run-tests
```

## API Endpoints

### Get Current Metrics
```bash
curl http://localhost:3001/metrics
```

**Response:**
```json
{
  "summary": {
    "generation": {
      "totalGenerated": 15,
      "successRate": "93.33%",
      "syntaxCorrectness": "100.00%",
      "functionalCompleteness": "92.00%",
      "averageTime": "4.8s",
      "simpleTime": "2.3s",
      "mediumTime": "4.1s",
      "complexTime": "8.7s"
    },
    "rag": {
      "totalQueries": 20,
      "averageRetrievalTime": "0.12s",
      "averageSimilarity": "0.87"
    },
    "api": {
      "totalRequests": 45,
      "averageLatency": "48ms"
    },
    "ecommerce": {
      "cartFunctionality": "75%",
      "pricingCalculations": "80%",
      "paymentIntegration": "70%",
      "total": 12
    }
  }
}
```

### Run Test Suite
```bash
curl -X POST http://localhost:3001/run-tests
```

**Response includes:**
- Test execution summary
- Updated metrics
- Detailed results saved to `backend/test-results.json`

### View Test Results
```bash
curl http://localhost:3001/test-results
```

### Reset Metrics
```bash
curl -X POST http://localhost:3001/metrics/reset
```

## Dashboard Features

### Real-Time Metrics
- Auto-refreshes every 30 seconds
- Shows live data from ongoing operations
- Updates immediately after test runs

### Key Metrics Cards
- **Syntax Correctness**: % of generated code with valid syntax
- **Functional Completeness**: % with all required features working
- **Average Generation Time**: Mean time from prompt to code
- **API Latency**: Average API response time

### Generation Statistics
- Total components generated
- Success rate with progress bar
- Breakdown by complexity (simple/medium/complex)

### E-commerce Detection
- Cart functionality rate
- Pricing calculation rate
- Payment integration rate
- Total e-commerce apps generated

### RAG System Performance
- Total queries processed
- Average retrieval time
- Average similarity score
- Template corpus size (11 templates)

### Comparison Table
Compares your system against:
- Manual coding (100% functional, 1-2 hours)
- Basic LLM without RAG (65% functional, 8-12s)
- Template systems (80% functional, 2-3s)

## Test Suite Details

### Test Prompts

**Simple Components (Expected: 2-4s):**
1. Contact form with validation
2. Responsive navigation bar
3. Hero section with CTA

**Medium Components (Expected: 4-6s):**
4. Product card with image
5. Pricing table with tiers
6. Testimonials carousel

**Complex E-commerce (Expected: 6-10s):**
7. Complete e-commerce store with cart, checkout, payment
8. Shopping cart with UPI payment integration
9. Product marketplace with search and filters
10. Electronics store with categories and sorting

### What Gets Tested

**RAG Retrieval:**
- Query: "shopping cart" → Should retrieve e-commerce templates
- Query: "contact form" → Should retrieve form templates
- Query: "payment integration" → Should retrieve payment components
- Measures retrieval time and similarity scores

**Code Generation:**
- All 10 prompts executed
- Code analyzed for syntax validity
- Functional completeness checked
- E-commerce features detected
- Success/failure tracked

**Modifications:**
- Tests code modification with prompts
- Verifies functionality preservation
- Checks data-element-id preservation

**System Performance:**
- 10 concurrent generation requests
- Measures API latency under load
- Tests system stability

## Validation Workflow

### For Research Paper Update

1. **Run Clean Test**
   ```bash
   # Reset metrics for fresh data
   curl -X POST http://localhost:3001/metrics/reset
   
   # Run full test suite
   node backend/test-suite.js
   ```

2. **Review Results**
   ```bash
   # View detailed results
   cat backend/test-results.json | jq
   
   # View summary metrics
   curl http://localhost:3001/metrics | jq
   ```

3. **Update Research Paper**
   - Use metrics from test-results.json
   - Update `research_paper_updated.tex` with empirical data
   - Replace estimated values with validated numbers

4. **Document Evidence**
   - Save test-results.json as proof
   - Screenshot dashboard for visual evidence
   - Include in research paper appendix

## Metrics Interpretation

### Syntax Correctness
- **Target:** >95%
- **Meaning:** Generated code has no syntax errors
- **Current:** Based on Acorn parser validation

### Functional Completeness
- **Target:** >90%
- **Meaning:** All requested features work correctly
- **Analysis:** Checks for useState, useEffect, event handlers, etc.

### Generation Time
- **Simple:** <3s expected
- **Medium:** <5s expected  
- **Complex:** <10s expected
- **Measured:** From API request to response

### API Latency
- **Target:** <100ms
- **Meaning:** Server response time
- **Measured:** Per endpoint across all requests

### E-commerce Features
- **Cart Detection:** addToCart, removeFromCart, cart state
- **Pricing Detection:** price calculations, subtotal, total
- **Payment Detection:** Razorpay, PayPal, UPI, payment handlers

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill existing process
pkill -f "tsx.*server.ts"

# Restart
npm run dev:server
```

### Tests Fail
```bash
# Check server logs
npm run dev:server

# Run single test manually
node -e "
import { componentGenerator } from './backend/generators/component-generator.js';
const result = await componentGenerator('Create a contact form');
console.log(result.code ? 'Success' : 'Failed');
"
```

### Dashboard Not Loading
```bash
# Ensure server is running
curl http://localhost:3001/metrics

# Check CORS if accessing from different origin
# Server already has CORS enabled

# Use Python server for dashboard
python3 -m http.server 8080
```

### Metrics Not Updating
```bash
# Check if metrics file exists
ls -la backend/metrics-data.json

# View raw metrics
cat backend/metrics-data.json | jq

# Reset and retry
curl -X POST http://localhost:3001/metrics/reset
curl -X POST http://localhost:3001/run-tests
```

## Integration Status

### ✅ Implemented
- Performance monitoring service
- Code quality analyzer with Acorn
- Comprehensive test suite with 10 prompts
- Live performance dashboard
- API endpoints for metrics
- Real-time tracking in /generate and /modify endpoints

### 🔄 Active Monitoring
- Every generation is analyzed and tracked
- Every modification is verified
- All API requests are timed
- Metrics persist across sessions

### 📊 Data Flow
```
User Request
    ↓
/generate or /modify endpoint
    ↓
Track start time
    ↓
Execute generation/modification
    ↓
Analyze code with CodeAnalyzer
    ↓
Track metrics with PerformanceMonitor
    ↓
Save to metrics-data.json
    ↓
Dashboard auto-refreshes (30s)
    ↓
Display updated metrics
```

## Research Paper Validation

### Claimed Metrics (from code analysis)
- Syntax Correctness: 98%
- Functional Completeness: 92%
- Generation Time: ~5s
- API Latency: ~50ms
- Template Corpus: 11 templates
- Success Rate: >90%

### Validation Process
1. Run test suite (10 diverse prompts)
2. Collect empirical data
3. Compare with claimed metrics
4. Update paper if significant deviation (>5%)
5. Document all results

### Expected Outcomes
- Syntax correctness should be 95-100% (Acorn validation)
- Functional completeness 85-95% (depends on complexity)
- Simple components: 2-4s
- Medium components: 4-6s
- Complex e-commerce: 6-10s
- API latency: 40-80ms (depends on AI model response)

## Files Created/Modified

### New Files
- `backend/services/performance-monitor.js` (270 lines)
- `backend/services/code-analyzer.js` (255 lines)
- `backend/test-suite.js` (468 lines)
- `dashboard.html` (responsive dashboard)
- `TESTING_DASHBOARD_GUIDE.md` (this file)

### Modified Files
- `backend/server.ts` - Added metrics endpoints and monitoring integration
- Metrics auto-tracked in /generate and /modify endpoints

### Generated Files
- `backend/metrics-data.json` - Live metrics (auto-created)
- `backend/test-results.json` - Test output (created after running tests)

## Next Steps

1. **Run Initial Tests**
   ```bash
   npm run dev:server
   node backend/test-suite.js
   ```

2. **Review Dashboard**
   - Open http://localhost:8080/dashboard.html
   - Verify all metrics display correctly
   - Run tests from dashboard UI

3. **Validate Research Paper**
   - Compare test results with claimed metrics
   - Update research_paper_updated.tex if needed
   - Document validation methodology

4. **Production Deployment**
   - Deploy dashboard as separate website
   - Add authentication for dashboard access
   - Set up monitoring alerts
   - Schedule periodic test runs

## Support

For issues or questions:
1. Check server logs: `npm run dev:server`
2. Review test output: `cat backend/test-results.json`
3. Inspect metrics: `curl http://localhost:3001/metrics`
4. Check dashboard console: Browser DevTools → Console

## Conclusion

This testing infrastructure provides:
- ✅ Automated validation of research paper claims
- ✅ Real-time performance monitoring
- ✅ Proof-of-concept dashboard with live metrics
- ✅ Comprehensive test coverage (10 prompts, 4 test categories)
- ✅ Empirical data for publication

Use this system to:
1. Validate your research paper metrics
2. Demonstrate system capabilities to stakeholders
3. Monitor production performance
4. Identify optimization opportunities
