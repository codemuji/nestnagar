import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Building2, 
  User, 
  IndianRupee, 
  MapPin, 
  Wifi, 
  Wind, 
  Utensils, 
  Car,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { createListing } from '../../listings/services/listingService';

const PostListing = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    type: 'pg',
    title: '',
    description: '',
    price: '',
    deposit: '',
    locality: '',
    amenities: [],
    genderAllowed: 'any',
  });

  const navigate = useNavigate();
  const totalSteps = 7;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleToggleAmenity = (amt) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amt)
        ? prev.amenities.filter((a) => a !== amt)
        : [...prev.amenities, amt],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
      photos.forEach(photo => {
        data.append('photos', photo);
      });

      await createListing(data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to post sanctuary:', err);
      alert('Failed to post sanctuary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">What type of sanctuary is it?</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'pg', label: 'PG / Hostel', icon: Building2 },
                { id: 'single-room', label: 'Single Room', icon: Home },
                { id: 'flat', label: 'Full Flat', icon: Home },
                { id: 'studio', label: 'Studio', icon: Building2 },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${
                    formData.type === t.id ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${formData.type === t.id ? 'bg-brand-secondary text-white' : 'bg-border-light text-text-muted'}`}>
                    <t.icon size={28} />
                  </div>
                  <span className="font-bold text-sm">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Tell us about it</h3>
            <Input
              label="Listing Title"
              placeholder="e.g. Modern Studio near NERIST"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-secondary px-1">Description</label>
              <textarea
                className="input-field h-32 py-4 resize-none"
                placeholder="Write a few words about the sanctuary..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Set the pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monthly Rent"
                icon={IndianRupee}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
              <Input
                label="Security Deposit"
                icon={IndianRupee}
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Where is it located?</h3>
            <Input
              icon={MapPin}
              placeholder="e.g. Naharlagun, Ganga Market"
              value={formData.locality}
              onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Included Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {['WiFi', 'AC', 'Food', 'Parking', 'Geyser', 'Attached Bath'].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleToggleAmenity(amt)}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    formData.amenities.includes(amt) ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${formData.amenities.includes(amt) ? 'bg-brand-secondary text-white' : 'bg-border-light text-text-muted'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="font-bold text-xs">{amt}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Upload Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border-default">
                  <img src={URL.createObjectURL(photo)} alt="upload" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 8 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white transition-all text-text-muted">
                  <ImageIcon size={24} />
                  <span className="text-[10px] font-bold uppercase">Add Photo</span>
                  <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              )}
            </div>
            <p className="text-center text-[10px] text-text-muted italic">Add up to 8 photos. High quality images get 3x more inquiries.</p>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-headings font-bold text-center">Gender Preference</h3>
            <div className="space-y-3">
              {[
                { id: 'any', label: 'Any', desc: 'Open to everyone' },
                { id: 'male', label: 'Males Only', desc: 'Strictly for men' },
                { id: 'female', label: 'Females Only', desc: 'Strictly for women' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setFormData({ ...formData, genderAllowed: g.id })}
                  className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                    formData.genderAllowed === g.id ? 'border-brand-secondary bg-brand-secondary/5' : 'border-border-default'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold text-sm">{g.label}</p>
                    <p className="text-xs text-text-muted">{g.desc}</p>
                  </div>
                  {formData.genderAllowed === g.id && <CheckCircle2 size={20} className="text-brand-secondary" />}
                </button>
              ))}
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
          <button onClick={() => navigate('/dashboard')} className="p-2 text-text-muted hover:text-brand-primary">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-headings font-bold text-brand-primary">Post Sanctuary</h2>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Step {step} of {totalSteps}</p>
          </div>
        </header>

        <div className="h-1 w-full bg-border-light rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-primary transition-all duration-500"
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
              <Button onClick={nextStep} className="px-10">
                Next <ArrowRight size={20} />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading} className="px-10 btn-cta">
                Submit Sanctuary
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostListing;
