/**
 * Sacred Core Backend API Server
 * Serves REST endpoints for the frontend application
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

const app = Fastify({
  logger: true,
  trustProxy: true
});

// Environment
const PORT = parseInt(process.env.API_PORT || '4000', 10);
const HOST = process.env.API_HOST || '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

/**
 * Register plugins
 */
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
});

await app.register(jwt, {
  secret: JWT_SECRET
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes'
});

/**
 * Health Check
 */
app.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

/**
 * Auth Routes
 */
app.post('/api/auth/login', async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password required' });
  }

  // Mock authentication (replace with real auth in production)
  const token = app.jwt.sign(
    {
      userId: 'user-123',
      email: email,
      tier: 'pro',
      credits: 500
    },
    { expiresIn: '7d' }
  );

  return {
    success: true,
    token,
    user: {
      id: 'user-123',
      email,
      name: email.split('@')[0],
      tier: 'pro',
      credits: 500
    }
  };
});

app.post('/api/auth/logout', async (request, reply) => {
  return { success: true, message: 'Logged out' };
});

/**
 * Campaign Routes
 */
app.get('/api/campaigns', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 'campaign-1',
        name: 'Summer Sale',
        status: 'active',
        createdAt: new Date().toISOString(),
        assets: [],
        stats: {
          impressions: 10000,
          clicks: 500,
          conversions: 50
        }
      }
    ],
    total: 1
  };
});

app.post('/api/campaigns', async (request, reply) => {
  const { name, description } = request.body as { name: string; description: string };

  if (!name) {
    return reply.status(400).send({ error: 'Campaign name required' });
  }

  return {
    success: true,
    data: {
      id: `campaign-${Date.now()}`,
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
      assets: [],
      stats: {
        impressions: 0,
        clicks: 0,
        conversions: 0
      }
    }
  };
});

app.get('/api/campaigns/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  return {
    success: true,
    data: {
      id,
      name: 'Summer Sale Campaign',
      status: 'active',
      createdAt: new Date().toISOString(),
      assets: [
        {
          id: 'asset-1',
          title: 'Summer Sale Post',
          content: 'Check out our summer collection!',
          imageUrl: 'https://via.placeholder.com/1024x1024',
          cta: 'Shop Now',
          platform: 'instagram'
        }
      ],
      stats: {
        impressions: 10000,
        clicks: 500,
        conversions: 50,
        roi: 245.67
      }
    }
  };
});

/**
 * Analytics Routes
 */
app.get('/api/analytics/campaigns/:id', async (request, reply) => {
  const { id } = request.params as { id: string };

  return {
    success: true,
    data: {
      campaignId: id,
      roi: 245.67,
      roas: 3.2,
      conversions: 50,
      revenue: 12450,
      cost: 3800,
      ctr: 5.0,
      conversionRate: 10.0
    }
  };
});

app.get('/api/analytics/performance', async (request, reply) => {
  return {
    success: true,
    data: {
      totalImpressions: 100000,
      totalClicks: 5000,
      totalConversions: 500,
      totalRevenue: 125000,
      averageROI: 250,
      averageRoas: 3.5,
      topCampaigns: [
        {
          campaignId: 'campaign-1',
          name: 'Summer Sale',
          roi: 450
        }
      ]
    }
  };
});

/**
 * Cost Tracking Routes
 */
app.get('/api/costs/summary', async (request, reply) => {
  return {
    success: true,
    data: {
      totalCost: 156.78,
      costByProvider: {
        openai: 45.20,
        'stability-ultra': 78.90,
        'google-veo': 32.68
      },
      costByOperation: {
        text_generation: 45.20,
        image_generation: 78.90,
        video_generation: 32.68
      },
      operationCount: {
        text_generation: 15000,
        image_generation: 3000,
        video_generation: 200
      }
    }
  };
});

app.get('/api/costs/daily-trend', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        date: new Date().toISOString().split('T')[0],
        cost: 15.45,
        operations: 500
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        cost: 12.30,
        operations: 450
      }
    ]
  };
});

/**
 * Provider Routes
 */
app.get('/api/providers/status', async (request, reply) => {
  return {
    success: true,
    data: {
      llm: [
        { name: 'gemini', status: 'healthy', successRate: 99.8, avgResponse: 150 },
        { name: 'openai', status: 'healthy', successRate: 99.7, avgResponse: 245 },
        { name: 'anthropic', status: 'healthy', successRate: 99.5, avgResponse: 320 }
      ],
      image: [
        { name: 'stability-ultra', status: 'healthy', successRate: 99.9, avgResponse: 2000 },
        { name: 'dalle-4', status: 'healthy', successRate: 99.8, avgResponse: 3000 }
      ],
      video: [
        { name: 'google-veo', status: 'healthy', successRate: 99.2, avgResponse: 'queued' },
        { name: 'sora', status: 'healthy', successRate: 99.1, avgResponse: 'queued' }
      ]
    }
  };
});

/**
 * Settings Routes
 */
app.get('/api/settings', async (request, reply) => {
  return {
    success: true,
    data: {
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'User'
      },
      providers: {
        activeLLM: 'gemini',
        activeImage: 'stability-ultra',
        activeVideo: 'google-veo'
      },
      notifications: {
        email: true,
        slack: false
      }
    }
  };
});

app.put('/api/settings', async (request, reply) => {
  const updates = request.body as Record<string, any>;

  return {
    success: true,
    message: 'Settings updated',
    data: {
      ...updates,
      updatedAt: new Date().toISOString()
    }
  };
});

/**
 * Stripe Checkout Routes
 */
app.get('/api/stripe/checkout', async (request, reply) => {
  const query = request.query as Record<string, string>;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    return reply.status(503).send({
      success: false,
      error: 'Stripe not configured. Set STRIPE_SECRET_KEY in environment.'
    });
  }

  // Dynamic import stripe for server-side only
  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeSecretKey);

  const priceMap: Record<string, string> = {
    pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    pro_annual: process.env.STRIPE_PRICE_PRO_ANNUAL || '',
    enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || '',
  };

  try {
    let priceId: string | undefined;

    if (query.tier) {
      const billing = query.billing || 'monthly';
      priceId = priceMap[`${query.tier}_${billing}`];
    }

    if (!priceId) {
      return reply.status(400).send({ error: 'Invalid checkout parameters' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL || 'http://localhost:3001'}/#/subscriptions?success=true`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3001'}/#/subscriptions?canceled=true`,
      metadata: { userId: query.userId || '' },
    });

    return reply.redirect(303, session.url!);
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return reply.status(500).send({ error: 'Failed to create checkout session' });
  }
});

/**
 * Error handler
 */
app.setErrorHandler((error, request, reply) => {
  console.error('API Error:', error);

  if (error.statusCode === 400) {
    return reply.status(400).send({
      success: false,
      error: error.message || 'Bad request'
    });
  }

  if (error.statusCode === 401) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized'
    });
  }

  if (error.statusCode === 404) {
    return reply.status(404).send({
      success: false,
      error: 'Not found'
    });
  }

  return reply.status(500).send({
    success: false,
    error: 'Internal server error'
  });
});

/**
 * Start server
 */
const start = async () => {
  try {
    await app.listen({ host: HOST, port: PORT });
    console.log(`\n✅ Sacred Core API Server running at http://${HOST}:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 CORS enabled for: ${process.env.CORS_ORIGIN || 'localhost:3001, localhost:3000'}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    console.log(`\n⏹️  Received ${signal}, shutting down gracefully...`);
    await app.close();
    process.exit(0);
  });
});

start();
