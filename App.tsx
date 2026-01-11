
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Leaf, 
  Info, 
  Loader2, 
  ExternalLink,
  QrCode,
  MapPin,
  CloudRain
} from 'lucide-react';
import { ATTRACTIONS, TIME_SLOTS, WHATSAPP_NUMBER, WEBHOOK_URL } from './constants';
import { AttractionType, BookingDetails } from './types';
import { getWildlifeFact, getTravelTip } from './services/geminiService';

const App: React.FC = () => {
  const [booking, setBooking] = useState<BookingDetails>({
    attractionId: 'ORANGUTAN',
    date: new Date().toISOString().split('T')[0],
    timeSlot: TIME_SLOTS[0],
    adultCount: 1,
    childCount: 0
  });

  const [wildlifeFact, setWildlifeFact] = useState<string>('');
  const [travelTip, setTravelTip] = useState<string>('');
  const [loadingFact, setLoadingFact] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedAttraction = useMemo(() => 
    ATTRACTIONS.find(a => a.id === booking.attractionId)!,
    [booking.attractionId]
  );

  const totalPrice = useMemo(() => {
    return (booking.adultCount * selectedAttraction.prices.adult) + 
           (booking.childCount * selectedAttraction.prices.child);
  }, [booking.adultCount, booking.childCount, selectedAttraction]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFact(true);
      const [fact, tip] = await Promise.all([
        getWildlifeFact(booking.attractionId),
        getTravelTip(booking.date)
      ]);
      setWildlifeFact(fact);
      setTravelTip(tip);
      setLoadingFact(false);
    };
    fetchData();
  }, [booking.attractionId, booking.date]);

  const handleAttractionClick = (attractionId: AttractionType) => {
    setBooking(prev => ({ ...prev, attractionId }));
  };

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    
    const formData = {
      timestamp: new Date().toLocaleString(),
      attraction: selectedAttraction.name,
      date: booking.date,
      timeSlot: booking.timeSlot,
      adults: booking.adultCount,
      children: booking.childCount,
      totalPrice: totalPrice,
      status: 'Pending WhatsApp Confirmation'
    };

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Error logging booking:', error);
    }

    const message = `Hello Sepilok Admin! I would like to book a visit:
----------------------------
🌿 Attraction: ${selectedAttraction.name}
📅 Date: ${booking.date}
🕐 Time: ${booking.timeSlot}
👥 Visitors: ${booking.adultCount} Adult(s), ${booking.childCount} Child(ren)
💰 Total: RM ${totalPrice}
----------------------------
Please confirm availability. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    
    setIsSubmitting(false);
  };

  const updateCount = (type: 'adult' | 'child', delta: number) => {
    setBooking(prev => ({
      ...prev,
      [`${type}Count`]: Math.max(type === 'adult' ? 1 : 0, prev[`${type}Count` as keyof BookingDetails] as number + delta)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 selection:bg-emerald-100">
      {/* Header with Overlay Gradient */}
      <header className="relative h-72 md:h-96 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=1600" 
          alt="Sepilok Rainforest" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center pb-12">
          <div className="flex items-center gap-2 mb-3 bg-white/10 backdrop-blur-md py-1 px-3 rounded-full border border-white/20">
            <Leaf className="text-emerald-400 fill-emerald-400" size={16} />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Official Conservation Partner</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-4 tracking-tight">Sepilok Wildlife</h1>
          <p className="text-slate-200 max-w-lg text-sm md:text-lg font-light leading-relaxed">
            Your gateway to the majestic orangutans and sun bears of Sabah. Secure your visit and support local conservation.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form and Selection */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Attraction Selector */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <span className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-emerald-200">1</span>
                  Choose Experience
                </h2>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Step 1 of 3</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ATTRACTIONS.map((attraction) => (
                  <button
                    key={attraction.id}
                    disabled={isSubmitting}
                    onClick={() => handleAttractionClick(attraction.id)}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500 border-2 text-left disabled:opacity-50 ${
                      booking.attractionId === attraction.id 
                        ? 'border-emerald-500 ring-8 ring-emerald-50 bg-emerald-50/30' 
                        : 'border-slate-100 hover:border-emerald-200 hover:shadow-lg'
                    }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={attraction.image} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-bold transition-colors ${booking.attractionId === attraction.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {attraction.name}
                        </h3>
                        {booking.attractionId === attraction.id && (
                          <div className="bg-emerald-500 rounded-full p-0.5">
                            <CheckCircle2 className="text-white" size={14} />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {attraction.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">RM {attraction.prices.adult}</span>
                        {attraction.externalUrl && (
                          <a 
                            href={attraction.externalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                          >
                            <Info size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Date and Time */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <span className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-emerald-200">2</span>
                  Visit Schedule
                </h2>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Step 2 of 3</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Calendar size={18} className="text-emerald-600" /> 
                    Selection Date
                  </label>
                  <input 
                    type="date"
                    disabled={isSubmitting}
                    min={new Date().toISOString().split('T')[0]}
                    value={booking.date}
                    onChange={(e) => setBooking(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all disabled:opacity-50 text-slate-700 font-medium cursor-pointer"
                  />
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                    <CloudRain size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Jungle Weather Tip</p>
                      <p className="text-xs text-amber-800 leading-tight">
                        {loadingFact ? 'Analyzing sky...' : travelTip}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Clock size={18} className="text-emerald-600" /> 
                    Entry Timeslot
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        disabled={isSubmitting}
                        onClick={() => setBooking(prev => ({ ...prev, timeSlot: slot }))}
                        className={`p-3 text-sm rounded-xl border-2 transition-all font-semibold disabled:opacity-50 ${
                          booking.timeSlot === slot
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100'
                            : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-200 hover:text-emerald-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Wildlife Guide - AI Insight */}
            <section className="bg-slate-900 rounded-3xl p-8 border border-slate-800 relative overflow-hidden text-white shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <Leaf size={120} className="text-emerald-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/20 p-2 rounded-lg">
                    <Info size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight">Wildlife Whisperer</h3>
                </div>
                <div className="min-h-[60px] flex items-center">
                  {loadingFact ? (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <p className="text-slate-300 italic text-lg leading-relaxed font-light">
                      "{wildlifeFact}"
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Digital Pass Preview & Checkout */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 space-y-6">
              
              {/* Digital Pass Preview */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="bg-emerald-600 p-6 text-white text-center">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5 font-serif text-lg font-bold">
                        <Leaf size={18} fill="currentColor" />
                        Sepilok Pass
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Digital Preview</span>
                    </div>
                    <div className="py-2">
                      <h4 className="text-xs uppercase tracking-[0.3em] font-bold opacity-80 mb-1">Holder of Admission</h4>
                      <p className="text-2xl font-serif">{booking.adultCount + booking.childCount} Visitor(s)</p>
                    </div>
                  </div>

                  {/* Dotted Line Divider */}
                  <div className="relative h-4 flex items-center px-4">
                    <div className="absolute -left-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100"></div>
                    <div className="absolute -right-2 w-4 h-4 bg-slate-50 rounded-full border border-slate-100"></div>
                    <div className="w-full border-t-2 border-dashed border-slate-100"></div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Experience</p>
                        <p className="text-sm font-bold text-slate-800">{selectedAttraction.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Entry Time</p>
                        <p className="text-sm font-bold text-slate-800">{booking.timeSlot}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date</p>
                        <p className="text-sm font-bold text-slate-800">{new Date(booking.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Location</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-500" />
                          Sandakan, Sabah
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-50 pt-6">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Cost</p>
                        <p className="text-3xl font-black text-emerald-600">RM {totalPrice}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <QrCode size={48} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visitor Count Controls */}
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="bg-emerald-600 text-white w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-lg shadow-emerald-200">3</span>
                    Review Details
                  </h2>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/50">
                    <div>
                      <p className="font-bold text-slate-800">Adults</p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">RM {selectedAttraction.prices.adult} / person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('adult', -1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                      >-</button>
                      <span className="font-bold w-4 text-center text-lg">{booking.adultCount}</span>
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('adult', 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                      >+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/50">
                    <div>
                      <p className="font-bold text-slate-800">Children</p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">RM {selectedAttraction.prices.child} / person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('child', -1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                      >-</button>
                      <span className="font-bold w-4 text-center text-lg">{booking.childCount}</span>
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('child', 1)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                      >+</button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting}
                  className="group w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:bg-emerald-400 disabled:cursor-not-allowed text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Securing Pass...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current transition-transform group-hover:scale-110" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.415-8.414z"/>
                      </svg>
                      Instant WhatsApp Booking
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Secure Transaction
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Conservation Fund
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 flex items-center justify-between md:hidden z-50">
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Pay on Arrival</p>
          <p className="text-2xl font-black text-emerald-600 leading-none">RM {totalPrice}</p>
        </div>
        <button 
          onClick={handleBookingSubmit}
          disabled={isSubmitting}
          className="bg-emerald-600 text-white py-4 px-8 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Book Now'}
          {!isSubmitting && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
};

export default App;
