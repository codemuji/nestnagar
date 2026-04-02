import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  LogOut, 
  Edit2, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Camera,
  CheckCircle2,
  X,
  Smartphone,
  Info
} from 'lucide-react';
import { logout, updateUser } from '../../auth/store/authSlice';
import { logoutUser, updateMe } from '../../auth/services/authService';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import BottomNav from '../../../components/BottomNav';

const ProfileOption = ({ icon: Icon, label, onClick, color = 'text-brand-primary' }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-brand-background transition-all group border-b border-border-light/30 last:border-0"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-text-muted group-hover:text-brand-secondary transition-colors">
        <Icon size={20} />
      </div>
      <span className={`font-bold text-sm ${color}`}>{label}</span>
    </div>
    <ChevronRight size={18} className="text-text-muted group-hover:translate-x-1 transition-transform" />
  </button>
);

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of your sanctuary?')) {
      try {
        await logoutUser();
        dispatch(logout());
        navigate('/login');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateMe({ name: formData.name });
      dispatch(updateUser(res.user));
      setIsEditModalOpen(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-lg text-white">
            <User size={18} />
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tighter uppercase">My Profile</h1>
        </div>
        <button className="p-2 text-text-secondary hover:bg-white rounded-full transition-all">
          <Settings size={22} />
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}&background=628141&color=fff&size=128`} 
                alt="profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-0 right-0 bg-brand-secondary text-white p-2 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <Camera size={18} />
            </button>
          </div>
          <h2 className="text-3xl font-headings font-bold text-brand-primary tracking-tight">{user?.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-secondary/20">
              {user?.role}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
              <Smartphone size={12} /> {user?.phone}
            </span>
          </div>
        </section>

        {/* Stats Grid (Contextual) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-border-light/50 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Profile Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-brand-primary">Verified</span>
              <CheckCircle2 size={18} className="text-brand-accent" />
            </div>
          </div>
          <div className="bg-brand-secondary/5 p-5 rounded-[1.5rem] shadow-sm border border-brand-secondary/10 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em]">Member Since</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-bold text-brand-secondary">2026</span>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-[0.3em] px-2">Account Hub</h3>
          <div className="bg-white rounded-[2rem] shadow-card overflow-hidden border border-border-light/50">
            <ProfileOption icon={User} label="Personal Information" onClick={() => setIsEditModalOpen(true)} />
            <ProfileOption icon={Shield} label="Security & Verification" onClick={() => {}} />
            <ProfileOption icon={Info} label="Preferences" onClick={() => user?.role === 'seeker' && navigate('/onboarding')} />
            <ProfileOption icon={HelpCircle} label="Help & Support" onClick={() => {}} />
          </div>
        </section>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full mt-10 flex items-center justify-center gap-3 p-5 bg-brand-error/10 text-brand-error rounded-[1.5rem] font-bold hover:bg-brand-error/20 transition-all active:scale-95 border border-brand-error/20"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>

        <p className="text-center mt-12 text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-50">
          NestNagar v1.0.4 (Emerald)
        </p>
      </main>

      <BottomNav />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-headings font-bold text-brand-primary">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-brand-background rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                icon={User}
              />
              <Input 
                label="Phone Number" 
                value={formData.phone} 
                disabled
                icon={Smartphone}
                className="opacity-50"
              />
              <p className="text-[10px] text-text-muted italic px-1">Phone number is verified and cannot be changed.</p>
              
              <Button type="submit" loading={loading} className="w-full mt-4">
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
