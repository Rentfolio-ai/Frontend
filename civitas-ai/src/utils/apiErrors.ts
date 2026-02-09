/**
 * API Error Parsing Utilities
 *
 * Handles structured error responses from the backend,
 * especially plan enforcement 403 errors.
 */

export interface PlanError {
  type: 'limit_exceeded' | 'pro_required';
  message: string;
  action?: string;
  limit?: number;
  currentTier?: string;
  upgradeUrl?: string;
}

/**
 * Parse a non-OK fetch response into a structured error.
 * Returns a PlanError if the response is a 403 from plan enforcement,
 * otherwise throws a generic Error.
 */
export async function parseApiError(response: Response): Promise<PlanError | null> {
  if (response.status === 403) {
    try {
      const body = await response.json();
      const detail = body.detail || body;

      if (detail.error === 'limit_exceeded') {
        return {
          type: 'limit_exceeded',
          message: detail.message || 'You have reached your plan limit.',
          action: detail.action,
          limit: detail.limit,
          currentTier: detail.current_tier,
          upgradeUrl: detail.upgrade_url || '/upgrade',
        };
      }

      if (detail.error === 'pro_required') {
        return {
          type: 'pro_required',
          message: detail.message || 'This feature requires a Pro subscription.',
          currentTier: detail.current_tier,
          upgradeUrl: detail.upgrade_url || '/upgrade',
        };
      }
    } catch {
      // Body wasn't JSON — fall through
    }
  }

  return null;
}

/**
 * User-friendly message for a plan error.
 */
export function planErrorMessage(err: PlanError): string {
  return err.message;
}
