import { useEffect, useRef, useState } from 'react';
import { saveProjectItem, updateProjectItem, inferCategory } from '@/services/projectSaveService';

export function useProjectSave(itemData, itemType = 'custom', autoSaveInterval = 30000) {
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSaved, setLastSaved] = useState(null);
  const [projectId, setProjectId] = useState(itemData?.projectId || null);
  const autoSaveTimerRef = useRef(null);
  const isDirtyRef = useRef(false);

  // Mark as dirty when itemData changes
  useEffect(() => {
    isDirtyRef.current = true;
  }, [itemData]);

  // Auto-save on interval
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(async () => {
      if (isDirtyRef.current && itemData) {
        try {
          setSaveStatus('saving');
          const category = await inferCategory(itemData.title, itemType);
          
          const saveData = {
            title: itemData.title || 'Untitled',
            type: itemType,
            content: itemData,
            category,
            created_at: itemData.created_at || new Date().toISOString(),
          };

          let result;
          if (projectId) {
            result = await updateProjectItem(projectId, saveData);
          } else {
            result = await saveProjectItem(saveData);
            if (result.success && result.data?.id) {
              setProjectId(result.data.id);
            }
          }

          setSaveStatus('saved');
          setLastSaved(new Date());
          isDirtyRef.current = false;

          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setSaveStatus('error');
        }
      }
    }, autoSaveInterval);

    return () => clearInterval(autoSaveTimerRef.current);
  }, [itemData, itemType, projectId]);

  const manualSave = async () => {
    if (!itemData) return;
    try {
      setSaveStatus('saving');
      const category = await inferCategory(itemData.title, itemType);
      
      const saveData = {
        title: itemData.title || 'Untitled',
        type: itemType,
        content: itemData,
        category,
        created_at: itemData.created_at || new Date().toISOString(),
      };

      let result;
      if (projectId) {
        result = await updateProjectItem(projectId, saveData);
      } else {
        result = await saveProjectItem(saveData);
        if (result.success && result.data?.id) {
          setProjectId(result.data.id);
        }
      }

      setSaveStatus('saved');
      setLastSaved(new Date());
      isDirtyRef.current = false;

      setTimeout(() => setSaveStatus('idle'), 2000);
      return result;
    } catch (error) {
      console.error('Manual save failed:', error);
      setSaveStatus('error');
      throw error;
    }
  };

  return {
    saveStatus,
    lastSaved,
    projectId,
    manualSave,
    isDirty: isDirtyRef.current,
  };
}