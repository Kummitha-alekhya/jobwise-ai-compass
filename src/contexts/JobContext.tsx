
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, Application } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface JobContextType {
  jobs: Job[];
  applications: Application[];
  userJobs: Job[];
  userApplications: Application[];
  addJob: (job: Omit<Job, 'id' | 'employerId' | 'createdAt' | 'status'>) => Promise<void>;
  applyToJob: (jobId: string, resume: string, coverLetter?: string) => Promise<Application | null>;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => Promise<void>;
  getJobById: (id: string) => Job | undefined;
  getApplicationsForJob: (jobId: string) => Application[];
  getApplicationById: (id: string) => Application | undefined;
  analyzeResumeForJob: (resume: string, jobId: string) => Promise<{ score: number; keywords: string[] }>;
  getResumeFeedback: (resume: string) => Promise<Application['feedback']>;
  deleteJob: (jobId: string) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Filter jobs/applications based on user role
  const userJobs = profile?.role === 'employer' 
    ? jobs.filter(job => job.employerId === user?.id)
    : [];
    
  const userApplications = profile?.role === 'candidate'
    ? applications.filter(app => app.candidateId === user?.id)
    : [];

  // Fetch jobs and applications
  useEffect(() => {
    // Only fetch data if we have a logged-in user
    if (user) {
      fetchJobs();
      fetchApplications();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*');
        
      if (error) throw error;
      
      setJobs(data as Job[]);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');
        
      if (error) throw error;
      
      setApplications(data as Application[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const addJob = async (jobData: Omit<Job, 'id' | 'employerId' | 'createdAt' | 'status'>) => {
    if (!user || profile?.role !== 'employer') {
      toast({
        title: "Permission denied",
        description: "Only employers can post jobs",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          employer_id: user.id,
          created_at: new Date().toISOString(),
          status: 'active',
          requirements: jobData.requirements || [],
          skills: jobData.skills || []
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setJobs(prevJobs => [...prevJobs, data as Job]);
      
      toast({
        title: "Job posted",
        description: "Your job has been posted successfully",
      });
    } catch (error: any) {
      console.error('Error adding job:', error);
      toast({
        title: "Job posting failed",
        description: error.message || "Failed to post job",
        variant: "destructive"
      });
    }
  };

  const applyToJob = async (jobId: string, resume: string, coverLetter?: string): Promise<Application | null> => {
    if (!user || profile?.role !== 'candidate') {
      toast({
        title: "Permission denied",
        description: "Only candidates can apply to jobs",
        variant: "destructive"
      });
      return null;
    }
    
    // Check if already applied
    const alreadyApplied = applications.some(app => app.jobId === jobId && app.candidateId === user.id);
    if (alreadyApplied) {
      toast({
        title: "Already applied",
        description: "You have already applied for this job",
      });
      return null;
    }
    
    try {
      // Analyze the resume against the job
      const analysis = await analyzeResumeForJob(resume, jobId);
      
      const newApplication = {
        job_id: jobId,
        candidate_id: user.id,
        resume: resume,
        cover_letter: coverLetter,
        match_score: analysis.score,
        matching_keywords: analysis.keywords,
        status: 'applied',
        applied_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('applications')
        .insert(newApplication)
        .select()
        .single();
      
      if (error) throw error;
      
      const application = data as unknown as Application;
      
      // Update local state
      setApplications(prevApps => [...prevApps, application]);
      
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
      
      return application;
    } catch (error: any) {
      console.error('Error applying to job:', error);
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Update local state
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
      
      toast({
        title: "Status updated",
        description: `Application status updated to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!user || profile?.role !== 'employer') {
      toast({
        title: "Permission denied",
        description: "Only employers can delete jobs",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('employer_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      toast({
        title: "Job deleted",
        description: "The job posting has been deleted",
      });
    } catch (error: any) {
      console.error('Error deleting job:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete job",
        variant: "destructive"
      });
    }
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
        deleteJob
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
