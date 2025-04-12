
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Calendar } from "lucide-react";

interface JobCardProps {
  job: Job;
  showApplyButton?: boolean;
}

export function JobCard({ job, showApplyButton = true }: JobCardProps) {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold mb-1 hover:text-primary cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
              {job.title}
            </h3>
            <div className="flex items-center text-muted-foreground mb-3">
              <Briefcase className="h-4 w-4 mr-1" />
              <span className="mr-3">{job.company}</span>
              <MapPin className="h-4 w-4 mr-1" />
              <span>{job.location}</span>
            </div>
          </div>
          {job.status === "closed" && (
            <Badge variant="secondary" className="ml-2">
              Closed
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 5).map((skill, index) => (
            <Badge key={index} variant="outline" className="bg-accent">
              {skill}
            </Badge>
          ))}
          {job.skills.length > 5 && (
            <Badge variant="outline" className="bg-accent">
              +{job.skills.length - 5} more
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          {job.salary && <p className="text-sm font-medium">{job.salary}</p>}
          <div className="text-sm text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Posted {formatDate(job.createdAt)}
          </div>
        </div>
      </CardContent>
      
      {showApplyButton && job.status !== "closed" && (
        <CardFooter className="bg-muted/50 px-6 py-3">
          <Button 
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="w-full"
          >
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default JobCard;
