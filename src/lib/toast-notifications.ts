import { toast } from "sonner";

/**
 * Centralized toast notifications for the Goal Tracking Portal
 * Provides consistent messaging and styling across the application
 */

export const toastNotifications = {
  /**
   * Goal Creation
   */
  goalCreated: (count: number = 1) => {
    toast.success("Goal created", {
      description: `${count} goal${count > 1 ? "s" : ""} added to the plan.`,
    });
  },

  /**
   * Goal Approval
   */
  goalApproved: () => {
    toast.success("Goal approved", {
      description: "The goal is now locked for employee edits.",
    });
  },

  /**
   * Goal Rejection
   */
  goalRejected: (reason?: string) => {
    toast.error("Goal rejected", {
      description: reason || "The goal did not meet approval criteria.",
    });
  },

  /**
   * Check-in Submission
   */
  checkInSubmitted: () => {
    toast.success("Check-in submitted", {
      description: "Your progress has been recorded.",
    });
  },

  /**
   * CSV Export
   */
  csvExported: (fileName?: string) => {
    toast.success("CSV exported", {
      description: fileName ? `Data exported to ${fileName}` : "Data has been exported successfully.",
    });
  },

  /**
   * Goal Unlocked (Admin action)
   */
  goalUnlocked: () => {
    toast.success("Goal unlocked", {
      description: "Goal definition is now editable.",
    });
  },

  /**
   * Generic Error Toast
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description: description || "An unexpected error occurred.",
    });
  },

  /**
   * Generic Info Toast
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    });
  },

  /**
   * Generic Success Toast
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    });
  },

  /**
   * Generic Loading Toast (returns ID for manual dismiss)
   */
  loading: (message: string, description?: string) => {
    return toast.loading(message, {
      description,
    });
  },
};
