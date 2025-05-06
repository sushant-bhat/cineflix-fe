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