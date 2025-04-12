
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ResumeFeedbackCard from "@/components/resume/ResumeFeedbackCard";
import { ArrowLeft, Briefcase, FileText, ClipboardCheck, Building, Calendar, Clock } from "lucide-react";

export default function CandidateApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getApplicationById, getJobById, getResumeFeedback } = useJobs();
  
  // Check if the user is logged in and is a candidate
  if (!user || user.role !== "candidate") {
    navigate("/login");
    return null;
  }
  
  // Get the application
  const application = getApplicationById(id || "");
  
  // If the application doesn't exist or doesn't belong to the user, redirect
  if (!application || application.candidateId !== user.id) {
    navigate("/candidate/dashboard");
    return null;
  }
  
  // Get the job details
  const job = getJobById(application.jobId);
  
  if (!job) {
    navigate("/candidate/dashboard");
    return null;
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
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

  // Get feedback if not available yet (for demo purposes)
  const feedback = application.feedback || getResumeFeedback("");

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
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge className={`ml-2 ${getStatusColor(application.status)}`}>
              <span className="capitalize">{application.status.replace("_", " ")}</span>
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground mt-2">
            <Building className="h-4 w-4 mr-1" />
            <span className="mr-3">{job.company}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* AI Match Score */}
            {application.matchScore && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">AI Match Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">Match Score</h3>
                        <span 
                          className={`text-sm font-bold px-2 py-0.5 rounded ${
                            application.matchScore >= 80 
                              ? "bg-green-100 text-green-800" 
                              : application.matchScore >= 60
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {application.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div 
                          className={`h-2.5 rounded-full ${
                            application.matchScore >= 80 
                              ? "bg-green-500" 
                              : application.matchScore >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${application.matchScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {application.matchingKeywords && application.matchingKeywords.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">Matching Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {application.matchingKeywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="bg-accent">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">AI Insights</h3>
                      <p className="text-muted-foreground text-sm">
                        Your resume shows strong alignment with {application.matchingKeywords?.length} out of {job.skills.length} key skills 
                        for this position. Consider highlighting experiences that demonstrate 
                        your expertise in {job.skills.filter(skill => !application.matchingKeywords?.includes(skill)).join(", ")}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Resume Feedback */}
            {feedback && <ResumeFeedbackCard feedback={feedback} />}
          </div>
          
          <div className="space-y-6">
            {/* Application Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Application Status</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="capitalize">{application.status.replace("_", " ")}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Date Applied</h3>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{formatDate(application.appliedAt)}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-3">Application Timeline</h3>
                  <ol className="relative border-l border-muted pl-5 space-y-6">
                    <li>
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px]"></div>
                      <time className="mb-1 text-xs font-normal text-muted-foreground">
                        {formatDate(application.appliedAt)}
                      </time>
                      <h3 className="text-sm font-semibold">Application Submitted</h3>
                      <p className="text-xs text-muted-foreground">
                        You applied for this position.
                      </p>
                    </li>
                    
                    {application.status !== "applied" && (
                      <li>
                        <div className="absolute w-3 h-3 bg-amber-500 rounded-full -left-[7px]"></div>
                        <time className="mb-1 text-xs font-normal text-muted-foreground">
                          {formatDate(new Date(new Date(application.appliedAt).getTime() + 1000 * 60 * 60 * 24 * 2).toISOString())}
                        </time>
                        <h3 className="text-sm font-semibold">Application In Review</h3>
                        <p className="text-xs text-muted-foreground">
                          Your application is being reviewed by the hiring team.
                        </p>
                      </li>
                    )}
                    
                    {application.status === "interview" && (
                      <li>
                        <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px]"></div>
                        <time className="mb-1 text-xs font-normal text-muted-foreground">
                          {formatDate(new Date(new Date(application.appliedAt).getTime() + 1000 * 60 * 60 * 24 * 5).toISOString())}
                        </time>
                        <h3 className="text-sm font-semibold">Interview Scheduled</h3>
                        <p className="text-xs text-muted-foreground">
                          You've been selected for an interview.
                        </p>
                      </li>
                    )}
                    
                    {application.status === "hired" && (
                      <li>
                        <div className="absolute w-3 h-3 bg-green-500 rounded-full -left-[7px]"></div>
                        <time className="mb-1 text-xs font-normal text-muted-foreground">
                          {formatDate(new Date(new Date(application.appliedAt).getTime() + 1000 * 60 * 60 * 24 * 14).toISOString())}
                        </time>
                        <h3 className="text-sm font-semibold">Offer Extended</h3>
                        <p className="text-xs text-muted-foreground">
                          Congratulations! You've received a job offer.
                        </p>
                      </li>
                    )}
                    
                    {application.status === "rejected" && (
                      <li>
                        <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px]"></div>
                        <time className="mb-1 text-xs font-normal text-muted-foreground">
                          {formatDate(new Date(new Date(application.appliedAt).getTime() + 1000 * 60 * 60 * 24 * 7).toISOString())}
                        </time>
                        <h3 className="text-sm font-semibold">Not Selected</h3>
                        <p className="text-xs text-muted-foreground">
                          The employer has decided to move forward with other candidates.
                        </p>
                      </li>
                    )}
                  </ol>
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <Briefcase className="mr-2 h-4 w-4" /> View Job Posting
                  </Button>
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" /> Update Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
