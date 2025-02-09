import React from 'react';
import { AlertCircle, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react';

interface UnderstandingFeedbackProps {
  assessment: {
    understanding_assessment: {
      level: 'low' | 'medium' | 'high';
      feedback: string;
      areas_to_improve: string[];
    };
    recommended_action: 'stay' | 'next';
  };
}

const UnderstandingFeedback: React.FC<UnderstandingFeedbackProps> = ({ assessment }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'high':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 space-y-4 border">
      {/* Understanding Level */}
      <div className={`flex items-center gap-2 p-2 rounded-md ${getLevelColor(assessment.understanding_assessment.level)}`}>
        {assessment.understanding_assessment.level === 'high' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium capitalize">
          {assessment.understanding_assessment.level} Understanding
        </span>
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Feedback:</h4>
        <p className="text-gray-600">{assessment.understanding_assessment.feedback}</p>
      </div>

      {/* Areas to Improve */}
      {assessment.understanding_assessment.areas_to_improve.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Areas to Improve:</h4>
          <ul className="space-y-1">
            {assessment.understanding_assessment.areas_to_improve.map((area, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600">
                <span className="text-blue-500">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action */}
      <div className="flex items-center gap-2 mt-4 p-2 rounded-md bg-blue-50 text-blue-600">
        {assessment.recommended_action === 'next' ? (
          <>
            <ArrowRight className="w-5 h-5" />
            <span>Ready to move to the next section!</span>
          </>
        ) : (
          <>
            <ArrowDown className="w-5 h-5" />
            <span>Let's spend more time on this section.</span>
          </>
        )}
      </div>
    </div>
  );
};

export default UnderstandingFeedback; 