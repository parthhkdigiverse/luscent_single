import React, { useState, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestimonialsSection = ({ productId }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [headerTitle, setHeaderTitle] = useState("REAL RESULTS, REAL PEOPLE");
  const [headerSubtitle, setHeaderSubtitle] = useState("Hear directly from our community about their skincare journey with Luscent Glow.");
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + '/api/content');
        if (res.ok) {
          const data = await res.json();
          if (data.video_testimonials_header) {
            setHeaderTitle(data.video_testimonials_header.title || "REAL RESULTS, REAL PEOPLE");
            setHeaderSubtitle(data.video_testimonials_header.subtitle || "Hear directly from our community about their skincare journey with Luscent Glow.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch content:", err);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const url = productId 
          ? `/api/testimonials?product_id=${productId}`
          : '/api/testimonials';
        const res = await fetch(import.meta.env.VITE_API_URL + url);
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.filter(t => t.is_active));
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    fetchTestimonials();
  }, [productId]);

  if (loading) return null;
  if (testimonials.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    if (activeIndex < testimonials.length - 1) setActiveIndex(activeIndex + 1);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const getVideoDetails = (url) => {
    const isYouTube = url && (url.includes('youtube.com') || url.includes('youtu.be'));
    let videoId = '';
    if (isYouTube) {
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('watch?v=')) videoId = url.split('watch?v=')[1].split('&')[0];
      else if (url.includes('youtube.com/shorts/')) videoId = url.split('youtube.com/shorts/')[1].split('?')[0];
    }
    return { isYouTube, videoId };
  };

  const renderThumbnail = (item, index) => {
    const { isYouTube, videoId } = getVideoDetails(item.video_url);
    if (!item.video_url) return null;
    
    if (isYouTube) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      return (
        <div 
          className="w-full h-full cursor-pointer relative group"
          onClick={() => setActiveIndex(index)}
        >
          <img src={thumbnailUrl} alt={item.title || "Video Testimonial"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors">
            {/* Play Button at Top Right */}
            <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            {/* Title at Bottom Left */}
            {item.title && (
              <div className="absolute bottom-4 left-4 right-4">
                <h4 className="text-white font-serif font-bold text-lg drop-shadow-md truncate">{item.title}</h4>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div 
        className="w-full h-full cursor-pointer relative group bg-black"
        onClick={() => setActiveIndex(index)}
      >
        <video src={item.video_url} className="w-full h-full object-cover opacity-80" preload="metadata" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors">
          <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
          {item.title && (
            <div className="absolute bottom-4 left-4 right-4">
              <h4 className="text-white font-serif font-bold text-lg drop-shadow-md truncate">{item.title}</h4>
            </div>
          )}
        </div>
      </div>
    );
  };

  const activeItem = activeIndex !== null ? testimonials[activeIndex] : null;
  const activeDetails = activeItem ? getVideoDetails(activeItem.video_url) : null;

  return (
    <section className="py-16 px-4 bg-brand-bg">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {headerTitle && (
            <h2 className="font-serif text-3xl md:text-4xl font-medium text-brand-dark mb-4">
              {headerTitle}
            </h2>
          )}
          {headerSubtitle && (
            <p className="text-sm md:text-base text-brand-grey max-w-2xl mx-auto leading-relaxed">
              {headerSubtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {testimonials.map((item, idx) => (
            <div 
              key={item.id} 
              className="bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative aspect-[9/16]"
            >
              {renderThumbnail(item, idx)}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Video Modal (Stories Style) */}
      {activeItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md">
          
          <button 
            onClick={() => setActiveIndex(null)} 
            className="absolute top-6 right-6 md:top-10 md:right-10 text-white/70 hover:text-white transition-colors p-2 z-50 bg-white/10 rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Left Arrow */}
          <button 
            onClick={handlePrev}
            className={`absolute left-2 sm:left-1/4 md:left-[28%] lg:left-[32%] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50 ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Main Video Carousel Container */}
          <div className="relative w-full h-full max-w-[1200px] mx-auto flex items-center justify-center overflow-hidden">
            
            {/* Left/Prev Item (Dimmed) */}
            {activeIndex > 0 && (
              <div 
                className="absolute left-4 md:left-12 lg:left-24 w-full max-w-[240px] md:max-w-xs aspect-[9/16] rounded-2xl overflow-hidden opacity-20 scale-90 blur-[2px] hidden sm:block pointer-events-none transition-all duration-500"
              >
                <img src={getVideoDetails(testimonials[activeIndex - 1].video_url).isYouTube ? `https://img.youtube.com/vi/${getVideoDetails(testimonials[activeIndex - 1].video_url).videoId}/hqdefault.jpg` : ''} alt="Previous" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Main Video Container */}
            <div className="h-[85vh] aspect-[9/16] relative rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black z-20">
              
              {/* Custom Top Left Icons (Mockup style) */}
              <div className="absolute top-4 left-4 z-50 flex gap-3 pointer-events-none opacity-80">
                 <div className="w-8 h-8 rounded-full border border-white/40 bg-black/40 backdrop-blur-md flex items-center justify-center">
                   <div className="flex gap-1"><div className="w-0.5 h-3 bg-white rounded-full"></div><div className="w-0.5 h-3 bg-white rounded-full"></div></div>
                 </div>
                 <div className="w-8 h-8 rounded-full border border-white/40 bg-black/40 backdrop-blur-md flex items-center justify-center">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                 </div>
              </div>

              {activeDetails.isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeDetails.videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3`}
                  title={activeItem.title || "Video Testimonial"}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] pointer-events-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={activeItem.video_url} 
                  controls={false}
                  autoPlay
                  className="w-full h-full object-cover"
                  playsInline
                />
              )}

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none flex flex-col justify-end">
                {activeItem.title && (
                  <h3 className="text-white font-serif font-bold text-xl mb-4 drop-shadow-md">
                    {activeItem.title}
                  </h3>
                )}
              </div>

            </div>

            {/* Right/Next Item (Dimmed) */}
            {activeIndex < testimonials.length - 1 && (
              <div 
                className="absolute right-4 md:right-12 lg:right-24 w-full max-w-[240px] md:max-w-xs aspect-[9/16] rounded-2xl overflow-hidden opacity-20 scale-90 blur-[2px] hidden sm:block pointer-events-none transition-all duration-500"
              >
                 <img src={getVideoDetails(testimonials[activeIndex + 1].video_url).isYouTube ? `https://img.youtube.com/vi/${getVideoDetails(testimonials[activeIndex + 1].video_url).videoId}/hqdefault.jpg` : ''} alt="Next" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            className={`absolute right-2 sm:right-1/4 md:right-[28%] lg:right-[32%] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50 ${activeIndex === testimonials.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={activeIndex === testimonials.length - 1}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;
