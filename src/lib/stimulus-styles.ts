/** Stimulus brand-aligned badge / surface utility classes (light + dark). */

export const STIMULUS_BADGE = {
  primary: "bg-stim-primary/10 text-stim-primary dark:bg-stim-primary-light/15 dark:text-stim-primary-light",
  success: "bg-stim-success/10 text-stim-success dark:bg-stim-success/20 dark:text-stim-success",
  warning: "bg-stim-warning/15 text-stim-warning-dark dark:bg-stim-warning/20 dark:text-stim-warning-light",
  error: "bg-stim-error/10 text-stim-error dark:bg-stim-error/20 dark:text-stim-error-light",
  info: "bg-stim-info/10 text-stim-info dark:bg-stim-info/15 dark:text-stim-info",
  muted: "bg-muted text-muted-foreground",
  forest: "bg-stim-forest/10 text-stim-forest dark:bg-stim-primary-light/10 dark:text-stim-primary-light",
  mint: "bg-stim-mint/50 text-stim-primary-dark dark:bg-stim-primary/20 dark:text-stim-primary-light",
} as const;

export const DISPLAY_STATUS_COLORS: Record<string, string> = {
  draft: STIMULUS_BADGE.muted,
  published: STIMULUS_BADGE.primary,
  qa_open: STIMULUS_BADGE.info,
  responses: STIMULUS_BADGE.success,
  submissions_open: STIMULUS_BADGE.success,
  awarded: STIMULUS_BADGE.warning,
  closed: STIMULUS_BADGE.muted,
};

export const STATUS_COLORS: Record<string, string> = {
  draft: STIMULUS_BADGE.muted,
  published: STIMULUS_BADGE.primary,
  open: STIMULUS_BADGE.success,
  closed: STIMULUS_BADGE.muted,
  awarded: STIMULUS_BADGE.warning,
};

export const TYPE_COLORS: Record<string, string> = {
  RFI: STIMULUS_BADGE.mint,
  RFQ: STIMULUS_BADGE.primary,
  RFP: STIMULUS_BADGE.forest,
};

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  not_submitted: STIMULUS_BADGE.error,
  draft: STIMULUS_BADGE.warning,
  not_started: STIMULUS_BADGE.muted,
  submitted: STIMULUS_BADGE.success,
};
