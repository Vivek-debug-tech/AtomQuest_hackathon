export interface QuarterWindow {
  key: string;
  label: string;
  start: string;
  end: string;
}

export interface CycleWindow {
  key: string;
  label: string;
  opensOn: string;
  closesOn?: string;
  action: string;
  isActive?: boolean;
}

export function getQuarterNumber(date = new Date()) {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function getQuarterKey(date = new Date()) {
  return `Q${getQuarterNumber(date)}-${date.getFullYear()}`;
}

export function getQuarterLabel(date = new Date()) {
  return `Q${getQuarterNumber(date)} ${date.getFullYear()}`;
}

export function getQuarterWindows(year = new Date().getFullYear()): QuarterWindow[] {
  return [
    { key: `Q1-${year}`, label: `Q1 ${year}`, start: `${year}-01-01`, end: `${year}-03-31` },
    { key: `Q2-${year}`, label: `Q2 ${year}`, start: `${year}-04-01`, end: `${year}-06-30` },
    { key: `Q3-${year}`, label: `Q3 ${year}`, start: `${year}-07-01`, end: `${year}-09-30` },
    { key: `Q4-${year}`, label: `Q4 ${year}`, start: `${year}-10-01`, end: `${year}-12-31` },
  ];
}

export function isQuarterSubmissionOpen(quarterKey: string, date = new Date()) {
  return quarterKey === getQuarterKey(date);
}

export function getBrdCycleWindows(year = new Date().getFullYear()): CycleWindow[] {
  return [
    {
      key: `goal-setting-${year}`,
      label: "Phase 1 - Goal Setting",
      opensOn: `${year}-05-01`,
      action: "Goal creation, submission and approval",
    },
    {
      key: `q1-${year}`,
      label: "Q1 Check-in",
      opensOn: `${year}-07-01`,
      action: "Progress update - planned vs actual",
    },
    {
      key: `q2-${year}`,
      label: "Q2 Check-in",
      opensOn: `${year}-10-01`,
      action: "Progress update - planned vs actual",
    },
    {
      key: `q3-${year + 1}`,
      label: "Q3 Check-in",
      opensOn: `${year + 1}-01-01`,
      action: "Progress update - planned vs actual",
    },
    {
      key: `annual-${year + 1}`,
      label: "Q4 / Annual",
      opensOn: `${year + 1}-03-01`,
      action: "Final achievement capture",
    },
  ];
}
