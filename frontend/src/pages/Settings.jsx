import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConfig } from '../store/slices/configSlice';
import DepartmentSettings from '../components/settings/DepartmentSettings';
import PositionSettings from '../components/settings/PositionSettings';
import CompanySettings from '../components/settings/CompanySettings';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Settings = () => {
  const dispatch = useDispatch();
  const { config, loading } = useSelector((state) => state.config);
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStartTime, setLoadingStartTime] = useState(null);

  useEffect(() => {
    setLoadingStartTime(Date.now());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchConfig()).unwrap();
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (!loading && loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minimumLoadingTime = 500; // 500ms minimum loading time

      if (elapsedTime < minimumLoadingTime) {
        const remainingTime = minimumLoadingTime - elapsedTime;
        setTimeout(() => {
          setShowLoading(false);
        }, remainingTime);
      } else {
        setShowLoading(false);
      }
    }
  }, [loading, loadingStartTime]);

  if (showLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 gap-6">
        <CompanySettings />
        <DepartmentSettings />
        <PositionSettings />
        </div>
    </div>
  );
};

export default Settings; 