import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { API_URL } from '../config';

const TestimonialsSection = ({ productId }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headerTitle, setHeaderTitle] = useState("REAL RESULTS, REAL PEOPLE");
  const [headerSubtitle, setHeaderSubtitle] = useState("Hear directly from our community about their skincare journey with Luscent Glow.");
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/content`);
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
        const res = await fetch(`${API_URL}${url}`);
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.filter(t => t.is_active !== false));
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
      return `${API_URL}/api/drive-thumbnail/${driveId}`;
    }
    if (isInstagram && instaId) return `https://www.instagram.com/p/${instaId}/media/?size=l`;
    return null;
  };

  const getStreamUrl = (item) => {
    if (!item) return '';
    const details = getVideoDetails(item.video_url);
    if (details.isGoogleDrive && details.driveId) {
      return `${API_URL}/api/drive-stream/${details.driveId}`;
    }
    return item.direct_url || item.video_url || '';
  };

  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || playingIndex !== null || testimonials.length <= 1) return;

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
  }, [testimonials.length, isHovered, playingIndex]);

  const togglePlayPause = (e, index) => {
    if (e) e.stopPropagation();

    if (playingIndex !== index) {
      setPlayingIndex(index);
      setIsPaused(false);
    } else {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPaused(false);
        } else {
          videoRef.current.pause();
          setIsPaused(true);
        }
      } else {
        setIsPaused(prev => !prev);
      }
    }
  };

  const renderCard = (item, index) => {
    if (!item || !item.video_url) return null;
    const isPlaying = playingIndex === index;
    const { isGoogleDrive, driveId, isYouTube, videoId } = getVideoDetails(item.video_url);
    const thumbUrl = getThumbnailUrl(item);
    const streamUrl = getStreamUrl(item);

    return (
      <div 
        key={item.id || index}
        className="w-full h-full relative group bg-stone-950 rounded-2xl overflow-hidden shadow-lg border border-stone-800/80 flex items-center justify-center cursor-pointer"
        onClick={(e) => togglePlayPause(e, index)}
      >
        {/* Ambient blurred backdrop so video fits 100% cleanly without empty borders */}
        {thumbUrl && (
          <img 
            src={thumbUrl} 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 pointer-events-none scale-110" 
          />
        )}

        {isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center z-10 bg-black">
            {isYouTube && videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1`}
                title={item.title || "Video Testimonial"}
                className="w-full h-full border-0 rounded-2xl pointer-events-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video 
                ref={videoRef}
                src={streamUrl} 
                autoPlay
                playsInline
                preload="metadata"
                onEnded={() => setIsPaused(true)}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                className="w-full h-full object-contain rounded-2xl"
              />
            )}

            {/* Top Right Play / Pause Toggle Button */}
            <button 
              type="button"
              onClick={(e) => togglePlayPause(e, index)}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all z-30 shadow-lg border border-white/30 cursor-pointer"
              title={isPaused ? "Play Video" : "Pause Video"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 text-white fill-white" />
              )}
            </button>

            {item.title && (
              <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold tracking-wide drop-shadow-md truncate pointer-events-none z-20">
                {item.title}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative group flex items-center justify-center">
            {thumbUrl ? (
              <img 
                src={thumbUrl} 
                alt={item.title || "Video Testimonial"} 
                className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-[1.02]"
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
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-900 text-stone-400 p-4 relative z-10">
                <Play className="w-12 h-12 text-white/60 mb-2" />
                <span className="text-xs font-medium text-white/80">{item.title || "Watch Review"}</span>
              </div>
            )}

            {/* Overlay Dark Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/90 transition-colors pointer-events-none z-20">
              {/* Top Right Play Button */}
              <button
                type="button"
                onClick={(e) => togglePlayPause(e, index)}
                className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-105 hover:bg-black/80 transition-all cursor-pointer pointer-events-auto z-30"
                title="Play Video"
              >
                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
              </button>

              {item.title && (
                <div className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold tracking-wide drop-shadow-md truncate">
                  {item.title}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return null;
  if (testimonials.length === 0) return null;

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
                key={item.id || idx} 
                className="bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] relative aspect-[9/16]"
              >
                {renderCard(item, idx)}
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
                  key={item.id || idx} 
                  className="flex-none w-[220px] sm:w-[250px] md:w-[270px] aspect-[9/16] bg-brand-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] relative snap-start"
                >
                  {renderCard(item, idx)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
