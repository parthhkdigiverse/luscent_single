import React, { useState, useEffect, useRef } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TestimonialsSection = ({ productId }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerTitle, setHeaderTitle] = useState("REAL RESULTS, REAL PEOPLE");
  const [headerSubtitle, setHeaderSubtitle] = useState("Hear directly from our community about their skincare journey with Luscent Glow.");
  const [activeIndex, setActiveIndex] = useState(null);
  const [resolvedUrl, setResolvedUrl] = useState(null);

  const videoRef = useRef(null);
  const navigate = useNavigate();

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

  const handleNext = (e) => {
    e.stopPropagation();
    if (activeIndex < testimonials.length - 1) setActiveIndex(activeIndex + 1);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (activeIndex > 0) setActiveIndex(activeIndex - 1);
  };

  const getVideoDetails = (url) => {
    if (!url) return { isYouTube: false, isInstagram: false, isGoogleDrive: false };

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    let videoId = '';
    if (isYouTube) {
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0].split('/')[0];
      } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('youtube.com/shorts/')[1].split('?')[0].split('/')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0].split('#')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0].split('/')[0];
      }
    }

    const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');
    let instaId = '';
    if (isInstagram) {
      if (url.includes('/reel/')) {
        instaId = url.split('/reel/')[1].split('/')[0].split('?')[0];
      } else if (url.includes('/p/')) {
        instaId = url.split('/p/')[1].split('/')[0].split('?')[0];
      } else if (url.includes('/reels/')) {
        instaId = url.split('/reels/')[1].split('/')[0].split('?')[0];
      }
    }

    const isGoogleDrive = url.includes('drive.google.com') || url.includes('docs.google.com');
    let driveId = '';
    if (isGoogleDrive) {
      if (url.includes('/file/d/')) {
        driveId = url.split('/file/d/')[1].split('/')[0].split('?')[0];
      } else if (url.includes('id=')) {
        driveId = url.split('id=')[1].split('&')[0];
      }
    }

    return { isYouTube, videoId, isInstagram, instaId, isGoogleDrive, driveId };
  };

  const getThumbnailUrl = (item) => {
    if (!item) return null;
    if (item.thumbnail_url) return item.thumbnail_url;
    if (item.thumbnail) return item.thumbnail;
    if (!item.video_url) return null;
    const { isYouTube, videoId, isInstagram, instaId, isGoogleDrive, driveId } = getVideoDetails(item.video_url);

    if (isYouTube && videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    if (isGoogleDrive && driveId) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      return `${baseUrl}/api/drive-thumbnail/${driveId}`;
    }
    if (isInstagram && instaId) return `https://www.instagram.com/p/${instaId}/media/?size=l`;
    return null;
  };

  const renderThumbnail = (item, index) => {
    if (!item || !item.video_url) return null;
    const { isGoogleDrive, driveId } = getVideoDetails(item.video_url);
    const thumbUrl = getThumbnailUrl(item);

    return (
      <div 
        className="w-full h-full cursor-pointer relative group bg-gradient-to-br from-gray-900 via-stone-800 to-black rounded-2xl overflow-hidden shadow-md"
        onClick={() => setActiveIndex(index)}
      >
        {thumbUrl ? (
          <img 
            src={thumbUrl} 
            alt={item.title || "Video Testimonial"} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              if (isGoogleDrive && driveId) {
                if (!e.target.dataset.fallbackStep) {
                  e.target.dataset.fallbackStep = "1";
                  e.target.src = `https://lh3.googleusercontent.com/d/${driveId}=s800`;
                  return;
                } else if (e.target.dataset.fallbackStep === "1") {
                  e.target.dataset.fallbackStep = "2";
                  e.target.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`;
                  return;
                }
              }
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <video 
            src={`${item.video_url}#t=0.1`} 
            className="w-full h-full object-cover opacity-80" 
            preload="metadata"
            muted 
            playsInline
          />
        )}

        {/* Overlay Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors pointer-events-none">
          <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>

          {item.title && (
            <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold tracking-wide drop-shadow-md truncate">
              {item.title}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStreamUrl = (item) => {
    if (!item) return '';
    const details = getVideoDetails(item.video_url);
    if (details.isGoogleDrive && details.driveId) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      return `${baseUrl}/api/drive-stream/${details.driveId}`;
    }
    return item.direct_url || item.video_url || '';
  };

  const activeItem = activeIndex !== null ? testimonials[activeIndex] : null;
  const activeDetails = activeItem ? getVideoDetails(activeItem.video_url) : null;

  useEffect(() => {
    if (!activeItem) {
      setResolvedUrl(null);
      return;
    }
    setResolvedUrl(getStreamUrl(activeItem));
  }, [activeIndex, activeItem]);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Autoplay was prevented:", error);
        });
      }
    }
  }, [resolvedUrl, activeIndex]);

  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || activeIndex !== null || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const scrollAmount = 280;

        if (scrollLeft >= maxScroll - 15) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [testimonials.length, isHovered, activeIndex]);

  const scrollSection = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return null;
  if (testimonials.length === 0) return null;

  const displayVideoUrl = resolvedUrl || (activeItem ? getStreamUrl(activeItem) : '');

  return (
    <section className="py-16 px-4 md:px-8 bg-brand-bg">
      <div className="max-w-7xl mx-auto">
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

        {testimonials.length <= 4 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
            {testimonials.map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] relative aspect-[9/16]"
              >
                {renderThumbnail(item, idx)}
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="relative px-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Horizontally Auto-scrolling Slider */}
            <div 
              ref={scrollRef}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-3 px-2 scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {testimonials.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex-none w-[220px] sm:w-[250px] md:w-[270px] aspect-[9/16] bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] relative snap-start"
                >
                  {renderThumbnail(item, idx)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Video Modal (Stories Style) */}
      {activeItem && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md p-4 sm:p-0">
          
          <button 
            onClick={() => setActiveIndex(null)} 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors p-2 z-50 bg-white/10 rounded-full hover:bg-white/20 cursor-pointer"
          >
            <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Left Arrow */}
          <button 
            onClick={handlePrev}
            className={`absolute left-2 sm:left-1/4 md:left-[28%] lg:left-[32%] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50 cursor-pointer ${activeIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          {/* Main Video Carousel Container */}
          <div className="relative w-full h-full max-w-[1200px] mx-auto flex items-center justify-center overflow-hidden">
            
            {/* Left/Prev Item (Dimmed) */}
            {activeIndex > 0 && (
              <div 
                className="absolute left-4 md:left-12 lg:left-24 w-full max-w-[240px] md:max-w-xs aspect-[9/16] rounded-2xl overflow-hidden opacity-20 scale-90 blur-[2px] hidden sm:block pointer-events-none transition-all duration-500 bg-black"
              >
                {getThumbnailUrl(testimonials[activeIndex - 1]) ? (
                  <img src={getThumbnailUrl(testimonials[activeIndex - 1])} alt="Previous" className="w-full h-full object-cover" />
                ) : (
                  <video src={getStreamUrl(testimonials[activeIndex - 1])} className="w-full h-full object-cover" preload="metadata" />
                )}
              </div>
            )}

            {/* Main Video Container - Keep exact same size aspect-[9/16] on both desktop & mobile */}
            <div className="h-[80vh] sm:h-[85vh] max-h-[750px] aspect-[9/16] max-w-[90vw] relative rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black z-20 flex items-center justify-center">

              {activeDetails?.isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeDetails.videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`}
                  title={activeItem.title || "Video Testimonial"}
                  className="absolute top-0 left-0 w-full h-full border-0 relative z-10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  ref={videoRef}
                  key={displayVideoUrl || activeItem.video_url}
                  src={displayVideoUrl} 
                  controls={true}
                  autoPlay
                  playsInline
                  loop
                  className="w-full h-full object-cover relative z-10"
                />
              )}

            </div>

            {/* Right/Next Item (Dimmed) */}
            {activeIndex < testimonials.length - 1 && (
              <div 
                className="absolute right-4 md:right-12 lg:right-24 w-full max-w-[240px] md:max-w-xs aspect-[9/16] rounded-2xl overflow-hidden opacity-20 scale-90 blur-[2px] hidden sm:block pointer-events-none transition-all duration-500 bg-black"
              >
                {getThumbnailUrl(testimonials[activeIndex + 1]) ? (
                  <img src={getThumbnailUrl(testimonials[activeIndex + 1])} alt="Next" className="w-full h-full object-cover" />
                ) : (
                  <video src={getStreamUrl(testimonials[activeIndex + 1])} className="w-full h-full object-cover" preload="metadata" />
                )}
              </div>
            )}
          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            className={`absolute right-2 sm:right-1/4 md:right-[28%] lg:right-[32%] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50 cursor-pointer ${activeIndex === testimonials.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
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
