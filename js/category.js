window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');

    const atoken = localStorage.getItem("atoken")

    console.log(cat)
    if (cat) {
        fetch(`http://localhost:9000/browse/${cat}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${atoken}` // optional if your endpoint is protected
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const catResultsHeading = document.getElementById("cat-result-heading")
            if (!data || !data.modules || data.modules.length === 0 || !data.modules[0].videoList || data.modules[0].videoList.length === 0) {
                catResultsHeading.innerText = `Sorry, no results found for ${cat}`
            } else {
                catResultsHeading.innerText = `Results for ${cat}`
            }
            const catResults = document.getElementById("cat-result-items")
            data.modules[0].videoList.forEach(async videoInfo => {
                let videoTile = await generateVideoTile(videoInfo, atoken)
                catResults.appendChild(videoTile)
            })
        })
    }
}