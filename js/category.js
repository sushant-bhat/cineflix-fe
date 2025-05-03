window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');

    const atoken = localStorage.getItem("atoken")

    console.log(cat)
    if (cat) {
        fetch(`http://localhost:8080/browse/${cat}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${atoken}` // optional if your endpoint is protected
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const searchresults = document.getElementById("cat-result-items");
            data.modules[0].videoList.forEach(async videoInfo => {
                let videoTile = await generateVideoTile(videoInfo, atoken)
                searchresults.appendChild(videoTile)
            })
        })
    }
}