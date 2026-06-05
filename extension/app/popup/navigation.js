const menuIcons = {
  macros: iconSet.play,
  settings: iconSet.settings,
  shortcuts: iconSet.keyboard,
  about: iconSet.info
};

for (const button of refs.menuButtons) {
  button.innerHTML = menuIcons[button.dataset.page] ?? "";
}

for (const icon of document.querySelectorAll("[data-about-icon]")) {
  icon.innerHTML = icon.dataset.aboutIcon === "heart" ? iconSet.heart : iconSet.shieldCheck;
}

function selectPopupPage(pageName) {
  for (const page of refs.pages) {
    page.classList.toggle("hidden", page.dataset.pageContent !== pageName);
  }

  for (const button of refs.menuButtons) {
    const active = button.dataset.page === pageName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }

  syncPopupHeight();
}

refs.menu.addEventListener("click", (event) => {
  const button = event.target.closest(".popup-menu-btn");
  if (button?.dataset.page) {
    selectPopupPage(button.dataset.page);
  }
});
