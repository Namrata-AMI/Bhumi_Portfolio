// =========================================
// HORIZONTAL PROJECT SCROLL
// =========================================

if (
  window.gsap &&
  window.ScrollTrigger &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  gsap.registerPlugin(ScrollTrigger);

  const gallery = document.querySelector(".works-gallery");
  const track = document.querySelector(".works-projects");

  if (gallery && track) {
    const setupHorizontalGallery = () => {
      // Remove an earlier instance when recalculating dimensions.
      ScrollTrigger.getById("works-horizontal")?.kill();

      gsap.set(track, { x: 0 });

      const distance = track.scrollWidth - gallery.clientWidth;

      if (distance <= 0) return;

      gsap.to(track, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          id: "works-horizontal",
          trigger: gallery,
          start: "top top",
          end: () => `+=${track.scrollWidth - gallery.clientWidth}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    };

    // Wait until project images have loaded for accurate widths.
    if (document.readyState === "complete") {
      setupHorizontalGallery();
    } else {
      window.addEventListener("load", setupHorizontalGallery, {
        once: true
      });
    }

    window.addEventListener("resize", () => {
      ScrollTrigger.refresh();
    });
  }
}