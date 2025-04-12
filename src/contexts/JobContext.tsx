import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, Application, ResumeFeedback } from '@/types';
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
  getResumeFeedback: (resume: string) => Promise<ResumeFeedback>;
  deleteJob: (jobId: string) => Promise<void>;
}

const mapDbJobToJob = (dbJob: any): Job => ({
  id: dbJob.id,
  employerId: dbJob.employer_id,
  title: dbJob.title,
  company: dbJob.company,
  location: dbJob.location,
  description: dbJob.description,
  requirements: dbJob.requirements || [],
  skills: dbJob.skills || [],
  salary: dbJob.salary,
  status: dbJob.status,
  createdAt: dbJob.created_at,
  updatedAt: dbJob.updated_at,
});

const mapDbApplicationToApplication = (dbApp: any): Application => ({
  id: dbApp.id,
  jobId: dbApp.job_id,
  candidateId: dbApp.candidate_id,
  resume: dbApp.resume_id || '',
  coverLetter: dbApp.cover_letter,
  status: dbApp.status,
  appliedAt: dbApp.applied_at,
  updatedAt: dbApp.updated_at,
});

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  
  const userJobs = profile?.role === 'employer' 
    ? jobs.filter(job => job.employerId === user?.id)
    : [];
    
  const userApplications = profile?.role === 'candidate'
    ? applications.filter(app => app.candidateId === user?.id)
    : [];

  useEffect(() => {
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
      
      setJobs(data.map(mapDbJobToJob));
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
      
      setApplications(data.map(mapDbApplicationToApplication));
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
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          description: jobData.description,
          requirements: jobData.requirements || [],
          skills: jobData.skills || [],
          salary: jobData.salary,
          employer_id: user.id,
          created_at: new Date().toISOString(),
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setJobs(prevJobs => [...prevJobs, mapDbJobToJob(data)]);
      
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
    
    const alreadyApplied = applications.some(app => app.jobId === jobId && app.candidateId === user.id);
    if (alreadyApplied) {
      toast({
        title: "Already applied",
        description: "You have already applied for this job",
      });
      return null;
    }
    
    try {
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
      
      const application = mapDbApplicationToApplication(data);
      application.matchScore = analysis.score;
      application.matchingKeywords = analysis.keywords;
      
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

  const analyzeResumeForJob = async (resume: string, jobId: string): Promise<{ score: number; keywords: string[] }> => {
    const job = getJobById(jobId);
    if (!job) throw new Error('Job not found');
    
    const score = Math.floor(Math.random() * 41) + 60;
    const keywords = job.skills.filter(() => Math.random() > 0.3);
    
    return { score, keywords };
  };

  const getResumeFeedback = async (resume: string): Promise<ResumeFeedback> => {
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
