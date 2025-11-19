/**
 * useCampaignView - Hook pour tracker les vues de campagne avec données enrichies
 * 
 * Collecte:
 * - Vues de page
 * - Temps passé
 * - Scroll depth
 * - Device/browser info
 * - UTM parameters
 * - Referrer
 * - Géolocalisation (via IP)
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getClientIPWithTimeout } from '@/utils/getClientIP';

interface ViewTrackingData {
  campaign_id: string;
  ip_address?: string;
  user_agent: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  viewport_size?: string;
  time_on_page?: number;
  max_scroll_depth?: number;
}

interface InteractionEvent {
  campaign_id: string;
  event_type: 'click' | 'scroll' | 'form_focus' | 'form_blur' | 'game_start' | 'game_complete' | 'page_exit';
  event_data?: Record<string, any>;
  timestamp: string;
}

export const useCampaignView = (campaignId: string) => {
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const interactionsRef = useRef<InteractionEvent[]>([]);
  const trackingDataRef = useRef<ViewTrackingData | null>(null);

  // Détecter le device et browser
  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device_type = 'desktop';
    let browser = 'unknown';
    let os = 'unknown';

    // Device type
    if (/mobile/i.test(ua)) device_type = 'mobile';
    else if (/tablet|ipad/i.test(ua)) device_type = 'tablet';

    // Browser
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    // OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { device_type, browser, os };
  };

  // Tracker le scroll depth
  const trackScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    
    if (scrollPercent > maxScrollDepthRef.current) {
      maxScrollDepthRef.current = scrollPercent;
    }
  };

  // Enregistrer une interaction
  const trackInteraction = (event_type: InteractionEvent['event_type'], event_data?: Record<string, any>) => {
    interactionsRef.current.push({
      campaign_id: campaignId,
      event_type,
      event_data,
      timestamp: new Date().toISOString(),
    });
  };

  // Envoyer les données de tracking
  const sendTrackingData = async (final: boolean = false) => {
    if (!trackingDataRef.current) return;

    const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000); // en secondes

    const updatedData = {
      ...trackingDataRef.current,
      time_on_page: timeOnPage,
      max_scroll_depth: maxScrollDepthRef.current,
    };

    try {
      // Envoyer à campaign_views
      await supabase.from('campaign_views').insert(updatedData);

      // Si c'est la fin de la session, envoyer les interactions
      if (final && interactionsRef.current.length > 0) {
        console.log('📊 [useCampaignView] Sending interactions:', interactionsRef.current.length);
        // On pourrait envoyer les interactions dans une table dédiée si nécessaire
      }

      console.log('✅ [useCampaignView] Tracking data sent:', {
        timeOnPage,
        maxScrollDepth: maxScrollDepthRef.current,
        interactions: interactionsRef.current.length,
      });
    } catch (error) {
      console.error('❌ [useCampaignView] Failed to send tracking data:', error);
    }
  };

  // Initialiser le tracking
  useEffect(() => {
    if (!campaignId || isTracking) return;

    const initTracking = async () => {
      // 🎯 Détecter si on est en mode preview
      const isPreviewMode = window.location.pathname.includes('/campaign/') && 
                            (window.location.hostname.includes('lovable.dev') || 
                             window.location.hostname.includes('localhost'));
      
      console.log('🎯 [useCampaignView] Initializing tracking for campaign:', campaignId, {
        isPreviewMode,
        hostname: window.location.hostname,
        pathname: window.location.pathname
      });
      
      // Collecter les données
      const [ipAddress] = await Promise.all([
        getClientIPWithTimeout(3000),
      ]);

      const deviceInfo = getDeviceInfo();
      const urlParams = new URLSearchParams(window.location.search);

      const trackingData: ViewTrackingData = {
        campaign_id: campaignId,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        referrer: document.referrer || undefined,
        utm_source: isPreviewMode ? 'preview' : (urlParams.get('utm_source') || undefined),
        utm_medium: isPreviewMode ? 'editor' : (urlParams.get('utm_medium') || undefined),
        utm_campaign: isPreviewMode ? 'test' : (urlParams.get('utm_campaign') || undefined),
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      };

      trackingDataRef.current = trackingData;
      setIsTracking(true);

      // Track initial view
      trackInteraction('click', { action: 'page_load' });
    };

    initTracking();

    // Setup scroll tracking
    window.addEventListener('scroll', trackScrollDepth);

    // Track page exit
    const handleBeforeUnload = () => {
      trackInteraction('page_exit');
      sendTrackingData(true);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Send periodic updates (every 30 seconds)
    const interval = setInterval(() => {
      sendTrackingData(false);
    }, 30000);

    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      sendTrackingData(true); // Send final data
    };
  }, [campaignId, isTracking]);

  return {
    trackInteraction,
    isTracking,
  };
};
