
/* =========================================
   BHUMI — VERTICAL SCROLL / HORIZONTAL GALLERY
========================================= */

(() => {
  function initBrandingGallery() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    if (!gsap || !ScrollTrigger) {
      console.warn("Bhumi gallery: GSAP or ScrollTrigger is missing.");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector("#branding, .branding-section");
    const stage = section?.querySelector(".branding-stage");
    const track = section?.querySelector(".branding-grid, .work-grid");

    if (!section || !stage || !track) return;

    const cards = [...track.querySelectorAll(".branding-card")];
    if (cards.length < 2) return;

    let galleryTween;

    function buildGallery() {
      if (galleryTween) {
        galleryTween.scrollTrigger?.kill();
        galleryTween.kill();
        galleryTween = null;
      }

      // Clear transforms left by a previous layout.
      gsap.set(track, { clearProps: "transform" });

      // Mobile uses a normal vertical card stack.
      if (window.matchMedia("(max-width: 700px)").matches) {
        gsap.set(track, { clearProps: "all" });
        return;
      }

      const getDistance = () =>
        Math.max(0, track.scrollWidth - window.innerWidth);

      if (getDistance() <= 0) return;

      galleryTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          id: "bhumi-branding-horizontal",
          trigger: stage,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // Card depth while the gallery travels.
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            y: index % 2 === 0 ? 24 : 55,
            rotateY: index % 2 === 0 ? 2 : -2
          },
          {
            y: 0,
            rotateY: 0,
            ease: "none",
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: () => `+=${getDistance()}`,
              scrub: 1
            }
          }
        );
      });
    }

    // Wait for project images before measuring the gallery.
    const images = [...track.querySelectorAll("img")];

    Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();

        return new Promise(resolve => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    ).then(() => {
      buildGallery();
      ScrollTrigger.refresh();
    });

    let resizeTimer;

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        buildGallery();
        ScrollTrigger.refresh();
      }, 200);
    });

    // Subtle 3D pointer tilt on desktop.
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (finePointer) {
      cards.forEach(card => {
        card.addEventListener("pointermove", event => {
          const rect = card.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;

          gsap.to(card, {
            rotateY: x * 3,
            rotateX: -y * 3,
            transformPerspective: 1000,
            duration: 0.35,
            overwrite: "auto"
          });
        });

        card.addEventListener("pointerleave", () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto"
          });
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBrandingGallery, {
      once: true
    });
  } else {
    initBrandingGallery();
  }
})();
