/*---------------------------------------------------------------------------------------*/

export async function sendMessage(form) {
  const formData = new FormData(form);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  return new Promise((resolve, reject) => {
    fetch(form.action, {
      method: form.method,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'application/json',
      },
      body: json,
    })
      .then(async (response) => {
        const json = await response.json();
        if (response.status === 200 && json?.success) {
          resolve(json);
        } else if (json) {
          reject(json);
        } else {
          reject(response);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
