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

function prepareVideoPlayer(videoId, atoken) {
    if (Hls.isSupported()) {
        var video = document.getElementById('hls-video');
        // to-do: Make the poster and streaming file endpoint come from backend to make it dynamic
        fetch(`http://localhost:9000/api/v1/video/${videoId}/thumb`, {
                headers: {
                    "Authorization": `Bearer ${atoken}`
                }
            }).then(response => response.blob())
            .then(blob => {
                const imageUrl = URL.createObjectURL(blob);
                video.setAttribute("poster", imageUrl)
            })
        // video.setAttribute("poster", `http://localhost:9000/api/v1/video/${videoId}/thumb`)
        var hls = new Hls({
            xhrSetup: function (xhr, url) {
                xhr.setRequestHeader("Authorization", `Bearer ${atoken}`);
            }
        });
        hls.loadSource(`http://localhost:9000/api/v1/video/${videoId}/master.m3u8`);
        hls.attachMedia(video);
        // hls.on(Hls.Events.MANIFEST_PARSED, function () {
        //     video.play();
        // });
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

        let heading = document.createElement("h1")
        heading.innerHTML = videoMeta.videoTitle
        videoInfo.appendChild(heading)

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