import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE ABSTRACTION LAYER
 * Drop-in replacement for Base44 SDK
 * Mimics base44.entities.* interface for easy migration
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabaseClient = createClient(supabaseUrl || '', supabaseAnonKey || '');

/**
 * Supabase Entity Wrapper
 * Usage: supabaseEntities.Lead.list() instead of base44.entities.Lead.list()
 */
export const supabaseEntities = {
  Lead: {
    async list(orderBy = '-created_at', limit = 100) {
      const { data, error } = await supabaseClient
        .from('leads')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async filter(filters = {}, orderBy = '-created_at', limit = 100) {
      let query = supabaseClient.from('leads').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async create(record) {
      const { data, error } = await supabaseClient.from('leads').insert([record]).select();
      if (error) throw error;
      return data?.[0] || record;
    },
    async update(id, updates) {
      const { data, error } = await supabaseClient.from('leads').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || updates;
    },
    async delete(id) {
      const { error } = await supabaseClient.from('leads').delete().eq('id', id);
      if (error) throw error;
    },
  },

  ProspectCompany: {
    async list(orderBy = '-created_at', limit = 100) {
      const { data, error } = await supabaseClient
        .from('prospect_companies')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async filter(filters = {}, orderBy = '-created_at', limit = 100) {
      let query = supabaseClient.from('prospect_companies').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async create(record) {
      const { data, error } = await supabaseClient.from('prospect_companies').insert([record]).select();
      if (error) throw error;
      return data?.[0] || record;
    },
    async update(id, updates) {
      const { data, error } = await supabaseClient.from('prospect_companies').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || updates;
    },
    async delete(id) {
      const { error } = await supabaseClient.from('prospect_companies').delete().eq('id', id);
      if (error) throw error;
    },
  },

  CallLog: {
    async list(orderBy = '-created_at', limit = 100) {
      const { data, error } = await supabaseClient
        .from('call_logs')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async filter(filters = {}, orderBy = '-created_at', limit = 100) {
      let query = supabaseClient.from('call_logs').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async create(record) {
      const { data, error } = await supabaseClient.from('call_logs').insert([record]).select();
      if (error) throw error;
      return data?.[0] || record;
    },
    async update(id, updates) {
      const { data, error } = await supabaseClient.from('call_logs').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || updates;
    },
    async delete(id) {
      const { error } = await supabaseClient.from('call_logs').delete().eq('id', id);
      if (error) throw error;
    },
  },

  CommercialJob: {
    async list(orderBy = '-created_at', limit = 100) {
      const { data, error } = await supabaseClient
        .from('commercial_jobs')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async filter(filters = {}, orderBy = '-created_at', limit = 100) {
      let query = supabaseClient.from('commercial_jobs').select('*');
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      const { data, error } = await query
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async create(record) {
      const { data, error } = await supabaseClient.from('commercial_jobs').insert([record]).select();
      if (error) throw error;
      return data?.[0] || record;
    },
    async update(id, updates) {
      const { data, error } = await supabaseClient.from('commercial_jobs').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || updates;
    },
    async delete(id) {
      const { error } = await supabaseClient.from('commercial_jobs').delete().eq('id', id);
      if (error) throw error;
    },
  },

  Proposal: {
    async list(orderBy = '-created_at', limit = 100) {
      const { data, error } = await supabaseClient
        .from('proposals')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async create(record) {
      const { data, error } = await supabaseClient.from('proposals').insert([record]).select();
      if (error) throw error;
      return data?.[0] || record;
    },
    async update(id, updates) {
      const { data, error } = await supabaseClient.from('proposals').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || updates;
    },
  },

  BidDocument: {
    async list(orderBy = '-created_at', limit = 100) {
      const { data, error } = await supabaseClient
        .from('bid_documents')
        .select('*')
        .order(orderBy.replace('-', ''), { ascending: orderBy.startsWith('-') ? false : true })
        .limit(limit);
      return error ? [] : data || [];
    },
    async create(record) {
      const { data, error } = await supabaseClient.from('bid_documents').insert([record]).select();
      if (error) throw error;
      return data?.[0] || record;
    },
    async update(id, updates) {
      const { data, error } = await supabaseClient.from('bid_documents').update(updates).eq('id', id).select();
      if (error) throw error;
      return data?.[0] || updates;
    },
  },

  // Add more entities as needed...
};

// Export as alternative name
export const entities = supabaseEntities;