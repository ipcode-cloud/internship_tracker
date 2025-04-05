import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchInterns } from '../store/slices/internSlice';
import { fetchAttendance } from '../store/slices/attendanceSlice';
import { fetchConfig, fetchPublicConfig } from '../store/slices/configSlice';
import { fetchMentors } from '../store/slices/authSlice';
import InternDashboard from '../components/dashboard/InternDashboard';
import MentorDashboard from '../components/dashboard/MentorDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';

// Skeleton Loading Components
const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { interns, loading: internsLoading } = useSelector((state) => state.interns);
  const { attendance, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { config, loading: configLoading } = useSelector((state) => state.config);
  const { mentors, mentorsLoading } = useSelector((state) => state.auth);
  
  const [userAttendance, setUserAttendance] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({ present: 0, absent: 0, late: 0 });
  const [todayStats, setTodayStats] = useState({ checkIn: null, checkOut: null, status: null });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      setError(null);
        setIsInitialLoad(true);
      try {
        if (user.role === 'intern') {
          await Promise.all([
            dispatch(fetchAttendance()),
            dispatch(fetchMentors()),
            dispatch(fetchPublicConfig())
          ]);
        } else if (user.role === 'mentor') {
          await Promise.all([
            dispatch(fetchInterns()),
            dispatch(fetchAttendance()),
            dispatch(fetchPublicConfig())
          ]);
        } else if (user.role === 'admin') {
          await Promise.all([
            dispatch(fetchInterns()),
            dispatch(fetchAttendance()),
            dispatch(fetchConfig()),
            dispatch(fetchMentors())
          ]);
        }
      } catch (err) {
        console.error('Dashboard data loading error:', err);
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadDashboardData();
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.role === 'intern' && attendance?.length > 0) {
      try {
        // Filter attendance for current intern
        const internAttendance = attendance.filter(record => record.internId === user.id);
        
        // Sort by date descending and get recent records
        const sortedAttendance = [...internAttendance].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        // Get today's attendance
        const today = new Date();
        const todayRecord = internAttendance.find(record => 
          new Date(record.date).toDateString() === today.toDateString()
        );
        
        if (todayRecord) {
          setTodayStats({
            checkIn: todayRecord.checkIn,
            checkOut: todayRecord.checkOut,
            status: todayRecord.status
          });
        }

        // Calculate weekly stats
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyAttendance = internAttendance.filter(record => 
          new Date(record.date) >= oneWeekAgo
        );

        const stats = weeklyAttendance.reduce((acc, record) => {
          if (record.status === 'present') acc.present++;
          else if (record.status === 'absent') acc.absent++;
          else if (record.status === 'late') acc.late++;
          return acc;
        }, { present: 0, absent: 0, late: 0 });

        setWeeklyStats(stats);
        setUserAttendance(sortedAttendance.slice(0, 5));
      } catch (err) {
        console.error('Error processing attendance data:', err);
      }
    }
  }, [attendance, user]);

  const getMentorId = (mentorId) => {
    if (!mentorId) return null;
    if (typeof mentorId === 'object') {
      return mentorId._id || mentorId.id;
    }
    return mentorId;
  };

  const isMentorMatch = (internMentor, userId) => {
    const mentorId = getMentorId(internMentor);
    return mentorId === userId || mentorId === getMentorId(userId);
  };

  const getMentorMentees = () => {
    if (!user || !interns) return [];
    return interns.filter(intern => isMentorMatch(intern.mentor, user));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (user?.role === 'intern') {
        await Promise.all([
          dispatch(fetchAttendance()),
          dispatch(fetchMentors()),
          dispatch(fetchPublicConfig())
        ]);
      } else if (user?.role === 'mentor') {
        await Promise.all([
          dispatch(fetchInterns()),
          dispatch(fetchAttendance()),
          dispatch(fetchPublicConfig())
        ]);
      } else if (user?.role === 'admin') {
        await Promise.all([
          dispatch(fetchInterns()),
          dispatch(fetchAttendance()),
          dispatch(fetchConfig()),
          dispatch(fetchMentors())
        ]);
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Loading states
  const isLoading = internsLoading || attendanceLoading || configLoading || mentorsLoading;

  if (isInitialLoad && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
          <CardSkeleton />
          <TableSkeleton />
        </div>
        </div>
    );
  }

  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
            onClick={handleRefresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
        </div>
      </div>
    );
  }

  if (!interns || !attendance) {
    return (
      <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">Failed to load dashboard data</div>
        <button 
            onClick={handleRefresh}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
      </div>
    );
  }

  // Calculate attendance statistics
  const today = new Date();
  const todayString = today.toDateString();
  const todayAttendance = attendance.filter(record => 
    new Date(record.date).toDateString() === todayString
  );

  const presentToday = todayAttendance.filter(record => record.status === 'present').length;
  const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
  const lateToday = todayAttendance.filter(record => record.status === 'late').length;
  const halfDayToday = todayAttendance.filter(record => record.status === 'half-day').length;

  // Calculate weekly attendance
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  
  const adminWeeklyAttendance = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toDateString();
    
    const dayAttendance = attendance.filter(record => 
      new Date(record.date).toDateString() === dateString
    );

    return {
      date: date.toISOString().split('T')[0],
      present: dayAttendance.filter(record => record.status === 'present').length,
      absent: dayAttendance.filter(record => record.status === 'absent').length,
      late: dayAttendance.filter(record => record.status === 'late').length,
      halfDay: dayAttendance.filter(record => record.status === 'half-day').length
    };
  }).reverse();

  // Calculate performance statistics
  const performanceStats = {
    excellent: interns.filter(intern => intern.performanceRating === 'excellent').length,
    good: interns.filter(intern => intern.performanceRating === 'good').length,
    average: interns.filter(intern => intern.performanceRating === 'average').length,
    needs_improvement: interns.filter(intern => intern.performanceRating === 'needs_improvement').length,
    unsatisfactory: interns.filter(intern => intern.performanceRating === 'unsatisfactory').length
  };

  // Calculate project statistics
  const projectStats = {
    not_started: interns.filter(intern => intern.projectStatus === 'not_started').length,
    in_progress: interns.filter(intern => intern.projectStatus === 'in_progress').length,
    completed: interns.filter(intern => intern.projectStatus === 'completed').length,
    delayed: interns.filter(intern => intern.projectStatus === 'delayed').length,
    on_hold: interns.filter(intern => intern.projectStatus === 'on_hold').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Common Header Section */}
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-4">
        {user?.role === 'intern' && (
          <Link 
                to="/profile" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
                View Profile
          </Link>
        )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
        </div>
      )}

        {/* Role-based Dashboard Content */}
        {user?.role === 'intern' && (
          <InternDashboard
            user={user}
            todayStats={todayStats}
            weeklyStats={weeklyStats}
            userAttendance={userAttendance}
          />
        )}

        {user?.role === 'mentor' && (
          <MentorDashboard
            user={user}
            interns={interns}
            attendance={attendance}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            getMentorMentees={getMentorMentees}
            getMentorId={getMentorId}
          />
        )}

      {user?.role === 'admin' && (
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
        )}
      </div>
    </div>
  );
};

export default Dashboard; 