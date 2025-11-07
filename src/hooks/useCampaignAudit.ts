import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  campaign_id: string;
  action: string;
  changes?: any;
  revision_before?: number;
  revision_after?: number;
  actor_id?: string;
  actor_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  description?: string;
}

export const useCampaignAudit = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch audit logs for a campaign
   */
  const fetchLogs = useCallback(async (campaignId: string, limit = 50) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaign_audit_logs' as any)
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data as any || []);
      return data as any || [];
    } catch (error) {
      console.error('[useCampaignAudit] Fetch error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log a campaign action (client-side call to DB function)
   */
  const logAction = useCallback(async (
    campaignId: string,
    action: string,
    options?: {
      changes?: any;
      description?: string;
      revisionBefore?: number;
      revisionAfter?: number;
    }
  ) => {
    try {
      const { data, error } = await supabase.rpc('log_campaign_action' as any, {
        p_campaign_id: campaignId,
        p_action: action,
        p_changes: options?.changes || null,
        p_description: options?.description || null,
        p_revision_before: options?.revisionBefore || null,
        p_revision_after: options?.revisionAfter || null,
      } as any);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[useCampaignAudit] Log error:', error);
      return null;
    }
  }, []);

  return {
    logs,
    isLoading,
    fetchLogs,
    logAction,
  };
};
