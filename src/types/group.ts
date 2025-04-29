export type Group = {
  id: string | number;
  name: string;
  members: number;
  contribution: number;
  frequency: string;
  nextDue: string;
  status: "active" | "pending" | "completed";
  progress: number;
  tags?: string[];
};
