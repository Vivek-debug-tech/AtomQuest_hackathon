"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, PencilLine, RotateCcw, Search, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Approval, Goal } from "@/types";

type ApprovalRow = Approval & { goal?: Goal };

type EditState = {
  approvalId: string;
  field: "target" | "weightage";
  value: string;
};

type ApprovalStatus = "All" | "Pending" | "Approved" | "Rejected";

export function ApprovalTable({
  approvals,
  onApprove,
  onReject,
  onReturn,
  onUpdateGoal,
}: {
  approvals: ApprovalRow[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReturn: (id: string) => void;
  onUpdateGoal?: (goalId: string, updates: { target?: string; weightage?: number }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus>("All");
  const [editingCell, setEditingCell] = useState<EditState | null>(null);

  // Filter and search logic
  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      // Status filter
      if (statusFilter !== "All" && approval.status !== statusFilter) {
        return false;
      }

      // Search filter (employee name or goal title)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (approval.goal?.owner || approval.requesterId).toLowerCase().includes(searchLower) ||
        (approval.goal?.title || "").toLowerCase().includes(searchLower) ||
        (approval.goal?.thrustArea || "").toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [approvals, searchQuery, statusFilter]);

  const handleEditStart = (approvalId: string, field: "target" | "weightage", currentValue: string | number) => {
    setEditingCell({
      approvalId,
      field,
      value: String(currentValue),
    });
  };

  const handleEditSave = (goalId: string | undefined) => {
    if (!editingCell || !goalId || !onUpdateGoal) return;

    const updates: { target?: string; weightage?: number } = {};
    if (editingCell.field === "target") {
      updates.target = editingCell.value;
    } else {
      const weightage = parseInt(editingCell.value);
      if (weightage >= 10 && weightage <= 100) {
        updates.weightage = weightage;
      } else {
        setEditingCell(null);
        return;
      }
    }

    onUpdateGoal(goalId, updates);
    setEditingCell(null);
  };

  const pendingCount = approvals.filter((a) => a.status === "Pending").length;

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] transition-all duration-300 overflow-hidden">
      <div className="border-b border-slate-200/50 px-6 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Pending Approvals</h3>
            <p className="mt-1 text-sm text-slate-600">Review submitted goals and take inline actions.</p>
          </div>
          <Badge className="w-fit bg-blue-100 text-blue-700 border-blue-200 border font-semibold">
            {pendingCount} pending
          </Badge>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
            <Input
              type="text"
              placeholder="Search by employee, goal title, or thrust area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white/50 border-slate-200 focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap h-10 border-slate-200 text-slate-700 hover:bg-slate-50">
                Status: {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {(["All", "Pending", "Approved", "Rejected"] as ApprovalStatus[]).map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter === status}
                  onCheckedChange={() => setStatusFilter(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Count */}
      {filteredApprovals.length > 0 && (
        <div className="border-b border-slate-200/50 px-6 py-3 text-xs font-medium text-slate-600 bg-slate-50/50">
          Showing {filteredApprovals.length} of {approvals.length} approvals
        </div>
      )}

      <div className="overflow-x-auto">
        {filteredApprovals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Target / Weightage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.map((approval) => (
                <TableRow key={approval.id} className="border-slate-200/50 hover:bg-blue-50/50 transition-colors duration-150 group">
                  <TableCell className="font-semibold text-slate-950 py-4">{approval.goal?.owner || approval.requesterId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="max-w-xs font-medium text-slate-950">{approval.goal?.title || "Goal awaiting review"}</p>
                      <p className="text-xs text-slate-500">{approval.goal?.thrustArea}</p>
                      {approval.goal?.isLocked ? (
                        <Badge variant="destructive" className="mt-2 bg-red-100 text-red-700">
                          Locked
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {/* Target - Editable */}
                      <div className="flex items-center gap-2">
                        {approval.goal?.isLocked ? (
                          <div className="flex flex-1 items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm text-slate-400">
                            <span>{approval.goal?.target}</span>
                          </div>
                        ) : editingCell?.approvalId === approval.id && editingCell.field === "target" ? (
                          <div className="flex flex-1 gap-1">
                            <Input
                              type="text"
                              value={editingCell.value}
                              onChange={(e) =>
                                setEditingCell({
                                  ...editingCell,
                                  value: e.target.value,
                                })
                              }
                              className="h-8 flex-1 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleEditSave(approval.goal?.id)}
                              className="h-8 px-2 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCell(null)}
                              className="h-8 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm text-slate-600">
                            <span>{approval.goal?.target}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditStart(
                                  approval.id,
                                  "target",
                                  approval.goal?.target || ""
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              <PencilLine className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Weightage - Editable */}
                      <div className="flex items-center gap-2">
                        {approval.goal?.isLocked ? (
                          <div className="flex flex-1 items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm text-slate-400">
                            <span>{approval.goal ? `${approval.goal.weightage}%` : "—"}</span>
                          </div>
                        ) : editingCell?.approvalId === approval.id && editingCell.field === "weightage" ? (
                          <div className="flex flex-1 gap-1">
                            <Input
                              type="number"
                              value={editingCell.value}
                              onChange={(e) =>
                                setEditingCell({
                                  ...editingCell,
                                  value: e.target.value,
                                })
                              }
                              min="10"
                              max="100"
                              className="h-8 flex-1 text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleEditSave(approval.goal?.id)}
                              className="h-8 px-2 text-xs"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCell(null)}
                              className="h-8 px-2 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-1 items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm text-slate-600">
                            <span>{approval.goal ? `${approval.goal.weightage}%` : "—"}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditStart(
                                  approval.id,
                                  "weightage",
                                  approval.goal?.weightage || 10
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              <PencilLine className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        approval.status === "Approved"
                          ? "default"
                          : approval.status === "Rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {approval.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onReturn(approval.id)} disabled={approval.goal?.isLocked}>
                        <RotateCcw className="mr-1.5 h-4 w-4" />
                        Rework
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onReject(approval.id)} disabled={approval.goal?.isLocked}>
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => onApprove(approval.id)} disabled={approval.goal?.isLocked}>
                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6">
            <EmptyState
              title="No approvals found"
              description="There are no pending approvals matching your current search or filter criteria."
            />
          </div>
        )}
      </div>
    </div>
  );
}
