import React from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface QuizResultsProps {
  results: {
    score_percentage: number;
    performance_level: string;
    correct_answers: number;
    total_questions: number;
    detailed_results: any[];
    recommendation_for_professor: string;
    can_move_forward: boolean;
  };
  onClose: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, onClose }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Quiz Results</h3>
        <div className="text-sm text-gray-500">
          {results.correct_answers} out of {results.total_questions} correct
        </div>
      </div>

      {/* Circular Progress Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#eee"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={results.score_percentage >= 70 ? "#22c55e" : "#ef4444"}
              strokeWidth="3"
              strokeDasharray={`${results.score_percentage}, 100`}
            />
            <text x="18" y="20.35" className="text-xl font-bold" textAnchor="middle">
              {results.score_percentage}%
            </text>
          </svg>
        </div>
      </div>

      {/* Performance Level */}
      <div className="mb-6">
        <div className="flex items-center gap-2 justify-center">
          {results.score_percentage >= 70 ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-medium">{results.performance_level}</span>
        </div>
      </div>

      {/* Can Move Forward Indicator */}
      <div className={`p-4 rounded-lg ${
        results.can_move_forward ? 'bg-green-50' : 'bg-yellow-50'
      }`}>
        <div className="flex items-center gap-2">
          {results.can_move_forward ? (
            <>
              <ArrowRight className="w-5 h-5 text-green-500" />
              <span className="text-green-700">Ready to move forward!</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-700">Review recommended before moving forward</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults; 