window.onload = async () => {
  const atoken = localStorage.getItem("atoken")

  await fetch(`http://localhost:9000/category`, {
      headers: {
        "Authorization": `Bearer ${atoken}`
      }
    }).then(resp => resp.json())
    .then(data => {
      const videoTags = document.getElementById("video-tags")
      data.categories.forEach(element => {
        let catOption = document.createElement("option")
        catOption.value = element.name
        catOption.innerHTML = element.name.toUpperCase()
        videoTags.appendChild(catOption)
      })
    })
}

document.getElementById('upload-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const videoFile = document.getElementById('video-vid').files[0]
  const thumbnailFile = document.getElementById('video-thumb').files[0]
  const coverFile = document.getElementById('video-cover').files[0]

  const metadata = {
    videoTitle: document.getElementById('video-title').value,
    videoDescription: document.getElementById('video-descr').value,
    videoDirector: document.getElementById('video-director').value,
    videoTags: Array.from(document.getElementById('video-tags').selectedOptions).map(option => option.value),
    videoCast: document.getElementById('video-cast').value.split('\n').map(cast => cast.trim())
  };

  const formData = new FormData();
  formData.append('file', videoFile);
  formData.append('thumbnail', thumbnailFile);
  formData.append('cover', coverFile);
  formData.append('video', new Blob([JSON.stringify(metadata)], {
    type: 'application/json'
  }))

  try {

    const atoken = localStorage.getItem("atoken")

    const response = await fetch('http://localhost:9000/api/v1/video', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${atoken}`
      },
      body: formData
    });

    if (!response.ok) {
      console.error(`Upload failed: ${response.status}`)
      return
    }

    const result = await response.json();
    console.log('Upload successful:', result)
  } catch (error) {
    console.error('Upload failed:', error)
  }
  window.location.href = '/'
});