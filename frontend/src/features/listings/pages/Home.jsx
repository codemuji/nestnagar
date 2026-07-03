import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Bell, Sparkles, Loader2, MapPin, Plus, Filter, X } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import ListingCardSkeleton from '../components/ListingCardSkeleton';
import BottomNav from '../../../components/BottomNav';
import FilterDrawer from '../components/FilterDrawer';
import { usePersonalisedListings } from '../../../hooks/useQueries';
import { startConversation } from '../../chat/services/chatService';
import { useLocalitySearch } from '../../../hooks/useLocalitySearch';

const Home = ({ unread, setUnread }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    price: { min: 0, max: 50000 },
    types: [],
    amenities: [],
    genderAllowed: 'any',
    verifiedOnly: false,
  });

  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search autocomplete hook
  const {
    query: searchLocality,
    setQuery: setSearchLocality,
    suggestions,
    recentSearches,
    loading: suggestionsLoading,
    showDropdown,
    setShowDropdown,
    handleSelect,
    clearRecent,
  } = useLocalitySearch();

  const dropdownRef = useRef(null);

  // URL sync - initialize filters from URL on mount
  useEffect(() => {
    const urlFilters = {
      price: {
        min: Number(searchParams.get('minPrice')) || 0,
        max: Number(searchParams.get('maxPrice')) || 50000,
      },
      types: searchParams.get('types')?.split(',').filter(Boolean) || [],
      amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
      genderAllowed: searchParams.get('gender') || 'any',
      verifiedOnly: searchParams.get('verified') === 'true',
    };
    setFilters(urlFilters);

    // Initialize search locality and category from URL
    const urlLocality = searchParams.get('locality');
    if (urlLocality) setSearchLocality(urlLocality);
    
    const urlCategory = searchParams.get('category');
    if (urlCategory && ['All', 'Rooms', 'PGs', 'Full Flats'].includes(urlCategory)) {
      setActiveCategory(urlCategory);
    }
  }, []); // Run once on mount

  // Build query params for React Query
  const queryParams = React.useMemo(() => {
    const params = {};
    if (searchLocality) params.locality = searchLocality;
    if (activeCategory !== 'All') {
      const categoryMap = {
        'Rooms': 'single-room',
        'PGs': 'pg',
        'Full Flats': 'flat'
      };
      params.type = categoryMap[activeCategory] || activeCategory.toLowerCase();
    }
    if (filters.price.min > 0) params.minPrice = filters.price.min;
    if (filters.price.max < 50000) params.maxPrice = filters.price.max;
    if (filters.types.length > 0) params.types = filters.types.join(',');
    if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
    if (filters.genderAllowed !== 'any') params.genderAllowed = filters.genderAllowed;
    if (filters.verifiedOnly) params.verifiedOnly = 'true';
    return params;
  }, [searchLocality, activeCategory, filters]);

  // React Query for listings
  const { 
    data: listingsData, 
    isLoading, 
    isFetching,
    error 
  } = usePersonalisedListings(queryParams);

  const listings = listingsData?.listings || [];
  const feedMessage = listingsData?.feedMessage || '';

  // Sync filters to URL whenever they change
  const syncFiltersToUrl = useCallback((newFilters, newLocality, newCategory) => {
    const params = new URLSearchParams();
    
    if (newLocality) params.set('locality', newLocality);
    if (newCategory && newCategory !== 'All') params.set('category', newCategory);
    if (newFilters.price.min > 0) params.set('minPrice', newFilters.price.min);
    if (newFilters.price.max < 50000) params.set('maxPrice', newFilters.price.max);
    if (newFilters.types.length > 0) params.set('types', newFilters.types.join(','));
    if (newFilters.amenities.length > 0) params.set('amenities', newFilters.amenities.join(','));
    if (newFilters.genderAllowed !== 'any') params.set('gender', newFilters.genderAllowed);
    if (newFilters.verifiedOnly) params.set('verified', 'true');

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Update filters and sync to URL
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(prev => {
      const resolvedFilters = typeof newFilters === 'function' ? newFilters(prev) : newFilters;
      syncFiltersToUrl(resolvedFilters, searchLocality, activeCategory);
      return resolvedFilters;
    });
  }, [searchLocality, activeCategory, syncFiltersToUrl]);

  // Handle filter drawer apply
  const handleFiltersApply = useCallback(() => {
    setFilterDrawerOpen(false);
  }, []);

  const handleChat = async (listingId) => {
    try {
      const conversation = await startConversation('listing', listingId, "Hi, I'm interested in this property.");
      navigate(`/chat/${conversation._id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    syncFiltersToUrl(filters, searchLocality, cat);
  }, [filters, searchLocality, syncFiltersToUrl]);

  const handleSearchSelect = useCallback((locality) => {
    setSearchLocality(locality);
    syncFiltersToUrl(filters, locality, activeCategory);
  }, [filters, activeCategory, syncFiltersToUrl]);

  // Categories and search bindings end above
  const categories = ['All', 'Rooms', 'PGs', 'Full Flats'];

  return (
    <div className="min-h-screen bg-brand-background pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 bg-brand-background/80 backdrop-blur-md z-50 border-b border-border-light/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary flex items-center justify-center rounded-lg text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="text-xl font-bold text-brand-primary tracking-tighter uppercase">NestNagar</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setUnread(false);
              navigate('/chat');
            }}
            className="relative p-2 text-text-secondary hover:bg-white rounded-full transition-all"
          >
            <Bell size={22} />
            {unread && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-cta rounded-full border-2 border-brand-background animate-pulse"></span>
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-brand-accent/20 border-2 border-brand-accent overflow-hidden">
            <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.name}`} alt="profile" />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Editorial Welcome */}
        <section className="space-y-2">
          <h2 className="text-4xl font-headings font-bold text-brand-primary leading-tight tracking-tight">
            Find your next <br />
            <span className="text-brand-secondary italic">sanctuary.</span>
          </h2>
          {feedMessage && !searchLocality && activeCategory === 'All' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary/10 text-brand-secondary rounded-full text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} />
              {feedMessage}
            </div>
          )}
        </section>

        {/* Search & Filter */}
        <section className="sticky top-20 z-40 py-2">
          <div className="flex items-center gap-3">
            <div className="relative flex-grow group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-secondary transition-colors" size={20} />
              <input 
                ref={dropdownRef}
                className="input-field pl-12 h-14 bg-white border-none shadow-sm group-focus-within:shadow-md transition-all"
                placeholder="Search by locality..."
                type="text"
                value={searchLocality}
                onChange={(e) => setSearchLocality(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                autoComplete="off"
                aria-autocomplete="list"
                aria-controls="locality-suggestions"
                aria-expanded={showDropdown && (suggestions.length > 0 || recentSearches.length > 0)}
              />
              
              {suggestionsLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary animate-spin" size={20} />
              )}
              
              {searchLocality && !suggestionsLoading && (
                <button
                  onClick={() => setSearchLocality('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-brand-secondary transition-colors p-1"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}

              {/* Autocomplete Dropdown */}
              {(showDropdown && (suggestions.length > 0 || recentSearches.length > 0)) && (
                <div
                  id="locality-suggestions"
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-border-light/50 overflow-hidden z-50 animate-in fade-in-20 duration-200"
                  role="listbox"
                >
                  {recentSearches.length > 0 && (
                    <div className="p-3 border-b border-border-light/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Recent Searches</span>
                        {recentSearches.length > 1 && (
                          <button
                            onClick={clearRecent}
                            className="text-[10px] font-bold text-brand-secondary hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => handleSearchSelect(loc)}
                            className="px-3 py-1.5 bg-brand-background text-text-secondary text-xs font-medium rounded-full hover:bg-brand-secondary/10 hover:text-brand-secondary transition-all"
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {suggestions.length > 0 && (
                    <div className="p-2 max-h-60 overflow-y-auto">
                      {suggestions.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => handleSearchSelect(loc)}
                          className="w-full px-4 py-3 text-left text-text-primary font-medium hover:bg-brand-background transition-colors rounded-xl flex items-center gap-3"
                          role="option"
                        >
                          <MapPin size={18} className="text-brand-secondary flex-shrink-0" />
                          <span className="truncate">{loc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => setFilterDrawerOpen(true)}
              className="p-4 bg-brand-primary text-white rounded-2xl shadow-lg active:scale-95 transition-transform relative"
            >
              <SlidersHorizontal size={22} />
              {(filters.price.min > 0 || filters.price.max < 50000 || filters.types.length > 0 || filters.amenities.length > 0 || filters.genderAllowed !== 'any' || filters.verifiedOnly) && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-cta text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {filters.types.length + filters.amenities.length + (filters.price.min > 0 ? 1 : 0) + (filters.price.max < 50000 ? 1 : 0) + (filters.genderAllowed !== 'any' ? 1 : 0) + (filters.verifiedOnly ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* Categories */}
        <section className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 py-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-brand-secondary text-white shadow-md' 
                  : 'bg-white text-text-muted border border-border-default/50 hover:border-brand-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Listings Feed */}
        <section>
          {(isLoading || isFetching) && listings.length === 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ListingCardSkeleton key={i} compact />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {listings.map((listing) => (
                listing?._id ? (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                  />
                ) : null
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-border-light">
              <div className="w-20 h-20 mx-auto mb-6 bg-brand-background/50 rounded-full flex items-center justify-center">
                <MapPin size={32} className="text-brand-secondary/50" />
              </div>
              <h3 className="text-xl font-headings font-bold text-brand-primary mb-2">
                No listings in {searchLocality || 'this area'}
              </h3>
              <p className="text-text-muted mb-6 max-w-xs mx-auto">
                {searchLocality
                  ? `We couldn't find any homes in "${searchLocality}". Try a nearby locality or clear your search.`
                  : 'Your personalized feed is empty. Adjust your filters or explore other areas.'}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {searchLocality && (
                  <button
                    onClick={() => setSearchLocality('')}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Filter size={16} />
                    Clear search
                  </button>
                )}
                <button
                  onClick={() => setActiveCategory('All')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={16} />
                  Explore all areas
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleFiltersApply}
        resultsCount={listings.length}
      />

      <BottomNav />
    </div>
  );
};

export default Home;
