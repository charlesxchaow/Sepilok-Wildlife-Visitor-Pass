
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, Clock, ArrowRight, CheckCircle2, Leaf, Info, Loader2 } from 'lucide-react';
import { ATTRACTIONS, TIME_SLOTS, WHATSAPP_NUMBER, WEBHOOK_URL } from './constants';
import { AttractionType, BookingDetails } from './types';
import { getWildlifeFact } from './services/geminiService';

const App: React.FC = () => {
  const [booking, setBooking] = useState<BookingDetails>({
    attractionId: 'ORANGUTAN',
    date: new Date().toISOString().split('T')[0],
    timeSlot: TIME_SLOTS[0],
    adultCount: 1,
    childCount: 0
  });

  const [wildlifeFact, setWildlifeFact] = useState<string>('');
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
    const fetchFact = async () => {
      setLoadingFact(true);
      const fact = await getWildlifeFact(booking.attractionId);
      setWildlifeFact(fact);
      setLoadingFact(false);
    };
    fetchFact();
  }, [booking.attractionId]);

  const handleBookingSubmit = async () => {
    setIsSubmitting(true);
    
    // Prepare data for Google Sheets
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
      // POST to Google Sheets Webhook
      // Note: use 'no-cors' if the script doesn't handle CORS, 
      // though 'cors' is preferred if the script is set up for it.
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Booking logged to Google Sheets');
    } catch (error) {
      console.error('Error logging to Google Sheets:', error);
      // We still proceed to WhatsApp even if logging fails
    }

    // Prepare WhatsApp Message
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
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="relative h-64 md:h-80 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1544991277-226e6d782723?auto=format&fit=crop&q=80&w=1200" 
          alt="Rainforest Canopy" 
          className="w-full h-full object-cover brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="text-emerald-400 fill-emerald-400" size={20} />
            <span className="uppercase tracking-widest text-xs font-semibold">Wild Borneo</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-3">Sepilok Wildlife</h1>
          <p className="text-slate-200 max-w-md text-sm md:text-base">Experience the magic of Borneo's most iconic species in their natural jungle home.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form and Selection */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Attraction Selector */}
            <section className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Choose Your Experience
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ATTRACTIONS.map((attraction) => (
                  <button
                    key={attraction.id}
                    disabled={isSubmitting}
                    onClick={() => setBooking(prev => ({ ...prev, attractionId: attraction.id }))}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 border-2 text-left disabled:opacity-50 ${
                      booking.attractionId === attraction.id 
                        ? 'border-emerald-500 ring-4 ring-emerald-50' 
                        : 'border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={attraction.image} 
                        alt={attraction.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-800">{attraction.name}</h3>
                        {booking.attractionId === attraction.id && (
                          <CheckCircle2 className="text-emerald-500" size={18} />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {attraction.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Date and Time */}
            <section className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Schedule Your Visit
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} /> Select Date
                  </label>
                  <input 
                    type="date"
                    disabled={isSubmitting}
                    min={new Date().toISOString().split('T')[0]}
                    value={booking.date}
                    onChange={(e) => setBooking(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> Preferred Entry Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_SLOTS.map(slot => (
                      <button
                        key={slot}
                        disabled={isSubmitting}
                        onClick={() => setBooking(prev => ({ ...prev, timeSlot: slot }))}
                        className={`p-2 text-sm rounded-lg border transition-all disabled:opacity-50 ${
                          booking.timeSlot === slot
                            ? 'bg-emerald-500 text-white border-emerald-500 font-medium'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
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
            <section className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                <Leaf size={80} className="text-emerald-800" />
              </div>
              <div className="relative z-10">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                  <Info size={18} />
                  Wilderness Insider
                </h3>
                <div className="min-h-[40px]">
                  {loadingFact ? (
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-75" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-150" />
                    </div>
                  ) : (
                    <p className="text-emerald-700 italic text-sm md:text-base">
                      "{wildlifeFact}"
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Checkout Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Users size={20} className="text-emerald-600" />
                  Visitor Count
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">Adult</p>
                      <p className="text-xs text-slate-500">RM {selectedAttraction.prices.adult} per person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('adult', -1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-30"
                      >-</button>
                      <span className="font-bold w-4 text-center">{booking.adultCount}</span>
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('adult', 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-30"
                      >+</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">Child</p>
                      <p className="text-xs text-slate-500">RM {selectedAttraction.prices.child} per person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('child', -1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-30"
                      >-</button>
                      <span className="font-bold w-4 text-center">{booking.childCount}</span>
                      <button 
                        disabled={isSubmitting}
                        onClick={() => updateCount('child', 1)}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-30"
                      >+</button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-500">Grand Total</span>
                    <span className="text-2xl font-black text-emerald-600">RM {totalPrice}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right uppercase tracking-wider font-semibold">Prices in Malaysian Ringgit</p>
                </div>

                <button 
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:bg-emerald-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.415-8.414z"/>
                      </svg>
                      Confirm & Book via WA
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-[11px] text-slate-400">
                  By clicking, your booking will be recorded and sent to our team.
                </p>
              </div>

              {/* Park Info Card */}
              <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  Visitor Information
                </h3>
                <ul className="text-sm space-y-3 text-slate-300">
                  <li className="flex justify-between">
                    <span>Feeding Time 1</span>
                    <span className="text-emerald-400 font-semibold">10:00 AM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Feeding Time 2</span>
                    <span className="text-emerald-400 font-semibold">03:00 PM</span>
                  </li>
                  <li className="pt-2 border-t border-slate-700 text-xs text-slate-400">
                    We recommend arriving at least 30 minutes before feeding times.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between md:hidden z-50">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p>
          <p className="text-xl font-black text-emerald-600 leading-none">RM {totalPrice}</p>
        </div>
        <button 
          onClick={handleBookingSubmit}
          disabled={isSubmitting}
          className="bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Book Now'}
          {!isSubmitting && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
};

export default App;
