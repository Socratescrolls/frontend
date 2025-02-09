import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface FormData {
  fullName: string;
  email: string;
  major: string;
  yearLevel: string;
  preferredProfessor: string;
}

function WelcomeForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    major: '',
    yearLevel: '',
    preferredProfessor: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store the form data in localStorage
    localStorage.setItem('userFormData', JSON.stringify(formData));
    // Navigate to the main app
    navigate('/app');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Let's get to know you better
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Major
            </label>
            <select
              name="major"
              id="major"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.major}
              onChange={handleChange}
            >
              <option value="">Select a major</option>
              <option value="computer-science">Computer Science</option>
              <option value="engineering">Engineering</option>
              <option value="business">Business</option>
              <option value="arts">Arts</option>
              <option value="sciences">Sciences</option>
            </select>
          </div>

          <div>
            <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700">
              Year Level
            </label>
            <select
              name="yearLevel"
              id="yearLevel"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.yearLevel}
              onChange={handleChange}
            >
              <option value="">Select year level</option>
              <option value="freshman">Freshman</option>
              <option value="sophomore">Sophomore</option>
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-3">
              Preferred Professor's Teaching Style
            </h2>
            <select
              name="preferredProfessor"
              id="preferredProfessor"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              value={formData.preferredProfessor}
              onChange={handleChange}
            >
              <option value="">Select preferred professor</option>
              <option value="andrew-ng">Andrew Ng</option>
              <option value="david-malan">David Malan</option>
              <option value="john-guttag">John Guttag</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WelcomeForm;
