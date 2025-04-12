
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { useToast } from "@/components/ui/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTitle } from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatCard from "@/components/dashboard/StatCard";
import JobCard from "@/components/jobs/JobCard";
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  Clock, 
  PlusCircle,
  X
} from "lucide-react";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userJobs, addJob, applications, getApplicationsForJob } = useJobs();
  const { toast } = useToast();
  
  const [isPostJobDialogOpen, setIsPostJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: user?.name || "",
    location: "",
    description: "",
    requirements: "",
    skills: "",
    salary: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if the user is logged in and is an employer
  if (!user || user.role !== "employer") {
    navigate("/login");
    return null;
  }
  
  // Count total applications across all jobs
  const totalApplications = userJobs.reduce(
    (total, job) => total + getApplicationsForJob(job.id).length,
    0
  );
  
  // Count applications by status
  const applicationStatusCounts = applications.reduce(
    (acc, app) => {
      const jobBelongsToUser = userJobs.some(job => job.id === app.jobId);
      if (jobBelongsToUser) {
        acc[app.status] = (acc[app.status] || 0) + 1;
      }
      return acc;
    },
    { applied: 0, in_review: 0, interview: 0, rejected: 0, hired: 0 }
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const handlePostJob = () => {
    setIsSubmitting(true);
    
    try {
      // Validate inputs
      if (!newJob.title || !newJob.description || !newJob.requirements || !newJob.skills) {
        throw new Error("Please fill in all required fields");
      }
      
      // Process inputs
      const requirementsArray = newJob.requirements
        .split('\n')
        .filter(req => req.trim() !== '');
      
      const skillsArray = newJob.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '');
      
      // Add the new job
      addJob({
        title: newJob.title,
        company: newJob.company,
        location: newJob.location,
        description: newJob.description,
        requirements: requirementsArray,
        skills: skillsArray,
        salary: newJob.salary,
      });
      
      toast({
        title: "Job posted successfully!",
        description: "Your new job listing is now active.",
      });
      
      // Reset the form and close the dialog
      setNewJob({
        title: "",
        company: user.name,
        location: "",
        description: "",
        requirements: "",
        skills: "",
        salary: "",
      });
      setIsPostJobDialogOpen(false);
    } catch (error) {
      let message = "Failed to post job";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <PageTitle 
            title={`Welcome, ${user.name}`} 
            subtitle="Manage your job listings and applications"
          />
          <Button onClick={() => setIsPostJobDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Post New Job
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Jobs"
            value={userJobs.filter(job => job.status === "active").length}
            icon={<Briefcase className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Total Applicants"
            value={totalApplications}
            icon={<Users className="h-5 w-5 text-secondary" />}
          />
          <StatCard
            title="In Review"
            value={applicationStatusCounts.in_review || 0}
            icon={<Clock className="h-5 w-5 text-amber-500" />}
          />
          <StatCard
            title="Hired"
            value={applicationStatusCounts.hired || 0}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          />
        </div>
        
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="applications">Recent Applications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="space-y-6">
            {userJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    showApplyButton={false} 
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No job listings yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first job listing to start receiving applications from qualified candidates.
                  </p>
                  <Button onClick={() => setIsPostJobDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Post a Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="applications" className="space-y-6">
            {totalApplications > 0 ? (
              <div>
                <p className="text-muted-foreground mb-4">
                  Feature coming soon: View and manage all applications in one place.
                </p>
                <Card>
                  <CardContent className="py-10 text-center">
                    <h3 className="text-lg font-medium mb-2">Application Management Coming Soon</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      We're working on a comprehensive application management system. 
                      For now, click on any job to see its applications.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Once candidates apply to your job listings, their applications will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
      
      {/* Post Job Dialog */}
      <Dialog open={isPostJobDialogOpen} onOpenChange={setIsPostJobDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new job listing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Frontend Developer"
                  value={newJob.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company Name <span className="text-red-500">*</span></Label>
                <Input
                  id="company"
                  name="company"
                  value={newJob.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. Remote, New York, NY"
                  value={newJob.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range (Optional)</Label>
                <Input
                  id="salary"
                  name="salary"
                  placeholder="e.g. $80,000 - $100,000"
                  value={newJob.salary}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and ideal candidate"
                className="min-h-[100px]"
                value={newJob.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">
                Requirements <span className="text-red-500">*</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (One per line)
                </span>
              </Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="e.g. 3+ years of React experience"
                className="min-h-[100px]"
                value={newJob.requirements}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skills">
                Skills <span className="text-red-500">*</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (Comma-separated)
                </span>
              </Label>
              <Input
                id="skills"
                name="skills"
                placeholder="e.g. React, TypeScript, Node.js"
                value={newJob.skills}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostJobDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePostJob} 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
