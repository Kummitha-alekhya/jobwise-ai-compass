
export type UserRole = "employer" | "candidate";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary?: string;
  createdAt: string;
  status: "active" | "closed";
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  resume: string;
  coverLetter?: string;
  matchScore?: number;
  matchingKeywords?: string[];
  status: "applied" | "in_review" | "interview" | "rejected" | "hired";
  feedback?: ResumeFeedback;
  appliedAt: string;
}

export interface ResumeFeedback {
  grammar: {
    score: number;
    suggestions: string[];
  };
  structure: {
    score: number;
    suggestions: string[];
  };
  keywords: {
    score: number;
    matching: string[];
    missing: string[];
  };
  ats: {
    score: number;
    suggestions: string[];
  };
  branding: {
    score: number;
    suggestions: string[];
  };
  overall: number;
}
