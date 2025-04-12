
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/Progress";
import { ResumeFeedback } from "@/types";

interface ResumeFeedbackCardProps {
  feedback: ResumeFeedback;
}

export function ResumeFeedbackCard({ feedback }: ResumeFeedbackCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Resume Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium">Overall Score</h3>
              <span className="font-semibold">{feedback.overall}%</span>
            </div>
            <Progress
              value={feedback.overall}
              className="h-2.5"
              indicatorClassName={getScoreColor(feedback.overall)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Grammar & Language</h4>
                <span className="text-sm font-semibold">{feedback.grammar.score}%</span>
              </div>
              <Progress
                value={feedback.grammar.score}
                className="h-2 mb-2"
                indicatorClassName={getScoreColor(feedback.grammar.score)}
              />
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {feedback.grammar.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Structure & Organization</h4>
                <span className="text-sm font-semibold">{feedback.structure.score}%</span>
              </div>
              <Progress
                value={feedback.structure.score}
                className="h-2 mb-2"
                indicatorClassName={getScoreColor(feedback.structure.score)}
              />
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {feedback.structure.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Keywords & Skills</h4>
                <span className="text-sm font-semibold">{feedback.keywords.score}%</span>
              </div>
              <Progress
                value={feedback.keywords.score}
                className="h-2 mb-2"
                indicatorClassName={getScoreColor(feedback.keywords.score)}
              />
              <div className="text-sm">
                <p className="font-medium mb-1">Matching Keywords:</p>
                <p className="text-muted-foreground mb-2">
                  {feedback.keywords.matching.join(", ")}
                </p>
                {feedback.keywords.missing.length > 0 && (
                  <>
                    <p className="font-medium mb-1">Missing Keywords:</p>
                    <p className="text-muted-foreground">
                      {feedback.keywords.missing.join(", ")}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">ATS Compatibility</h4>
                <span className="text-sm font-semibold">{feedback.ats.score}%</span>
              </div>
              <Progress
                value={feedback.ats.score}
                className="h-2 mb-2"
                indicatorClassName={getScoreColor(feedback.ats.score)}
              />
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {feedback.ats.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium">Personal Branding</h4>
                <span className="text-sm font-semibold">{feedback.branding.score}%</span>
              </div>
              <Progress
                value={feedback.branding.score}
                className="h-2 mb-2"
                indicatorClassName={getScoreColor(feedback.branding.score)}
              />
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {feedback.branding.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResumeFeedbackCard;
