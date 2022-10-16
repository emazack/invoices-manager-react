type HttpRequest = Partial<Request & {
  body: any
}>

export function http<T>(endpoint: string, { body, ...req }: HttpRequest = {}): Promise<T> {
  const headers = {'Content-Type': 'application/json'}
  const config: any = {
    method: body ? 'POST' : 'GET',
    ...req,
    headers: {
      ...headers,
      ...req.headers,
    },
  }
  if (body) {
    config.body = JSON.stringify(body)
  }

  return fetch(endpoint, config)
    .then(async response => {
      if (response.ok) {
        return await response.json();
      }
      const errorMessage = await response.text()
      return Promise.reject(new Error(errorMessage))
    })
}

