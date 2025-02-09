import React from 'react';
import { AlertCircle, CheckCircle, ArrowRight, ArrowDown, X, Brain, List, HelpCircle } from 'lucide-react';

interface UnderstandingAssessment {
  level: 'low' | 'medium' | 'high';
  feedback: string;
  areas_to_improve: string[];
}

interface UnderstandingFeedbackProps {
  assessment: {
    understanding_assessment: UnderstandingAssessment;
    recommended_action: 'stay' | 'next';
    reasoning: string;
    verification_question?: string;
    key_points?: string[];
  };
  onClose: () => void;
}

export function UnderstandingFeedback({ assessment, onClose }: UnderstandingFeedbackProps) {
  if (!assessment?.understanding_assessment) {
    return null;
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium':
        return <Brain className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const { understanding_assessment } = assessment;
  const areasToImprove = understanding_assessment.areas_to_improve || [];
  const keyPoints = assessment.key_points || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-medium">Understanding Analysis</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Understanding Level */}
        <div className={`p-4 rounded-lg border ${getLevelColor(understanding_assessment.level)}`}>
          <div className="flex items-center gap-2 mb-2">
            {getLevelIcon(understanding_assessment.level)}
            <span className="font-medium capitalize">
              {understanding_assessment.level} Understanding
            </span>
          </div>
          <p className="text-sm">{understanding_assessment.feedback}</p>
        </div>

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <List className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-700">Key Points</h4>
            </div>
            <ul className="space-y-2">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-green-600 text-sm">
                  <span className="text-green-400 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas to Improve */}
        {areasToImprove.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Areas to Improve</h4>
            <ul className="space-y-2">
              {areasToImprove.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-600 text-sm">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verification Question */}
        {assessment.verification_question && (
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-purple-700">Verification Question</h4>
            </div>
            <p className="text-sm text-purple-600">{assessment.verification_question}</p>
          </div>
        )}

        {/* Reasoning */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Detailed Analysis</h4>
          <p className="text-sm text-gray-600">{assessment.reasoning}</p>
        </div>

        {/* Recommended Action */}
        <div className="flex items-center gap-2 p-4 rounded-lg bg-purple-50 text-purple-700">
          {assessment.recommended_action === 'next' ? (
            <>
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-medium">Ready to move forward!</span>
            </>
          ) : (
            <>
              <ArrowDown className="w-5 h-5" />
              <span className="text-sm font-medium">Let's review this section more.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnderstandingFeedback; 