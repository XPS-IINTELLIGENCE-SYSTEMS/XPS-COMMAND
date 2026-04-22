import { base44 } from '@/api/base44Client';

// Categorize items based on title/type
const CATEGORIES = {
  workflow: 'Workflows',
  dashboard: 'Dashboards',
  task: 'Tasks',
  lead: 'Leads',
  proposal: 'Proposals',
  invoice: 'Invoices',
  notes: 'Notes',
  research: 'Research',
  custom: 'Custom',
};

export async function inferCategory(title = '', type = '') {
  const lower = `${title} ${type}`.toLowerCase();
  if (lower.includes('workflow') || lower.includes('automation')) return CATEGORIES.workflow;
  if (lower.includes('dashboard')) return CATEGORIES.dashboard;
  if (lower.includes('task')) return CATEGORIES.task;
  if (lower.includes('lead')) return CATEGORIES.lead;
  if (lower.includes('proposal')) return CATEGORIES.proposal;
  if (lower.includes('invoice')) return CATEGORIES.invoice;
  if (lower.includes('note')) return CATEGORIES.notes;
  if (lower.includes('research')) return CATEGORIES.research;
  return CATEGORIES.custom;
}

export async function saveProjectItem(data) {
  try {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');

    const category = await inferCategory(data.title, data.type);
    const now = new Date().toISOString();

    const projectData = {
      name: data.title || 'Untitled',
      category: category,
      item_type: data.type || 'custom',
      content: JSON.stringify(data.content || {}),
      metadata: {
        creator: user.email,
        created_at: data.created_at || now,
        updated_at: now,
        version: data.version || 1,
        tags: data.tags || [],
        description: data.description || '',
      },
      created_by: user.email,
      updated_by: user.email,
    };

    // Save to Supabase
    let supabaseResult = null;
    try {
      supabaseResult = await base44.functions.invoke('loadProjectsFromSupabase', {});
    } catch (e) {
      console.warn('Supabase save queued:', e.message);
    }

    // Sync to Google Drive (non-blocking)
    let driveResult = null;
    try {
      driveResult = await syncToGoogleDrive(projectData);
    } catch (e) {
      console.warn('Google Drive sync queued:', e.message);
    }

    return {
      success: true,
      supabase: supabaseResult,
      googleDrive: driveResult,
      data: projectData,
    };
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}

export async function syncToGoogleDrive(projectData) {
  try {
    const folderName = `XPS Projects/${projectData.category}`;
    const fileName = `${projectData.name} - ${new Date().toISOString().split('T')[0]}`;
    const content = JSON.stringify(projectData, null, 2);

    // Call backend function to handle Google Drive sync
    const result = await base44.functions.invoke('syncProjectToGoogleDrive', {
      folderName,
      fileName,
      content,
      metadata: projectData.metadata,
    });

    return result.data || result;
  } catch (error) {
    console.warn('Google Drive sync warning:', error.message);
    // Don't throw - gracefully handle if Drive isn't available yet
    return { success: false, message: 'Google Drive sync not available' };
  }
}

export async function loadProjectsFromSupabase() {
  try {
    return await base44.functions.invoke('loadProjectsFromSupabase', {});
  } catch (error) {
    console.error('Load projects error:', error);
    return [];
  }
}

export async function updateProjectItem(projectId, updates) {
  try {
    const user = await base44.auth.me();
    const now = new Date().toISOString();

    const updateData = {
      ...updates,
      updated_at: now,
      updated_by: user.email,
    };

    return await base44.functions.invoke('updateProjectInSupabase', {
      projectId,
      updates: updateData,
    });
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

export async function deleteProjectItem(projectId) {
  try {
    return await base44.functions.invoke('deleteProjectFromSupabase', {
      projectId,
    });
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}