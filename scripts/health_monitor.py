#!/usr/bin/env python3
"""
Quovarine Deployment Health Monitor

This script monitors the health of a deployed Quovarine instance by:
- Checking if the deployment URL is responding
- Verifying the health check endpoint returns valid status
- Logging errors with timestamps
- Implementing retry logic with exponential backoff
"""

import os
import sys
import time
import json
from datetime import datetime
from typing import Optional, Dict, Any

try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("Error: Required packages not installed.")
    print("Please run: pip install -r requirements.txt")
    sys.exit(1)

# Load environment variables
load_dotenv()


class HealthMonitor:
    """Monitor deployment health with retry logic and logging."""
    
    def __init__(
        self,
        deployment_url: str,
        max_retries: int = 5,
        initial_backoff: float = 2.0,
        max_backoff: float = 60.0,
    ):
        """
        Initialize the health monitor.
        
        Args:
            deployment_url: Base URL of the deployment to monitor
            max_retries: Maximum number of retry attempts
            initial_backoff: Initial backoff time in seconds
            max_backoff: Maximum backoff time in seconds
        """
        self.deployment_url = deployment_url.rstrip('/')
        self.max_retries = max_retries
        self.initial_backoff = initial_backoff
        self.max_backoff = max_backoff
        self.health_endpoint = f"{self.deployment_url}/api/health"
    
    def log_message(self, level: str, message: str, data: Optional[Dict[str, Any]] = None):
        """Log a message with timestamp and optional data."""
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
        log_entry = {
            'timestamp': timestamp,
            'level': level,
            'message': message,
        }
        if data:
            log_entry['data'] = data
        
        print(json.dumps(log_entry, indent=2))
    
    def check_health(self) -> bool:
        """
        Check the health endpoint of the deployment.
        
        Returns:
            True if healthy, False otherwise
        """
        try:
            response = requests.get(
                self.health_endpoint,
                timeout=10,
                headers={'User-Agent': 'Quovarine-Health-Monitor/1.0'}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_message('INFO', 'Health check passed', data)
                return True
            else:
                self.log_message(
                    'ERROR',
                    f'Health check failed with status {response.status_code}',
                    {'status_code': response.status_code, 'response': response.text[:200]}
                )
                return False
                
        except requests.exceptions.Timeout:
            self.log_message('ERROR', 'Health check timed out')
            return False
        except requests.exceptions.ConnectionError as e:
            self.log_message('ERROR', 'Connection error during health check', {'error': str(e)})
            return False
        except requests.exceptions.RequestException as e:
            self.log_message('ERROR', 'Request exception during health check', {'error': str(e)})
            return False
        except Exception as e:
            self.log_message('ERROR', 'Unexpected error during health check', {'error': str(e)})
            return False
    
    def check_with_retry(self) -> bool:
        """
        Check health with exponential backoff retry logic.
        
        Returns:
            True if eventually healthy, False if all retries exhausted
        """
        backoff = self.initial_backoff
        
        for attempt in range(1, self.max_retries + 1):
            self.log_message(
                'INFO',
                f'Health check attempt {attempt}/{self.max_retries}',
                {'url': self.health_endpoint}
            )
            
            if self.check_health():
                self.log_message('INFO', '✅ Deployment is healthy')
                return True
            
            if attempt < self.max_retries:
                self.log_message(
                    'INFO',
                    f'Retrying in {backoff:.1f} seconds...',
                    {'next_attempt': attempt + 1}
                )
                time.sleep(backoff)
                # Exponential backoff with cap
                backoff = min(backoff * 2, self.max_backoff)
        
        self.log_message('ERROR', '❌ All health check attempts failed')
        return False


def main():
    """Main entry point for the health monitor."""
    deployment_url = os.getenv('DEPLOYMENT_URL')
    
    if not deployment_url:
        print("Error: DEPLOYMENT_URL environment variable not set")
        print("Please set it in your .env file or environment")
        sys.exit(1)
    
    print(f"{'=' * 60}")
    print("Quovarine Deployment Health Monitor")
    print(f"{'=' * 60}")
    print(f"Target: {deployment_url}")
    print(f"{'=' * 60}\n")
    
    monitor = HealthMonitor(deployment_url)
    success = monitor.check_with_retry()
    
    print(f"\n{'=' * 60}")
    if success:
        print("✅ Health monitoring completed successfully")
        sys.exit(0)
    else:
        print("❌ Health monitoring failed")
        sys.exit(1)


if __name__ == '__main__':
    main()
