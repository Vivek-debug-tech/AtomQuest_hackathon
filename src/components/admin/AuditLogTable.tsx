"use client";

import { Search } from "lucide-react";
import { useState, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLog } from "@/types";

const actionToneMap: Record<AuditLog["action"], { badge: string; color: string }> = {
  create: { badge: "Created", color: "bg-blue-50 text-blue-700 border-blue-200" },
  update: { badge: "Updated", color: "bg-slate-50 text-slate-700 border-slate-200" },
  delete: { badge: "Deleted", color: "bg-red-50 text-red-700 border-red-200" },
  approve: { badge: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  reject: { badge: "Rejected", color: "bg-red-50 text-red-700 border-red-200" },
  lock: { badge: "Locked", color: "bg-amber-50 text-amber-700 border-amber-200" },
  unlock: { badge: "Unlocked", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  share: { badge: "Shared", color: "bg-purple-50 text-purple-700 border-purple-200" },
  signin: { badge: "Sign-in", color: "bg-slate-50 text-slate-700 border-slate-200" },
  signout: { badge: "Sign-out", color: "bg-slate-50 text-slate-700 border-slate-200" },
};

export function AuditLogTable({ auditLogs }: { auditLogs: AuditLog[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const searchLower = searchQuery.toLowerCase();
      const performedBy = ((log.performedByName && String(log.performedByName)) || log.performedById || "").toLowerCase();
      const entityId = (log.entityId || "").toLowerCase();
      const details = JSON.stringify(log.details || {}).toLowerCase();
      return (
        performedBy.includes(searchLower) ||
        entityId.includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        details.includes(searchLower)
      );
    });
  }, [auditLogs, searchQuery]);

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200/50 px-6 py-6 sm:flex-row sm:items-center">
        <h3 className="text-xl font-bold text-slate-950">Audit Log</h3>
        <div className="relative flex-1 sm:ml-auto sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
          <Input
            type="text"
            placeholder="Search by user, goal, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white/50 border-slate-200 focus:border-blue-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredLogs.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50/50 border-b border-slate-200/50">
              <TableRow className="hover:bg-slate-50/50">
                <TableHead className="font-bold text-slate-950">Timestamp</TableHead>
                <TableHead className="font-bold text-slate-950">User</TableHead>
                <TableHead className="font-bold text-slate-950">Action</TableHead>
                <TableHead className="font-bold text-slate-950">Goal ID</TableHead>
                <TableHead className="font-bold text-slate-950">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const actionConfig = actionToneMap[log.action] || {
                  badge: log.action,
                  color: "bg-slate-50 text-slate-700 border-slate-200",
                };

                return (
                  <TableRow key={log.id} className="border-slate-200/50 hover:bg-blue-50/50 transition-colors duration-150">
                    <TableCell className="whitespace-nowrap text-xs font-medium text-slate-600 py-4">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-950">{log.performedByName || log.performedById || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border font-semibold ${actionConfig.color}`}>
                        {actionConfig.badge}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{log.entityId || "—"}</TableCell>
                    <TableCell className="max-w-xs text-sm text-slate-700">
                      <p className="line-clamp-2">{log.details ? JSON.stringify(log.details) : "—"}</p>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-950">No audit logs found</p>
            <p className="text-xs text-slate-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {filteredLogs.length > 0 && (
        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">
          Showing {filteredLogs.length} of {auditLogs.length} audit entries
        </div>
      )}
    </div>
  );
}
