const policeBtn = document.getElementById("btn-police");
const criminalBtn = document.getElementById("btn-criminal");

policeBtn?.addEventListener("click", () => {
  alert("Du valde Police — spelet kommer snart!");
});

criminalBtn?.addEventListener("click", () => {
  alert("Du valde criminal — spelet kommer snart!");
});
