import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Briefcase, 
  IndianRupee, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Smile, 
  Loader2 
} from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { createPartnerCard } from '../services/partnerService';

const CreatePartnerCard = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    purpose: 'student',
    budget: '',
    preferredLocality: '',
    moveInDate: '',
    genderPreference: 'any',
    habits: [],
    bio: '',
  });

  const navigate = useNavigate();
  const totalSteps = 4;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleToggleHabit = (habit) => {
    setFormData((prev) => ({
      ...prev,
      habits: prev.habits.includes(habit)
        ? prev.habits.filter((h) => h !== habit)
        : [...prev.habits, habit],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createPartnerCard({
        ...formData,
        budget: Number(formData.budget),
      });
      navigate('/partners');
    } catch (err) {
      console.error('Failed to post partner card:', err);
      alert('Failed to post partner card. Please fill in all fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">What is your profile type?</h3>
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
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary px-1">Your Max Rent Budget (INR)</label>
              <Input
                icon={IndianRupee}
                type="number"
                placeholder="e.g. 5000"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Locality & Date</h3>
            <Input
              label="Preferred Locality"
              icon={MapPin}
              placeholder="e.g. Naharlagun, Ganga Market, E-Sector"
              value={formData.preferredLocality}
              onChange={(e) => setFormData({ ...formData, preferredLocality: e.target.value })}
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary px-1">Target Move-in Date</label>
              <input
                type="date"
                className="input-field h-16 text-lg text-center"
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Roommate Preferences</h3>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary px-1">Gender Allowed</label>
              <div className="flex gap-2">
                {[
                  { id: 'any', label: 'Any' },
                  { id: 'male', label: 'Male Only' },
                  { id: 'female', label: 'Female Only' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFormData({ ...formData, genderPreference: g.id })}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-xs capitalize transition-all ${
                      formData.genderPreference === g.id
                        ? 'border-brand-secondary bg-brand-secondary/5 text-brand-secondary'
                        : 'border-border-default hover:border-brand-accent'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary px-1">Your Lifestyle Habits</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Non-smoker',
                  'Vegetarian',
                  'Early riser',
                  'Late sleeper',
                  'Pet friendly',
                  'Quiet study',
                  'Likes cooking',
                  'Clean freak',
                ].map((habit) => (
                  <button
                    key={habit}
                    onClick={() => handleToggleHabit(habit)}
                    className={`p-3.5 rounded-xl border flex items-center gap-2 transition-all text-xs font-bold ${
                      formData.habits.includes(habit)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-border-default/60 hover:border-brand-primary/40'
                    }`}
                  >
                    <CheckCircle2 size={14} className={formData.habits.includes(habit) ? 'text-brand-primary' : 'text-text-muted'} />
                    {habit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">About Yourself</h3>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary px-1">Bio / Profile Description</label>
              <textarea
                className="input-field h-40 py-4 resize-none leading-relaxed text-sm"
                placeholder="Describe your daily routine, what you do, and what type of roommate you are looking for..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate('/partners')} className="p-2 text-text-muted hover:text-brand-primary">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-headings font-bold text-brand-primary">Post Roommate Card</h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Step {step} of {totalSteps}</p>
          </div>
        </header>

        <div className="h-1.5 w-full bg-border-light rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-secondary transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-card min-h-[450px] flex flex-col justify-between">
          <div>{renderStep()}</div>

          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button onClick={prevStep} className="flex items-center gap-2 text-text-secondary font-bold hover:text-brand-primary">
                <ArrowLeft size={20} /> Back
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <Button 
                onClick={nextStep} 
                disabled={step === 1 && (!formData.budget || !formData.purpose) || step === 2 && (!formData.preferredLocality || !formData.moveInDate)}
                className="px-10"
              >
                Next <ArrowRight size={20} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} disabled={!formData.bio.trim()} className="px-10 btn-cta">
                Submit Card
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePartnerCard;
