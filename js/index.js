let moduleData = {}

window.onload = () => {
    const atoken = localStorage.getItem("atoken")

    fetch('http://localhost:8080/home', {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        }).then(response => {
            if (!response.ok) {
                console.error(`Home feed request failed: ${response.body}`)
            }
            return response.json()
        })
        .then(data => {
            if (data && Array.isArray(data.modules)) {
                updateHomeFeed(data, atoken);
            } else {
                console.warn('Invalid data structure received from the backend.');
            }
        })
}

function updateHomeFeed(data, atoken) {
    data.modules.forEach(module => {
        moduleData[module["moduleId"]] = module["videoList"]
    });

    let continueSection = document.getElementById("continue-watching-items")
    moduleData["CONTINUE"].forEach(async videoInfo => {
        let videoTile = await generateVideoTile(videoInfo, atoken)
        continueSection.appendChild(videoTile)
    })

    let recSection = document.getElementById("rec-items")
    moduleData["RECOM"].forEach(async videoInfo => {
        let videoTile = await generateVideoTile(videoInfo, atoken)
        recSection.appendChild(videoTile)
    })
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