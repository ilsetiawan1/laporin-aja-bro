// lib\hooks\useActivityLogs.ts

import { useEffect, useState, useCallback } from "react";
import { getActivityLogsAction } from "@/lib/actions/statusLogs";

export interface ActivityLog {
  id: string;
  report_id: string;
  status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
  report_title: string | null;
  admin_name: string | null;
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getActivityLogsAction(filterStatus || undefined);
    setLogs(data);
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const hasActiveFilters = !!(search.trim() || dateFrom || dateTo || filterStatus);

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setFilterStatus("");
  };

  const filtered = logs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        log.report_title?.toLowerCase().includes(q) ||
        log.admin_name?.toLowerCase().includes(q) ||
        log.note?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(log.created_at) < from) return false;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(log.created_at) > to) return false;
    }

    return true;
  });

  return {
    loading,
    filtered,
    hasActiveFilters,
    search, setSearch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    filterStatus, setFilterStatus,
    clearFilters,
    refresh: load,
  };
}