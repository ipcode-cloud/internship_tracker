import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { fetchConfig } from '../../store/slices/configSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  department: z.string().min(1, 'Department is required'),
  role: z.enum(['admin', 'mentor', 'intern'], {
    required_error: 'Role is required',
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const RegisterForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { config } = useSelector((state) => state.config);

  useEffect(() => {
    dispatch(fetchConfig());
  }, [dispatch]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;
      console.log('Form data before submission:', registerData);
      const result = await dispatch(register(registerData)).unwrap();
      console.log('Registration result:', result);
      toast.success('Registered successfully');
    } catch (error) {
      console.error('Registration error in form:', error);
      toast.error(error.message || 'Failed to register. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="First Name"
            {...registerField('firstName')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="Last Name"
            {...registerField('lastName')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            {...registerField('email')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            {...registerField('password')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            {...registerField('confirmPassword')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        <div>
          <select
            {...registerField('department')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.department ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Department</option>
            {config?.departments?.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
          )}
        </div>
        <div>
          <select
            {...registerField('role')}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="mentor">Mentor</option>
            <option value="intern">Intern</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link to="/login" className="text-blue-500 hover:text-blue-700">
          Already have an account? Login here
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm; 