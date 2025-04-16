import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
// import { fetchInterns } from '../store/slices/internSlice';
// import { fetchMentors } from '../store/slices/authSlice';
// import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchInterns } from '../../store/slices/internSlice';
import { fetchMentors } from '../../store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';


const InternProfile = () => {

    const dispatch = useDispatch();
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const { interns, loading, error } = useSelector((state) => state.interns);
    const { mentors } = useSelector((state) => state.auth);
    const [internData, setInternData] = useState(null);
    const [mentorData, setMentorData] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setErrorMessage(null);
                await Promise.all([
                    dispatch(fetchInterns()),
                    dispatch(fetchMentors())
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
                setErrorMessage('Failed to fetch profile data. Please try again later.');
            }
        };

        fetchData();
    }, [dispatch]);

    useEffect(() => {
        if (interns && user) {
            let targetIntern;

            if (id) {
                // Mentor viewing a specific intern's profile
                targetIntern = interns.find(intern => intern._id === id);
                if (!targetIntern) {
                    setErrorMessage('Could not find the specified intern profile.');
                    return;
                }

                // Check if the mentor has permission to view this intern
                if (user.role === 'mentor') {
                    const mentorId = targetIntern.mentor?._id || targetIntern.mentor;
                    if (mentorId !== user._id) {
                        setErrorMessage('You do not have permission to view this intern profile.');
                        return;
                    }
                }
            } else {
                // Intern viewing their own profile
                targetIntern = interns.find(intern => intern.email === user.email);
                if (!targetIntern && user.role === 'intern') {
                    setErrorMessage('Could not find your intern profile. Please contact your administrator.');
                    return;
                }
            }

            setInternData(targetIntern);

            if (targetIntern && mentors) {
                const currentMentor = mentors.find(mentor => mentor._id === targetIntern.mentor);
                setMentorData(currentMentor);
            }
        }
    }, [interns, user, mentors, id]);

    const getPerformanceColor = (rating) => {
        switch (rating) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'average':
                return 'bg-yellow-100 text-yellow-800';
            case 'needs_improvement':
                return 'bg-orange-100 text-orange-800';
            case 'unsatisfactory':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" text="Loading profile..." />
            </div>
        );
    }

    if (error || errorMessage) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-red-800">Error</h3>
                    <p className="mt-2 text-sm text-red-700">{errorMessage || error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!internData) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-yellow-800">Profile Not Found</h3>
                    <p className="mt-2 text-sm text-yellow-700">
                        We couldn't find your intern profile. Please make sure you're logged in with the correct email address.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {/* Header */}
                <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h3 className="text-lg leading-6 font-medium text-white">
                        Intern Profile
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-indigo-100">
                        Personal details and performance information
                    </p>
                </div>

                {/* Content */}
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        {/* Personal Information */}
                        <div className="sm:col-span-2">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {internData.firstName} {internData.lastName}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{internData.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{internData.phone}</dd>
                                </div>
                                <div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Department</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{internData.department}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Internship Details */}
                        <div className="sm:col-span-2">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Internship Details</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Position</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{internData.position}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPerformanceColor(internData.status)}`}>
                                            {internData.status.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(internData.startDate).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">End Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(internData.endDate).toLocaleDateString()}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="sm:col-span-2">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Performance Rating</dt>
                                    <dd className="mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPerformanceColor(internData?.performanceRating)}`}>
                                            {internData.performanceRating.replace('_', ' ')}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Project Status</dt>
                                    <dd className="mt-1">
                                        {/* <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProjectStatusColor(internData?.projectStatus)}`}> */}
                                            {internData.projectStatus.replace('_', ' ')}
                                        {/* </span> */}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        {/* Mentor Information */}
                        <div className="sm:col-span-2">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Mentor Information</h4>
                            {mentorData ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Mentor Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {mentorData.firstName} {mentorData.lastName}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Mentor Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{mentorData.email}</dd>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No mentor assigned</p>
                            )}
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}

export default InternProfile