import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const DEFAULT_TAB = {
  id: "tab_default",
  name: "Main Dashboard",
  projectId: null,       // null = general workspace, string = linked to a project
  activeView: null,      // null = dashboard hub, string = tool id
  isDefault: true,       // the original dashboard tab
  notes: "",             // tab-level notes
  tools: [],             // tools added to this workspace tab
};

function generateId() {
  return "tab_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export default function useWorkspaceTabs() {
  const [tabs, setTabs] = useState([DEFAULT_TAB]);
  const [activeTabId, setActiveTabId] = useState(DEFAULT_TAB.id);
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load from user profile
  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      if (me?.workspace_tabs) {
        try {
          const data = typeof me.workspace_tabs === "string" ? JSON.parse(me.workspace_tabs) : me.workspace_tabs;
          if (data.tabs?.length) setTabs(data.tabs);
          if (data.activeTabId) setActiveTabId(data.activeTabId);
          if (data.projects) setProjects(data.projects);
        } catch {}
      }
      setLoaded(true);
    })();
  }, []);

  // Persist
  const persist = useCallback(async (overrides = {}) => {
    const payload = {
      tabs: overrides.tabs || tabs,
      activeTabId: overrides.activeTabId || activeTabId,
      projects: overrides.projects || projects,
    };
    await base44.auth.updateMe({ workspace_tabs: JSON.stringify(payload) }).catch(() => {});
  }, [tabs, activeTabId, projects]);

  // Tab actions
  const updateTab = useCallback((tabId, updates) => {
    const updated = tabs.map(t => t.id === tabId ? { ...t, ...updates } : t);
    setTabs(updated);
    persist({ tabs: updated });
  }, [tabs, persist]);

  const addTab = useCallback((name, projectId = null) => {
    const newTab = { id: generateId(), name: name || "New Tab", projectId, activeView: null, isDefault: false, notes: "", tools: [] };
    const updated = [...tabs, newTab];
    setTabs(updated);
    setActiveTabId(newTab.id);
    persist({ tabs: updated, activeTabId: newTab.id });
    return newTab;
  }, [tabs, persist]);

  const closeTab = useCallback((tabId) => {
    if (tabs.length <= 1) return; // Keep at least one tab
    const idx = tabs.findIndex(t => t.id === tabId);
    const updated = tabs.filter(t => t.id !== tabId);
    setTabs(updated);
    if (activeTabId === tabId) {
      const newActive = updated[Math.min(idx, updated.length - 1)]?.id;
      setActiveTabId(newActive);
      persist({ tabs: updated, activeTabId: newActive });
    } else {
      persist({ tabs: updated });
    }
  }, [tabs, activeTabId, persist]);

  const renameTab = useCallback((tabId, name) => {
    const updated = tabs.map(t => t.id === tabId ? { ...t, name } : t);
    setTabs(updated);
    persist({ tabs: updated });
  }, [tabs, persist]);

  const setTabView = useCallback((tabId, activeView) => {
    const updated = tabs.map(t => t.id === tabId ? { ...t, activeView } : t);
    setTabs(updated);
    persist({ tabs: updated });
  }, [tabs, persist]);

  const setTabProject = useCallback((tabId, projectId) => {
    const updated = tabs.map(t => t.id === tabId ? { ...t, projectId } : t);
    setTabs(updated);
    persist({ tabs: updated });
  }, [tabs, persist]);

  // Project actions
  const createProject = useCallback((name, color) => {
    const project = {
      id: "proj_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name || "Untitled Project",
      color: color || "#d4af37",
      createdAt: new Date().toISOString(),
    };
    const updated = [...projects, project];
    setProjects(updated);
    persist({ projects: updated });
    return project;
  }, [projects, persist]);

  const renameProject = useCallback((projectId, name) => {
    const updated = projects.map(p => p.id === projectId ? { ...p, name } : p);
    setProjects(updated);
    persist({ projects: updated });
  }, [projects, persist]);

  const deleteProject = useCallback((projectId) => {
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    // Unlink tabs that were on this project
    const updatedTabs = tabs.map(t => t.projectId === projectId ? { ...t, projectId: null } : t);
    setTabs(updatedTabs);
    persist({ projects: updated, tabs: updatedTabs });
  }, [projects, tabs, persist]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  return {
    tabs, activeTab, activeTabId, setActiveTabId: (id) => { setActiveTabId(id); persist({ activeTabId: id }); },
    addTab, closeTab, renameTab, setTabView, setTabProject, updateTab,
    projects, createProject, renameProject, deleteProject,
    loaded,
  };
}