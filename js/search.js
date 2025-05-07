window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    const atoken = localStorage.getItem("atoken")
    console.log(query)
    if (query) {
        fetch(`http://localhost:9000/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${atoken}`
            }
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            const searchQueryBar = document.getElementById("nav-search-q")
            searchQueryBar.value = query
            const searchResultsHeading = document.getElementById("search-result-heading")
            searchResultsHeading.innerText = `Results for ${query}`
            const searchresults = document.getElementById("search-result-items");
            data.modules[0].videoList.forEach(async videoInfo => {
                let videoTile = await generateVideoTile(videoInfo, atoken)
                searchresults.appendChild(videoTile)
            })
        })
    }
}