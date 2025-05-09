let moduleData = {}

window.onload = () => {
    const atoken = localStorage.getItem("atoken")

    fetch('http://localhost:9000/home', {
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
    })

    // const heroSectionItems = []
    let heroSection = document.getElementById("hero-section")
    moduleData["HERO"].forEach(async videoInfo => {
        await fetch(`http://localhost:9000/api/v1/video/${videoInfo.videoId}/thumb`, {
                headers: {
                    "Authorization": `Bearer ${atoken}`
                }
            }).then(response => response.blob())
            .then(blob => {
                const imageUrl = URL.createObjectURL(blob)
                // heroSection.style.backgroundImage = `url(${imageUrl})`
            })
    })

    let continueSection = document.getElementById("continue-watching-items")
    moduleData["CONTINUE"].forEach(async videoInfo => {
        let videoTile = await generateVideoTile(videoInfo, true, atoken)
        continueSection.appendChild(videoTile)
    })

    let recSection = document.getElementById("rec-items")
    moduleData["RECOM"].forEach(async videoInfo => {
        let videoTile = await generateVideoTile(videoInfo, false, atoken)
        recSection.appendChild(videoTile)
    })
}