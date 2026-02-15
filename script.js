// ============================================================
//  SCRIPT.JS — Complete Rewrite
// ============================================================

(function () {

  // ---------------------------------------------------------------------------
  // DOM ELEMENTS
  // ---------------------------------------------------------------------------
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox?.querySelector(".lightbox-img");
  const closeBtn = lightbox?.querySelector(".close");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  let currentImgs = [];
  let currentIndex = 0;
  let allowArrows = false;

  // ---------------------------------------------------------------------------
  // OPEN / CLOSE LIGHTBOX
  // ---------------------------------------------------------------------------
  function openLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("aria-hidden", "false");
    prevBtn.style.display = allowArrows ? "block" : "none";
    nextBtn.style.display = allowArrows ? "block" : "none";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute("aria-hidden", "true");
  }

  // ---------------------------------------------------------------------------
  // SHOW IMAGE WITH SMOOTH FADE
  // ---------------------------------------------------------------------------
  function showImage(index) {
    if (!lightboxImg || !currentImgs.length) return;

    const newSrc = currentImgs[index];

    // fade-out
    lightboxImg.style.opacity = 0;

    // preload new image
    const loader = new Image();
    loader.onload = () => {
      lightboxImg.src = newSrc;
      requestAnimationFrame(() => {
        lightboxImg.style.opacity = 1; // smooth fade-in
      });
    };

    loader.onerror = () => {
      lightboxImg.src = newSrc;
      requestAnimationFrame(() => {
        lightboxImg.style.opacity = 1;
      });
    };

    loader.src = newSrc;
  }

  // ---------------------------------------------------------------------------
  // PROJECT CARDS (MULTI-IMAGE GALLERIES)
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(card.dataset.imgs || "[]");
        if (!Array.isArray(parsed) || parsed.length === 0) return;

        currentImgs = parsed;
        currentIndex = 0;
        allowArrows = currentImgs.length > 1;

        showImage(currentIndex);
        openLightbox();
      } catch (err) {
        console.error("Invalid JSON in data-imgs:", err);
      }
    });

    // keyboard accessibility
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // LAYOUT & ILLUSTRATION (SINGLE IMAGE)
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".layout-grid button").forEach(btn => {
    btn.addEventListener("click", () => {
      const src = btn.dataset.img;
      if (!src) return;

      currentImgs = [src];
      currentIndex = 0;
      allowArrows = false;

      showImage(currentIndex);
      openLightbox();
    });
  });

  // ---------------------------------------------------------------------------
  // CLOSE BUTTON
  // ---------------------------------------------------------------------------
  closeBtn?.addEventListener("click", closeLightbox);

  // Click background to close
  lightbox?.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  // ---------------------------------------------------------------------------
  // NEXT / PREV BUTTONS
  // ---------------------------------------------------------------------------
  nextBtn?.addEventListener("click", e => {
    e.stopPropagation();
    if (!allowArrows) return;
    currentIndex = (currentIndex + 1) % currentImgs.length;
    showImage(currentIndex);
  });

  prevBtn?.addEventListener("click", e => {
    e.stopPropagation();
    if (!allowArrows) return;
    currentIndex = (currentIndex - 1 + currentImgs.length) % currentImgs.length;
    showImage(currentIndex);
  });

  // ---------------------------------------------------------------------------
  // KEYBOARD CONTROLS
  // ---------------------------------------------------------------------------
  document.addEventListener("keydown", e => {
    if (!lightbox || lightbox.getAttribute("aria-hidden") === "true") return;

    if (e.key === "Escape") {
      closeLightbox();
      return;
    }

    if (allowArrows) {
      if (e.key === "ArrowRight") {
        currentIndex = (currentIndex + 1) % currentImgs.length;
        showImage(currentIndex);
      }
      if (e.key === "ArrowLeft") {
        currentIndex = (currentIndex - 1 + currentImgs.length) % currentImgs.length;
        showImage(currentIndex);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // EMAIL BUTTON — COPY TO CLIPBOARD + OPEN MAIL APP
  // ---------------------------------------------------------------------------
  document.querySelectorAll(".copy-email").forEach(btn => {
    btn.addEventListener("click", async () => {
      const email = btn.dataset.email;
      if (!email) return;

      // Try native clipboard
      try {
        await navigator.clipboard.writeText(email);
        console.log("Copied:", email);
      } catch (err) {
        // Fallback copy method
        const temp = document.createElement("input");
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
      }

      // Do NOT preventDefault → mailto: still opens
    });
  });

  // ---------------------------------------------------------------------------
  // ACCESSIBILITY: Auto-focus close button when opened
  // ---------------------------------------------------------------------------
  const observer = new MutationObserver(() => {
    if (lightbox?.getAttribute("aria-hidden") === "false") {
      closeBtn?.focus();
    }
  });

  if (lightbox) {
    observer.observe(lightbox, { attributes: true, attributeFilter: ["aria-hidden"] });
  }

})();
