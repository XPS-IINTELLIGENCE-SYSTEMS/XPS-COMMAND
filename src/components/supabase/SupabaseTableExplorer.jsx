import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Table, Search, Loader2, ChevronRight, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupabaseTableExplorer() {
  const [table, setTable] = useState('');
  const [rows, setRows] = useState([]);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const [filterKey, setFilterKey] = useState('');
  const [filterVal, setFilterVal] = useState('');
  const [totalCount, setTotalCount] = useState(null);

  const fetchRows = async (tbl, off = 0) => {
    setLoading(true);
    const filters = {};
    if (filterKey && filterVal) filters[filterKey] = `ilike.*${filterVal}*`;
    const res = await base44.functions.invoke('supabaseAdmin', {
      action: 'query', table: tbl || table, limit, offset: off, filters
    });
    setRows(res.data?.data || []);
    const range = res.data?.count || '';
    const match = range?.match?.(/\/(\d+)/);
    if (match) setTotalCount(parseInt(match[1]));
    setOffset(off);
    setLoading(false);
  };

  const describeTable = async (tbl) => {
    const res = await base44.functions.invoke('supabaseAdmin', { action: 'describe_table', table: tbl });
    setSchema(res.data?.schema || null);
  };

  const selectTable = (tbl) => {
    setTable(tbl);
    setOffset(0);
    fetchRows(tbl, 0);
    describeTable(tbl);
  };

  const columns = rows.length > 0 ? Object.keys(rows[0]).slice(0, 12) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Enter table name..."
          value={table}
          onChange={e => setTable(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && selectTable(table)}
          className="glass-input max-w-xs text-sm"
        />
        <Button onClick={() => selectTable(table)} disabled={!table || loading} size="sm" className="metallic-gold-bg text-background">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Query
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Input placeholder="Column..." value={filterKey} onChange={e => setFilterKey(e.target.value)} className="glass-input max-w-[140px] text-xs" />
        <Input placeholder="Contains..." value={filterVal} onChange={e => setFilterVal(e.target.value)} className="glass-input max-w-[180px] text-xs" />
        <Button variant="outline" size="sm" onClick={() => fetchRows(table, 0)} disabled={loading}>Filter</Button>
      </div>

      {/* Schema */}
      {schema && (
        <div className="glass-card rounded-lg p-3">
          <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary" /> Schema: {table}</h3>
          <div className="flex flex-wrap gap-1">
            {Object.entries(schema.properties || {}).map(([col, def]) => (
              <span key={col} className="px-2 py-0.5 rounded bg-secondary text-[9px]">
                <span className="text-foreground font-medium">{col}</span>
                <span className="text-muted-foreground ml-1">{def.type || def.format || '?'}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      {rows.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {columns.map(c => <th key={c} className="px-3 py-2 text-left text-[10px] font-bold text-muted-foreground uppercase">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                    {columns.map(c => (
                      <td key={c} className="px-3 py-1.5 text-foreground max-w-[200px] truncate">
                        {typeof row[c] === 'object' ? JSON.stringify(row[c])?.slice(0, 60) : String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-3 py-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground">
              Showing {offset + 1}–{offset + rows.length}{totalCount != null ? ` of ${totalCount}` : ''}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => fetchRows(table, Math.max(0, offset - limit))}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => fetchRows(table, offset + limit)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {rows.length === 0 && !loading && table && (
        <div className="text-center py-8 text-sm text-muted-foreground">No rows found in "{table}"</div>
      )}
    </div>
  );
}