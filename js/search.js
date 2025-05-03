window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    console.log(query)
    if (query) {
        fetch(`http://localhost:8080/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${atoken}` // optional if your endpoint is protected
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const searchresults = document.getElementById("search-result-items");
            data.modules[0].videoList.forEach(async videoInfo => {
                let videoTile = await generateVideoTile(videoInfo, atoken)
                searchresults.appendChild(videoTile)
            })
        })
    }
}

async function generateVideoTile(videoInfo, atoken) {
    let li = document.createElement("li")

    let anchor = document.createElement("a")
    anchor.setAttribute("href", `/pages/video.html?id=${encodeURIComponent(videoInfo.videoId)}`)

    let image = document.createElement("img")
    await fetch(`http://localhost:8080/api/v1/video/${videoInfo.videoId}/thumb`, {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        }).then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            image.src = imageUrl;
        })
    image.classList.add("thumbnail-img")
    anchor.appendChild(image)

    let heading = document.createElement("h3")
    heading.innerHTML = videoInfo.videoTitle
    anchor.appendChild(heading)

    let addBtn = document.createElement("button")
    addBtn.classList.add("add-btn")
    addBtn.innerHTML = "+ Add"
    anchor.appendChild(addBtn)

    li.appendChild(anchor)
    return li
}