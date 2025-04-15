import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateAttendance, fetchAttendance } from '../store/slices/attendanceSlice';
import { fetchInterns } from '../store/slices/internSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttendanceForm from '../components/attendance/AttendanceForm';

const AttendanceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { interns, loading: internsLoading } = useSelector((state) => state.interns);
  const { attendance, loading: attendanceLoading } = useSelector((state) => state.attendance);
  
  const [loading, setLoading] = useState(true);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  
  // Filter interns based on user role
  const accessibleInterns = interns.filter(intern => {
    if (user.role === 'admin') return true;
    if (user.role === 'mentor') {
      const mentorId = intern.mentor?._id || intern.mentor;
      return mentorId === user._id;
    }
    if (user.role === 'intern') return intern._id === user._id;
    return false;
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(fetchAttendance()),
          dispatch(fetchInterns())
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (attendance.length > 0) {
      const record = attendance.find(record => record._id === id);
      if (record) {
        // Format the data for the form
        const formattedRecord = {
          intern: typeof record.intern === 'object' ? record.intern._id : record.intern,
          date: new Date(record.date).toISOString().split('T')[0],
          status: record.status,
          checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          notes: record.notes || ''
        };
        setAttendanceRecord(formattedRecord);
      } else {
        toast.error('Attendance record not found');
        navigate('/attendance');
      }
    }
  }, [attendance, id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await dispatch(updateAttendance({ id, attendanceData: formData })).unwrap();
      toast.success('Attendance updated successfully');
      navigate('/attendance');
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.message || 'Failed to update attendance');
    }
  };

  if (loading || attendanceLoading || internsLoading || !attendanceRecord) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading attendance record..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Attendance</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AttendanceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/attendance')}
          accessibleInterns={accessibleInterns}
          initialData={attendanceRecord}
        />
      </div>
    </div>
  );
};

export default AttendanceEdit; 