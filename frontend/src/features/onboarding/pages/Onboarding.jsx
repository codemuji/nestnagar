import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, 
  Briefcase, 
  IndianRupee, 
  MapPin, 
  Calendar, 
  Users, 
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { completeOnboarding } from '../services/onboardingService';
import { updateUser } from '../../auth/store/authSlice';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purpose: 'student',
    budget: '',
    locality: '',
    moveInDate: '',
    aloneOrPartner: 'alone',
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const totalSteps = 5;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await completeOnboarding(formData);
      dispatch(updateUser(res.user));
      navigate('/');
    } catch (err) {
      console.error('Onboarding failed:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">What brings you to Itanagar?</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, purpose: 'student' })}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${
                  formData.purpose === 'student' ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default hover:border-brand-accent'
                }`}
              >
                <div className={`p-3 rounded-full ${formData.purpose === 'student' ? 'bg-brand-secondary text-white' : 'bg-border-light text-text-muted'}`}>
                  <User size={32} />
                </div>
                <span className="font-bold">Student</span>
              </button>
              <button
                onClick={() => setFormData({ ...formData, purpose: 'working' })}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${
                  formData.purpose === 'working' ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default hover:border-brand-accent'
                }`}
              >
                <div className={`p-3 rounded-full ${formData.purpose === 'working' ? 'bg-brand-secondary text-white' : 'bg-border-light text-text-muted'}`}>
                  <Briefcase size={32} />
                </div>
                <span className="font-bold">Professional</span>
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">What is your monthly budget?</h3>
            <Input
              icon={IndianRupee}
              type="number"
              placeholder="e.g. 8000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="text-center text-2xl font-bold h-20"
            />
            <p className="text-center text-text-secondary text-sm">We'll find places that fit your pocket.</p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Which locality do you prefer?</h3>
            <Input
              icon={MapPin}
              placeholder="e.g. Naharlagun, Ganga Market, E-Sector"
              value={formData.locality}
              onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
              className="h-16 text-lg"
            />
            <div className="flex flex-wrap gap-2 justify-center">
              {['Naharlagun', 'Ganga Market', 'E-Sector', 'Nerist Area'].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setFormData({ ...formData, locality: loc })}
                  className="px-4 py-2 rounded-full border border-border-default bg-white text-sm hover:border-brand-secondary hover:text-brand-secondary transition-all"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">When do you plan to move in?</h3>
            <div className="relative">
              <input
                type="date"
                className="input-field h-16 text-lg text-center"
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">How do you want to live?</h3>
            <div className="space-y-4">
              <button
                onClick={() => setFormData({ ...formData, aloneOrPartner: 'alone' })}
                className={`w-full p-6 rounded-2xl border-2 flex items-center gap-6 transition-all ${
                  formData.aloneOrPartner === 'alone' ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default'
                }`}
              >
                <div className={`p-4 rounded-xl ${formData.aloneOrPartner === 'alone' ? 'bg-brand-secondary text-white' : 'bg-border-light text-text-muted'}`}>
                  <Users size={28} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold">Live Alone</h4>
                  <p className="text-sm text-text-secondary">I'm looking for a full room or flat for myself.</p>
                </div>
              </button>
              <button
                onClick={() => setFormData({ ...formData, aloneOrPartner: 'partner' })}
                className={`w-full p-6 rounded-2xl border-2 flex items-center gap-6 transition-all ${
                  formData.aloneOrPartner === 'partner' ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default'
                }`}
              >
                <div className={`p-4 rounded-xl ${formData.aloneOrPartner === 'partner' ? 'bg-brand-secondary text-white' : 'bg-border-light text-text-muted'}`}>
                  <UserPlus size={28} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold">Find a Rent Partner</h4>
                  <p className="text-sm text-text-secondary">I want to share a room and split the rent.</p>
                </div>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-secondary flex items-center justify-center rounded-xl text-white">
              <Users size={24} />
            </div>
            <span className="text-2xl font-headings font-bold tracking-tighter">NestNagar</span>
          </div>
          <p className="text-text-muted font-medium uppercase tracking-widest text-xs">Step {step} of {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-border-light rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-secondary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-card min-h-[400px] flex flex-col justify-between">
          <div>{renderStep()}</div>

          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-text-secondary font-bold hover:text-brand-primary transition-colors"
              >
                <ArrowLeft size={20} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={step === 2 && !formData.budget || step === 3 && !formData.locality || step === 4 && !formData.moveInDate}
                className="px-10"
              >
                Next Step
                <ArrowRight size={20} />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                loading={loading}
                className="px-10 btn-cta"
              >
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Onboarding;
