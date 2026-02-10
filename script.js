// Media Manager - Handles both Videos and Images with Intersection Observer
class MediaManager {
    constructor() {
        this.videos = document.querySelectorAll('.video-player');
        this.images = document.querySelectorAll('.media-image');
        this.videoItems = document.querySelectorAll('.video-item');
        this.playingVideos = new Set();
        this.rafId = null;
        this.isMobile = () => window.matchMedia('(max-width: 768px)').matches;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            this.playAllVideos();
        }
        this.setupVideoListeners();
        this.setupImageLoading();
    }

    setupIntersectionObserver() {
        const mobile = this.isMobile();
        const observerOptions = {
            root: null,
            rootMargin: mobile ? '80px' : '300px',
            threshold: mobile ? [0, 0.25, 0.5, 0.75, 1] : [0, 0.1, 0.5, 1.0]
        };

        const observer = new IntersectionObserver((entries) => {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = requestAnimationFrame(() => {
                entries.forEach(entry => {
                    const element = entry.target;
                    const videoItem = element.closest('.video-item');
                    const ratio = entry.intersectionRatio;

                    if (entry.isIntersecting && ratio > 0.1) {
                        if (element.tagName === 'VIDEO') {
                            if (mobile) {
                                if (ratio >= 0.5) this.playVideoMobile(element, videoItem);
                                else this.pauseVideo(element);
                            } else {
                                if (ratio < 0.5) this.preloadVideo(element);
                                else this.playVideo(element, videoItem);
                            }
                        } else if (element.tagName === 'IMG') {
                            this.loadImage(element);
                        }
                    } else if (!entry.isIntersecting && element.tagName === 'VIDEO') {
                        this.pauseVideo(element);
                    }
                });
            });
        }, observerOptions);

        this.videos.forEach(v => observer.observe(v));
        this.images.forEach(img => observer.observe(img));
    }

    playVideoMobile(video, videoItem) {
        this.playingVideos.forEach(v => {
            if (v !== video && !v.paused) this.pauseVideo(v);
        });
        this.playingVideos.clear();
        this.playVideo(video, videoItem);
    }

    preloadVideo(video) {
        if (video.readyState === 0) {
            video.preload = this.isMobile() ? 'metadata' : 'auto';
            if (!this.isMobile()) video.load();
        }
    }

    loadImage(img) {
        if (!img.complete) img.decode?.().catch(() => {});
    }

    setupImageLoading() {
        this.images.forEach(img => {
            if (!img.complete) img.decode?.().catch(() => {});
        });
    }

    setupVideoListeners() {
        const mobile = this.isMobile();
        let lastTimeUpdate = 0;
        const timeUpdateThrottle = mobile ? 250 : 100;

        this.videos.forEach((video, index) => {
            const videoItem = video.closest('.video-item');

            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.controls = false;
            video.removeAttribute('controls');
            video.setAttribute('autoplay', '');
            video.setAttribute('loop', 'true');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');

            video.style.transform = 'translateZ(0)';
            video.preload = mobile ? 'metadata' : 'auto';
            video.setAttribute('preload', mobile ? 'metadata' : 'auto');

            video.addEventListener('canplay', () => {
                if (!this.playingVideos.has(video)) video.play().catch(() => {});
            }, { once: true });

            // Smooth loop handling
            video.addEventListener('ended', () => {
                requestAnimationFrame(() => {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                });
            });

            // Throttled timeupdate for better performance
            video.addEventListener('timeupdate', () => {
                const now = Date.now();
                if (now - lastTimeUpdate < timeUpdateThrottle) return;
                lastTimeUpdate = now;

                // Smooth loop handling - restart slightly before end
                if (video.duration > 0 && video.currentTime > 0 && 
                    video.duration - video.currentTime < 0.1) {
                    requestAnimationFrame(() => {
                        video.currentTime = 0;
                    });
                }
            });

            video.addEventListener('error', () => {}, { once: true });

            // Track playing videos
            video.addEventListener('play', () => {
                this.playingVideos.add(video);
                video.loop = true;
                video.muted = true;
            });

            video.addEventListener('pause', () => {
                this.playingVideos.delete(video);
            });

            if (video.readyState >= 3 && !mobile) {
                requestAnimationFrame(() => video.play().catch(() => {}));
            }
        });
    }

    async playVideo(video, videoItem) {
        if (this.playingVideos.has(video) && !video.paused) return;
        if (this.isMobile() && video.preload !== 'auto') {
            video.preload = 'auto';
            video.load();
        }

        try {
            if (video.readyState === 0) {
                video.preload = 'auto';
                video.load();
            }
            if (video.readyState < 3) {
                await new Promise(r => {
                    const fn = () => { video.removeEventListener('canplay', fn); r(); };
                    video.addEventListener('canplay', fn);
                });
            }
            await new Promise(r => {
                requestAnimationFrame(() => {
                    video.play().then(() => r()).catch(() => r());
                });
            });
            this.playingVideos.add(video);
        } catch {
            requestAnimationFrame(() => setTimeout(() => {
                video.play().catch(() => this.setupClickToPlay(video, videoItem));
            }, 150));
        }
    }

    pauseVideo(video) {
        // Use requestAnimationFrame for smooth pause
        requestAnimationFrame(() => {
            if (!video.paused) {
                video.pause();
                this.playingVideos.delete(video);
            }
        });
    }

    playAllVideos() {
        this.videos.forEach(video => {
            video.play().catch(error => {
                console.warn('Autoplay prevented:', error);
            });
        });
    }

    setupClickToPlay(video, videoItem) {
        const playOnClick = () => {
            video.play();
            videoItem.removeEventListener('click', playOnClick);
        };
        videoItem.addEventListener('click', playOnClick);
    }
}

// Smooth scroll behavior
class SmoothScroll {
    constructor() {
        this.setupSmoothScroll();
    }

    setupSmoothScroll() {
        // Add smooth scrolling to all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    const headerOffset = 120;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active nav item
                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });
    }
}

// Header scroll effect - Optimized with throttling
class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScroll = 0;
        this.ticking = false;
        this.init();
    }

    init() {
        // Use passive listener and throttle with requestAnimationFrame
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateHeader();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        }, { passive: true });
    }

    updateHeader() {
        const y = window.pageYOffset;
        const scrolled = y > 100;
        const bg = scrolled ? 'rgba(10,10,10,0.75)' : 'rgba(10,10,10,0.25)';
        const blur = scrolled ? 'blur(24px)' : 'blur(16px)';
        this.header.style.background = `linear-gradient(180deg,${bg} 0%,${bg} 100%)`;
        this.header.style.backdropFilter = blur;
        this.header.style.webkitBackdropFilter = blur;
        this.lastScroll = y;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const delay = isMobile ? 300 : 100;
    const timeout = isMobile ? 800 : 2000;
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            new MediaManager();
            new SmoothScroll();
            new HeaderScroll();
        }, { timeout });
    } else {
        setTimeout(() => {
            new MediaManager();
            new SmoothScroll();
            new HeaderScroll();
        }, delay);
    }
});

document.addEventListener('visibilitychange', () => {
    const videos = document.querySelectorAll('.video-player');
    if (document.hidden) {
        videos.forEach(v => { if (!v.paused) v.pause(); });
    } else {
        requestAnimationFrame(() => {
            const mobile = window.matchMedia('(max-width: 768px)').matches;
            let played = 0;
            videos.forEach(video => {
                const videoItem = video.closest('.video-item');
                if (!videoItem) return;
                const rect = videoItem.getBoundingClientRect();
                const visible = rect.top < window.innerHeight && rect.bottom > 0;
                if (visible && video.paused) {
                    if (mobile && played >= 1) return;
                    video.play().catch(() => {});
                    if (mobile) played++;
                }
            });
        });
    }
});
