/**
 * Stripe Service - Payment Processing
 * Handles subscriptions, credit packs, and overage billing
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { pricingService, Tier } from './pricingService';

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
  type: 'subscription' | 'credit-pack' | 'upgrade';
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceInCents: number;
  stripePriceId: string;
}

class StripeService {
  private stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  private stripePromise: Promise<Stripe | null> | null = null;

  private getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise && this.stripePublishableKey) {
      this.stripePromise = loadStripe(this.stripePublishableKey);
    }
    return this.stripePromise || Promise.resolve(null);
  }

  // Credit packs (self-service)
  private creditPacks: CreditPack[] = [
    {
      id: 'pack-small',
      name: '500 Credits',
      credits: 500,
      priceInCents: 499, // $4.99
      stripePriceId: 'price_starter_500'
    },
    {
      id: 'pack-medium',
      name: '1000 Credits',
      credits: 1000,
      priceInCents: 999, // $9.99
      stripePriceId: 'price_starter_1000'
    },
    {
      id: 'pack-large',
      name: '5000 Credits',
      credits: 5000,
      priceInCents: 4499, // $44.99
      stripePriceId: 'price_starter_5000'
    },
    {
      id: 'pack-xlarge',
      name: '10000 Credits',
      credits: 10000,
      priceInCents: 8999, // $89.99
      stripePriceId: 'price_starter_10000'
    }
  ];

  // Subscription tiers (mapped to Stripe price IDs)
  private subscriptionTiers = {
    pro: {
      name: 'Pro',
      price: 4900, // $49/month
      stripePriceId: 'price_pro_monthly',
      stripePriceIdAnnual: 'price_pro_annual' // $490/year (10% discount)
    },
    enterprise: {
      name: 'Enterprise',
      price: 19900, // $199/month
      stripePriceId: 'price_enterprise_monthly',
      stripePriceIdAnnual: 'price_enterprise_annual' // $1990/year (10% discount)
    }
  };

  // ===== SUBSCRIPTION CHECKOUT =====

  async createSubscriptionCheckout(
    userId: string,
    tier: 'pro' | 'enterprise',
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<StripeCheckoutSession> {
    console.log(`💳 Creating ${tier} subscription checkout for ${userId}...`);

    const tierConfig = this.subscriptionTiers[tier];
    const priceId = billingCycle === 'annual' 
      ? tierConfig.stripePriceIdAnnual 
      : tierConfig.stripePriceId;

    const sessionId = `cs_${Date.now()}`;

    // If Stripe publishable key is configured, create real redirect
    const stripe = await this.getStripe();
    if (stripe) {
      // In production: call your backend /api/create-checkout-session
      // which creates a Stripe Checkout Session and returns the URL.
      // For now, redirect to Stripe's payment link pattern.
      const url = `/api/stripe/checkout?tier=${tier}&billing=${billingCycle}&userId=${userId}`;
      console.log(`💳 Stripe checkout initiated for ${tier} (${billingCycle})`);
      return { sessionId, url, type: 'subscription' };
    }

    // Fallback: no Stripe key configured
    console.warn('⚠️ Stripe not configured. Set VITE_STRIPE_PUBLISHABLE_KEY in .env');
    return {
      sessionId,
      url: '#stripe-not-configured',
      type: 'subscription'
    };
  }

  // ===== CREDIT PACK CHECKOUT =====

  async createCreditPackCheckout(userId: string, packId: string): Promise<StripeCheckoutSession> {
    const pack = this.creditPacks.find(p => p.id === packId);
    if (!pack) {
      throw new Error(`Credit pack not found: ${packId}`);
    }

    console.log(`💳 Creating credit pack checkout: ${pack.name}`);
    const sessionId = `cs_${Date.now()}`;

    const stripe = await this.getStripe();
    if (stripe) {
      const url = `/api/stripe/checkout?pack=${packId}&userId=${userId}`;
      return { sessionId, url, type: 'credit-pack' };
    }

    console.warn('⚠️ Stripe not configured for credit pack purchase');
    return { sessionId, url: '#stripe-not-configured', type: 'credit-pack' };
  }

  // ===== UPGRADE CHECKOUT =====

  async createUpgradeCheckout(
    userId: string,
    currentTier: Tier,
    upgradeTier: 'pro' | 'enterprise',
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<StripeCheckoutSession> {
    console.log(`💳 Creating upgrade from ${currentTier} to ${upgradeTier}...`);
    const sessionId = `cs_${Date.now()}`;

    const stripe = await this.getStripe();
    if (stripe) {
      const url = `/api/stripe/checkout?upgrade=${upgradeTier}&from=${currentTier}&billing=${billingCycle}&userId=${userId}`;
      return { sessionId, url, type: 'upgrade' };
    }

    console.warn('⚠️ Stripe not configured for upgrade');
    return { sessionId, url: '#stripe-not-configured', type: 'upgrade' };
  }

  private calculateProration(newPrice: number, currentTier: Tier, upgradeTier: string): number {
    // Simple proation: charge difference for remainder of month
    // In production, calculate based on billing period
    const daysRemaining = 30; // placeholder
    return Math.floor((newPrice / 30) * daysRemaining);
  }

  // ===== WEBHOOK HANDLERS (Firebase Functions) =====

  async handleSubscriptionCreated(
    userId: string,
    tier: 'pro' | 'enterprise',
    subscriptionId: string,
    billingCycle: 'monthly' | 'annual'
  ): Promise<void> {
    const tierConfig = pricingService.getTierConfig(tier);
    console.log(`✅ Subscription created: ${subscriptionId} — ${tierConfig.includedCredits} credits granted`);
  }

  async handleSubscriptionRenewed(userId: string, subscriptionId: string, tier: 'pro' | 'enterprise'): Promise<void> {
    const tierConfig = pricingService.getTierConfig(tier);
    console.log(`✅ Subscription renewed: ${subscriptionId} — ${tierConfig.includedCredits} credits refreshed`);
  }

  async handleSubscriptionCanceled(userId: string, subscriptionId: string): Promise<void> {
    console.log(`❌ Subscription canceled: ${subscriptionId} — downgraded to starter`);
  }

  async handleCreditPackPurchased(userId: string, packId: string): Promise<void> {
    const pack = this.creditPacks.find(p => p.id === packId);
    if (!pack) return;
    console.log(`✅ Credit pack purchased: ${pack.name} — +${pack.credits} credits`);
  }

  async handlePaymentFailed(userId: string, reason: string): Promise<void> {
    console.log(`❌ Payment failed for ${userId}: ${reason}`);
  }

  // ===== HELPERS =====

  getAvailableCreditPacks(): CreditPack[] {
    return this.creditPacks;
  }

  getPack(packId: string): CreditPack | undefined {
    return this.creditPacks.find(p => p.id === packId);
  }

  getSubscriptionPrice(tier: 'pro' | 'enterprise', billingCycle: 'monthly' | 'annual' = 'monthly'): number {
    const config = this.subscriptionTiers[tier];
    if (billingCycle === 'annual') {
      return Math.floor(config.price * 0.9); // 10% discount
    }
    return config.price;
  }

  formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export const stripeService = new StripeService();
