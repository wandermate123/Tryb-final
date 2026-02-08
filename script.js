// Media Manager - Handles both Videos and Images with Intersection Observer
class MediaManager {
    constructor() {
        this.videos = document.querySelectorAll('.video-player');
        this.images = document.querySelectorAll('.media-image');
        this.videoItems = document.querySelectorAll('.video-item');
        this.observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
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
        // More aggressive optimization - only load when closer to viewport
        const observerOptions = {
            root: null,
            rootMargin: '100px', // Start loading 100px before entering viewport
            threshold: 0.01 // Trigger earlier
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const element = entry.target;
                const videoItem = element.closest('.video-item');
                
                if (entry.isIntersecting) {
                    // Check if it's a video or image
                    if (element.tagName === 'VIDEO') {
                        // Set preload to auto when visible
                        if (element.preload === 'none') {
                            element.preload = 'auto';
                        }
                        this.playVideo(element, videoItem);
                    } else if (element.tagName === 'IMG') {
                        this.loadImage(element, videoItem);
                    }
                    // Unobserve after loading to improve performance
                    observer.unobserve(element);
                } else {
                    // Pause video if it's a video element
                    if (element.tagName === 'VIDEO') {
                        this.pauseVideo(element);
                    }
                }
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
        this.videos.forEach((video, index) => {
            const videoItem = video.closest('.video-item');

            // Force loop attribute and property
            video.loop = true;
            video.setAttribute('loop', 'true');

            // Remove loading state when video can play
            video.addEventListener('loadeddata', () => {
                videoItem.classList.remove('loading');
                // Ensure loop is still set after loading
                video.loop = true;
            });

            // Add loading state initially
            videoItem.classList.add('loading');

            // Ensure video loops smoothly - multiple methods for reliability
            video.addEventListener('ended', () => {
                video.currentTime = 0;
                video.play().catch(() => {});
            });

            // Additional loop handling for better reliability
            video.addEventListener('timeupdate', () => {
                // If video is near the end (within 0.05 seconds), restart immediately
                if (video.duration > 0 && video.currentTime > 0 && 
                    video.duration - video.currentTime < 0.05) {
                    video.currentTime = 0;
                }
            });

            // Handle video errors
            video.addEventListener('error', () => {
                videoItem.classList.remove('loading');
                console.warn(`Video ${index + 1} failed to load`);
            });

            // Ensure loop persists
            video.addEventListener('play', () => {
                if (!video.loop) {
                    video.loop = true;
                }
            });
        });
    }

    async playVideo(video, videoItem) {
        try {
            videoItem.classList.add('loading');
            // Ensure loop is set
            video.loop = true;
            await video.play();
            videoItem.classList.remove('loading');
            
            // Double-check loop is working
            if (!video.loop) {
                video.loop = true;
            }
        } catch (error) {
            console.warn('Autoplay prevented:', error);
            videoItem.classList.remove('loading');
            // Try to play on user interaction
            this.setupClickToPlay(video, videoItem);
        }
    }

    pauseVideo(video) {
        video.pause();
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

// Header scroll effect
class HeaderScroll {
    constructor() {
        this.header = document.querySelector('.header');
        this.lastScroll = 0;
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                // More opaque and stronger blur when scrolled
                this.header.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.75) 0%, rgba(10, 10, 10, 0.7) 50%, rgba(10, 10, 10, 0.75) 100%)';
                this.header.style.backdropFilter = 'blur(30px) saturate(180%)';
                this.header.style.webkitBackdropFilter = 'blur(30px) saturate(180%)';
                this.header.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
                this.header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08)';
            } else {
                // More transparent and lighter blur at top
                this.header.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.3) 0%, rgba(10, 10, 10, 0.2) 50%, rgba(10, 10, 10, 0.25) 100%)';
                this.header.style.backdropFilter = 'blur(20px) saturate(180%)';
                this.header.style.webkitBackdropFilter = 'blur(20px) saturate(180%)';
                this.header.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
                this.header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            }

            this.lastScroll = currentScroll;
        });
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

// Handle page visibility changes (pause videos when tab is hidden)
document.addEventListener('visibilitychange', () => {
    const videos = document.querySelectorAll('.video-player');
    if (document.hidden) {
        videos.forEach(video => video.pause());
    } else {
        videos.forEach(video => {
            const videoItem = video.closest('.video-item');
            const rect = videoItem.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible) {
                video.play().catch(() => {});
            }
        });
    }
});
