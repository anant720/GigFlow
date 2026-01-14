import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import GigForm from '../../components/Gigs/GigForm';
import { gigsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const EditGigPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await gigsAPI.getGig(id);
        const gigData = response.data.data;

        // Check if user owns the gig and it's editable
        if (gigData.status !== 'open') {
          toast.error('Cannot edit assigned gigs');
          navigate(`/gigs/${id}`);
          return;
        }

        setGig(gigData);
      } catch (error) {
        console.error('Error fetching gig:', error);
        toast.error('Failed to load gig details');
        navigate('/gigs');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGig();
    }
  }, [id, navigate]);

  const handleSuccess = (updatedGig) => {
    toast.success('Gig updated successfully!');
    navigate(`/gigs/${updatedGig._id}`);
  };

  const handleCancel = () => {
    navigate(`/gigs/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/gigs/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gig
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Gig</h1>
          <p className="mt-2 text-gray-600">
            Update your gig details to attract better freelancers
          </p>
        </div>
      </div>

      {/* Form */}
      <GigForm
        gig={gig}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditGigPage;