let lastSavedTime = 0;
const saveInterval = 10; // in seconds

document.addEventListener('DOMContentLoaded', async () => {
    const atoken = localStorage.getItem("atoken")

    const urlParams = new URLSearchParams(window.location.search);
    let rawVideoId = urlParams.get('id');

    if (rawVideoId) {
        videoId = decodeURIComponent(rawVideoId)
    } else {
        console.error("Didn't get the video ID")
        return
    }

    prepareVideoPlayer(videoId, atoken)
    populateVideoInfo(videoId, atoken)
});

async function prepareVideoPlayer(videoId, atoken) {
    if (Hls.isSupported()) {
        var video = document.getElementById('hls-video');

        await setVideoAttributes(video, atoken)

        var hls = new Hls({
            xhrSetup: function (xhr, url) {
                xhr.setRequestHeader("Authorization", `Bearer ${atoken}`);
            }
        });
        hls.loadSource(`http://localhost:9000/api/v1/video/${videoId}/master.m3u8`);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.addEventListener('loadedmetadata', () => {
                console.log('Metadata loaded. Duration:', video.duration);
                console.log('Seeking to:', lastWatched);
                video.currentTime = lastWatched;
                // video.play();
            });
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("Fatal network error encountered, try to recover");
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("Fatal media error encountered, try to recover");
                        hls.recoverMediaError();
                        break;
                    default:
                        hls.destroy();
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support found
        video.src = `http://localhost:9000/api/v1/video/${videoId}/master.m3u8`;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    }
}

async function setVideoAttributes(video, atoken) {
    // to-do: Make the poster and streaming file endpoint come from backend to make it dynamic
    await fetch(`http://localhost:9000/api/v1/video/${videoId}/cover`, {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        }).then(response => response.blob())
        .then(blob => {
            const imageUrl = URL.createObjectURL(blob);
            video.setAttribute("poster", imageUrl)
        })

    // Fetch last watched time stamp of a video for that user
    await fetch(`http://localhost:9000/api/v1/video/${videoId}/progress`, {
            headers: {
                "Authorization": `Bearer ${atoken}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.videoProgressDetails.lastWatched !== undefined) {
                video.currentTime = data.videoProgressDetails.lastWatched
                lastSavedTime = 0
            }
        })

    // Add listener to update the watch timestamp of the video for a user
    video.addEventListener('timeupdate', async () => {
        const currentTime = Math.floor(video.currentTime)
        const duration = Math.floor(video.duration)

        console.log(`Got time update: ${currentTime} out of ${duration}`)
        let timePassed = currentTime - lastSavedTime
        if (timePassed < 0 || timePassed >= saveInterval) {
            lastSavedTime = currentTime;
            await saveProgress(videoId, currentTime, duration, atoken)
        }
    })

    video.volume = 0.2
}

async function saveProgress(videoId, lastWatched, duration, atoken) {
    await fetch(`http://localhost:9000/api/v1/video/${videoId}/progress`, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${atoken}`
        },
        body: JSON.stringify({
            lastWatched,
            duration
        })
    });
}

async function populateVideoInfo(videoId, atoken) {
    const response = await fetch(`http://localhost:9000/api/v1/video/${videoId}`, {
        headers: {
            "Authorization": `Bearer ${atoken}`
        }
    });

    const result = await response.json();
    if (result.errorMessage) {
        console.error("Something went wrong while fetching video details")
    } else {
        const videoMeta = result.videoMeta
        let videoInfo = document.getElementById("video-info-section")

        let videoTitle = document.createElement("div")
        videoTitle.setAttribute("id", "video-title")

        let heading = document.createElement("h1")
        heading.innerHTML = videoMeta.videoTitle
        videoTitle.appendChild(heading)

        let favBtn = await addFavButton(videoId, atoken, videoMeta.watchListedByUser)
        videoTitle.appendChild(favBtn)

        videoInfo.appendChild(videoTitle)

        let description = document.createElement("p")
        description.innerHTML = videoMeta.videoDescription
        videoInfo.appendChild(description)

        let videoTags = document.createElement("p")
        videoTags.innerHTML = videoMeta.videoTags
        videoInfo.appendChild(videoTags)

        let director = document.createElement("p")
        director.innerHTML = videoMeta.videoDirector
        videoInfo.appendChild(director)

        let cast = document.createElement("p")
        cast.innerHTML = videoMeta.videoCast
        videoInfo.appendChild(cast)

    }
}

async function addFavButton(videoId, atoken, watchListedByUser) {
    console.log("Adding fav button")
    let addBtn = document.createElement("button")
    addBtn.classList.add("fav-btn")
    addBtn.classList.add("not-fav")
    addBtn.innerHTML = '<i class="fa-regular fa-heart fa-2xl"></i>'
    if (watchListedByUser) {
        addBtn.innerHTML = '<i class="fa-solid fa-heart fa-2xl"></i>'
        addBtn.classList.remove("not-fav")
    }
    addBtn.addEventListener("click", async (e) => {
        e.preventDefault()
        if (addBtn.classList.contains("not-fav")) {
            addBtn.innerHTML = '<i class="fa-solid fa-heart fa-2xl"></i>'
            addBtn.classList.remove("not-fav")
            await fetch(`http://localhost:9000/api/v1/user/watchlist/${videoId}`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${atoken}`
                    }
                }).then(response => response.json())
                .then(data => {
                    console.log(`Added to fav for ${data.watchListDetails.userName}`)
                })
        } else {
            addBtn.innerHTML = '<i class="fa-regular fa-heart fa-2xl"></i>'
            addBtn.classList.add("not-fav")
            await fetch(`http://localhost:9000/api/v1/user/watchlist/${videoId}`, {
                    method: 'DELETE',
                    headers: {
                        "Authorization": `Bearer ${atoken}`
                    }
                }).then(response => response.json())
                .then(data => {
                    console.log(`Removed fav for ${data.watchListDetails.userName}`)
                })
        }
    })
    return addBtn
}