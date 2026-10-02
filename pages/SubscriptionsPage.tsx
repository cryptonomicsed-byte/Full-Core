import React, { useState } from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { creditSystemService } from '../services/creditSystemService';
import { toast as toastService } from '../services/toastService';

type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export default function SubscriptionsPage() {
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('starter');
  const [credits, setCredits] = useState(500);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const plans = creditSystemService.getAllPlans();
  const packs = creditSystemService.getAvailablePacks();

  // Handle upgrade
  const handleUpgrade = (tier: SubscriptionTier) => {
    if (tier === currentTier) {
      toastService.info('Already on this plan');
      return;
    }

    // In production: process payment via Stripe
    toastService.success(`✅ Upgraded to ${creditSystemService.getPlan(tier).name}`);
    setCurrentTier(tier);
  };

  // Handle pack purchase
  const handleBuyPack = (index: number) => {
    const pack = packs[index];
    if (!pack) return;

    // In production: process payment via Stripe
    const result = creditSystemService.purchasePack(
      {
        tier: currentTier,
        totalCredits: credits,
        usedToday: 0,
        usedThisMonth: 0,
        refundPending: 0,
        nextResetDate: '',
      },
      index
    );

    if (result.success) {
      setCredits(result.newCredits.totalCredits);
      toastService.success(`✅ ${pack.name} purchased! +${pack.credits} credits`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-yellow-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">💳 Subscriptions & Billing</h1>
        <p className="text-slate-400 mb-8">Upgrade your plan or buy credits</p>

        {/* Current Status */}
        <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-400">Current Plan</p>
              <p className="text-2xl font-bold text-white">{creditSystemService.getPlan(currentTier).name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Available Credits</p>
              <p className="text-2xl font-bold text-green-400">{credits}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Monthly Allotment</p>
              <p className="text-2xl font-bold text-blue-400">
                {creditSystemService.getPlan(currentTier).monthlyCredits}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-lg border p-6 transition-all ${
                  currentTier === plan.tier
                    ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500 ring-2 ring-purple-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                {/* Icon */}
                <div className="mb-4">
                  {plan.tier === 'starter' && <Zap className="w-8 h-8 text-yellow-400" />}
                  {plan.tier === 'pro' && <Sparkles className="w-8 h-8 text-blue-400" />}
                  {plan.tier === 'enterprise' && <Crown className="w-8 h-8 text-purple-400" />}
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-4">
                  {plan.price === 0 ? (
                    <p className="text-3xl font-bold text-green-400">Free</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-white">${plan.price}</p>
                      <p className="text-sm text-slate-400">/month</p>
                    </>
                  )}
                </div>

                {/* Credits */}
                <div className="mb-6 p-3 bg-slate-900/50 rounded">
                  <p className="text-sm text-slate-400">Monthly Credits</p>
                  <p className="text-2xl font-bold text-white">{creditSystemService.formatCredits(plan.monthlyCredits)}</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                {currentTier === plan.tier ? (
                  <button
                    disabled
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.tier)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium"
                  >
                    Upgrade Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Credit Packs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">💰 Buy Credit Packs</h2>
          <p className="text-slate-400 mb-6">Need more credits? Buy additional packs anytime.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packs.map((pack, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-4">{pack.name}</h3>

                <div className="mb-6 p-4 bg-slate-900/50 rounded">
                  <p className="text-sm text-slate-400">Credits</p>
                  <p className="text-3xl font-bold text-green-400">{creditSystemService.formatCredits(pack.credits)}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">${pack.price.toFixed(2)}</span>
                  <span className="text-sm text-slate-400">
                    ({(pack.price / pack.credits * 100).toFixed(3)}¢/credit)
                  </span>
                </div>

                <button
                  onClick={() => handleBuyPack(i)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium"
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">📋 Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300">Feature</th>
                  <th className="text-center py-3 px-4 text-slate-300">Starter</th>
                  <th className="text-center py-3 px-4 text-slate-300">Pro</th>
                  <th className="text-center py-3 px-4 text-slate-300">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">DNA Extraction</td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">Campaign Generation</td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">Auto-Post (IG, TikTok)</td>
                  <td className="text-center text-red-400">✗</td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">Website Builder</td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                  <td className="text-center text-green-400">
                    <Check className="w-5 h-5 inline" />
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-slate-300">AI Agents</td>
                  <td className="text-center text-slate-400">1</td>
                  <td className="text-center text-slate-400">5</td>
                  <td className="text-center text-slate-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-300">Team Members</td>
                  <td className="text-center text-slate-400">1</td>
                  <td className="text-center text-slate-400">5</td>
                  <td className="text-center text-slate-400">50</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
