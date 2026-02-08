// Media Manager - Handles both Videos and Images with Intersection Observer
class MediaManager {
    constructor() {
        this.videos = document.querySelectorAll('.video-player');
        this.images = document.querySelectorAll('.media-image');
        this.videoItems = document.querySelectorAll('.video-item');
        this.playingVideos = new Set();
        this.rafId = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback: play all videos if Intersection Observer is not supported
            this.playAllVideos();
        }

        // Setup video event listeners
        this.setupVideoListeners();
        
        // Setup image lazy loading
        this.setupImageLoading();
    }

    setupIntersectionObserver() {
        // Optimized for smooth playback - load videos early but intelligently
        const observerOptions = {
            root: null,
            rootMargin: '300px', // Start loading 300px before entering viewport
            threshold: [0, 0.1, 0.5, 1.0] // Multiple thresholds for better control
        };

        const observer = new IntersectionObserver((entries) => {
            // Use requestAnimationFrame for smooth updates
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            
            this.rafId = requestAnimationFrame(() => {
                entries.forEach(entry => {
                    const element = entry.target;
                    const videoItem = element.closest('.video-item');
                    
                    if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                        // Check if it's a video or image
                        if (element.tagName === 'VIDEO') {
                            // Preload video when approaching viewport
                            if (entry.intersectionRatio < 0.5) {
                                this.preloadVideo(element);
                            } else {
                                // Play when fully visible
                                this.playVideo(element, videoItem);
                            }
                        } else if (element.tagName === 'IMG') {
                            this.loadImage(element, videoItem);
                        }
                    } else if (!entry.isIntersecting) {
                        // Pause video when out of view to save resources
                        if (element.tagName === 'VIDEO') {
                            this.pauseVideo(element);
                        }
                    }
                });
            });
        }, observerOptions);

        // Observe all videos and images
        this.videos.forEach(video => {
            observer.observe(video);
        });
        this.images.forEach(image => {
            observer.observe(image);
        });
    }

    preloadVideo(video) {
        // Preload video without playing
        if (video.readyState === 0) {
            video.preload = 'auto';
            video.load();
        }
    }

    loadImage(img, videoItem) {
        // Remove loading state for images
        if (img.complete) {
            videoItem.classList.remove('loading');
        } else {
            img.addEventListener('load', () => {
                videoItem.classList.remove('loading');
            });
            img.addEventListener('error', () => {
                videoItem.classList.remove('loading');
            });
        }
    }

    setupImageLoading() {
        this.images.forEach((img, index) => {
            const videoItem = img.closest('.video-item');
            
            // Add loading state initially
            videoItem.classList.add('loading');

            // Remove loading when image loads
            if (img.complete) {
                videoItem.classList.remove('loading');
            } else {
                img.addEventListener('load', () => {
                    videoItem.classList.remove('loading');
                });
                img.addEventListener('error', () => {
                    videoItem.classList.remove('loading');
                    console.warn(`Image ${index + 1} failed to load`);
                });
            }
        });
    }

    setupVideoListeners() {
        // Throttle timeupdate for better performance
        let lastTimeUpdate = 0;
        const timeUpdateThrottle = 100; // Update every 100ms instead of every frame

        this.videos.forEach((video, index) => {
            const videoItem = video.closest('.video-item');

            // Force autoplay, loop, and muted attributes for smooth playback
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('autoplay', '');
            video.setAttribute('loop', 'true');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            
            // Enable hardware acceleration hints
            video.style.transform = 'translateZ(0)';
            video.style.willChange = 'transform';

            // Optimize video loading
            video.preload = 'auto';
            video.setAttribute('preload', 'auto');

            // Remove loading state when video can play
            video.addEventListener('loadeddata', () => {
                videoItem.classList.remove('loading');
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
            }, { once: true });

            // Try to play when video can start playing
            video.addEventListener('canplay', () => {
                if (!this.playingVideos.has(video)) {
                    video.play().catch(() => {});
                }
            }, { once: true });

            // Add loading state initially
            videoItem.classList.add('loading');

            // Optimized loop handling - use seeked event for smoother loops
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

            // Handle video errors gracefully
            video.addEventListener('error', () => {
                videoItem.classList.remove('loading');
                console.warn(`Video ${index + 1} failed to load`);
            }, { once: true });

            // Track playing videos
            video.addEventListener('play', () => {
                this.playingVideos.add(video);
                video.loop = true;
                video.muted = true;
            });

            video.addEventListener('pause', () => {
                this.playingVideos.delete(video);
            });

            // Try to play immediately if video is already loaded
            if (video.readyState >= 3) {
                requestAnimationFrame(() => {
                    video.play().catch(() => {});
                });
            }
        });
    }

    async playVideo(video, videoItem) {
        // Skip if already playing
        if (this.playingVideos.has(video) && !video.paused) {
            return;
        }

        try {
            videoItem.classList.add('loading');
            
            // Ensure all attributes are set for smooth playback
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute('autoplay', '');
            video.setAttribute('loop', 'true');
            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            
            // Load video if needed
            if (video.readyState === 0) {
                video.preload = 'auto';
                video.load();
            }
            
            // Wait for video to be ready
            if (video.readyState < 3) {
                await new Promise((resolve) => {
                    const onCanPlay = () => {
                        video.removeEventListener('canplay', onCanPlay);
                        resolve();
                    };
                    video.addEventListener('canplay', onCanPlay);
                });
            }
            
            // Play using requestAnimationFrame for smooth start
            await new Promise((resolve) => {
                requestAnimationFrame(async () => {
                    try {
                        await video.play();
                        resolve();
                    } catch (e) {
                        resolve(); // Continue even if play fails
                    }
                });
            });
            
            videoItem.classList.remove('loading');
            this.playingVideos.add(video);
            
        } catch (error) {
            videoItem.classList.remove('loading');
            // Retry with delay using requestAnimationFrame
            requestAnimationFrame(() => {
                setTimeout(() => {
                    video.play().catch(() => {
                        this.setupClickToPlay(video, videoItem);
                    });
                }, 200);
            });
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
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            this.header.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.75) 0%, rgba(10, 10, 10, 0.7) 50%, rgba(10, 10, 10, 0.75) 100%)';
            this.header.style.backdropFilter = 'blur(30px) saturate(180%)';
            this.header.style.webkitBackdropFilter = 'blur(30px) saturate(180%)';
            this.header.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
            this.header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
        } else {
            this.header.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.3) 0%, rgba(10, 10, 10, 0.2) 50%, rgba(10, 10, 10, 0.25) 100%)';
            this.header.style.backdropFilter = 'blur(20px) saturate(180%)';
            this.header.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
            this.header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
            this.header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
        }

        this.lastScroll = currentScroll;
    }
}

// Initialize everything when DOM is ready - Optimized
document.addEventListener('DOMContentLoaded', () => {
    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            new MediaManager();
            new SmoothScroll();
            new HeaderScroll();
        }, { timeout: 2000 });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            new MediaManager();
            new SmoothScroll();
            new HeaderScroll();
        }, 100);
    }
});

// Handle page visibility changes - Optimized
document.addEventListener('visibilitychange', () => {
    const videos = document.querySelectorAll('.video-player');
    if (document.hidden) {
        // Pause all videos when tab is hidden to save resources
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
    } else {
        // Resume visible videos when tab becomes active
        requestAnimationFrame(() => {
            videos.forEach(video => {
                const videoItem = video.closest('.video-item');
                if (videoItem) {
                    const rect = videoItem.getBoundingClientRect();
                    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                    if (isVisible && video.paused) {
                        video.play().catch(() => {});
                    }
                }
            });
        });
    }
});
