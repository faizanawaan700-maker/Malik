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

  const portraitFrame = document.querySelector(".portrait-inner");
  const portrait = portraitFrame.querySelector("img");
  portrait.addEventListener("load", () => portraitFrame.classList.add("has-photo"), { once: true });
  fetch(portrait.dataset.photoSrc, { method: "HEAD" })
    .then(response => {
      if (response.ok) portrait.src = portrait.dataset.photoSrc;
    })
    .catch(error => console.error("Could not check the birthday photo.", error));

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
