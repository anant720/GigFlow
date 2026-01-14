import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { CurrencyDollarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';

const GigCard = ({ gig }) => {
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

  return (
    <Link to={`/gigs/${gig._id}`} className="block">
      <div className="card hover:shadow-medium transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {gig.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{gig.owner?.name || 'Anonymous'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`status-badge ${getStatusColor(gig.status)}`}>
              {gig.status}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {gig.description}
        </p>

        {/* Budget and Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-lg font-semibold text-success-600">
            <CurrencyDollarIcon className="h-5 w-5 mr-1" />
            {formatBudget(gig.budget)}
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}
          </div>
        </div>

        {/* Action hint */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {gig.bidCount || 0} bids
            </span>
            <span className="text-primary-600 font-medium">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;