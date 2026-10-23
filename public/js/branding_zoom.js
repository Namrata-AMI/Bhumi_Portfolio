
/* =========================================
   BHUMI — BRANDING GALLERY
   One horizontal scroll + one image zoom
========================================= */

(() => {
  function initBrandingGallery() {
    const section = document.querySelector("#branding");
    const stage = section?.querySelector(".branding-stage");
    const track = section?.querySelector(".branding-grid");

    if (!section || !stage || !track) return;
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const media = gsap.matchMedia();

    media.add(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      () => {
        // Avoid creating the gallery twice.
        if (track.dataset.brandingGalleryInitialized === "true") {
          return;
        }

        track.dataset.brandingGalleryInitialized = "true";
        track.classList.add("branding-horizontal");

        const getDistance = () =>
          Math.max(0, track.scrollWidth - stage.clientWidth);

        if (getDistance() <= 20) {
          track.classList.remove("branding-horizontal");
          track.dataset.brandingGalleryInitialized = "false";
          return;
        }

        const cards = [...track.querySelectorAll(".branding-card")];

        // Gentle floating movement while scrolling.
        cards.forEach((card, index) => {
          gsap.set(card, {
            y: index % 2 === 0 ? 18 : -18,
            rotation: index % 2 === 0 ? -1.2 : 1.2,
            transformOrigin: "center center"
          });
        });

        const timeline = gsap.timeline();

        timeline.to(
          track,
          {
            x: () => -getDistance(),
            ease: "none"
          },
          0
        );

        cards.forEach((card, index) => {
          timeline.to(
            card,
            {
              y: index % 2 === 0 ? -12 : 12,
              rotation: index % 2 === 0 ? 1 : -1,
              ease: "none"
            },
            0
          );
        });

        const trigger = ScrollTrigger.create({
          id: "branding-horizontal",
          trigger: stage,
          start: "top top+=50",
          end: () => `+=${Math.max(600, getDistance())}`,
          pin: stage,
          pinSpacing: true,
          scrub: 1,
          animation: timeline,
          invalidateOnRefresh: true,
          anticipatePin: 1
        });

        // Zoom each image only once.
        const zoomTweens = cards
          .map(card => card.querySelector(".card-media img"))
          .filter(Boolean)
          .map(img =>
            gsap.fromTo(
              img,
              { scale: 0.85 },
              {
                scale: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: img,
                  start: "top 90%",
                  end: "top 35%",
                  scrub: 0.8
                }
              }
            )
          );

        const refresh = () => ScrollTrigger.refresh();

        window.addEventListener("load", refresh, { once: true });

        track.querySelectorAll("img").forEach(img => {
          if (!img.complete) {
            img.addEventListener("load", refresh, { once: true });
            img.addEventListener("error", refresh, { once: true });
          }
        });

        requestAnimationFrame(refresh);

        // Clean up if the screen size or motion preference changes.
        return () => {
          trigger.kill();
          timeline.kill();

          zoomTweens.forEach(tween => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });

          gsap.set(track, { clearProps: "transform" });
          cards.forEach(card => {
            gsap.set(card, { clearProps: "transform" });
          });

          track.classList.remove("branding-horizontal");
          track.dataset.brandingGalleryInitialized = "false";
        };
      }
    );

    // On mobile or reduced-motion devices, keep the normal gallery.
    if (reduceMotion || !window.matchMedia("(min-width: 701px)").matches) {
      track.classList.remove("branding-horizontal");
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
