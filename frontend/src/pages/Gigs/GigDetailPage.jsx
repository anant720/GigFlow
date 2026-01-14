import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, CurrencyDollarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { gigsAPI, bidsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';

const GigDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);

  // Fetch gig details
  useEffect(() => {
    const fetchGig = async () => {
      try {
        const response = await gigsAPI.getGig(id);
        setGig(response.data.data);
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

  // Fetch bids if user owns the gig
  const fetchBids = async () => {
    if (!gig || gig.owner._id !== user._id) return;

    setBidsLoading(true);
    try {
      const response = await bidsAPI.getBidsForGig(gig._id);
      setBids(response.data.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Failed to load bids');
    } finally {
      setBidsLoading(false);
    }
  };

  useEffect(() => {
    if (gig && user) {
      fetchBids();
    }
  }, [gig, user]);

  const formatBudget = (budget) => {
    if (budget >= 1000) {
      return `$${(budget / 1000).toFixed(1)}k`;
    }
    return `$${budget}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'status-open';
      case 'assigned':
        return 'status-assigned';
      default:
        return 'status-open';
    }
  };

  const canEditGig = gig && user && gig.owner._id === user._id && gig.status === 'open';
  const canViewBids = gig && user && gig.owner._id === user._id;
  const canBid = gig && user && gig.owner._id !== user._id && gig.status === 'open';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="card">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-24 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gig) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/gigs')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Gigs
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{gig.title}</h1>
              <span className={`status-badge ${getStatusColor(gig.status)}`}>
                {gig.status}
              </span>
            </div>

            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                <span>Posted by {gig.owner.name}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span>{formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {canEditGig && (
            <div className="mt-4 sm:mt-0">
              <Link
                to={`/gigs/${gig._id}/edit`}
                className="btn-secondary inline-flex items-center"
              >
                <PencilIcon className="mr-2 h-5 w-5" />
                Edit Gig
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{gig.description}</p>
            </div>
          </div>

          {/* Bid Form (for freelancers) */}
          {canBid && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Bid</h2>
              <BidForm gigId={gig._id} onBidSubmitted={() => setShowBidForm(false)} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Card */}
          <div className="card">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="h-6 w-6 text-success-600 mr-2" />
                <span className="text-2xl font-bold text-success-600">
                  {formatBudget(gig.budget)}
                </span>
              </div>
              <p className="text-gray-600">Project Budget</p>
            </div>
          </div>

          {/* Bids Summary (for gig owners) */}
          {canViewBids && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bids Received</h3>
              {bidsLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold text-primary-600 mb-2">{bids.length}</p>
                  <p className="text-gray-600">Total bids</p>
                  <Link
                    to={`/gigs/${gig._id}/bids`}
                    className="mt-4 btn-primary w-full text-center block"
                  >
                    View All Bids
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {canBid && !showBidForm && (
                <button
                  onClick={() => setShowBidForm(true)}
                  className="btn-primary w-full"
                >
                  Submit Bid
                </button>
              )}
              {canEditGig && (
                <Link
                  to={`/gigs/${gig._id}/edit`}
                  className="btn-secondary w-full text-center block"
                >
                  Edit Gig
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bid Form Component
const BidForm = ({ gigId, onBidSubmitted }) => {
  const [formData, setFormData] = useState({
    message: '',
    price: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 1) {
        newErrors.price = 'Price must be at least $1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await bidsAPI.createBid({
        gigId,
        message: formData.message.trim(),
        price: parseFloat(formData.price),
      });

      toast.success('Bid submitted successfully!');
      onBidSubmitted();
      setFormData({ message: '', price: '' });
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error(error.response?.data?.message || 'Failed to submit bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Your Message <span className="text-danger-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className={`input-field resize-none ${errors.message ? 'input-error' : ''}`}
          placeholder="Introduce yourself and explain why you're the right fit for this project..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-danger-600">{errors.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
          Your Price (USD) <span className="text-danger-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`input-field pl-8 ${errors.price ? 'input-error' : ''}`}
            placeholder="500"
            min="1"
            step="0.01"
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-danger-600">{errors.price}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          'Submit Bid'
        )}
      </button>
    </form>
  );
};

export default GigDetailPage;