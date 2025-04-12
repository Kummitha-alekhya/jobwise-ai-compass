
// Extending the existing types file with types that match our database schema

export type UserRole = "candidate" | "employer";

export interface User {
  id: string;
  name?: string;
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
  status: "active" | "closed";
  createdAt: string;
  updatedAt?: string;
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
  feedback?: {
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
  };
  appliedAt: string;
  updatedAt?: string;
}

export interface Resume {
  id: string;
  candidateId: string;
  personalDetails: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    summary?: string;
  };
  skills: string[];
  experience: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }[];
  projects: {
    name: string;
    description?: string;
    url?: string;
    technologies?: string[];
  }[];
  createdAt: string;
  updatedAt?: string;
}
