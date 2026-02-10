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
        const mobile = this.isMobile();
        if (mobile) this.deferVideoSources();
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            if (!mobile) this.playAllVideos();
        }
        this.setupVideoListeners();
        if (!mobile) this.setupImageLoading();
    }

    /** On mobile: don't set video src until in view — avoids loading dozens of videos on first paint */
    deferVideoSources() {
        this.videos.forEach(video => {
            const src = video.querySelector('source');
            if (!src || !src.getAttribute('src')) return;
            src.setAttribute('data-src', src.getAttribute('src'));
            src.removeAttribute('src');
        });
    }

    /** Set video source when about to play (mobile lazy-load) */
    ensureVideoSource(video) {
        const src = video.querySelector('source');
        if (!src) return;
        const dataSrc = src.getAttribute('data-src');
        if (dataSrc && !src.getAttribute('src')) {
            src.setAttribute('src', dataSrc);
            src.removeAttribute('data-src');
            video.load();
        }
    }

    setupIntersectionObserver() {
        const mobile = this.isMobile();
        const observerOptions = {
            root: null,
            rootMargin: mobile ? '60px' : '400px',
            threshold: mobile ? [0, 0.5, 1] : [0, 0.1, 0.5, 1]
        };

        const observer = new IntersectionObserver((entries) => {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.rafId = requestAnimationFrame(() => {
                entries.forEach(entry => {
                    const el = entry.target;
                    const videoItem = el.closest('.video-item');
                    const ratio = entry.intersectionRatio;

                    if (entry.isIntersecting && ratio > 0.1) {
                        if (el.tagName === 'VIDEO') {
                            if (mobile) {
                                if (ratio >= 0.5) this.playVideoMobile(el, videoItem);
                                else this.pauseVideo(el);
                            } else {
                                if (ratio < 0.5) this.preloadVideo(el);
                                else this.playVideo(el, videoItem);
                            }
                        } else if (el.tagName === 'IMG') {
                            this.loadImage(el);
                        }
                    } else if (!entry.isIntersecting && el.tagName === 'VIDEO') {
                        this.pauseVideo(el);
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

        this.videos.forEach((video) => {
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

            video.style.transform = 'translate3d(0,0,0)';
            video.preload = mobile ? 'none' : 'auto';
            video.setAttribute('preload', mobile ? 'none' : 'auto');

            video.addEventListener('canplay', () => {
                if (!this.playingVideos.has(video)) video.play().catch(() => {});
            }, { once: true });

            video.addEventListener('ended', () => {
                requestAnimationFrame(() => {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                });
            });

            if (!mobile) {
                video.addEventListener('timeupdate', () => {
                    const now = Date.now();
                    if (now - lastTimeUpdate < 100) return;
                    lastTimeUpdate = now;
                    if (video.duration > 0 && video.currentTime > 0 && video.duration - video.currentTime < 0.1) {
                        requestAnimationFrame(() => { video.currentTime = 0; });
                    }
                });
            }

            video.addEventListener('error', () => {}, { once: true });
            video.addEventListener('play', () => {
                this.playingVideos.add(video);
                video.loop = true;
                video.muted = true;
            });
            video.addEventListener('pause', () => this.playingVideos.delete(video));

            if (video.readyState >= 3 && !mobile) {
                requestAnimationFrame(() => video.play().catch(() => {}));
            }
        });
    }

    async playVideo(video, videoItem) {
        if (this.playingVideos.has(video) && !video.paused) return;

        const mobile = this.isMobile();
        if (mobile) this.ensureVideoSource(video);
        if (mobile) {
            video.preload = 'auto';
            video.setAttribute('preload', 'auto');
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
    new SmoothScroll();
    new HeaderScroll();

    function initMedia() {
        new MediaManager();
    }

    if (isMobile) {
        let done = false;
        const run = () => {
            if (done) return;
            done = true;
            initMedia();
        };
        window.addEventListener('scroll', run, { passive: true, once: true });
        setTimeout(run, 1400);
    } else {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => initMedia(), { timeout: 1500 });
        } else {
            setTimeout(initMedia, 100);
        }
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
