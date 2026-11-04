(() => {
  const params = new URLSearchParams(location.search);
  if (params.has("error")) document.getElementById("gate-error").classList.add("visible");
})();
