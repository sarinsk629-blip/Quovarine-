/**
 * SelfHealer - Self-Healing System for Automatic Provider Failover
 * Monitors adapters, switches providers on failure, and logs recovery actions
 */

import { OmniAdapter } from '@/adapters/claude/OmniAdapter';
import { CloudOrchestrator } from '@/adapters/cloud/CloudOrchestrator';
import {
  RecoveryAction,
  HealthStatus,
  AIProvider,
  CloudType,
  QuovarineError
} from '@/types/quovarine';
import { PROVIDERS_CONFIG } from '@/config/providers';

export class SelfHealer {
  private aiAdapter: OmniAdapter;
  private cloudOrchestrator: CloudOrchestrator;
  private recoveryHistory: RecoveryAction[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private consecutiveFailures: Map<string, number> = new Map();
  private isMonitoring = false;

  constructor(
    aiProvider: AIProvider = AIProvider.ANTHROPIC,
    cloudProvider: CloudType = CloudType.VERCEL
  ) {
    this.aiAdapter = new OmniAdapter(aiProvider);
    this.cloudOrchestrator = new CloudOrchestrator(cloudProvider);
  }

  /**
   * Start monitoring all adapters
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.warn('Self-healing monitoring already started');
      return;
    }

    this.isMonitoring = true;
    const interval = PROVIDERS_CONFIG.selfHealing.healthCheckInterval;

    console.log(`Starting self-healing monitoring (interval: ${interval}ms)`);

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, interval);

    // Start cloud orchestrator health checks
    this.cloudOrchestrator.startHealthChecks();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.cloudOrchestrator.stopHealthChecks();
    this.isMonitoring = false;
    console.log('Self-healing monitoring stopped');
  }

  /**
   * Perform health checks on all adapters
   */
  private async performHealthChecks() {
    try {
      // Check AI adapter
      await this.checkAIAdapter();

      // Check cloud providers (handled by CloudOrchestrator internally)
      await this.checkCloudProviders();
    } catch (error) {
      console.error('Error during health checks:', error);
    }
  }

  /**
   * Check AI adapter health
   */
  private async checkAIAdapter() {
    try {
      const health = await this.aiAdapter.healthCheck();

      if (!health.healthy) {
        await this.handleAIFailure(health);
      } else {
        // Reset failure count on success
        this.consecutiveFailures.set('ai', 0);
      }
    } catch (error) {
      console.error('AI adapter health check failed:', error);
      await this.handleAIFailure({
        healthy: false,
        provider: this.aiAdapter.getCurrentProvider(),
        latency: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  /**
   * Check cloud providers health
   */
  private async checkCloudProviders() {
    try {
      const healthMap = await this.cloudOrchestrator.checkAllProviders();
      
      for (const [providerType, health] of healthMap) {
        if (!health.healthy) {
          await this.handleCloudFailure(providerType, health);
        } else {
          this.consecutiveFailures.set(`cloud-${providerType}`, 0);
        }
      }
    } catch (error) {
      console.error('Cloud provider health check failed:', error);
    }
  }

  /**
   * Handle AI adapter failure
   */
  private async handleAIFailure(health: HealthStatus) {
    const failureCount = (this.consecutiveFailures.get('ai') || 0) + 1;
    this.consecutiveFailures.set('ai', failureCount);

    console.warn(`AI adapter failure detected (${failureCount}/${PROVIDERS_CONFIG.selfHealing.alertThreshold}):`, health.error);

    // Trigger failover if threshold reached
    if (failureCount >= PROVIDERS_CONFIG.selfHealing.alertThreshold) {
      await this.performAIFailover(health.provider);
    }
  }

  /**
   * Handle cloud provider failure
   */
  private async handleCloudFailure(provider: CloudType, health: HealthStatus) {
    const key = `cloud-${provider}`;
    const failureCount = (this.consecutiveFailures.get(key) || 0) + 1;
    this.consecutiveFailures.set(key, failureCount);

    console.warn(`Cloud provider ${provider} failure detected (${failureCount}/${PROVIDERS_CONFIG.selfHealing.alertThreshold}):`, health.error);

    // Cloud orchestrator handles failover internally
    if (failureCount >= PROVIDERS_CONFIG.selfHealing.alertThreshold) {
      this.logAlert(`Cloud provider ${provider} unhealthy`, health.error);
    }
  }

  /**
   * Perform AI adapter failover
   */
  private async performAIFailover(failedProvider: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const availableProviders = this.aiAdapter.getAvailableProviders();
      const currentProvider = this.aiAdapter.getCurrentProvider();

      // Find next available provider
      const nextProvider = availableProviders.find(p => p !== currentProvider);

      if (!nextProvider) {
        throw new QuovarineError(
          'No alternative AI providers available',
          'NO_FAILOVER_AVAILABLE',
          failedProvider
        );
      }

      console.log(`Failing over AI from ${currentProvider} to ${nextProvider}`);

      // Switch provider
      this.aiAdapter.switchProvider(nextProvider);

      // Verify new provider works
      const health = await this.aiAdapter.healthCheck();

      if (!health.healthy) {
        throw new QuovarineError(
          'Failover provider is also unhealthy',
          'FAILOVER_UNHEALTHY',
          nextProvider
        );
      }

      // Record successful recovery
      const recovery: RecoveryAction = {
        id: `recovery-${Date.now()}`,
        timestamp: new Date(),
        failedProvider,
        failoverProvider: nextProvider,
        reason: 'Consecutive health check failures',
        success: true,
        duration: Date.now() - startTime
      };

      this.recoveryHistory.push(recovery);
      this.consecutiveFailures.set('ai', 0);

      console.log(`✓ AI failover successful: ${failedProvider} → ${nextProvider}`);
      this.logAlert('AI Failover Success', `Switched from ${failedProvider} to ${nextProvider}`);

      return true;
    } catch (error) {
      const recovery: RecoveryAction = {
        id: `recovery-${Date.now()}`,
        timestamp: new Date(),
        failedProvider,
        failoverProvider: 'none',
        reason: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        duration: Date.now() - startTime
      };

      this.recoveryHistory.push(recovery);

      console.error('✗ AI failover failed:', error);
      this.logAlert('AI Failover Failed', error instanceof Error ? error.message : 'Unknown error');

      return false;
    }
  }

  /**
   * Log alert (can be extended to send to GitHub Actions, Slack, etc.)
   */
  private logAlert(title: string, message?: string) {
    const alert = {
      timestamp: new Date().toISOString(),
      title,
      message,
      recoveryHistory: this.recoveryHistory.slice(-5) // Last 5 actions
    };

    console.error('🚨 ALERT:', JSON.stringify(alert, null, 2));

    // In GitHub Actions, we can use workflow commands
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::warning::${title}: ${message}`);
    }
  }

  /**
   * Get recovery history
   */
  getRecoveryHistory(): RecoveryAction[] {
    return [...this.recoveryHistory];
  }

  /**
   * Get recent recovery actions
   */
  getRecentRecoveries(count: number = 10): RecoveryAction[] {
    return this.recoveryHistory.slice(-count);
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats() {
    const total = this.recoveryHistory.length;
    const successful = this.recoveryHistory.filter(r => r.success).length;
    const failed = total - successful;
    const averageDuration = total > 0
      ? this.recoveryHistory.reduce((sum, r) => sum + r.duration, 0) / total
      : 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDuration,
      lastRecovery: this.recoveryHistory[this.recoveryHistory.length - 1]
    };
  }

  /**
   * Get current health status of all systems
   */
  async getCurrentHealth() {
    const aiHealth = await this.aiAdapter.healthCheck();
    const cloudHealth = await this.cloudOrchestrator.checkAllProviders();

    return {
      ai: aiHealth,
      cloud: Array.from(cloudHealth.entries()).map(([providerType, health]) => ({
        providerType,
        ...health
      })),
      isMonitoring: this.isMonitoring,
      consecutiveFailures: Object.fromEntries(this.consecutiveFailures)
    };
  }

  /**
   * Force a manual failover for AI adapter
   */
  async forceAIFailover(): Promise<boolean> {
    const currentProvider = this.aiAdapter.getCurrentProvider();
    return this.performAIFailover(currentProvider);
  }

  /**
   * Clear recovery history
   */
  clearHistory() {
    this.recoveryHistory = [];
    this.consecutiveFailures.clear();
  }

  /**
   * Export recovery history as JSON
   */
  exportHistory(): string {
    return JSON.stringify({
      recoveryHistory: this.recoveryHistory,
      stats: this.getRecoveryStats()
    }, null, 2);
  }

  /**
   * Get monitoring status
   */
  isActive(): boolean {
    return this.isMonitoring;
  }
}

export default SelfHealer;
