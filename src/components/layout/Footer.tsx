
import React from "react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-primary mb-4">JobWise</h3>
            <p className="text-muted-foreground mb-4">
              Connecting talented professionals with the perfect employers using
              AI-powered matching and insights.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">For Candidates</h3>
            <ul className="space-y-2">
              <li>
                <a href="/jobs" className="text-muted-foreground hover:text-primary">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/resume-builder" className="text-muted-foreground hover:text-primary">
                  Resume Builder
                </a>
              </li>
              <li>
                <a href="/career-resources" className="text-muted-foreground hover:text-primary">
                  Career Resources
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <a href="/post-job" className="text-muted-foreground hover:text-primary">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="/talent-search" className="text-muted-foreground hover:text-primary">
                  Search Talent
                </a>
              </li>
              <li>
                <a href="/employer-resources" className="text-muted-foreground hover:text-primary">
                  Recruiting Resources
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between text-sm text-muted-foreground">
          <p>© 2025 JobWise. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary">
              Terms of Service
            </a>
            <a href="/contact" className="hover:text-primary">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
