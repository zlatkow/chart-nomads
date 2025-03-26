export const createModalContainer = () => {
  const container = document.createElement("div")
  container.id = "modal-root"
  document.body.appendChild(container)
  return container
}
