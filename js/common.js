const atoken = localStorage.getItem("atoken")

if (!atoken) {
    window.location.href = "/pages/login.html"
}

let navLinks = document.getElementById("nav-links")
if (navLinks) {
    let li = document.createElement("li")
    let accountLink = document.createElement("a")
    accountLink.href = "/pages/account.html"
    accountLink.innerHTML = localStorage.getItem("username")
    li.appendChild(accountLink)
    navLinks.appendChild(li)

    const role = localStorage.getItem("role")
    if (role === "CREATOR") {
        let li = document.createElement("li")
        let uploadLink = document.createElement("a")
        uploadLink.href = "/pages/uploadform.html"
        uploadLink.innerHTML = "+Upload"
        li.appendChild(uploadLink)
        navLinks.appendChild(uploadLink)
    }

    let logoutBtn = document.createElement("button")
    logoutBtn.innerHTML = "Logout"
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