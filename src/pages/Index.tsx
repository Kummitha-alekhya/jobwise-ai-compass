
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import JobCard from "@/components/jobs/JobCard";
import { Search, Briefcase, FileText, BarChart3, Brain } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs } = useJobs();
  
  // Just show the latest 3 jobs
  const latestJobs = jobs
    .filter(job => job.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-accent to-background py-20">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <Badge variant="outline" className="mb-4 px-3 py-1">
                  <span className="text-primary font-medium">AI-Powered Job Matching</span>
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  Find Your Perfect <span className="text-primary">Career Match</span> with AI
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                  JobWise uses AI to match candidates with the right job opportunities based on skills, experience, and career goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" onClick={() => navigate("/jobs")}>
                    <Search className="mr-2 h-5 w-5" /> Browse Jobs
                  </Button>
                  {!user && (
                    <Button size="lg" variant="outline" onClick={() => navigate("/signup")}>
                      Create Account
                    </Button>
                  )}
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img 
                  src="https://via.placeholder.com/600x400?text=JobWise" 
                  alt="JobWise AI Matching" 
                  className="rounded-lg shadow-lg max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How JobWise Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform simplifies the job search and hiring process for both candidates and employers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 border border-border rounded-lg text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Discover Jobs</h3>
                <p className="text-muted-foreground">
                  Browse thousands of job listings from top companies across industries.
                </p>
              </div>

              <div className="p-6 border border-border rounded-lg text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Resume</h3>
                <p className="text-muted-foreground">
                  Let our AI analyze your resume and match you to the right opportunities.
                </p>
              </div>

              <div className="p-6 border border-border rounded-lg text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Matching</h3>
                <p className="text-muted-foreground">
                  Get personalized job matches and resume feedback to improve your chances.
                </p>
              </div>

              <div className="p-6 border border-border rounded-lg text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your applications and get insights to improve your job search.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Jobs Section */}
        <section className="py-16 bg-background">
          <div className="container px-4 mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Latest Job Opportunities</h2>
              <Button variant="outline" onClick={() => navigate("/jobs")}>
                View All Jobs
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of candidates and employers who are already using JobWise to find their perfect match.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" onClick={() => navigate("/jobs")}>
                Browse Jobs
              </Button>
              {!user && (
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => navigate("/signup")}>
                  Create Free Account
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
