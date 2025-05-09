const atoken = localStorage.getItem("atoken")

if (!atoken) {
    window.location.href = "/pages/login.html"
}

let navLinks = document.getElementById("nav-links")
if (navLinks) {
    let categoriesNav = document.createElement("li")
    categoriesNav.setAttribute("id", "cat-nav")
    let categoriesLink = document.createElement("a")
    categoriesLink.innerHTML = 'CATEGORIES <i class="fa-solid fa-angle-down"></i>'
    categoriesLink.addEventListener("click", () => {
        document.getElementById("cat-list").classList.toggle("hidden")
        if (document.getElementById("cat-list").classList.contains("hidden")) {
            categoriesLink.innerHTML = 'CATEGORIES <i class="fa-solid fa-angle-down"></i>'
        } else {
            categoriesLink.innerHTML = 'CATEGORIES <i class="fa-solid fa-angle-up"></i>'
        }
    })
    categoriesNav.appendChild(categoriesLink)
    let categoryList = document.createElement("ul")
    categoryList.setAttribute("id", "cat-list")
    categoryList.classList.add("hidden")
    generateCategoryLinks(categoryList)
    categoriesNav.appendChild(categoryList)
    navLinks.appendChild(categoriesNav)

    let accountNav = document.createElement("li")
    let accountLink = document.createElement("a")
    accountLink.href = "/pages/account.html"
    accountLink.innerHTML = localStorage.getItem("username")
    accountNav.appendChild(accountLink)
    navLinks.appendChild(accountNav)

    const role = localStorage.getItem("role")
    if (role === "CREATOR") {
        let uploadNav = document.createElement("li")
        let uploadLink = document.createElement("a")
        uploadLink.href = "/pages/uploadform.html"
        uploadLink.innerHTML = '<i class="fa-solid fa-upload"></i> UPLOAD'
        uploadNav.appendChild(uploadLink)
        navLinks.appendChild(uploadNav)
    }

    let logoutBtn = document.createElement("button")
    logoutBtn.innerHTML = "LOGOUT"
    logoutBtn.addEventListener("click", () => {
        localStorage.clear()
        window.location.href = "/pages/login.html"
    })
    navLinks.appendChild(logoutBtn)
}

let searchBar = document.getElementById("nav-search-q")
if (searchBar) {
    searchBar.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            const query = searchBar.value.trim()
            window.location.href = `/pages/searchresults.html?q=${encodeURIComponent(query)}`
        }
    })
}

async function generateCategoryLinks(categoryList) {
    await fetch(`http://localhost:9000/category`, {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        })
        .then(resp => resp.json())
        .then(data => {
            data.categories.forEach(element => {
                let catItem = document.createElement("li")
                let catAnchor = document.createElement("a")
                catAnchor.href = `/pages/catresults.html?cat=${element.name}`
                catAnchor.innerHTML = element.name
                catItem.appendChild(catAnchor)

                categoryList.appendChild(catItem)
            })
        })

}

async function generateVideoTile(videoInfo, showProgress, atoken) {

    let anchor = document.createElement("a")
    anchor.classList.add("video-anchor")
    anchor.setAttribute("href", `/pages/video.html?id=${encodeURIComponent(videoInfo.videoId)}`)

    let videoTile = document.createElement("li")
    videoTile.classList.add("video-tile")

    await fetch(`http://localhost:9000/api/v1/video/${videoInfo.videoId}/thumb`, {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        }).then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob)
            videoTile.style.backgroundImage = `url(${imageUrl})`
        })

    await fetch(`http://localhost:9000/api/v1/video/${videoInfo.videoId}/progress`, {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.videoProgressDetails.lastWatched !== undefined && showProgress) {
                const watchedTime = data.videoProgressDetails.lastWatched
                console.log(`watched time: ${watchedTime}, duration: ${data.videoProgressDetails.duration}`)
                let progress = Math.floor(watchedTime * 100 / data.videoProgressDetails.duration)
                console.log("Setting progress: " + progress)
    
                let videoProg = document.createElement("progress")
                videoProg.classList.add("video-prog")
                videoProg.max = "100"
                videoProg.value = progress
                videoTile.appendChild(videoProg)
            }
        })

    anchor.appendChild(videoTile)

    return anchor
}