document.addEventListener('DOMContentLoaded', () => {
  const dashTime = document.getElementById('dash-time');
  const dashTasks = document.getElementById('dash-tasks');
  const dashBookings = document.getElementById('dash-bookings');
  const dashStress = document.getElementById('dash-stress');
  const dashProgress = document.getElementById('dash-progress');
  const dashLoad = document.getElementById('dash-load');


  // Populate demo dashboard values (safe, no network calls)
  try {
    if (dashTime) dashTime.textContent = '12';
    if (dashTasks) dashTasks.textContent = '35';
    if (dashBookings) dashBookings.textContent = '18';
    if (dashStress) dashStress.textContent = '↓';
    if (dashProgress) dashProgress.style.width = '66%';
    if (dashLoad) dashLoad.textContent = 'CPU: 12%';
  } catch (e) {
    // fail silently — UI is primarily static
    console.warn('dashboard init error', e);
  }



  // Mobile nav: accessible open/close + focus trap
  const mobileOpen = document.getElementById('mobile-nav-open');
  const mobileClose = document.getElementById('mobile-nav-close');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  let _lastFocus = null;

  function trapKey(e) {
    if (!mobileNav || mobileNav.classList.contains('hidden')) return;
    if (e.key === 'Escape') {
      closeMobileNav();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(mobileNav.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function openMobileNav() {
    if (!mobileNav) return;
    _lastFocus = document.activeElement;
    mobileNav.classList.remove('hidden');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (mobileOpen) mobileOpen.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const focusable = mobileNav.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    document.addEventListener('keydown', trapKey);
  }

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('hidden');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (mobileOpen) mobileOpen.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (_lastFocus && _lastFocus.focus) _lastFocus.focus();
    document.removeEventListener('keydown', trapKey);
  }

  if (mobileOpen) mobileOpen.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);



  // ── Scroll-based Navigation ──
  // Toggle .nav-scrolled on header when user scrolls past hero section
  const stickyHeader = document.querySelector('header.sticky');
  const heroSection = document.getElementById('hero');

  if (stickyHeader && heroSection) {
    const handleScroll = () => {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      if (window.scrollY > heroBottom * 0.3) {
        stickyHeader.classList.add('nav-scrolled');
      } else {
        stickyHeader.classList.remove('nav-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on load
  }

  // ── Section Reveal Animations ──
  // Use IntersectionObserver to trigger .revealed class on .reveal sections
  const revealSections = document.querySelectorAll('.reveal');

  if (revealSections.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    revealSections.forEach(section => revealObserver.observe(section));
  } else {
    // Fallback: show everything if no IntersectionObserver
    revealSections.forEach(section => section.classList.add('revealed'));
  }

  // ── Tech Stack Card Shuffle ──
  // Every 20 s the tool cards in #tech-stack-grid swap positions randomly.
  // Phase 1: fade-out + scale-down (250 ms)
  // Phase 2: re-order DOM, then fade each card back in with a stagger
  (function initTechStackShuffle() {
    const grid = document.getElementById('tech-stack-grid');
    if (!grid) return; // guard: element must exist

    // Detect user's motion preference
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fisher-Yates shuffle — returns a NEW shuffled array, original untouched
    function shuffleArray(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function runShuffle() {
      // Skip shuffle on mobile — the mobile carousel handles card visibility
      if (window.matchMedia('(max-width: 767px)').matches) return;

      const cards = Array.from(grid.children);
      if (cards.length < 2) return; // nothing to shuffle

      if (reducedMotion) {
        // No animation — just silently reorder
        const shuffled = shuffleArray(cards);
        shuffled.forEach(card => grid.appendChild(card));
        return;
      }

      // Phase 1 — fade all cards out simultaneously
      cards.forEach(card => {
        card.classList.remove('tech-card-shuffle-in');
        card.style.animationDelay = '';
        card.classList.add('tech-card-shuffling');
      });

      // After the fade-out transition completes (280 ms > 250 ms transition)
      setTimeout(() => {
        // Re-order the DOM
        const shuffled = shuffleArray(cards);
        shuffled.forEach(card => grid.appendChild(card));

        // Phase 2 — fade each card back in with a small stagger
        shuffled.forEach((card, index) => {
          card.classList.remove('tech-card-shuffling');
          card.style.animationDelay = `${index * 40}ms`; // 40 ms stagger per card
          card.classList.add('tech-card-shuffle-in');
        });

        // Clean up animation class once all cards are done
        const totalDuration = 350 + shuffled.length * 40 + 50; // animation + stagger + buffer
        setTimeout(() => {
          shuffled.forEach(card => {
            card.classList.remove('tech-card-shuffle-in');
            card.style.animationDelay = '';
          });
        }, totalDuration);

      }, 280);
    }

    // ── Mouse Glow Effect ──
    const mouseGlow = document.getElementById('mouse-glow');
    if (mouseGlow) {
      window.addEventListener('mousemove', (e) => {
        mouseGlow.style.left = e.clientX + 'px';
        mouseGlow.style.top = e.clientY + 'px';
      }, { passive: true });
    }

    // ── Scroll Active Links ──
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    function highlightNav() {
      let scrollY = window.pageYOffset;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('text-cyan-400');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('text-cyan-400');
            }
          });
        }
      });
    }
    window.addEventListener('scroll', highlightNav);

    // ── Copy Email to Clipboard ──
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
      emailLink.addEventListener('click', (e) => {
        // Only prevent if clicking near the icon or if user expects copy
        // For now, let's just make it a nice secondary feature
        const email = emailLink.getAttribute('href').replace('mailto:', '');
        navigator.clipboard.writeText(email).then(() => {
          const originalText = emailLink.innerHTML;
          // Simple feedback could be added here
          console.log('Email copied to clipboard');
        });
      });
    }

    // Kick off the 20-second interval
    setInterval(runShuffle, 20000);
  })();

  // ── Footer Year ──
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Chatbot Logic ──
  const chatWindow = document.getElementById("chat-window");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const botMode = document.getElementById("bot-mode");
  const botAvatar = document.getElementById("bot-avatar");
  const toggleBtn = document.getElementById("chatbot-toggle");
  const closeBtn = document.getElementById("chatbot-close");
  const chatWidget = document.getElementById("chatbot-window");
  const voiceBtn = document.getElementById("voice-btn");

  if (chatWindow) {
    function saveHistory() {
      localStorage.setItem("chatHistory", chatWindow.innerHTML);
    }

    function timestamp() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function addMessage(text, sender = "bot") {
      const bubble = document.createElement("div");
      bubble.className = "flex items-start gap-2";

      const avatar = document.createElement("div");
      avatar.className =
        sender === "bot"
          ? botAvatar.className
          : "w-6 h-6 rounded-full bg-emerald-400";

      const wrapper = document.createElement("div");
      wrapper.className = "bg-slate-800 px-3 py-2 rounded-lg max-w-[80%]";

      const msg = document.createElement("div");
      msg.textContent = text;

      const time = document.createElement("div");
      time.className = "text-[10px] text-slate-400 mt-1";
      time.textContent = timestamp();

      wrapper.appendChild(msg);
      wrapper.appendChild(time);
      bubble.appendChild(avatar);
      bubble.appendChild(wrapper);
      chatWindow.appendChild(bubble);

      chatWindow.scrollTop = chatWindow.scrollHeight;
      saveHistory();
    }

    let typingInterval;
    function showTyping() {
      const typing = document.createElement("div");
      typing.id = "typing-indicator";
      typing.className = "flex items-start gap-2";

      const avatar = document.createElement("div");
      avatar.className = botAvatar.className;

      const dots = document.createElement("div");
      dots.className =
        "bg-slate-800 px-3 py-2 rounded-lg text-slate-300 text-xs";
      dots.innerHTML = `
      <span class="animate-pulse">●</span>
      <span class="animate-pulse delay-150">●</span>
      <span class="animate-pulse delay-300">●</span>
    `;

      typing.appendChild(avatar);
      typing.appendChild(dots);
      chatWindow.appendChild(typing);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function hideTyping() {
      const t = document.getElementById("typing-indicator");
      if (t) t.remove();
    }

    const personalities = {
      fun: {
        avatar: "w-8 h-8 rounded-full bg-cyan-400",
        greet: "Hey hey! Ready to automate your chaos?",
        automate: "I automate everything except your love life. That one’s still in beta.",
        joke: "Why did the developer go broke? Because he used up all his cache.",
        website: "Websites that sparkle, convert, and never ghost your customers.",
        ai: "AI is my superpower. I use it to fight boring tasks and bad workflows.",
        savings: "Money talks! Check out the ROI calculator on this page to see how much we can save you.",
        default: "Ooooh interesting. Tell me more, human friend."
      },
      professional: {
        avatar: "w-8 h-8 rounded-full bg-blue-400",
        greet: "Hello. How can I support your workflow or automation needs today?",
        automate: "I can streamline bookings, emails, reporting, and operational workflows efficiently.",
        joke: "Debugging is like being a detective in a crime movie where you are also the murderer.",
        website: "I build clean, responsive, conversion-focused websites tailored to your business goals.",
        ai: "AI is a powerful tool for reducing manual workload and improving operational efficiency.",
        savings: "Operational efficiency leads to direct cost savings. I recommend using our specialized ROI calculator below to estimate your potential annual recovery.",
        default: "I understand. Could you provide more details so I can assist effectively?"
      },
      sarcastic: {
        avatar: "w-8 h-8 rounded-full bg-rose-400",
        greet: "Oh great, another human. What chaos are we fixing today?",
        automate: "Sure, I’ll automate your tasks. Your procrastination, however, is out of scope.",
        joke: "A joke? Your current workflow is already hilarious.",
        website: "Yes, I build websites. No, they won’t fix your bad WiFi.",
        ai: "AI is amazing. It even pretends to listen better than most people.",
        savings: "Ah, looking for the bottom line? Scroll down to the ROI calculator. It'll show you exactly how much money is currently leaking out of your business.",
        default: "Fascinating. Truly. Go on, I’m riveted."
      }
    };

    function updateAvatar() {
      botAvatar.className = personalities[botMode.value].avatar;
    }

    function loadHistory() {
      const history = localStorage.getItem("chatHistory");
      if (history) {
        chatWindow.innerHTML = history;
      } else {
        addMessage(personalities[botMode.value].greet, "bot");
      }
    }

    botMode.addEventListener("change", () => {
      updateAvatar();
      const history = localStorage.getItem("chatHistory");
      // If chat is empty or contains only a single greeting message from the bot, replace it
      if (!history || chatWindow.children.length <= 1) {
        chatWindow.innerHTML = "";
        addMessage(personalities[botMode.value].greet, "bot");
      } else {
        // Otherwise, notify the user of the tone switch
        addMessage(`[Switched to ${botMode.value.toUpperCase()} mode] ${personalities[botMode.value].greet}`, "bot");
      }
    });

    updateAvatar();
    loadHistory();

    // The API key has been moved to the backend server (.env -> GEMINI_API_KEY)
    // for security. The frontend now communicates via the /api/chat proxy.

    const SYSTEM_PROMPT = `You are Chima's AI assistant on his portfolio site (chimadev.com).
Chima is a Web Developer, Workflow Optimizer, and AI Evangelizer.
Target Audience: Small businesses, solo entrepreneurs, influencers.
Services:
1. Web Design & Redesign: Sleek, responsive, conversion-focused.
2. App Development: Custom web apps, internal portals.
3. Branding & Integrations: Next.JS, Vercel, Stripe.
4. AI Automation & Chatbots: Smart systems.
5. Workflow Optimization: Automating back-office chaos.
Process: Audit & Discovery -> Architecture -> Build & Automate -> Launch & Scale.
Pricing: Focused on saving money. Uses an ROI calculator.
Contact: hallo@chimadev.com
FAQs:
- Works with non-techies? Yes.
- Fast? Simple sites 2-3 weeks.
- Cost? Tailored to small business budgets.

Instructions:
- Keep answers very short and conversational (1-3 sentences max).
- Match the requested tone exactly based on user prompt context.
- Always be helpful, point them to hallo@chimadev.com for complex requests.
- DO NOT invent information.
`;

    let chatSessionHistory = [];

    async function botReply(text) {

      const mode = botMode.value;
      let toneInstruction = "";
      if (mode === "fun") toneInstruction = "Use a fun, slightly humorous, and very friendly tone.";
      if (mode === "professional") toneInstruction = "Use a highly professional, polite, and concise tone.";
      if (mode === "sarcastic") toneInstruction = "Use a sarcastic, witty, slightly condescending but ultimately helpful tone (like a tired genius).";

      chatSessionHistory.push({ role: "user", parts: [{ text: text }] });

      try {
        const response = await fetch(`/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT + "\n\n" + toneInstruction }]
            },
            contents: chatSessionHistory
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          console.error("API Error Response:", errData);
          throw new Error("API Error");
        }

        const data = await response.json();
        const replyText = data.candidates[0].content.parts[0].text;
        
        chatSessionHistory.push({ role: "model", parts: [{ text: replyText }] });
        
        return replyText;
      } catch (err) {
        console.error("Chatbot API Error:", err);
        // Pop the user message if it failed, so they can try again
        chatSessionHistory.pop();
        return "Oops, my circuits got crossed. Please email Chima at hallo@chimadev.com instead!";
      }
    }

    async function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;

      addMessage(text, "user");
      chatInput.value = "";

      showTyping();

      const reply = await botReply(text);

      hideTyping();
      addMessage(reply, "bot");
    }

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      voiceBtn.addEventListener("click", () => {
        voiceBtn.textContent = "🎙️";
        recognition.start();
      });

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        chatInput.value = transcript;
        voiceBtn.textContent = "🎤";
      };

      recognition.onend = () => {
        voiceBtn.textContent = "🎤";
      };
    }

    toggleBtn.addEventListener("click", () => {
      chatWidget.classList.toggle("hidden");
    });

    closeBtn.addEventListener("click", () => {
      chatWidget.classList.add("hidden");
    });
  }

  // ── ROI Calculator Logic ──
  const hoursInput = document.getElementById('manual-hours');
  const rateInput = document.getElementById('hourly-rate');
  const hoursVal = document.getElementById('hours-val');
  const annualLossText = document.getElementById('annual-loss');
  const weeksLostElem = document.getElementById('weeks-lost');

  function calculateROI() {
    if (!hoursInput || !rateInput || !hoursVal || !annualLossText || !weeksLostElem) return;

    const hours = parseInt(hoursInput.value);
    const rate = parseInt(rateInput.value) || 0;

    hoursVal.textContent = hours + (hours >= 40 ? 'h+' : 'h');

    const yearlyLoss = hours * rate * 52;
    annualLossText.textContent = yearlyLoss.toLocaleString();

    const totalHoursYear = hours * 52;
    const weeksLost = Math.round(totalHoursYear / 40);
    weeksLostElem.textContent = weeksLost;
  }

  if (hoursInput && rateInput) {
    hoursInput.addEventListener('input', calculateROI);
    rateInput.addEventListener('input', calculateROI);
    calculateROI();
  }

  // ── SheetDB Form Submission ──
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      formStatus.classList.remove('hidden', 'text-rose-400', 'text-emerald-400');
      formStatus.classList.add('text-cyan-400');
      formStatus.textContent = 'Processing your request...';

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      data.date = new Date().toLocaleString();

      fetch('https://sheetdb.io/api/v1/8h250m0bvd2qo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [data] }),
      })
        .then(response => {
          if (response.ok) {
            formStatus.textContent = 'Message sent! I’ll get back to you soon.';
            formStatus.classList.replace('text-cyan-400', 'text-emerald-400');
            contactForm.reset();
            calculateROI();
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          formStatus.textContent = 'Oops! Something went wrong. Please try again.';
          formStatus.classList.replace('text-cyan-400', 'text-rose-400');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
          setTimeout(() => {
            formStatus.classList.add('hidden');
          }, 5000);
        });
    });
  }

  // ── HERO DASHBOARD ANIMATION ──
  if (dashTime && dashTasks && dashBookings) {
    let stats = { time: 0, tasks: 0, bookings: 0 };
    const targets = { time: 10, tasks: 80, bookings: 30 };

    const animateCount = () => {
      const speed = 0.05;
      let animated = false;

      Object.keys(targets).forEach(key => {
        if (stats[key] < targets[key]) {
          stats[key] = Math.min(targets[key], stats[key] + targets[key] * speed);
          animated = true;
        }
      });

      dashTime.textContent = Math.floor(stats.time);
      dashTasks.textContent = Math.floor(stats.tasks);
      dashBookings.textContent = Math.floor(stats.bookings);

      if (animated) requestAnimationFrame(animateCount);
    };

    animateCount();

    setInterval(() => {
      if (dashProgress) dashProgress.style.width = (20 + Math.random() * 60) + '%';
      if (dashLoad) dashLoad.textContent = `CPU: ${Math.floor(10 + Math.random() * 20)}%`;

      if (Math.random() > 0.8) {
        dashTime.classList.add('scale-110', 'text-white');
        setTimeout(() => dashTime.classList.remove('scale-110', 'text-white'), 500);
      }
    }, 3000);
  }

  // ── COOKIE CONSENT & TRACKING ──
  const cookieBanner = document.getElementById('cookie-banner');
  const btnAccept = document.getElementById('cookie-accept');
  const btnReject = document.getElementById('cookie-reject');

  function initTracking() {
    // Insert your tracking codes (e.g., Google Analytics, Meta Pixel) here
    console.log("Tracking initialized. User accepted cookies.");

    // Example for GA4:
    // const script = document.createElement('script');
    // script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID';
    // script.async = true;
    // document.head.appendChild(script);
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){dataLayer.push(arguments);}
    // gtag('js', new Date());
    // gtag('config', 'YOUR-GA-ID');
  }

  if (cookieBanner && btnAccept && btnReject) {
    const consent = localStorage.getItem('chimadev_cookie_consent');

    if (consent === 'accepted') {
      initTracking();
    } else if (!consent) {
      // Show banner after a slight delay
      setTimeout(() => {
        cookieBanner.classList.remove('translate-y-full');
      }, 1000);
    }

    btnAccept.addEventListener('click', () => {
      localStorage.setItem('chimadev_cookie_consent', 'accepted');
      cookieBanner.classList.add('translate-y-full');
      initTracking();
    });

    btnReject.addEventListener('click', () => {
      localStorage.setItem('chimadev_cookie_consent', 'rejected');
      cookieBanner.classList.add('translate-y-full');
    });
  }

  // ═══════════════════════════════════════════════════════════
  // MOBILE-ONLY INTERACTIVE FEATURES
  // Only activate on viewports < 768px
  // ═══════════════════════════════════════════════════════════
  const isMobile = window.matchMedia('(max-width: 767px)');

  function initMobileFeatures() {
    if (!isMobile.matches) return;

    // ── Tech Stack Carousel (2x2 pages) ──
    const techGrid = document.getElementById('tech-stack-grid');
    const carouselNav = document.querySelector('.tech-carousel-nav');

    if (techGrid && carouselNav) {
      const allCards = Array.from(techGrid.children);
      const CARDS_PER_PAGE = 4;
      const totalPages = Math.ceil(allCards.length / CARDS_PER_PAGE);
      let currentPage = 0;

      // Show nav dots
      carouselNav.style.display = 'flex';

      // Generate correct number of dots
      carouselNav.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'tech-carousel-dot' + (i === 0 ? ' active' : '');
        dot.dataset.page = i;
        dot.setAttribute('aria-label', `Page ${i + 1}`);
        carouselNav.appendChild(dot);
      }

      function showPage(page) {
        currentPage = page;
        allCards.forEach((card, idx) => {
          const cardPage = Math.floor(idx / CARDS_PER_PAGE);
          card.style.display = cardPage === page ? '' : 'none';
        });

        // Update dots
        carouselNav.querySelectorAll('.tech-carousel-dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === page);
        });
      }

      // Show first page
      showPage(0);

      // Dot click handlers
      carouselNav.addEventListener('click', (e) => {
        const dot = e.target.closest('.tech-carousel-dot');
        if (!dot) return;
        showPage(parseInt(dot.dataset.page));
      });

      // Auto-cycle every 5 seconds
      let carouselInterval = setInterval(() => {
        showPage((currentPage + 1) % totalPages);
      }, 5000);

      // Pause on interaction
      carouselNav.addEventListener('pointerdown', () => {
        clearInterval(carouselInterval);
        // Resume after 10s
        setTimeout(() => {
          carouselInterval = setInterval(() => {
            showPage((currentPage + 1) % totalPages);
          }, 5000);
        }, 10000);
      });

      // Swipe support for tech stack
      let touchStartX = 0;
      techGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      techGrid.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          clearInterval(carouselInterval);
          if (diff > 0 && currentPage < totalPages - 1) showPage(currentPage + 1);
          else if (diff < 0 && currentPage > 0) showPage(currentPage - 1);
        }
      }, { passive: true });
    }

    // ── FAQ Accordions ──
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
      // Show toggle icons on mobile
      document.querySelectorAll('.faq-toggle-icon').forEach(icon => {
        icon.style.display = '';
      });

      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
          const wasOpen = item.classList.contains('open');

          // Close all other items (accordion behavior)
          faqItems.forEach(other => other.classList.remove('open'));

          // Toggle current
          if (!wasOpen) {
            item.classList.add('open');
          }
        });
      });
    }

    // ── Case Studies Swipe Hint ──
    const swipeHint = document.querySelector('.case-studies-scroll-hint');
    if (swipeHint) {
      swipeHint.style.display = '';

      // Hide hint after first swipe
      const caseContainer = document.querySelector('#case-studies .space-y-8');
      if (caseContainer) {
        caseContainer.addEventListener('scroll', () => {
          swipeHint.style.display = 'none';
        }, { once: true });
      }
    }
  }

  // Initialize mobile features
  initMobileFeatures();

  // Re-check on resize (handles orientation changes)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMobile.matches) {
        initMobileFeatures();
      } else {
        // Reset mobile-specific states on larger viewports
        document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('open'));
        document.querySelectorAll('.faq-toggle-icon').forEach(icon => icon.style.display = 'none');

        const techGrid = document.getElementById('tech-stack-grid');
        if (techGrid) {
          Array.from(techGrid.children).forEach(card => card.style.display = '');
        }

        const carouselNav = document.querySelector('.tech-carousel-nav');
        if (carouselNav) carouselNav.style.display = 'none';

        const swipeHint = document.querySelector('.case-studies-scroll-hint');
        if (swipeHint) swipeHint.style.display = 'none';
      }
    }, 200);
  });
});
