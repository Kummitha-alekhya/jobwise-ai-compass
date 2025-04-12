
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTitle } from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import ApplicationCard from "@/components/jobs/ApplicationCard";
import JobCard from "@/components/jobs/JobCard";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  FileText, 
  User, 
  Search,
  BarChart3
} from "lucide-react";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, userApplications } = useJobs();
  
  // Check if the user is logged in and is a candidate
  if (!user || user.role !== "candidate") {
    navigate("/login");
    return null;
  }
  
  // Count applications by status
  const applicationCounts = userApplications.reduce(
    (acc, app) => {
      acc.total += 1;
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    { total: 0, applied: 0, in_review: 0, interview: 0, rejected: 0, hired: 0 }
  );
  
  // Get job details for user applications
  const applicationJobDetails = userApplications.map(app => {
    const job = jobs.find(job => job.id === app.jobId);
    return { application: app, job };
  }).filter(item => item.job); // Filter out applications for jobs that don't exist
  
  // Jobs recommendations (for demo, just show jobs the user hasn't applied to)
  const appliedJobIds = userApplications.map(app => app.jobId);
  const recommendedJobs = jobs
    .filter(job => !appliedJobIds.includes(job.id) && job.status === "active")
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <PageTitle 
            title={`Welcome, ${user.name}`} 
            subtitle="Manage your job applications and track your progress"
          />
          <Button onClick={() => navigate("/jobs")}>
            <Search className="mr-2 h-4 w-4" /> Find Jobs
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={applicationCounts.total}
            icon={<Briefcase className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="In Review"
            value={applicationCounts.in_review}
            icon={<Clock className="h-5 w-5 text-amber-500" />}
          />
          <StatCard
            title="Interviews"
            value={applicationCounts.interview}
            icon={<User className="h-5 w-5 text-purple-500" />}
          />
          <StatCard
            title="Offers"
            value={applicationCounts.hired}
            icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          />
        </div>
        
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="recommendations">Recommended Jobs</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="applications" className="space-y-6">
            {applicationJobDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applicationJobDetails.map(({ application, job }) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    job={job!}
                    userRole="candidate"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start your job search by applying to positions that match your skills and experience.
                  </p>
                  <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6">
            {recommendedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No job recommendations yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Complete your profile and apply to more jobs to get personalized recommendations.
                  </p>
                  <Button onClick={() => navigate("/jobs")}>Browse Jobs</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardContent className="py-10 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Insights Coming Soon</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We're building powerful insights to help you improve your job search. Check back soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
