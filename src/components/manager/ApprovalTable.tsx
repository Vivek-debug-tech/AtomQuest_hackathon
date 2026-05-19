"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PencilLine, RotateCcw, Search, XCircle } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      if (statusFilter !== "All" && approval.status !== statusFilter) {
        return false;
      }

      const searchLower = searchQuery.toLowerCase();
      return (
        (approval.goal?.owner || approval.requesterId).toLowerCase().includes(searchLower) ||
        (approval.goal?.title || "").toLowerCase().includes(searchLower) ||
        (approval.goal?.thrustArea || "").toLowerCase().includes(searchLower)
      );
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
      const weightage = parseInt(editingCell.value, 10);
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

  const pendingCount = approvals.filter((approval) => approval.status === "Pending").length;

  return (
    <div className="glass-panel overflow-hidden rounded-[30px] border border-white/70 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
      <div className="border-b border-white/70 px-6 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-2xl font-semibold text-slate-950">Approval command board</h3>
            <p className="mt-1 text-sm text-slate-600">
              Review submitted goals, adjust target or weightage inline, and complete approvals in one place.
            </p>
          </div>
          <Badge className="w-fit border-blue-200 bg-blue-50 text-blue-700">{pendingCount} pending</Badge>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by employee, goal title, or thrust area"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/70 bg-white/76 text-slate-700">
                Status: {statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
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

      {filteredApprovals.length > 0 ? (
        <>
          <div className="border-b border-white/70 bg-white/50 px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Showing {filteredApprovals.length} of {approvals.length} approvals
          </div>
          <div className="overflow-x-auto px-2 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Employee</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Target / Weightage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell className="pl-4 font-semibold text-slate-950">{approval.goal?.owner || approval.requesterId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="max-w-xs font-medium text-slate-950">{approval.goal?.title || "Goal awaiting review"}</p>
                        <p className="mt-1 text-xs text-slate-500">{approval.goal?.thrustArea}</p>
                        {approval.goal?.isLocked ? (
                          <Badge variant="destructive" className="mt-2">Locked</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {approval.goal?.isLocked ? (
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                              <span>{approval.goal?.target}</span>
                            </div>
                          ) : editingCell?.approvalId === approval.id && editingCell.field === "target" ? (
                            <div className="flex flex-1 gap-2">
                              <Input
                                type="text"
                                value={editingCell.value}
                                onChange={(event) =>
                                  setEditingCell({
                                    ...editingCell,
                                    value: event.target.value,
                                  })
                                }
                                className="h-10 flex-1 text-sm"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleEditSave(approval.goal?.id)} className="px-3 text-xs">
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCell(null)} className="px-3 text-xs">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-sm text-slate-600">
                              <span>{approval.goal?.target}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditStart(approval.id, "target", approval.goal?.target || "")}
                                className="h-8 w-8 p-0"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {approval.goal?.isLocked ? (
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                              <span>{approval.goal ? `${approval.goal.weightage}%` : "-"}</span>
                            </div>
                          ) : editingCell?.approvalId === approval.id && editingCell.field === "weightage" ? (
                            <div className="flex flex-1 gap-2">
                              <Input
                                type="number"
                                value={editingCell.value}
                                onChange={(event) =>
                                  setEditingCell({
                                    ...editingCell,
                                    value: event.target.value,
                                  })
                                }
                                min="10"
                                max="100"
                                className="h-10 flex-1 text-sm"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleEditSave(approval.goal?.id)} className="px-3 text-xs">
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingCell(null)} className="px-3 text-xs">
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-1 items-center justify-between rounded-2xl border border-white/70 bg-white/75 px-3 py-2 text-sm text-slate-600">
                              <span>{approval.goal ? `${approval.goal.weightage}%` : "-"}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditStart(approval.id, "weightage", approval.goal?.weightage || 10)}
                                className="h-8 w-8 p-0"
                              >
                                <PencilLine className="h-3.5 w-3.5" />
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
          </div>
        </>
      ) : (
        <div className="p-6">
          <EmptyState
            title="No approvals found"
            description="There are no pending approvals matching your current search or filter criteria."
          />
        </div>
      )}
    </div>
  );
}
