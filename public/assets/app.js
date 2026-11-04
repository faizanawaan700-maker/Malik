(() => {
  const intro = document.getElementById("intro");
  const site = document.getElementById("birthdaySite");
  document.getElementById("enterExperience").addEventListener("click", () => {
    intro.classList.add("intro-leaving");
    window.setTimeout(() => {
      intro.remove();
      site.classList.remove("is-hidden");
      site.classList.add("site-enter");
      window.scrollTo(0, 0);
      burst(110);
    }, 850);
  });

  const target = new Date("2026-11-05T00:00:00+05:00").getTime();
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      const countdown = document.getElementById("countdown");
      countdown.replaceChildren();
      const message = document.createElement("div");
      message.className = "birthday-now";
      message.textContent = Date.now() < target + 86400000
        ? "TODAY IS YOUR DAY ✦"
        : "NOVEMBER 5, 2026 ✦";
      countdown.appendChild(message);
      document.getElementById("countdown-note").textContent = Date.now() < target + 86400000
        ? "November 5, 2026 · A day to celebrate you"
        : "A day to celebrate you, always";
      return;
    }
    const units = [
      ["days", 86400000], ["hours", 3600000], ["minutes", 60000], ["seconds", 1000]
    ];
    let rest = diff;
    units.forEach(([id, size]) => {
      const value = Math.floor(rest / size);
      rest %= size;
      document.getElementById(id).textContent = String(value).padStart(2, "0");
    });
  }
  tick();
  const countdownTimer = setInterval(() => {
    if (Date.now() >= target) {
      clearInterval(countdownTimer);
      tick();
      return;
    }
    tick();
  }, 1000);

  const portraitFrame = document.querySelector(".portrait-frame");
  const portraitReveal = document.getElementById("portraitReveal");
  const portrait = document.getElementById("portraitImage");
  const portraitRevealStatus = document.getElementById("portraitRevealStatus");

  portraitReveal.addEventListener("click", () => {
    if (portraitReveal.dataset.revealed === "true" || portraitReveal.dataset.loading === "true") return;

    portraitReveal.dataset.loading = "true";
    portraitReveal.classList.add("is-opening");
    portraitFrame.classList.add("is-opening");
    portraitReveal.setAttribute("aria-busy", "true");
    portraitRevealStatus.textContent = "Opening your surprise.";

    portrait.addEventListener("load", () => {
      portrait.hidden = false;
      portraitReveal.dataset.loading = "false";
      portraitReveal.dataset.revealed = "true";
      const finishReveal = () => {
        portraitReveal.classList.remove("is-opening");
        portraitFrame.classList.remove("is-opening");
        portraitReveal.classList.add("is-revealed");
        portraitFrame.classList.add("is-revealing");
        portraitFrame.classList.add("is-revealed");
        portraitReveal.removeAttribute("aria-busy");
        portraitReveal.setAttribute("aria-expanded", "true");
        portraitReveal.setAttribute("aria-label", "Birthday surprise revealed. Zahra's portrait.");
        portraitRevealStatus.textContent = "Your birthday surprise is revealed.";

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          [
            ["2%", "16%", "-8px", "-18px"],
            ["98%", "27%", "8px", "-20px"],
            ["0%", "63%", "-10px", "-14px"],
            ["100%", "74%", "10px", "-18px"],
            ["24%", "1%", "-8px", "-16px"],
            ["78%", "99%", "8px", "-22px"]
          ].forEach(([x, y, driftX, driftY], index) => {
            const particle = document.createElement("span");
            particle.className = "portrait-golden-particle";
            particle.setAttribute("aria-hidden", "true");
            particle.style.setProperty("--particle-x", x);
            particle.style.setProperty("--particle-y", y);
            particle.style.setProperty("--particle-drift-x", driftX);
            particle.style.setProperty("--particle-drift-y", driftY);
            particle.style.animationDelay = `${index * 70}ms`;
            particle.addEventListener("animationend", () => particle.remove(), { once: true });
            portraitFrame.appendChild(particle);
          });
        }
      };

      requestAnimationFrame(() => {
        const revealDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360;
        window.setTimeout(finishReveal, revealDelay);
      });
    }, { once: true });

    portrait.addEventListener("error", () => {
      portrait.removeAttribute("src");
      portraitReveal.dataset.loading = "false";
      portraitReveal.classList.remove("is-opening");
      portraitFrame.classList.remove("is-opening");
      portraitReveal.removeAttribute("aria-busy");
      portraitReveal.setAttribute("aria-label", "The surprise could not be loaded. Tap to try again.");
      portraitRevealStatus.textContent = "The surprise could not be loaded. Tap to try again.";
      console.error("Could not load the birthday surprise photo.");
    }, { once: true });

    portrait.src = portraitReveal.dataset.photoSrc;
  });

  document.querySelectorAll(".candle").forEach(candle => {
    candle.addEventListener("click", () => {
      candle.classList.toggle("blown");
      const remaining = document.querySelectorAll(".candle:not(.blown)").length;
      document.getElementById("wish-hint").textContent = remaining
        ? `${remaining} flame${remaining === 1 ? "" : "s"} left. Keep making wishes.`
        : "All wishes sent into the universe. ✨";
    });
  });
  document.getElementById("wishButton").addEventListener("click", () => {
    document.querySelectorAll(".candle").forEach(c => c.classList.add("blown"));
    document.getElementById("wish-hint").textContent = "Your wish is yours to keep. ✨";
    burst(70);
  });

  const wishForm = document.getElementById("wishForm");
  const wishMessage = document.getElementById("wishMessage");
  const wishStatus = document.getElementById("wishStatus");
  const wishCounter = document.getElementById("wishCounter");
  const sendWishButton = document.getElementById("sendWishButton");
  const updateWishCounter = () => {
    wishCounter.textContent = `${wishMessage.value.length} / 300`;
  };
  wishMessage.addEventListener("input", updateWishCounter);
  updateWishCounter();

  const wishFeedback = new URLSearchParams(window.location.search).get("wish");
  if (wishFeedback === "invalid") {
    wishStatus.textContent = "Please enter a wish of up to 300 characters.";
  } else if (wishFeedback === "unavailable") {
    wishStatus.textContent = "WhatsApp sending is not configured. Please try again later.";
  }

  wishForm.addEventListener("submit", event => {
    if (!wishMessage.value.trim()) {
      event.preventDefault();
      wishStatus.textContent = "Please write a wish before continuing.";
      wishMessage.focus();
      return;
    }

    wishStatus.textContent = "Opening WhatsApp with your wish ready to review.";
    sendWishButton.disabled = true;
  });

  document.getElementById("celebrateButton").addEventListener("click", () => burst(150));

  function burst(count) {
    const layer = document.getElementById("confettiLayer");
    for (let i = 0; i < count; i++) {
      const bit = document.createElement("i");
      bit.className = "confetti";
      bit.style.left = `${Math.random() * 100}%`;
      bit.style.setProperty("--drift", `${(Math.random() - .5) * 220}px`);
      bit.style.setProperty("--duration", `${2.2 + Math.random() * 2.5}s`);
      bit.style.setProperty("--delay", `${Math.random() * .6}s`);
      bit.style.setProperty("--spin", `${Math.random() * 900 - 450}deg`);
      layer.appendChild(bit);
      setTimeout(() => bit.remove(), 5500);
    }
  }
})();
