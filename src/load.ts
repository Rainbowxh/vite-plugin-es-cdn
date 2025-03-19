async function fetchResource(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return response.text();
    }
  }catch(err){
    console.warn('[import-cdn] fetchResource error:', err)
    return null
  }
  return null;
}

async function loadResource(url: string | string[], retry = 1): Promise<string | null> {
  let _SAFE_LOCK = 4;
  const urls = typeof url === 'string' ? [url] : url;
  const tasks = urls.map((url) => () => fetchResource(url));

  return new Promise((resolve) => {
    while(tasks.length && _SAFE_LOCK) {
      _SAFE_LOCK--;
      const task = tasks.shift();
      if(task) {
        task().then((res) => {
          if(res) {
            resolve(res);
          } else {
            if(retry > 0) {
              retry--;
              tasks.push(task)
            }else {
              resolve(null);
            }
          }
        }).finally(() => resolve(null))
      }else {
        resolve(null);
      }
    }
  })
}
