import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Building2, 
  IndianRupee, 
  MapPin, 
  X,
  Loader2,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { getListingById, updateListing } from '../../listings/services/listingService';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [formData, setFormData] = useState({
    type: 'pg',
    title: '',
    description: '',
    price: '',
    deposit: '',
    locality: '',
    coordinates: { lat: '', lng: '' },
    amenities: [],
    genderAllowed: 'any',
  });

  const totalSteps = 7;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListingById(id);
        setFormData({
          type: data.type || 'pg',
          title: data.title || '',
          description: data.description || '',
          price: data.price || '',
          deposit: data.deposit || '',
          locality: data.locality || '',
          coordinates: {
            lat: data.coordinates?.lat || '',
            lng: data.coordinates?.lng || ''
          },
          amenities: data.amenities || [],
          genderAllowed: data.genderAllowed || 'any',
        });
        setExistingPhotos(data.photos || []);
      } catch (err) {
        console.error('Failed to fetch sanctuary details:', err);
        alert('Could not load listing details.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate]);

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

  const removeNewPhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index) => {
    setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      
      // Append normal text fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === 'coordinates') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      // Append existing photos list
      data.append('existingPhotos', JSON.stringify(existingPhotos));

      // Append new files
      photos.forEach(photo => {
        data.append('photos', photo);
      });

      await updateListing(id, data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update sanctuary:', err);
      alert('Failed to update sanctuary. Please try again.');
    } finally {
      setSaving(false);
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
              label="Locality"
              icon={MapPin}
              placeholder="e.g. Naharlagun, Ganga Market"
              value={formData.locality}
              onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
            />
            <div className="bg-brand-background p-4 rounded-2xl border border-border-light/30 space-y-4">
              <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">Coordinates (Optional)</p>
              <p className="text-[10px] text-text-muted">Enter latitude and longitude to drop an exact pin on the map, or leave blank to search by locality name.</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 27.102"
                  value={formData.coordinates?.lat || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    coordinates: {
                      ...formData.coordinates,
                      lat: e.target.value ? parseFloat(e.target.value) : ''
                    }
                  })}
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 93.692"
                  value={formData.coordinates?.lng || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    coordinates: {
                      ...formData.coordinates,
                      lng: e.target.value ? parseFloat(e.target.value) : ''
                    }
                  })}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setFormData({
                          ...formData,
                          coordinates: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                          }
                        });
                      },
                      (error) => {
                        alert('Could not retrieve current location.');
                      }
                    );
                  } else {
                    alert('Geolocation is not supported by your browser.');
                  }
                }}
                className="w-full py-2.5 bg-white hover:bg-brand-background text-brand-secondary font-bold text-[10px] uppercase tracking-widest border border-border-default rounded-xl transition-all"
              >
                Detect Current Location
              </button>
            </div>
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
            <h3 className="text-2xl font-headings font-bold text-center">Manage Photos</h3>
            
            {/* Existing Photos */}
            {existingPhotos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Existing Photos ({existingPhotos.length})</p>
                <div className="grid grid-cols-4 gap-2">
                  {existingPhotos.map((photoUrl, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border-default">
                      <img src={photoUrl} alt="existing" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeExistingPhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/75 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photos */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Upload New Photos ({photos.length})</p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border-default">
                    <img src={URL.createObjectURL(photo)} alt="upload" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeNewPhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/75 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {(existingPhotos.length + photos.length) < 8 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border-default flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-white transition-all text-text-muted">
                    <ImageIcon size={20} />
                    <span className="text-[9px] font-bold uppercase">Add Photo</span>
                    <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                )}
              </div>
            </div>
            
            <p className="text-center text-[10px] text-text-muted italic pt-2">Total limit is 8 photos. High quality images get 3x more inquiries.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-brand-secondary mb-4" size={48} />
        <p className="font-headings font-medium italic text-text-muted">Fetching sanctuary details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-8">
        <header className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-text-muted hover:text-brand-primary">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-headings font-bold text-brand-primary">Edit Sanctuary</h2>
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
              <Button onClick={handleSubmit} loading={saving} className="px-10 btn-cta">
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing;
