
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTitle } from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeFeedbackCard } from "@/components/resume/ResumeFeedbackCard";
import { Application, Job, ResumeFeedback } from "@/types";
import { Calendar, CheckCircle, Clock, FileText, XCircle, ArrowLeft } from "lucide-react";

export default function CandidateApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getApplicationById, getJobById, getResumeFeedback } = useJobs();
  
  const [application, setApplication] = useState<Application | undefined>(undefined);
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [feedback, setFeedback] = useState<ResumeFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if the user is logged in and is a candidate
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "candidate") {
      navigate("/");
      return;
    }
    
    if (!id) return;
    
    const appData = getApplicationById(id);
    if (!appData || appData.candidateId !== user.id) {
      navigate("/candidate/dashboard");
      return;
    }
    
    setApplication(appData);
    const jobData = getJobById(appData.jobId);
    setJob(jobData);
    
    // Get resume feedback
    const loadFeedback = async () => {
      try {
        const feedbackData = await getResumeFeedback(appData.resume);
        setFeedback(feedbackData);
      } catch (error) {
        console.error("Error getting resume feedback:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFeedback();
  }, [id, user, navigate, getApplicationById, getJobById, getResumeFeedback]);
  
  if (!application || !job) {
    return null;
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };
  
  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "in_review":
        return "bg-amber-100 text-amber-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusIcon = (status: Application["status"]) => {
    switch (status) {
      case "applied":
        return <FileText className="h-4 w-4 mr-1" />;
      case "in_review":
        return <Clock className="h-4 w-4 mr-1" />;
      case "interview":
        return <Calendar className="h-4 w-4 mr-1" />;
      case "rejected":
        return <XCircle className="h-4 w-4 mr-1" />;
      case "hired":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container py-8 px-4">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate("/candidate/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <PageTitle 
          title={job.title} 
          subtitle={`${job.company} • ${job.location}`}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Applied on {formatDate(application.appliedAt)}
                    </p>
                    <Badge className={getStatusColor(application.status)}>
                      <div className="flex items-center">
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status.replace("_", " ")}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  {application.matchScore !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">
                        Match Score
                      </p>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent">
                        <span className="font-semibold">{application.matchScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Application Progress</h3>
                  <div className="relative pt-4 pb-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent">
                      <div 
                        className={
                          application.status === "applied" ? "w-1/5 h-full bg-blue-500" :
                          application.status === "in_review" ? "w-2/5 h-full bg-amber-500" :
                          application.status === "interview" ? "w-3/5 h-full bg-purple-500" :
                          application.status === "rejected" ? "w-4/5 h-full bg-red-500" :
                          application.status === "hired" ? "w-full h-full bg-green-500" :
                          "w-0 h-full"
                        }
                      />
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${application.status === "applied" || application.status === "in_review" || application.status === "interview" || application.status === "hired" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <p className="text-xs">Applied</p>
                      </div>
                      
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${application.status === "in_review" || application.status === "interview" || application.status === "hired" ? "bg-amber-500 text-white" : "bg-gray-200"}`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <p className="text-xs">In Review</p>
                      </div>
                      
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${application.status === "interview" || application.status === "hired" ? "bg-purple-500 text-white" : "bg-gray-200"}`}>
                          <Calendar className="h-4 w-4" />
                        </div>
                        <p className="text-xs">Interview</p>
                      </div>
                      
                      <div className="text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${application.status === "hired" ? "bg-green-500 text-white" : "bg-gray-200"}`}>
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <p className="text-xs">Hired</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Company</h3>
                    <p>{job.company}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Location</h3>
                    <p>{job.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Employment Type</h3>
                    <p className="capitalize">Full-time</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Salary Range</h3>
                    <p>{job.salary || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className={application.matchingKeywords?.includes(skill) ? "bg-green-100" : ""}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="resume-feedback" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resume-feedback">Resume Feedback</TabsTrigger>
            <TabsTrigger value="application-details">Application Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume-feedback">
            {isLoading ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>Loading resume feedback...</p>
                </CardContent>
              </Card>
            ) : feedback ? (
              <ResumeFeedbackCard feedback={feedback} />
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <p>No feedback available for this application.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="application-details">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Your Application</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Resume</h3>
                    <div className="bg-accent p-4 rounded max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{application.resume}</pre>
                    </div>
                  </div>
                  
                  {application.coverLetter && (
                    <div>
                      <h3 className="font-medium mb-2">Cover Letter</h3>
                      <div className="bg-accent p-4 rounded max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{application.coverLetter}</pre>
                      </div>
                    </div>
                  )}
                  
                  {application.matchingKeywords && application.matchingKeywords.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Matching Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.matchingKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="bg-green-100">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
