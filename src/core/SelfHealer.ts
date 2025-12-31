/**
 * SelfHealer
 * Automatic error detection and recovery system
 */

import { RecoveryAction, TaskSlice, HealthStatus } from '../types/quovarine';

export interface HealingStrategy {
  maxRetries: number;
  retryDelay: number;
  escalationThreshold: number;
}

export class SelfHealer {
  private recoveryActions: RecoveryAction[] = [];
  private strategy: HealingStrategy;
  
  constructor(strategy?: Partial<HealingStrategy>) {
    this.strategy = {
      maxRetries: strategy?.maxRetries || 3,
      retryDelay: strategy?.retryDelay || 1000,
      escalationThreshold: strategy?.escalationThreshold || 5,
    };
  }
  
  /**
   * Analyze a failed task and determine recovery action
   */
  async analyzeFailure(slice: TaskSlice): Promise<RecoveryAction | null> {
    const retryCount = slice.retryCount || 0;
    
    // If under retry limit, attempt retry
    if (retryCount < this.strategy.maxRetries) {
      const action: RecoveryAction = {
        type: 'retry',
        target: slice.id,
        reason: `Task failed, attempting retry ${retryCount + 1}/${this.strategy.maxRetries}`,
        timestamp: new Date().toISOString(),
        automated: true,
      };
      
      this.recoveryActions.push(action);
      return action;
    }
    
    // If retries exhausted, escalate to alert
    const action: RecoveryAction = {
      type: 'alert',
      target: slice.id,
      reason: `Task failed after ${this.strategy.maxRetries} retries: ${slice.error}`,
      timestamp: new Date().toISOString(),
      automated: true,
    };
    
    this.recoveryActions.push(action);
    return action;
  }
  
  /**
   * Check system health and trigger recovery if needed
   */
  async checkHealth(health: HealthStatus): Promise<RecoveryAction | null> {
    if (health.status === 'unhealthy') {
      const failedChecks = health.checks?.filter(c => c.status === 'fail') || [];
      
      const action: RecoveryAction = {
        type: 'rollback',
        target: health.service,
        reason: `System unhealthy: ${failedChecks.map(c => c.name).join(', ')}`,
        timestamp: new Date().toISOString(),
        automated: true,
      };
      
      this.recoveryActions.push(action);
      return action;
    }
    
    if (health.status === 'degraded') {
      const warnChecks = health.checks?.filter(c => c.status === 'warn') || [];
      
      if (warnChecks.length >= this.strategy.escalationThreshold) {
        const action: RecoveryAction = {
          type: 'alert',
          target: health.service,
          reason: `System degraded: ${warnChecks.length} warnings detected`,
          timestamp: new Date().toISOString(),
          automated: true,
        };
        
        this.recoveryActions.push(action);
        return action;
      }
    }
    
    return null;
  }
  
  /**
   * Execute a recovery action
   */
  async executeRecovery(action: RecoveryAction): Promise<boolean> {
    console.log(`[SelfHealer] Executing recovery action:`, action);
    
    switch (action.type) {
      case 'retry':
        // Wait before retry
        await this.delay(this.strategy.retryDelay);
        return true;
        
      case 'rollback':
        console.log(`[SelfHealer] Rollback required for: ${action.target}`);
        // Rollback logic would be implemented by the caller
        return true;
        
      case 'alert':
        console.error(`[SelfHealer] ALERT: ${action.reason}`);
        // Alert logic would be implemented by the caller
        return true;
        
      case 'scale':
        console.log(`[SelfHealer] Scaling action for: ${action.target}`);
        // Scaling logic would be implemented by the caller
        return true;
        
      default:
        return false;
    }
  }
  
  /**
   * Get all recovery actions
   */
  getRecoveryHistory(): RecoveryAction[] {
    return [...this.recoveryActions];
  }
  
  /**
   * Clear recovery history
   */
  clearHistory(): void {
    this.recoveryActions = [];
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
