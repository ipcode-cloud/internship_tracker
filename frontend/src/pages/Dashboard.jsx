import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInterns } from '../store/slices/internSlice';
import { fetchAttendance } from '../store/slices/attendanceSlice';
import { fetchConfig } from '../store/slices/configSlice';
import { fetchMentors, clearMentors } from '../store/slices/authSlice';
import { Link } from 'react-router-dom';

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
  
  const [userInternData, setUserInternData] = useState(null);
  const [userMentorData, setUserMentorData] = useState(null);
  const [userAttendance, setUserAttendance] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (fetchInProgress.current) return;
    
    try {
      fetchInProgress.current = true;
      setError(null);
      
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoad(true);
      }

      const promises = [];
      
      if (user?.role === 'intern') {
        // For interns, only fetch their specific data
        promises.push(dispatch(fetchInterns()));
        promises.push(dispatch(fetchAttendance()));
        promises.push(dispatch(fetchMentors()));
      } else {
        // For admins and mentors, fetch all data
        promises.push(dispatch(fetchInterns()));
        promises.push(dispatch(fetchAttendance()));
        promises.push(dispatch(fetchConfig()));
        if (user?.role === 'mentor') {
          promises.push(dispatch(fetchMentors()));
        }
      }

      await Promise.all(promises);
      
      if (isMounted.current) {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsInitialLoad(false);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (isMounted.current) {
        setError('Failed to load dashboard data. Please try again.');
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsInitialLoad(false);
        }
      }
    } finally {
      fetchInProgress.current = false;
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (!user) return;
    
    dispatch(clearMentors());
    fetchDashboardData();
    
    return () => {
      fetchInProgress.current = false;
    };
  }, [fetchDashboardData, dispatch, user]);

  useEffect(() => {
    if (!interns || !user) return;

    const currentIntern = interns.find(intern => intern.email === user.email);
    setUserInternData(currentIntern);
    
    if (currentIntern && mentors) {
      const currentMentor = mentors.find(mentor => mentor._id === currentIntern.mentor);
      setUserMentorData(currentMentor);
    }
    
    if (currentIntern && attendance) {
      const userAttendanceRecords = attendance.filter(record => record.intern === currentIntern._id);
      setUserAttendance(userAttendanceRecords);
    }
  }, [interns, user, mentors, attendance]);

  // Check if any data is still loading
  const isLoading = internsLoading || attendanceLoading || configLoading || mentorsLoading;

  // Show skeleton loading only on initial load
  if (isInitialLoad && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6">
          <div className="h-6 bg-white bg-opacity-20 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-white bg-opacity-20 rounded w-1/2 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="h-4 bg-white bg-opacity-20 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-6 bg-white bg-opacity-20 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Tables Skeleton */}
        <TableSkeleton />
      </div>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={() => fetchDashboardData(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show error state if data is missing
  if (!interns || !attendance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">Failed to load dashboard data</div>
        <button 
          onClick={() => fetchDashboardData(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show loading spinner during refresh
  if (isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Get today's date from the most recent attendance record
  const getTodayDate = () => {
    if (attendance.length > 0) {
      const mostRecentDate = new Date(attendance[0].date);
      mostRecentDate.setHours(0, 0, 0, 0);
      return mostRecentDate;
    }
    return new Date();
  };

  const today = getTodayDate();
  const todayISO = today.toISOString().split('T')[0];

  const userTodayAttendance = userAttendance.find(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  // Get last 7 days attendance
  const getLastWeekDates = () => {
    const dates = [];
    
    // Get today's date from the most recent attendance record
    const today = getTodayDate();
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Generate dates for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const getInternWeeklyAttendance = () => {
    return getLastWeekDates().map(date => {
      const dayAttendance = userAttendance.find(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      });
      return {
        date: date.toISOString().split('T')[0],
        status: dayAttendance ? dayAttendance.status : 'absent',
        checkIn: dayAttendance?.checkIn,
        checkOut: dayAttendance?.checkOut
      };
    });
  };

  const getAdminWeeklyAttendance = () => {
    return getLastWeekDates().map(date => {
      const dayAttendance = attendance.filter(record => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === date.getTime();
      });
      return {
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter(record => record.status === 'present').length,
        absent: dayAttendance.filter(record => record.status === 'absent').length,
        late: dayAttendance.filter(record => record.status === 'late').length,
        halfDay: dayAttendance.filter(record => record.status === 'half-day').length,
      };
    });
  };

  // Attendance Statistics
  const todayAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });
  const presentToday = todayAttendance.filter(record => record.status === 'present').length;
  const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
  const lateToday = todayAttendance.filter(record => record.status === 'late').length;
  const halfDayToday = todayAttendance.filter(record => record.status === 'half-day').length;

  // Weekly Attendance for admin/mentor view
  const adminWeeklyAttendance = getAdminWeeklyAttendance();

  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const getInternName = (internId) => {
    // If intern is already populated in the attendance record
    if (typeof internId === 'object' && internId.firstName && internId.lastName) {
      return `${internId.firstName} ${internId.lastName}`;
    }
    // Fallback to finding in interns array
    const intern = interns.find((i) => i._id === internId);
    return intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown';
  };

  // Performance Statistics
  const performanceStats = {
    excellent: interns.filter(intern => intern.performanceRating === 'excellent').length,
    good: interns.filter(intern => intern.performanceRating === 'good').length,
    average: interns.filter(intern => intern.performanceRating === 'average').length,
    needs_improvement: interns.filter(intern => intern.performanceRating === 'needs_improvement').length,
    unsatisfactory: interns.filter(intern => intern.performanceRating === 'unsatisfactory').length,
  };

  // Project Status Statistics
  const projectStats = {
    not_started: interns.filter(intern => intern.projectStatus === 'not_started').length,
    in_progress: interns.filter(intern => intern.projectStatus === 'in_progress').length,
    completed: interns.filter(intern => intern.projectStatus === 'completed').length,
    delayed: interns.filter(intern => intern.projectStatus === 'delayed').length,
    on_hold: interns.filter(intern => intern.projectStatus === 'on_hold').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {user?.role === 'intern' && (
          <Link 
            to="/dashboard/profile" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            View My Profile
          </Link>
        )}
      </div>

      {/* Welcome Section for Interns */}
      {user?.role === 'intern' && userInternData && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Welcome back, {userInternData.firstName}!</h2>
          <p className="mb-4">Here's your internship status and performance overview.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Status</h3>
              <p className="text-lg font-semibold mt-1">
                {userInternData.status.charAt(0).toUpperCase() + userInternData.status.slice(1).replace('_', ' ')}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Performance</h3>
              <p className="text-lg font-semibold mt-1">
                {userInternData.performanceRating.charAt(0).toUpperCase() + userInternData.performanceRating.slice(1).replace('_', ' ')}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Project</h3>
              <p className="text-lg font-semibold mt-1">
                {userInternData.projectStatus.charAt(0).toUpperCase() + userInternData.projectStatus.slice(1).replace('_', ' ')}
              </p>
            </div>
          </div>
          
          {userTodayAttendance && (
            <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Today's Attendance</h3>
              <p className="text-lg font-semibold mt-1">
                {userTodayAttendance.status.charAt(0).toUpperCase() + userTodayAttendance.status.slice(1).replace('_', ' ')}
              </p>
              {userTodayAttendance.checkIn && (
                <p className="text-sm mt-1">
                  Check-in: {new Date(userTodayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Welcome Section for Mentors */}
      {user?.role === 'mentor' && (
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Welcome back, {user.firstName}!</h2>
          <p className="mb-4">Here's an overview of your mentees and their performance.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Active Mentees</h3>
              <p className="text-lg font-semibold mt-1">
                {interns.filter(intern => intern.mentor === user._id && intern.status === 'active').length}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Completed Mentees</h3>
              <p className="text-lg font-semibold mt-1">
                {interns.filter(intern => intern.mentor === user._id && intern.status === 'completed').length}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">On Leave</h3>
              <p className="text-lg font-semibold mt-1">
                {interns.filter(intern => intern.mentor === user._id && intern.status === 'on_leave').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Overview */}
      {user?.role === 'admin' && (
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
          <p className="mb-4">Here's an overview of the internship program.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Total Interns</h3>
              <p className="text-lg font-semibold mt-1">{interns.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Active Interns</h3>
              <p className="text-lg font-semibold mt-1">{interns.filter(intern => intern.status === 'active').length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Mentors</h3>
              <p className="text-lg font-semibold mt-1">{mentors.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h3 className="text-sm font-medium opacity-80">Departments</h3>
              <p className="text-lg font-semibold mt-1">{config?.departments?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Intern Statistics Cards */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Interns</h3>
                <p className="text-3xl font-bold text-green-600">{interns.filter(intern => intern.status === 'active').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                <p className="text-3xl font-bold text-blue-600">{interns.filter(intern => intern.status === 'completed').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Terminated</h3>
                <p className="text-3xl font-bold text-red-600">{interns.filter(intern => intern.status === 'terminated').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">On Leave</h3>
                <p className="text-3xl font-bold text-yellow-600">{interns.filter(intern => intern.status === 'on_leave').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Attendance and Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Present</span>
              <span className="font-semibold text-green-600">{presentToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absent</span>
              <span className="font-semibold text-red-600">{absentToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Late</span>
              <span className="font-semibold text-yellow-600">{lateToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Half Day</span>
              <span className="font-semibold text-blue-600">{halfDayToday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <div className="space-y-4">
            {Object.entries(interns.reduce((acc, intern) => {
              acc[intern.department] = (acc[intern.department] || 0) + 1;
              return acc;
            }, {})).map(([department, count]) => (
              <div key={department} className="flex justify-between items-center">
                <span className="text-gray-600">{department}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${(count / interns.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold text-indigo-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance and Project Status */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Distribution</h2>
            <div className="space-y-4">
              {Object.entries(performanceStats).map(([rating, count]) => (
                <div key={rating} className="flex justify-between items-center">
                  <span className="text-gray-600">{rating.replace('_', ' ').charAt(0).toUpperCase() + rating.replace('_', ' ').slice(1)}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          rating === 'excellent' ? 'bg-green-600' :
                          rating === 'good' ? 'bg-blue-600' :
                          rating === 'average' ? 'bg-yellow-600' :
                          rating === 'needs_improvement' ? 'bg-orange-600' :
                          'bg-red-600'
                        }`}
                        style={{ width: `${(count / interns.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Status</h2>
            <div className="space-y-4">
              {Object.entries(projectStats).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-600">{status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`h-2.5 rounded-full ${
                          status === 'completed' ? 'bg-green-600' :
                          status === 'in_progress' ? 'bg-blue-600' :
                          status === 'not_started' ? 'bg-gray-600' :
                          status === 'delayed' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }`}
                        style={{ width: `${(count / interns.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Day</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getAdminWeeklyAttendance().map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{day.present}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{day.absent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{day.late}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{day.halfDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAttendance.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getInternName(record.intern)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 