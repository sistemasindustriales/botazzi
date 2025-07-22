addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname

  if (pathname.startsWith("/stream/")) {
    const parts = pathname.split("/")
    const idRaw = parts.pop()
    const id = idRaw.replace(/:/g, "__")

    const jsonUrl = `/streams/${id}.json`
    return fetch(jsonUrl)
  }

  return new Response("Addon activo", { status: 200 })
}
