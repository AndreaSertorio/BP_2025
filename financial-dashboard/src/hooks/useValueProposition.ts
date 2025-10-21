/**
 * CUSTOM HOOK: useValueProposition
 * Semplifica editing e auto-save per Value Proposition
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDatabase } from '@/contexts/DatabaseProvider';
import type { Job, Pain, Gain, Feature, PainReliever, GainCreator, ElevatorPitch, ValueStatement, NarrativeFlow, Competitor, PositioningStatement, CompetitiveMessage, CustomerTestimonial, Objection } from '@/types/valueProposition';

const API_BASE_URL = 'http://localhost:3001/api/value-proposition';

interface UseValuePropositionReturn {
  // State
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  
  // Customer Profile methods - UPDATE
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>;
  updatePain: (painId: string, updates: Partial<Pain>) => Promise<void>;
  updateGain: (gainId: string, updates: Partial<Gain>) => Promise<void>;
  
  // Customer Profile methods - CREATE
  createJob: (data: Partial<Job>) => Promise<void>;
  createPain: (data: Partial<Pain>) => Promise<void>;
  createGain: (data: Partial<Gain>) => Promise<void>;
  
  // Customer Profile methods - DELETE
  deleteJob: (jobId: string) => Promise<void>;
  deletePain: (painId: string) => Promise<void>;
  deleteGain: (gainId: string) => Promise<void>;
  
  // Value Map methods
  updateFeature: (featureId: string, updates: Partial<Feature>) => Promise<void>;
  updatePainReliever: (relieverId: string, updates: Partial<PainReliever>) => Promise<void>;
  updateGainCreator: (creatorId: string, updates: Partial<GainCreator>) => Promise<void>;
  
  // Messaging methods
  updateElevatorPitch: (updates: Partial<ElevatorPitch>) => Promise<void>;
  updateValueStatement: (statementId: string, updates: Partial<ValueStatement>) => Promise<void>;
  updateNarrativeFlow: (updates: Partial<NarrativeFlow>) => Promise<void>;
  
  // Positioning Statement
  updatePositioningStatement: (updates: Partial<PositioningStatement>) => Promise<void>;
  
  // Competitive Messages
  updateCompetitiveMessage: (messageId: string, updates: Partial<CompetitiveMessage>) => Promise<void>;
  createCompetitiveMessage: (data: Partial<CompetitiveMessage>) => Promise<void>;
  deleteCompetitiveMessage: (messageId: string) => Promise<void>;
  
  // Customer Testimonials
  updateTestimonial: (testimonialId: string, updates: Partial<CustomerTestimonial>) => Promise<void>;
  createTestimonial: (data: Partial<CustomerTestimonial>) => Promise<void>;
  deleteTestimonial: (testimonialId: string) => Promise<void>;
  
  // Objections
  updateObjection: (objectionId: string, updates: Partial<Objection>) => Promise<void>;
  createObjection: (data: Partial<Objection>) => Promise<void>;
  deleteObjection: (objectionId: string) => Promise<void>;
  
  // Competitor methods
  updateCompetitor: (competitorId: string, updates: Partial<Competitor>) => Promise<void>;
  
  // Segment methods
  createSegment: (data: { name: string; priority: 'high' | 'medium' | 'low'; icon: string }) => Promise<void>;
  deleteSegment: (segmentId: string) => Promise<void>;
  setActiveSegment: (segmentId: string) => Promise<void>;
  
  // Auto-save
  scheduleAutoSave: (callback: () => Promise<void>) => void;
  cancelAutoSave: () => void;
}

/**
 * Hook principale per gestire Value Proposition
 */
export function useValueProposition(): UseValuePropositionReturn {
  const { data } = useDatabase();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-save timeout ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generic API call helper
  const apiCall = useCallback(async (
    endpoint: string, 
    data: any, 
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'PATCH'
  ) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method !== 'GET' && method !== 'DELETE' ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante operazione');
      }
      
      setLastSaved(new Date());
      
      // Trigger database refresh
      window.dispatchEvent(new Event('database-updated'));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('API Error:', errorMessage);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Customer Profile methods
  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    await apiCall(`/customer-profile/job/${jobId}`, updates);
  }, [apiCall]);
  
  const updatePain = useCallback(async (painId: string, updates: Partial<Pain>) => {
    await apiCall(`/customer-profile/pain/${painId}`, updates);
  }, [apiCall]);
  
  const updateGain = useCallback(async (gainId: string, updates: Partial<Gain>) => {
    await apiCall(`/customer-profile/gain/${gainId}`, updates);
  }, [apiCall]);
  
  // Customer Profile - CREATE methods
  const createJob = useCallback(async (data: Partial<Job>) => {
    await apiCall('/customer-profile/job', data, 'POST');
  }, [apiCall]);
  
  const createPain = useCallback(async (data: Partial<Pain>) => {
    await apiCall('/customer-profile/pain', data, 'POST');
  }, [apiCall]);
  
  const createGain = useCallback(async (data: Partial<Gain>) => {
    await apiCall('/customer-profile/gain', data, 'POST');
  }, [apiCall]);
  
  // Customer Profile - DELETE methods
  const deleteJob = useCallback(async (jobId: string) => {
    await apiCall(`/customer-profile/job/${jobId}`, {}, 'DELETE');
  }, [apiCall]);
  
  const deletePain = useCallback(async (painId: string) => {
    await apiCall(`/customer-profile/pain/${painId}`, {}, 'DELETE');
  }, [apiCall]);
  
  const deleteGain = useCallback(async (gainId: string) => {
    await apiCall(`/customer-profile/gain/${gainId}`, {}, 'DELETE');
  }, [apiCall]);
  
  // Value Map methods
  const updateFeature = useCallback(async (featureId: string, updates: Partial<Feature>) => {
    await apiCall(`/value-map/feature/${featureId}`, updates);
  }, [apiCall]);
  
  const updatePainReliever = useCallback(async (relieverId: string, updates: Partial<PainReliever>) => {
    await apiCall(`/value-map/pain-reliever/${relieverId}`, updates);
  }, [apiCall]);
  
  const updateGainCreator = useCallback(async (creatorId: string, updates: Partial<GainCreator>) => {
    await apiCall(`/value-map/gain-creator/${creatorId}`, updates);
  }, [apiCall]);
  
  // Messaging methods
  const updateElevatorPitch = useCallback(async (updates: Partial<ElevatorPitch>) => {
    await apiCall('/messaging/elevator-pitch', updates);
  }, [apiCall]);
  
  const updateValueStatement = useCallback(async (statementId: string, updates: Partial<ValueStatement>) => {
    await apiCall(`/messaging/value-statement/${statementId}`, updates);
  }, [apiCall]);
  
  const updateNarrativeFlow = useCallback(async (updates: Partial<NarrativeFlow>) => {
    await apiCall('/messaging/narrative-flow', updates);
  }, [apiCall]);
  
  // Positioning Statement methods
  const updatePositioningStatement = useCallback(async (updates: Partial<PositioningStatement>) => {
    await apiCall('/messaging/positioning-statement', updates);
  }, [apiCall]);
  
  // Competitive Messages methods
  const updateCompetitiveMessage = useCallback(async (messageId: string, updates: Partial<CompetitiveMessage>) => {
    await apiCall(`/messaging/competitive-message/${messageId}`, updates);
  }, [apiCall]);
  
  const createCompetitiveMessage = useCallback(async (data: Partial<CompetitiveMessage>) => {
    await apiCall('/messaging/competitive-message', data, 'POST');
  }, [apiCall]);
  
  const deleteCompetitiveMessage = useCallback(async (messageId: string) => {
    await apiCall(`/messaging/competitive-message/${messageId}`, {}, 'DELETE');
  }, [apiCall]);
  
  // Customer Testimonials methods
  const updateTestimonial = useCallback(async (testimonialId: string, updates: Partial<CustomerTestimonial>) => {
    await apiCall(`/messaging/testimonial/${testimonialId}`, updates);
  }, [apiCall]);
  
  const createTestimonial = useCallback(async (data: Partial<CustomerTestimonial>) => {
    await apiCall('/messaging/testimonial', data, 'POST');
  }, [apiCall]);
  
  const deleteTestimonial = useCallback(async (testimonialId: string) => {
    await apiCall(`/messaging/testimonial/${testimonialId}`, {}, 'DELETE');
  }, [apiCall]);
  
  // Objections methods
  const updateObjection = useCallback(async (objectionId: string, updates: Partial<Objection>) => {
    await apiCall(`/messaging/objection/${objectionId}`, updates);
  }, [apiCall]);
  
  const createObjection = useCallback(async (data: Partial<Objection>) => {
    await apiCall('/messaging/objection', data, 'POST');
  }, [apiCall]);
  
  const deleteObjection = useCallback(async (objectionId: string) => {
    await apiCall(`/messaging/objection/${objectionId}`, {}, 'DELETE');
  }, [apiCall]);
  
  // Competitor methods
  const updateCompetitor = useCallback(async (competitorId: string, updates: Partial<Competitor>) => {
    await apiCall(`/competitor/${competitorId}`, updates);
  }, [apiCall]);
  
  // Segment methods
  const createSegment = useCallback(async (data: { name: string; priority: 'high' | 'medium' | 'low'; icon: string }) => {
    const response = await fetch(`${API_BASE_URL}/customer-profile/segment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create segment');
    }
    
    window.dispatchEvent(new Event('database-updated'));
  }, []);
  
  const deleteSegment = useCallback(async (segmentId: string) => {
    const response = await fetch(`${API_BASE_URL}/customer-profile/segment/${segmentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete segment');
    }
    
    window.dispatchEvent(new Event('database-updated'));
  }, []);
  
  const setActiveSegment = useCallback(async (segmentId: string) => {
    const response = await fetch(`${API_BASE_URL}/customer-profile/active-segment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segmentId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to set active segment');
    }
    
    window.dispatchEvent(new Event('database-updated'));
  }, []);
  
  // Auto-save methods
  const scheduleAutoSave = useCallback((callback: () => Promise<void>) => {
    // Cancel previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Schedule new auto-save after 2 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await callback();
        console.log('✅ Auto-save completato');
      } catch (err) {
        console.error('❌ Auto-save fallito:', err);
      }
    }, 2000);
  }, []);
  
  const cancelAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAutoSave();
    };
  }, [cancelAutoSave]);
  
  return {
    // State
    isSaving,
    lastSaved,
    error,
    
    // Update methods
    updateJob,
    updatePain,
    updateGain,
    updateFeature,
    updatePainReliever,
    updateGainCreator,
    updateElevatorPitch,
    updateValueStatement,
    updateNarrativeFlow,
    updateCompetitor,
    updatePositioningStatement,
    updateCompetitiveMessage,
    updateTestimonial,
    updateObjection,
    
    // Create methods
    createJob,
    createPain,
    createGain,
    createCompetitiveMessage,
    createTestimonial,
    createObjection,
    
    // Delete methods
    deleteJob,
    deletePain,
    deleteGain,
    deleteCompetitiveMessage,
    deleteTestimonial,
    deleteObjection,
    
    // Segment methods
    createSegment,
    deleteSegment,
    setActiveSegment,
    
    // Auto-save
    scheduleAutoSave,
    cancelAutoSave,
  };
}

/**
 * Hook semplificato per inline editing con auto-save
 */
export function useInlineEdit<T>(
  initialValue: T,
  onSave: (value: T) => Promise<void>,
  autoSaveDelay: number = 2000
) {
  const [value, setValue] = useState<T>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    setHasChanges(true);
    
    // Schedule auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(newValue);
        setHasChanges(false);
      } catch (err) {
        console.error('Save error:', err);
      } finally {
        setIsSaving(false);
      }
    }, autoSaveDelay);
  }, [onSave, autoSaveDelay]);
  
  const handleCancel = useCallback(() => {
    setValue(initialValue);
    setIsEditing(false);
    setHasChanges(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [initialValue]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    value,
    setValue: handleChange,
    isEditing,
    setIsEditing,
    isSaving,
    hasChanges,
    cancel: handleCancel,
  };
}
