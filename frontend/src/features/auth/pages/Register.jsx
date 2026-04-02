import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { User, Smartphone, Lock, ArrowRight, Eye, EyeOff, Building2, UserPlus, Check } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { registerUser } from '../services/authService';
import { authStart, authSuccess, authFailure } from '../store/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'seeker',
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
    if (!formData.name || !formData.phone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    dispatch(authStart());

    try {
      const res = await registerUser(formData);
      dispatch(authSuccess(res));
      
      if (formData.role === 'seeker') {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      dispatch(authFailure(err.response?.data?.message));
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'seeker', title: 'Seeker', icon: User },
    { id: 'owner', title: 'Owner', icon: Building2 },
    { id: 'broker', title: 'Broker', icon: UserPlus },
  ];

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Join the curated community of modern home seekers."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          icon={User}
          required
        />
        
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
            placeholder="Min. 6 characters"
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

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-text-secondary px-1">Choose Role</label>
          <div className="grid grid-cols-3 gap-3">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: r.id })}
                className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                  formData.role === r.id ? 'border-brand-secondary bg-brand-secondary/5 text-brand-secondary' : 'border-border-default text-text-muted'
                }`}
              >
                <r.icon size={18} />
                <span className="text-[10px] font-bold uppercase">{r.title}</span>
              </button>
            ))}
          </div>
        </div>

        <Button 
          type="submit" 
          loading={loading}
          className="w-full mt-4"
        >
          <span>Create Account</span>
          {!loading && <ArrowRight size={20} />}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-bold hover:underline">
            Login
          </Link>
        </p>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-brand-error/10 border border-brand-error/20 rounded-lg text-brand-error text-sm text-center">
          {error}
        </div>
      )}
    </AuthLayout>
  );
};

export default Register;
