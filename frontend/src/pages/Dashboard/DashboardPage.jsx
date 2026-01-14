import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { gigsAPI, bidsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { PlusIcon, DocumentTextIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const [userGigs, setUserGigs] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [gigsResponse, bidsResponse] = await Promise.all([
          gigsAPI.getUserGigs(),
          bidsAPI.getUserBids()
        ]);

        setUserGigs(gigsResponse.data.data);
        setUserBids(bidsResponse.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'status-open';
      case 'assigned':
        return 'status-assigned';
      case 'hired':
        return 'status-hired';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  const formatBudget = (budget) => {
    if (budget >= 1000) {
      return `$${(budget / 1000).toFixed(1)}k`;
    }
    return `$${budget}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your gigs and track your applications
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <Link
            to="/gigs/create"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Post a Gig
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Gigs</p>
              <p className="text-2xl font-bold text-gray-900">{userGigs.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Bids</p>
              <p className="text-2xl font-bold text-gray-900">{userBids.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Gigs</p>
              <p className="text-2xl font-bold text-gray-900">
                {userGigs.filter(gig => gig.status === 'open').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">
                {userGigs.filter(gig => gig.status === 'assigned').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Gigs */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Gigs</h2>
            <Link
              to="/gigs/create"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Create New
            </Link>
          </div>

          {userGigs.length > 0 ? (
            <div className="space-y-4">
              {userGigs.slice(0, 5).map((gig) => (
                <div key={gig._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {gig.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`status-badge ${getStatusColor(gig.status)}`}>
                        {gig.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatBudget(gig.budget)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/gigs/${gig._id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-4"
                  >
                    View
                  </Link>
                </div>
              ))}
              {userGigs.length > 5 && (
                <p className="text-center text-sm text-gray-600 pt-2">
                  And {userGigs.length - 5} more...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No gigs posted yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first gig to start receiving bids from talented freelancers.
              </p>
              <Link to="/gigs/create" className="btn-primary">
                Post Your First Gig
              </Link>
            </div>
          )}
        </div>

        {/* My Bids */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
            <Link
              to="/gigs"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Browse Gigs
            </Link>
          </div>

          {userBids.length > 0 ? (
            <div className="space-y-4">
              {userBids.slice(0, 5).map((bid) => (
                <div key={bid._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 line-clamp-1">
                      {bid.gig?.title || 'Gig not found'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`status-badge ${getStatusColor(bid.status)}`}>
                        {bid.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        ${bid.price}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/gigs/${bid.gigId}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-4"
                  >
                    View Gig
                  </Link>
                </div>
              ))}
              {userBids.length > 5 && (
                <p className="text-center text-sm text-gray-600 pt-2">
                  And {userBids.length - 5} more...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start applying to gigs to get hired by clients looking for your skills.
              </p>
              <Link to="/gigs" className="btn-primary">
                Browse Available Gigs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;