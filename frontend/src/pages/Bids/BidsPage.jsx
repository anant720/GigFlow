import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { bidsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const BidsPage = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiringLoading, setHiringLoading] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await bidsAPI.getBidsForGig(gigId);
        setBids(response.data.data);

        // Get gig info from first bid if available
        if (response.data.data.length > 0) {
          setGig(response.data.data[0].gig);
        }
      } catch (error) {
        console.error('Error fetching bids:', error);
        toast.error('Failed to load bids');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (gigId) {
      fetchBids();
    }
  }, [gigId, navigate]);

  const handleHireFreelancer = async (bidId) => {
    setHiringLoading(bidId);

    try {
      await bidsAPI.hireFreelancer(bidId);
      toast.success('Freelancer hired successfully!');

      // Update the bids locally
      setBids(prevBids =>
        prevBids.map(bid => ({
          ...bid,
          status: bid._id === bidId ? 'hired' : 'rejected'
        }))
      );

      // Update gig status
      if (gig) {
        setGig(prev => ({ ...prev, status: 'assigned' }));
      }
    } catch (error) {
      console.error('Error hiring freelancer:', error);
      toast.error(error.response?.data?.message || 'Failed to hire freelancer');
    } finally {
      setHiringLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hired':
        return 'status-hired';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gig Applications</h1>
          {gig && (
            <p className="mt-2 text-gray-600">
              Applications for: <Link to={`/gigs/${gig._id}`} className="text-primary-600 hover:underline">{gig.title}</Link>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {bids.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">{bids.length}</div>
              <div className="text-gray-600">Total Applications</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600 mb-2">
                {bids.filter(bid => bid.status === 'hired').length}
              </div>
              <div className="text-gray-600">Hired</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600 mb-2">
                {bids.filter(bid => bid.status === 'pending').length}
              </div>
              <div className="text-gray-600">Pending Review</div>
            </div>
          </div>
        </div>
      )}

      {/* Bids List */}
      {bids.length > 0 ? (
        <div className="space-y-6">
          {bids.map((bid) => (
            <div key={bid._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {bid.freelancer?.name || 'Anonymous'}
                      </span>
                    </div>
                    <span className={`status-badge ${getStatusColor(bid.status)}`}>
                      {bid.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Proposal</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {bid.message}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-lg font-semibold text-success-600">
                      <CurrencyDollarIcon className="h-5 w-5 mr-1" />
                      ${bid.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted {new Date(bid.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  {bid.status === 'pending' && gig?.status === 'open' && (
                    <button
                      onClick={() => handleHireFreelancer(bid._id)}
                      disabled={hiringLoading === bid._id}
                      className="btn-success"
                    >
                      {hiringLoading === bid._id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'Hire Freelancer'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-24 w-24 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600 mb-6">
            Freelancers haven't applied to this gig yet. Check back later or consider updating your gig description to attract more applicants.
          </p>
          {gig && (
            <Link to={`/gigs/${gig._id}/edit`} className="btn-primary">
              Edit Gig
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default BidsPage;