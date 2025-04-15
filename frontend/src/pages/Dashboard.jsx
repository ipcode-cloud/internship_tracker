import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInterns } from '../store/slices/internSlice';
import { fetchAttendance } from '../store/slices/attendanceSlice';
import { fetchConfig } from '../store/slices/configSlice';
import { fetchMentors } from '../store/slices/authSlice';
import InternDashboard from '../components/dashboard/InternDashboard';
import MentorDashboard from '../components/dashboard/MentorDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { fetchUsers } from '../store/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, users, loading: usersLoading, isAuthenticated } = useSelector((state) => state.auth);
  const { interns, loading: internsLoading } = useSelector((state) => state.interns);
  const { attendance, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { config, loading: configLoading } = useSelector((state) => state.config);
  const { mentors, mentorsLoading } = useSelector((state) => state.auth);
  
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ present: 0, absent: 0, late: 0 });
  const [todayStats, setTodayStats] = useState({ checkIn: null, checkOut: null, status: null });
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLoading, setShowLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const isMounted = useRef(true);

  // Loading states
  const isLoading = internsLoading || attendanceLoading || configLoading || mentorsLoading;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setShowLoading(true);
        setLoadingStartTime(Date.now());
        setDataLoaded(false);
        
        // Fetch config for all users
        await dispatch(fetchConfig());
        
        switch (user?.role) {
          case 'intern':
            await Promise.all([
              dispatch(fetchAttendance()),
            dispatch(fetchMentors())
          ]);
          break;
          case 'mentor':
            await Promise.all([
              dispatch(fetchInterns()),
              dispatch(fetchAttendance()),
              dispatch(fetchMentors())
            ]);
            break;
          case 'admin':
            await Promise.all([
              dispatch(fetchInterns()),
              dispatch(fetchAttendance()),
              dispatch(fetchMentors())
            ]);
            break;
          default:
            break;
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to fetch dashboard data');
        toast.error('Failed to load dashboard data');
      }
    };

    // Fetch data when user is authenticated or when user role changes
    if (isAuthenticated && user?.role) {
      console.log('Fetching data for role:', user.role);
      fetchData();
    }
  }, [dispatch, user?.role, isAuthenticated]);

  // Handle loading state
  useEffect(() => {
    if (!isLoading && loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minimumLoadingTime = 1000; // 1 second minimum loading time

      if (elapsedTime < minimumLoadingTime) {
        const remainingTime = minimumLoadingTime - elapsedTime;
        const timer = setTimeout(() => {
          setShowLoading(false);
        }, remainingTime);
        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
      }
    }
  }, [isLoading, loadingStartTime]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper function to get mentor's mentees
  const getMentorMentees = () => {
    const userId = user?._id || user?.id;

    if (!user || !interns || !userId) {
      return [];
    }

    const filteredMentees = interns.filter(intern => {
      const mentorId = getMentorId(intern.mentor);
      return mentorId && mentorId.toString() === userId.toString();
    });

    return filteredMentees;
  };

  // Helper function to get mentor ID from mentor object
  const getMentorId = (mentor) => {
    if (!mentor) {
      return null;
    }
    
    if (typeof mentor === 'object') {
      return mentor._id || mentor.id;
    }
    
    return mentor;
  };

  // Get user's mentees if user is a mentor
  const userMentees = user?.role === 'mentor' 
    ? interns?.filter(intern => {
        const mentorId = getMentorId(intern.mentor);
        const userId = user?._id || user?.id;
        return mentorId && userId && mentorId.toString() === userId.toString();
      }) || []
    : [];

  // Get user's attendance if user is an intern
  const internAttendance = user?.role === 'intern'
    ? attendance.filter(record => {
        const userId = user?._id || user?.id;
        return record.intern._id === userId;
      })
    : [];

  // Calculate attendance statistics for admin dashboard
  const today = new Date();
  const todayString = today.toDateString();
  const todayAttendance = attendance.filter(record => 
    new Date(record.date).toDateString() === todayString
  );

  const presentToday = todayAttendance.filter(record => record.status === 'present').length;
  const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
  const lateToday = todayAttendance.filter(record => record.status === 'late').length;
  const halfDayToday = todayAttendance.filter(record => record.status === 'half-day').length;

  // Calculate weekly attendance for admin dashboard
  const adminWeeklyAttendance = Array(7).fill(0).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const dateString = date.toDateString();
    const dayAttendance = attendance.filter(record => 
      new Date(record.date).toDateString() === dateString
    );
    return {
      date: dateString,
      present: dayAttendance.filter(record => record.status === 'present').length || 0,
      absent: dayAttendance.filter(record => record.status === 'absent').length || 0,
      late: dayAttendance.filter(record => record.status === 'late').length || 0
    };
  }).reverse();

  // Calculate performance statistics for admin dashboard
  const performanceStats = {
    excellent: interns.filter(intern => intern.performanceRating === 'excellent').length || 0,
    good: interns.filter(intern => intern.performanceRating === 'good').length || 0,
    average: interns.filter(intern => intern.performanceRating === 'average').length || 0,
    needsImprovement: interns.filter(intern => intern.performanceRating === 'Needs_improvement').length || 0
  };

  // Calculate project statistics for admin dashboard
  const projectStats = {
    completed: interns.filter(intern => intern.projectStatus === 'completed').length || 0,
    inProgress: interns.filter(intern => intern.projectStatus === 'in_progress').length || 0,
    notStarted: interns.filter(intern => intern.projectStatus === 'not_started').length || 0
  };

  // Debug logging
  console.log('Dashboard State:', {
    user,
    interns,
    attendance,
    userMentees,
    dataLoaded,
    isLoading,
    showLoading,
    isAuthenticated
  });

  if (showLoading || isLoading) {
  return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setShowLoading(true);
              setLoadingStartTime(Date.now());
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Company details section
  const CompanyDetails = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{config?.companyName || 'Company Name'}</h2>
          <p className="text-gray-600 mt-1">
            Working Hours: {config?.workingHours?.start || '09:00'} - {config?.workingHours?.end || '17:00'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Departments: {config?.departments?.length || 0}</p>
          <p className="text-gray-600">Total Positions: {Object.values(config?.positions || {}).flat().length || 0}</p>
        </div>
      </div>
      
      {/* Departments and Positions */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Departments & Positions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config?.departments?.map((department) => (
            <div key={department} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{department}</h4>
              <ul className="space-y-1">
                {(config?.positions?.[department] || []).map((position) => (
                  <li key={position} className="text-sm text-gray-600">
                    • {position}
                  </li>
                ))}
                {(!config?.positions?.[department] || config.positions[department].length === 0) && (
                  <li className="text-sm text-gray-400 italic">No positions defined</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render the appropriate dashboard based on user role
  switch (user?.role) {
    case 'admin':
      return (
        <div className="space-y-6">
          <CompanyDetails />
          <AdminDashboard
            interns={interns}
            presentToday={presentToday}
            absentToday={absentToday}
            lateToday={lateToday}
            halfDayToday={halfDayToday}
            adminWeeklyAttendance={adminWeeklyAttendance}
            performanceStats={performanceStats}
            projectStats={projectStats}
          />
        </div>
      );
    case 'mentor':
      return (
        <div className="space-y-6">
          <CompanyDetails />
          <MentorDashboard
            user={user}
            interns={interns}
            attendance={attendance}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            getMentorMentees={getMentorMentees}
            getMentorId={getMentorId}
            />
        </div>
      );
      case 'intern':
        return (
          <div className="space-y-6">
          <CompanyDetails />
          <InternDashboard
            user={user}
            attendance={attendance}
            interns={interns}
          />
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Please log in to view your dashboard</p>
    </div>
  );
  }
};

export default Dashboard; 