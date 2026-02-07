// WORKING SLIDESHOW WITH TRUE FULLSCREEN
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing website with true fullscreen slideshow...');
  
  // ========== VARIABLES ==========
  const totalSlides = 15;
  let currentSlide = 0;
  let slideInterval;
  let slides = [];
  let fullscreenSlides = [];
  let fullscreenCurrent = 0;
  let isFullscreen = false;
  let isFullscreenAPI = false;
  
  // Slide titles based on your actual slides
  const slideTitles = [
    'Computational Philology for the Urdu Canon',
    'Agenda',
    'The Problem: Classical Urdu is Rich but Digitally Inaccessible',
    'Research Significance',
    'Research Questions',
    'Methodology: 3-Tiered Framework',
    'Tier 1: Data Curation & TEI-XML Encoding',
    'Tier 2: Urdu NLP Pipeline',
    'Tier 3: Computational Philology & Literary Analysis',
    'Case Study: Ghalib & Classical Poets',
    'Expected Outcomes',
    'Project Timeline',
    'Technical Implementation',
    'Why This University',
    'Thank You & References'
  ];
  
  // ========== MAIN SLIDESHOW ==========
  function initMainSlideshow() {
    const slidesContainer = document.getElementById('slidesContainer');
    const totalSlidesElement = document.getElementById('totalSlides');
    
    totalSlidesElement.textContent = totalSlides;
    slidesContainer.innerHTML = '';
    slides = [];
    
    for (let i = 1; i <= totalSlides; i++) {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.dataset.index = i;
      slide.dataset.title = slideTitles[i-1] || `Slide ${i}`;
      
      const title = slide.dataset.title;
      const img = document.createElement('img');
      img.className = 'slide-img';
      img.alt = title;
      img.loading = 'lazy';
      
      // Try your actual file paths
      const imagePaths = [
        `slides/Slide${i}.JPG`,
        `slides/Slide${i}.jpg`,
        `slides/Slide${i}.jpeg`,
        `./slides/Slide${i}.JPG`,
        `./slides/Slide${i}.jpg`
      ];
      
      let currentPathIndex = 0;
      let imgLoaded = false;
      
      function tryNextImage() {
        if (currentPathIndex < imagePaths.length && !imgLoaded) {
          img.src = imagePaths[currentPathIndex];
          currentPathIndex++;
        } else if (!imgLoaded) {
          createFallbackImage(img, title, i, false);
          imgLoaded = true;
        }
      }
      
      img.onload = function() {
        console.log(`✓ Loaded: ${img.src}`);
        imgLoaded = true;
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
      };
      
      img.onerror = tryNextImage;
      tryNextImage();
      
      slide.appendChild(img);
      slidesContainer.appendChild(slide);
      slides.push(slide);
      
      img.style.display = 'block';
      img.style.visibility = 'visible';
      img.style.opacity = '1';
    }
    
    console.log(`Created ${slides.length} slides`);
    
    setTimeout(() => {
      showSlide(0);
      ensureSlideImagesDisplay();
    }, 300);
    
    startAutoRotation();
  }
  
  // ========== FULLSCREEN FUNCTIONS ==========
  function enterTrueFullscreen(element) {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      return element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      return element.msRequestFullscreen();
    }
    return Promise.reject('Fullscreen API not supported');
  }
  
  function exitTrueFullscreen() {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      return document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      return document.msExitFullscreen();
    }
    return Promise.reject('Fullscreen API not supported');
  }
  
  function isInTrueFullscreen() {
    return !!(document.fullscreenElement ||
              document.mozFullScreenElement ||
              document.webkitFullscreenElement ||
              document.msFullscreenElement);
  }
  
  function initFullscreenSlideshow() {
    const fullscreenContainer = document.getElementById('fullscreenSlidesContainer');
    const modalTotalSlides = document.getElementById('modalTotalSlides');
    
    modalTotalSlides.textContent = totalSlides;
    fullscreenContainer.innerHTML = '';
    fullscreenSlides = [];
    
    for (let i = 1; i <= totalSlides; i++) {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.dataset.index = i;
      slide.dataset.title = slideTitles[i-1] || `Slide ${i}`;
      
      const title = slide.dataset.title;
      const img = document.createElement('img');
      img.className = 'slide-img';
      img.alt = title;
      
      const imagePath = `slides/Slide${i}.JPG`;
      img.src = imagePath;
      
      img.onerror = function() {
        createFallbackImage(img, title, i, true);
      };
      
      img.onload = function() {
        img.style.display = 'block';
        img.style.visibility = 'visible';
        img.style.opacity = '1';
      };
      
      img.style.display = 'block';
      img.style.visibility = 'visible';
      img.style.opacity = '1';
      
      slide.appendChild(img);
      fullscreenContainer.appendChild(slide);
      fullscreenSlides.push(slide);
    }
    
    console.log(`Created ${fullscreenSlides.length} fullscreen slides`);
    
    setTimeout(() => {
      showFullscreenSlide(0);
      ensureSlideImagesDisplay();
      updateProgressBar();
    }, 300);
  }
  
  async function openFullscreenModal() {
    isFullscreen = true;
    initFullscreenSlideshow();
    
    const modal = document.getElementById('fullscreenModal');
    modal.classList.add('active');
    
    // Try to enter true browser fullscreen
    try {
      await enterTrueFullscreen(modal);
      isFullscreenAPI = true;
      console.log('Entered true browser fullscreen mode');
      
      // Show floating elements
      document.getElementById('exitFullscreenBtn').style.display = 'flex';
      document.getElementById('floatingSlideNumber').style.display = 'flex';
      
      // Update floating counter
      updateFloatingCounter();
      
      // Auto-hide controls after 3 seconds
      setTimeout(() => {
        if (isFullscreen && isFullscreenAPI) {
          document.querySelector('.modal-controls').style.opacity = '0';
        }
      }, 3000);
      
    } catch (error) {
      console.log('Using fallback fullscreen mode:', error);
      isFullscreenAPI = false;
      modal.classList.add('true-fullscreen-fallback');
      document.body.style.overflow = 'hidden';
    }
    
    stopAutoRotation();
    
    setTimeout(() => {
      ensureSlideImagesDisplay();
    }, 100);
  }
  
  async function closeFullscreenModal() {
    if (isFullscreenAPI && isInTrueFullscreen()) {
      try {
        await exitTrueFullscreen();
      } catch (error) {
        console.log('Error exiting fullscreen:', error);
      }
    }
    
    isFullscreen = false;
    isFullscreenAPI = false;
    
    const modal = document.getElementById('fullscreenModal');
    modal.classList.remove('active');
    modal.classList.remove('true-fullscreen-fallback');
    
    // Hide floating elements
    document.getElementById('exitFullscreenBtn').style.display = 'none';
    document.getElementById('floatingSlideNumber').style.display = 'none';
    
    // Restore controls
    document.querySelector('.modal-controls').style.opacity = '1';
    
    document.body.style.overflow = 'auto';
    startAutoRotation();
  }
  
  function handleFullscreenChange() {
    if (!isInTrueFullscreen() && isFullscreen) {
      closeFullscreenModal();
    }
  }
  
  // ========== SLIDE FUNCTIONS ==========
  function showSlide(index) {
    if (slides.length === 0) return;
    
    slides.forEach(slide => slide.classList.remove('active'));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    
    const activeImg = slides[currentSlide].querySelector('.slide-img');
    if (activeImg) {
      activeImg.style.display = 'block';
      activeImg.style.visibility = 'visible';
      activeImg.style.opacity = '1';
    }
    
    updateSlideCounter();
    ensureSlideImagesDisplay();
  }
  
  function nextSlide() {
    showSlide(currentSlide + 1);
    startAutoRotation();
  }
  
  function prevSlide() {
    showSlide(currentSlide - 1);
    startAutoRotation();
  }
  
  function showFullscreenSlide(index) {
    if (fullscreenSlides.length === 0) return;
    
    fullscreenSlides.forEach(slide => slide.classList.remove('active'));
    fullscreenCurrent = (index + fullscreenSlides.length) % fullscreenSlides.length;
    fullscreenSlides[fullscreenCurrent].classList.add('active');
    
    const activeImg = fullscreenSlides[fullscreenCurrent].querySelector('.slide-img');
    if (activeImg) {
      activeImg.style.display = 'block';
      activeImg.style.visibility = 'visible';
      activeImg.style.opacity = '1';
    }
    
    updateFullscreenCounter();
    updateFloatingCounter();
    updateProgressBar();
    ensureSlideImagesDisplay();
  }
  
  function nextFullscreenSlide() {
    showFullscreenSlide(fullscreenCurrent + 1);
  }
  
  function prevFullscreenSlide() {
    showFullscreenSlide(fullscreenCurrent - 1);
  }
  
  function updateSlideCounter() {
    document.getElementById('currentSlide').textContent = currentSlide + 1;
  }
  
  function updateFullscreenCounter() {
    document.getElementById('modalCurrentSlide').textContent = fullscreenCurrent + 1;
    const slideTitle = fullscreenSlides[fullscreenCurrent]?.dataset.title || slideTitles[fullscreenCurrent] || `Slide ${fullscreenCurrent + 1}`;
    document.getElementById('modalSlideTitle').textContent = slideTitle;
  }
  
  function updateFloatingCounter() {
    document.getElementById('floatingCurrentSlide').textContent = fullscreenCurrent + 1;
    document.getElementById('floatingTotalSlides').textContent = totalSlides;
  }
  
  function updateProgressBar() {
    const progress = ((fullscreenCurrent + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
  }
  
  function startAutoRotation() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoRotation() {
    clearInterval(slideInterval);
  }
  
  function createFallbackImage(imgElement, title, number, isFullscreen = false) {
    const width = isFullscreen ? 1920 : 600;
    const height = isFullscreen ? 1080 : 400;
    const titleSize = isFullscreen ? 48 : 22;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, width - 100, height - 100);
    
    ctx.fillStyle = '#60a5fa';
    ctx.font = `bold ${titleSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const words = title.split(' ');
    let lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < (isFullscreen ? 1800 : 500)) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    
    const lineHeight = titleSize + 8;
    const startY = height / 2 - (lines.length - 1) * lineHeight / 2 - 50;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `32px Arial`;
    ctx.fillText(`Slide ${number}`, width / 2, startY + lines.length * lineHeight + 30);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = `24px Arial`;
    ctx.fillText(
      isFullscreen ? 'Fullscreen Presentation View' : 'Preview Slideshow',
      width / 2,
      startY + lines.length * lineHeight + 80
    );
    
    imgElement.src = canvas.toDataURL('image/png');
    imgElement.onerror = null;
    
    imgElement.style.display = 'block';
    imgElement.style.visibility = 'visible';
    imgElement.style.opacity = '1';
    imgElement.style.objectFit = 'contain';
  }
  
  function ensureSlideImagesDisplay() {
    document.querySelectorAll('#slidesContainer .slide-img').forEach(img => {
      img.style.display = 'block';
      img.style.visibility = 'visible';
      img.style.opacity = '1';
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.margin = '0 auto';
      img.style.objectFit = 'contain';
    });
    
    document.querySelectorAll('#fullscreenSlidesContainer .slide-img').forEach(img => {
      img.style.display = 'block';
      img.style.visibility = 'visible';
      img.style.opacity = '1';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
    });
  }
  
  // ========== EVENT LISTENERS ==========
  initMainSlideshow();
  
  document.querySelector('.next-btn')?.addEventListener('click', function() {
    nextSlide();
    startAutoRotation();
  });
  
  document.querySelector('.prev-btn')?.addEventListener('click', function() {
    prevSlide();
    startAutoRotation();
  });
  
  document.getElementById('viewFullscreenBtn')?.addEventListener('click', openFullscreenModal);
  document.getElementById('modalClose')?.addEventListener('click', closeFullscreenModal);
  document.getElementById('exitFullscreenBtn')?.addEventListener('click', closeFullscreenModal);
  
  document.querySelector('.modal-next-btn')?.addEventListener('click', nextFullscreenSlide);
  document.querySelector('.modal-prev-btn')?.addEventListener('click', prevFullscreenSlide);
  
  // Click anywhere on fullscreen slide to advance
  document.getElementById('fullscreenModal')?.addEventListener('click', function(e) {
    if (isFullscreen && e.target === this) {
      nextFullscreenSlide();
    }
  });
  
  const slideshowEl = document.getElementById('slideshow');
  if (slideshowEl) {
    slideshowEl.addEventListener('mouseenter', stopAutoRotation);
    slideshowEl.addEventListener('mouseleave', startAutoRotation);
  }
  
  // Fullscreen change events
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
  // Keyboard controls
  document.addEventListener('keydown', function(e) {
    if (isFullscreen) {
      switch(e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
        case 'PageDown':
          nextFullscreenSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          prevFullscreenSlide();
          break;
        case 'Escape':
          closeFullscreenModal();
          break;
        case 'Home':
          showFullscreenSlide(0);
          break;
        case 'End':
          showFullscreenSlide(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            closeFullscreenModal();
          }
          break;
      }
    } else {
      switch(e.key) {
        case 'ArrowRight':
          nextSlide();
          startAutoRotation();
          break;
        case 'ArrowLeft':
          prevSlide();
          startAutoRotation();
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            openFullscreenModal();
          }
          break;
      }
    }
  });
  
  // Smooth scroll for navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#!') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.offsetTop - 90,
          behavior: 'smooth'
        });
      }
    });
  });
  
  console.log('Website with true fullscreen initialized successfully');
});