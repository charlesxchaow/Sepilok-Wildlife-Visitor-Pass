
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
  CloudRain,
  User
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
    childCount: 0,
    visitorName: ''
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
      try {
        const [fact, tip] = await Promise.all([
          getWildlifeFact(booking.attractionId),
          getTravelTip(booking.date)
        ]);
        setWildlifeFact(fact);
        setTravelTip(tip);
      } catch (err) {
        console.error("Error fetching AI data", err);
      } finally {
        setLoadingFact(false);
      }
    };
    fetchData();
  }, [booking.attractionId, booking.date]);

  const handleAttractionClick = (attractionId: AttractionType) => {
    setBooking(prev => ({ ...prev, attractionId }));
  };

  const handleBookingSubmit = async () => {
    if (!booking.visitorName.trim()) {
      alert("Please enter your name to proceed.");
      return;
    }

    setIsSubmitting(true);
    
    const formData = {
      timestamp: new Date().toLocaleString(),
      visitorName: booking.visitorName,
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
👤 Name: ${booking.visitorName}
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
      [`${type}Count`]: Math.max(type === 'adult' ? 1 : 0, (prev[`${type}Count` as keyof BookingDetails] as number) + delta)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 selection:bg-emerald-100 transition-colors duration-500">
      {/* Header with Overlay Gradient */}
      <header className="relative h-72 md:h-96 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=1600" 
          alt="Sepilok Rainforest" 
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-slate-50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center pb-12">
          <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md py-1.5 px-4 rounded-full border border-white/20 animate-fade-in">
            <Leaf className="text-emerald-400 fill-emerald-400" size={16} />
            <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Conservation Gateway</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl mb-4 tracking-tight animate-slide-up">Sepilok Pass</h1>
          <p className="text-slate-200 max-w-xl text-sm md:text-lg font-light leading-relaxed opacity-90">
            Witness Borneo's rare wildlife in their sanctuary. Your visit directly funds the rehabilitation of orangutans and sun bears.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-20 md:-mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Selection & Information */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Experience Selection */}
            <section className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <span className="bg-emerald-600 text-white w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-200">1</span>
                  Choose Experience
                </h2>
                <div className="hidden sm:flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ATTRACTIONS.map((attraction) => (
                  <button
                    key={attraction.id}
                    disabled={isSubmitting}
                    onClick={() => handleAttractionClick(attraction.id)}
                    className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 border-2 text-left disabled:opacity-50 ${
                      booking.attractionId === attraction.id 
                        ? 'border-emerald-500 ring-4 ring-emerald-50 bg-emerald-50/20' 
                        : 'border-slate-100 hover:border-emerald-200 bg-white'
                    }`}
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={attraction.image} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-bold text-sm transition-colors ${booking.attractionId === attraction.id ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {attraction.name}
                        </h3>
                        {booking.attractionId === attraction.id && (
                          <CheckCircle2 className="text-emerald-600 shrink-0" size={16} />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                        {attraction.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-xs font-black text-emerald-600">RM {attraction.prices.adult}</span>
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

            {/* Visit Details */}
            <section className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-slate-200/40 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <span className="bg-emerald-600 text-white w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-200">2</span>
                  Visit Details
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} className="text-emerald-600" /> 
                      Lead Visitor Name
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. John Doe"
                      disabled={isSubmitting}
                      value={booking.visitorName}
                      onChange={(e) => setBooking(prev => ({ ...prev, visitorName: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all text-slate-700 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-600" /> 
                      Visit Date
                    </label>
                    <input 
                      type="date"
                      disabled={isSubmitting}
                      min={new Date().toISOString().split('T')[0]}
                      value={booking.date}
                      onChange={(e) => setBooking(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all text-slate-700 font-medium cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <CloudRain size={18} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Borneo Travel Tip</p>
                      <p className="text-xs text-amber-800/80 leading-snug">
                        {loadingFact ? 'Consulting local guides...' : travelTip}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14} className="text-emerald-600" /> 
                    Entry Timeslot
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        disabled={isSubmitting}
                        onClick={() => setBooking(prev => ({ ...prev, timeSlot: slot }))}
                        className={`p-4 text-sm rounded-2xl border-2 transition-all font-bold ${
                          booking.timeSlot === slot
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-emerald-200 hover:text-emerald-600 hover:bg-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 mt-4">
                    <p className="text-[10px] text-emerald-800 font-medium">Feeding times are usually at 10 AM and 3 PM. We recommend arriving 30 minutes early.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Insights Section */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden text-white shadow-2xl transition-all hover:shadow-emerald-900/10">
              <div className="absolute -top-10 -right-10 opacity-5 rotate-12">
                <Leaf size={240} className="text-emerald-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                    <Leaf size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl tracking-tight">Wildlife Wisdom</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold">Powered by Gemini AI</p>
                  </div>
                </div>
                <div className="min-h-[80px] flex items-center">
                  {loadingFact ? (
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '0ms'}} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '150ms'}} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  ) : (
                    <p className="text-slate-300 italic text-xl leading-relaxed font-light">
                      "{wildlifeFact}"
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Pass & Checkout */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              
              {/* Digital Pass Visualizer */}
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-br from-emerald-600 to-teal-400 rounded-[2.8rem] blur opacity-20 group-hover:opacity-30 transition duration-700"></div>
                <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="bg-emerald-600 p-8 text-white">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
                        <Leaf size={22} fill="currentColor" />
                        Sepilok Pass
                      </div>
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Validated Visitor</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70">Guest Name</h4>
                      <p className="text-2xl font-serif truncate min-h-[2rem]">
                        {booking.visitorName || 'Guest Visitor'}
                      </p>
                    </div>
                  </div>

                  {/* Cutout Line */}
                  <div className="relative h-6 flex items-center px-4 bg-white">
                    <div className="absolute -left-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
                    <div className="absolute -right-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
                    <div className="w-full border-t-2 border-dashed border-slate-100"></div>
                  </div>

                  <div className="p-8 pt-4 space-y-8">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Selected Experience</p>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{selectedAttraction.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Entry Schedule</p>
                        <p className="text-sm font-bold text-slate-800">{booking.timeSlot}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Booking Date</p>
                        <p className="text-sm font-bold text-slate-800">
                          {booking.date ? new Date(booking.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select Date'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Sanctuary Location</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          <MapPin size={12} className="text-emerald-500" />
                          Sandakan, Sabah
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-6">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Pay on Arrival</p>
                        <p className="text-3xl font-black text-emerald-600">RM {totalPrice}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <QrCode size={56} className="text-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Count & Final Step */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/40 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <span className="bg-emerald-600 text-white w-9 h-9 rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-emerald-200">3</span>
                    Review Pass
                  </h2>
                </div>
                
                <div className="space-y-4 mb-8">
                  {[
                    { label: 'Adults', type: 'adult', count: booking.adultCount, price: selectedAttraction.prices.adult },
                    { label: 'Children', type: 'child', count: booking.childCount, price: selectedAttraction.prices.child }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/50">
                      <div>
                        <p className="font-bold text-slate-800">{item.label}</p>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">RM {item.price} / person</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          disabled={isSubmitting}
                          onClick={() => updateCount(item.type as any, -1)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                        >-</button>
                        <span className="font-bold w-4 text-center text-lg">{item.count}</span>
                        <button 
                          disabled={isSubmitting}
                          onClick={() => updateCount(item.type as any, 1)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:border-emerald-500 hover:shadow-md transition-all active:scale-90 disabled:opacity-30 shadow-sm"
                        >+</button>
                      </div>
                    </div>
                  ))}
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
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.415-8.414z"/>
                      </svg>
                      Book via WhatsApp
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    No Prepayment
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Official Rates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 p-5 flex items-center justify-between md:hidden z-50 animate-slide-up shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Pay on Arrival</p>
          <p className="text-2xl font-black text-emerald-600 leading-none">RM {totalPrice}</p>
        </div>
        <button 
          onClick={handleBookingSubmit}
          disabled={isSubmitting}
          className="bg-emerald-600 text-white h-14 px-8 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Book Visit'}
          {!isSubmitting && <ArrowRight size={20} />}
        </button>
      </div>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
