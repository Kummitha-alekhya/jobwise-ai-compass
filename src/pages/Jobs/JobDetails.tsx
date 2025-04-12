
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Briefcase, MapPin, Calendar, ArrowLeft, Building, Check, X, Upload } from "lucide-react";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, applyToJob, userApplications } = useJobs();
  const { toast } = useToast();
  
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Find the job with the given ID
  const job = jobs.find(job => job.id === id);
  
  // Check if the user has already applied for this job
  const hasApplied = userApplications.some(app => app.jobId === id);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to log in as a candidate to apply for jobs.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (user.role !== "candidate") {
      toast({
        title: "Not allowed",
        description: "Only candidates can apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    if (hasApplied) {
      toast({
        title: "Already applied",
        description: "You have already applied for this job.",
      });
      return;
    }
    
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = async () => {
    if (!job || !resume) return;
    
    setIsSubmitting(true);
    
    try {
      const application = await applyToJob(job.id, resume, coverLetter);
      
      toast({
        title: "Application submitted!",
        description: "Your application has been successfully submitted.",
      });
      
      setIsApplyDialogOpen(false);
      
      // Redirect to application details
      navigate(`/candidate/applications/${application.id}`);
    } catch (error) {
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/jobs")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Browse All Jobs
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/jobs")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center text-muted-foreground gap-3 mb-3">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Posted {formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                  {job.salary && (
                    <div className="bg-accent/50 rounded-full px-3 py-1 text-sm font-medium inline-block">
                      {job.salary}
                    </div>
                  )}
                </div>
                {job.status !== "active" && (
                  <Badge variant="secondary" className="ml-2">
                    Closed
                  </Badge>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {job.description}
                </p>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {job.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-accent">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Apply for this position</h2>
              
              {job.status === "active" ? (
                <>
                  {hasApplied ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-green-800 font-medium">You've already applied</p>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Check your applications dashboard for status updates.
                      </p>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={handleApply}>
                      Apply Now
                    </Button>
                  )}
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Easy application process with JobWise AI resume analysis
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <X className="h-5 w-5 text-gray-500 mr-2" />
                    <p className="text-gray-800 font-medium">This job is no longer accepting applications</p>
                  </div>
                </div>
              )}
              
              <div className="border-t border-border mt-6 pt-6">
                <h3 className="font-medium mb-3">Company Information</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {job.company} is a leading company in the technology sector, known for innovation and employee satisfaction.
                </p>
                <Button variant="outline" className="w-full">
                  View Company Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Submit your resume and our AI will analyze it against the job requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="resume" className="text-sm font-medium">
                Resume <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="resume"
                placeholder="Paste your resume text here..."
                className="min-h-[200px]"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                In a production app, you would upload a PDF file here.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="coverLetter" className="text-sm font-medium">
                Cover Letter (Optional)
              </label>
              <Textarea
                id="coverLetter"
                placeholder="Add a cover letter to highlight why you're a good fit for this role"
                className="min-h-[100px]"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApplication} 
              disabled={!resume || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
