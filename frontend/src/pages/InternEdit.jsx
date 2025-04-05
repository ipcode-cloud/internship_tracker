import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateIntern, fetchInterns } from '../store/slices/internSlice';
import { toast } from 'react-toastify';

const InternEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { interns, loading } = useSelector((state) => state.interns);

  const [formData, setFormData] = useState({
    performanceRating: '',
    projectStatus: '',
    status: '',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchInterns());
  }, [dispatch]);

  const intern = interns.find(i => i._id === id);

  useEffect(() => {
    if (intern) {
      setFormData({
        performanceRating: intern.performanceRating || '',
        projectStatus: intern.projectStatus || '',
        status: intern.status || '',
        comments: intern.comments || ''
      });
    }
  }, [intern]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(updateIntern({ id, internData: formData })).unwrap();
      toast.success('Intern progress updated successfully');
      navigate(`/intern/${id}/profile`);
    } catch (err) {
      toast.error(err.message || 'Failed to update intern progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">Intern not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Update Progress: {intern.firstName} {intern.lastName}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Performance Rating
              </label>
              <select
                name="performanceRating"
                value={formData.performanceRating}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Rating</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="needs_improvement">Needs Improvement</option>
                <option value="unsatisfactory">Unsatisfactory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Status
              </label>
              <select
                name="projectStatus"
                value={formData.projectStatus}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Add any comments or notes about the intern's progress..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/intern/${id}/profile`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Progress'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternEdit; 