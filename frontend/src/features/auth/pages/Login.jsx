import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Smartphone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { loginUser } from '../services/authService';
import { authStart, authSuccess, authFailure } from '../store/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    dispatch(authStart());

    try {
      const res = await loginUser(formData.phone, formData.password);
      dispatch(authSuccess(res));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      dispatch(authFailure(err.response?.data?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your account"
      illustration="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="98765 43210"
          value={formData.phone}
          onChange={handleChange}
          icon={Smartphone}
          required
        />

        <div className="relative group">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-text-muted hover:text-brand-secondary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button 
          type="submit" 
          loading={loading}
          className="w-full"
        >
          <span>Login</span>
          {!loading && <ArrowRight size={20} />}
        </Button>
      </form>

      <footer className="mt-12 text-center">
        <p className="text-sm text-text-secondary font-medium">
          New to NestNagar?{' '}
          <Link to="/register" className="text-brand-secondary font-bold hover:underline ml-1">
            Sign up
          </Link>
        </p>
      </footer>
      
      {error && (
        <div className="mt-4 p-3 bg-brand-error/10 border border-brand-error/20 rounded-lg text-brand-error text-sm text-center">
          {error}
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
