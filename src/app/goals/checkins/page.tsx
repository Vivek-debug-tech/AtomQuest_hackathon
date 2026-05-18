"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/shared/PageTitle";
import { CheckinForm } from "@/components/checkins/CheckinForm";
import { CheckinCard } from "@/components/checkins/CheckinCard";
import { CheckinReview } from "@/components/checkins/CheckinReview";
import { ProgressTracker } from "@/components/checkins/ProgressTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { mockGoals, mockCheckIns } from "@/data/mockData";
import { fetchGoals, isSupabaseConfigured } from "@/lib/supabase";
import type { GoalCheckIn } from "@/types";
import { toastNotifications } from "@/lib/toast-notifications";

type CheckinFormValues = {
  actualAchievement: number;
  status: "Not Started" | "On Track" | "Completed";
  comments: string;
};

export default function CheckinsPage() {
  const userRole = "Manager"; // In real app, get from auth context
  const [goals, setGoals] = useState(mockGoals);
  const [checkIns, setCheckIns] = useState<GoalCheckIn[]>(mockCheckIns);
  const [activeTab, setActiveTab] = useState(userRole === "Manager" ? "review" : "submit");

  useEffect(() => {
    let alive = true;

    if (!isSupabaseConfigured) return;

    void fetchGoals()
      .then((rows) => {
        if (alive && rows.length > 0) {
          setGoals(rows);
        }
      })
      .catch((error) => {
        console.error("Failed to load goals for check-ins", error);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Group check-ins by goal
  const checkInsByGoal = useMemo(() => {
    const grouped: Record<string, GoalCheckIn[]> = {};
    checkIns.forEach((checkin) => {
      if (!grouped[checkin.goalId]) {
        grouped[checkin.goalId] = [];
      }
      grouped[checkin.goalId].push(checkin);
    });
    return grouped;
  }, [checkIns]);

  // Get stats
  const pendingReview = checkIns.filter((c) => !c.reviewedBy).length;
  const totalSubmitted = checkIns.length;
  const completedGoals = goals.filter((g) => g.status === "Completed").length;
  const avgProgress = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length);

  const handleSubmitCheckin = (goalId: string, data: CheckinFormValues) => {
    const newCheckin: GoalCheckIn = {
      id: `checkin-${Date.now()}`,
      goalId,
      actualAchievement: data.actualAchievement,
      plannedTarget: parseFloat(goals.find((g) => g.id === goalId)?.target || "0"),
      progress: data.actualAchievement,
      status: data.status,
      comments: data.comments,
      createdBy: "emp-001",
      createdAt: new Date().toISOString(),
    };

    setCheckIns([...checkIns, newCheckin]);
    setActiveTab("submitted");
    toastNotifications.checkInSubmitted();
  };

  const handleSubmitFeedback = (checkinId: string) => {
    setCheckIns((prev) =>
      prev.map((c) =>
        c.id === checkinId
          ? {
              ...c,
              reviewedBy: "mgr-001",
              reviewedAt: new Date().toISOString(),
            }
          : c,
      ),
    );
  };

  if (userRole === "Manager") {
    return (
      <DashboardLayout
        role="Manager"
        title="Quarterly Check-ins"
        subtitle="Review employee check-in submissions and provide structured feedback."
      >
        <PageTitle
          eyebrow="Employee progress"
          title="Quarterly check-in hub"
          description="Monitor team goal progress with structured check-in reviews and feedback."
        />

        {/* Stats Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Pending Review</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{pendingReview}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Total Submitted</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{totalSubmitted}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Completed Goals</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{completedGoals}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-slate-500">Avg Progress</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{avgProgress}%</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Check-in Review Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Employee Check-in Reviews</h2>
            <p className="mt-1 text-sm text-slate-600">Review and provide feedback on quarterly check-in submissions.</p>
          </div>

          {pendingReview > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                You have <span className="font-semibold">{pendingReview}</span> check-in(s) awaiting your feedback.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {checkIns.map((checkin) => {
              const goal = goals.find((g) => g.id === checkin.goalId);
              if (!goal) return null;

              return (
                <CheckinReview
                  key={checkin.id}
                  checkin={checkin}
                  goalTitle={goal.title}
                  goalThrust={goal.thrustArea}
                  employeeName={goal.owner}
                  onSubmitFeedback={() => handleSubmitFeedback(checkin.id)}
                />
              );
            })}
          </div>

          {checkIns.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-600">No check-ins submitted yet</p>
                <p className="text-xs text-slate-500">Employee check-ins will appear here once submitted.</p>
              </CardContent>
            </Card>
          )}
        </section>
      </DashboardLayout>
    );
  }

  // Employee View
  return (
    <DashboardLayout
      role="Employee"
      title="Quarterly Check-ins"
      subtitle="Submit quarterly updates on your goal progress with detailed comments."
    >
      <PageTitle
        eyebrow="Progress updates"
        title="Quarterly goal check-ins"
        description="Track your achievement against planned targets and share quarterly progress insights."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Check-in</TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted
            <Badge variant="outline" className="ml-2">
              {checkIns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="timeline">Progress Timeline</TabsTrigger>
        </TabsList>

        {/* Submit Check-in Tab */}
        <TabsContent value="submit" className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Submit your quarterly check-in with actual achievement, status, and comments.
            </AlertDescription>
          </Alert>

          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <CheckinForm
                  key={goal.id}
                  goal={goal}
                  onSubmit={(data) => handleSubmitCheckin(goal.id, data)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-slate-200 bg-white">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-800">No goals available</p>
                <p className="text-xs text-slate-500">Create a goal before submitting a quarterly check-in.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Submitted Check-ins Tab */}
        <TabsContent value="submitted" className="space-y-4">
          {checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((checkin) => {
                const goal = goals.find((g) => g.id === checkin.goalId);
                if (!goal) return null;

                return (
                  <CheckinCard
                    key={checkin.id}
                    checkin={checkin}
                    goalTitle={goal.title}
                    goalThrust={goal.thrustArea}
                    goalWeightage={goal.weightage}
                    onViewFeedback={() => undefined}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-600">No check-ins submitted yet</p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("submit")}
                  className="mt-3"
                >
                  Submit your first check-in
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Progress Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {Object.entries(checkInsByGoal).map(([goalId, goalCheckIns]) => {
            const goal = goals.find((g) => g.id === goalId);
            if (!goal) return null;

            const phases = goalCheckIns.map((c) => ({
              quarter: `Q${Math.floor((new Date(c.createdAt).getMonth() + 1) / 3)}`,
              status: c.status,
              progress: c.progress,
              date: new Date(c.createdAt).toLocaleDateString(),
              comments: c.comments,
            }));

            return (
              <ProgressTracker
                key={goalId}
                phases={phases}
                goalTitle={goal.title}
              />
            );
          })}

          {checkIns.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="mb-3 h-8 w-8 text-slate-400" />
                <p className="text-sm text-slate-600">No progress to display</p>
                <p className="text-xs text-slate-500">Submit check-ins to see your progress timeline.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}