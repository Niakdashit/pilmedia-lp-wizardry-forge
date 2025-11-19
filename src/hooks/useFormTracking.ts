/**
 * useFormTracking - Hook pour tracker les interactions avec les formulaires
 * 
 * Collecte:
 * - Champs remplis vs vides
 * - Temps de remplissage par champ
 * - Taux d'abandon
 * - Erreurs de validation
 */

import { useRef, useCallback } from 'react';

interface FieldInteraction {
  field_id: string;
  field_label: string;
  focused_at?: number;
  blurred_at?: number;
  time_spent?: number;
  filled: boolean;
  validation_errors?: string[];
}

interface FormTrackingData {
  campaign_id: string;
  form_started_at: number;
  form_completed_at?: number;
  total_time?: number;
  fields: Record<string, FieldInteraction>;
  abandon_at_field?: string;
  completion_rate: number;
}

export const useFormTracking = (campaignId: string, formFields: any[]) => {
  const trackingDataRef = useRef<FormTrackingData>({
    campaign_id: campaignId,
    form_started_at: Date.now(),
    fields: {},
    completion_rate: 0,
  });

  const trackFieldFocus = useCallback((fieldId: string, fieldLabel: string) => {
    console.log('📝 [FormTracking] Field focused:', fieldId);
    
    if (!trackingDataRef.current.fields[fieldId]) {
      trackingDataRef.current.fields[fieldId] = {
        field_id: fieldId,
        field_label: fieldLabel,
        filled: false,
      };
    }
    
    trackingDataRef.current.fields[fieldId].focused_at = Date.now();
  }, []);

  const trackFieldBlur = useCallback((fieldId: string, value: any, errors?: string[]) => {
    console.log('📝 [FormTracking] Field blurred:', fieldId, { filled: !!value });
    
    const field = trackingDataRef.current.fields[fieldId];
    if (!field) return;

    field.blurred_at = Date.now();
    field.filled = !!value;
    field.validation_errors = errors;
    
    if (field.focused_at && field.blurred_at) {
      field.time_spent = Math.round((field.blurred_at - field.focused_at) / 1000);
    }

    // Calculate completion rate
    const totalFields = formFields.length;
    const filledFields = Object.values(trackingDataRef.current.fields).filter(f => f.filled).length;
    trackingDataRef.current.completion_rate = Math.round((filledFields / totalFields) * 100);
  }, [formFields]);

  const trackFormCompletion = useCallback(() => {
    console.log('✅ [FormTracking] Form completed');
    
    trackingDataRef.current.form_completed_at = Date.now();
    trackingDataRef.current.total_time = Math.round(
      (trackingDataRef.current.form_completed_at - trackingDataRef.current.form_started_at) / 1000
    );
    trackingDataRef.current.completion_rate = 100;
  }, []);

  const trackFormAbandonment = useCallback((lastFieldId?: string) => {
    console.log('❌ [FormTracking] Form abandoned at field:', lastFieldId);
    
    trackingDataRef.current.abandon_at_field = lastFieldId;
    
    // Calculate which fields were filled before abandonment
    const filledFields = Object.values(trackingDataRef.current.fields).filter(f => f.filled).length;
    trackingDataRef.current.completion_rate = Math.round((filledFields / formFields.length) * 100);
  }, [formFields]);

  const getTrackingData = useCallback((): FormTrackingData => {
    return { ...trackingDataRef.current };
  }, []);

  const getFieldStats = useCallback(() => {
    const fields = Object.values(trackingDataRef.current.fields);
    return {
      total_fields: formFields.length,
      fields_interacted: fields.length,
      fields_filled: fields.filter(f => f.filled).length,
      average_time_per_field: fields.reduce((acc, f) => acc + (f.time_spent || 0), 0) / fields.length || 0,
      fields_with_errors: fields.filter(f => f.validation_errors && f.validation_errors.length > 0).length,
    };
  }, [formFields]);

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFormCompletion,
    trackFormAbandonment,
    getTrackingData,
    getFieldStats,
  };
};
