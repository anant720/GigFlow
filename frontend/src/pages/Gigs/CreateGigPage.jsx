import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import GigForm from '../../components/Gigs/GigForm';

const CreateGigPage = () => {
  const navigate = useNavigate();

  const handleSuccess = (gig) => {
    navigate(`/gigs/${gig._id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gigs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gigs
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Post a New Gig</h1>
          <p className="mt-2 text-gray-600">
            Describe your project and find the perfect freelancer
          </p>
        </div>
      </div>

      {/* Form */}
      <GigForm onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateGigPage;