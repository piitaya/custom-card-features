// Hack to load ha-components needed for editor
export const loadHaComponents = () => {
  if (!customElements.get("ha-form")) {
    (customElements.get("tile-card") as any)?.getConfigElement();
  }
};
