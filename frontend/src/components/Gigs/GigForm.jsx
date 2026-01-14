import { useState } from 'react';
import { gigsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const GigForm = ({ gig, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: gig?.title || '',
    description: gig?.description || '',
    budget: gig?.budget || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!gig;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else {
      const budgetNum = parseFloat(formData.budget);
      if (isNaN(budgetNum) || budgetNum < 1 || budgetNum > 1000000) {
        newErrors.budget = 'Budget must be between $1 and $1,000,000';
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
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: parseFloat(formData.budget),
      };

      let response;
      if (isEditing) {
        response = await gigsAPI.updateGig(gig._id, submitData);
      } else {
        response = await gigsAPI.createGig(submitData);
      }

      toast.success(isEditing ? 'Gig updated successfully!' : 'Gig posted successfully!');
      onSuccess(response.data.data);
    } catch (error) {
      console.error('Error saving gig:', error);
      toast.error(error.response?.data?.message || 'Failed to save gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Gig Title <span className="text-danger-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`input-field ${errors.title ? 'input-error' : ''}`}
          placeholder="e.g., Build a React website for my business"
          maxLength={100}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-danger-600">{errors.title}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.title.length}/100 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-danger-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          value={formData.description}
          onChange={handleChange}
          className={`input-field resize-none ${errors.description ? 'input-error' : ''}`}
          placeholder="Describe your project requirements, deliverables, timeline, and any specific skills needed..."
          maxLength={1000}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/1000 characters
        </p>
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
          Budget (USD) <span className="text-danger-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className={`input-field pl-8 ${errors.budget ? 'input-error' : ''}`}
            placeholder="500"
            min="1"
            max="1000000"
            step="0.01"
          />
        </div>
        {errors.budget && (
          <p className="mt-1 text-sm text-danger-600">{errors.budget}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Set a realistic budget for your project
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 sm:flex-none"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            isEditing ? 'Update Gig' : 'Post Gig'
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1 sm:flex-none"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default GigForm;