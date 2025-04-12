
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Application, Job } from "@/types";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/Progress";

interface ApplicationCardProps {
  application: Application;
  job: Job;
  userRole: "employer" | "candidate";
}

export function ApplicationCard({ application, job, userRole }: ApplicationCardProps) {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
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

  const handleCardClick = () => {
    if (userRole === "employer") {
      navigate(`/employer/applications/${application.id}`);
    } else {
      navigate(`/candidate/applications/${application.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-semibold mb-1 hover:text-primary">
              {job.title}
            </h3>
            <p className="text-muted-foreground">{job.company}</p>
          </div>
          <Badge className={getStatusColor(application.status)}>
            <div className="flex items-center">
              {getStatusIcon(application.status)}
              <span className="capitalize">{application.status.replace("_", " ")}</span>
            </div>
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground mb-4">
          Applied on {formatDate(application.appliedAt)}
        </div>
        
        {application.matchScore !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Match Score</span>
              <span className="text-sm font-semibold">{application.matchScore}%</span>
            </div>
            <Progress 
              value={application.matchScore} 
              className="h-2"
              indicatorClassName={
                application.matchScore >= 80 ? "bg-green-500" :
                application.matchScore >= 60 ? "bg-amber-500" : 
                "bg-red-500"
              }
            />
          </div>
        )}
        
        {application.matchingKeywords && application.matchingKeywords.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Matching Skills:</p>
            <div className="flex flex-wrap gap-2">
              {application.matchingKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-accent">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ApplicationCard;
