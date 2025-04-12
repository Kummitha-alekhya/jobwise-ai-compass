
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, Application, UserRole } from '@/types';
import { useAuth } from './AuthContext';

// Sample data
import { mockJobs, mockApplications } from '@/data/mockData';

interface JobContextType {
  jobs: Job[];
  applications: Application[];
  userJobs: Job[];
  userApplications: Application[];
  addJob: (job: Omit<Job, 'id' | 'employerId' | 'createdAt' | 'status'>) => void;
  applyToJob: (jobId: string, resume: string, coverLetter?: string) => Promise<Application>;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => void;
  getJobById: (id: string) => Job | undefined;
  getApplicationsForJob: (jobId: string) => Application[];
  getApplicationById: (id: string) => Application | undefined;
  analyzeResumeForJob: (resume: string, jobId: string) => Promise<{ score: number; keywords: string[] }>;
  getResumeFeedback: (resume: string) => Promise<Application['feedback']>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [applications, setApplications] = useState<Application[]>(mockApplications);

  // Filter jobs/applications based on user role
  const userJobs = user?.role === 'employer' 
    ? jobs.filter(job => job.employerId === user.id)
    : [];
    
  const userApplications = user?.role === 'candidate'
    ? applications.filter(app => app.candidateId === user.id)
    : [];

  const addJob = (jobData: Omit<Job, 'id' | 'employerId' | 'createdAt' | 'status'>) => {
    if (!user || user.role !== 'employer') return;
    
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      employerId: user.id,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    
    setJobs(prevJobs => [...prevJobs, newJob]);
  };

  const applyToJob = async (jobId: string, resume: string, coverLetter?: string): Promise<Application> => {
    if (!user || user.role !== 'candidate') throw new Error('Only candidates can apply to jobs');
    
    // Analyze the resume against the job (in a real app, this would be an API call)
    const analysis = await analyzeResumeForJob(resume, jobId);
    
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      jobId,
      candidateId: user.id,
      resume,
      coverLetter,
      matchScore: analysis.score,
      matchingKeywords: analysis.keywords,
      status: 'applied',
      appliedAt: new Date().toISOString(),
    };
    
    setApplications(prevApps => [...prevApps, newApplication]);
    return newApplication;
  };

  const updateApplicationStatus = (applicationId: string, status: Application['status']) => {
    setApplications(prevApps => 
      prevApps.map(app => 
        app.id === applicationId ? { ...app, status } : app
      )
    );
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const getApplicationsForJob = (jobId: string) => {
    return applications.filter(app => app.jobId === jobId);
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  // AI functions (simulated for demo)
  const analyzeResumeForJob = async (resume: string, jobId: string): Promise<{ score: number; keywords: string[] }> => {
    const job = getJobById(jobId);
    if (!job) throw new Error('Job not found');
    
    // In a real app, this would use an AI service
    // For demo purposes, we'll generate a random score and use the job skills as keywords
    const score = Math.floor(Math.random() * 41) + 60; // Score between 60-100
    const keywords = job.skills.filter(() => Math.random() > 0.3); // Randomly select some skills
    
    return { score, keywords };
  };

  const getResumeFeedback = async (resume: string): Promise<Application['feedback']> => {
    // In a real app, this would use an AI service
    // For demo purposes, we'll generate mock feedback
    return {
      grammar: {
        score: Math.floor(Math.random() * 30) + 70,
        suggestions: [
          "Consider using more active voice throughout your resume.",
          "Fix spelling errors in your technical skills section.",
        ],
      },
      structure: {
        score: Math.floor(Math.random() * 20) + 80,
        suggestions: [
          "Your work experience section is well-organized.",
          "Consider adding more quantifiable achievements.",
        ],
      },
      keywords: {
        score: Math.floor(Math.random() * 40) + 60,
        matching: ["development", "React", "JavaScript", "teamwork"],
        missing: ["TypeScript", "project management", "agile"],
      },
      ats: {
        score: Math.floor(Math.random() * 30) + 70,
        suggestions: [
          "Your resume uses a good, ATS-friendly format.",
          "Consider removing complex tables or graphics.",
        ],
      },
      branding: {
        score: Math.floor(Math.random() * 40) + 60,
        suggestions: [
          "Your personal statement could better highlight your unique value.",
          "Consider adding a professional summary section.",
        ],
      },
      overall: Math.floor(Math.random() * 30) + 70,
    };
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        applications,
        userJobs,
        userApplications,
        addJob,
        applyToJob,
        updateApplicationStatus,
        getJobById,
        getApplicationsForJob,
        getApplicationById,
        analyzeResumeForJob,
        getResumeFeedback,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
