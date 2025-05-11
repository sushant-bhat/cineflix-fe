document.addEventListener('DOMContentLoaded', () => {
    fetch("http://localhost:9000/live", {
            'Content-Type': 'text/plain'
        })
        .then(response => {
            console.log(response)
            if (!response.ok) {
                window.location.href = "/pages/down.html"
            }
        })
        .catch(err => {
            console.log("The server is down " + err)
            window.location.href = "/pages/down.html"
        })
});

let loginForm = document.getElementById("login-form")

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("username").value.trim()
        const password = document.getElementById("password").value

        if (!username || !password) {
            const loginMsg = document.getElementById("login-msg")
            loginMsg.classList.remove("hidden")
            loginMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #e82626;"></i> Credentials missing'
            return
        }

        try {
            const response = await fetch('http://localhost:9000/api/v1/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                })
            });

            if (!response.ok) {
                console.log(`Login failed: ${response.status}`)
                if (response.status == 401) {
                    document.getElementById("login-msg").innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #e82626;"></i> Incorrect credentials. Please try again'
                }
                return
            }

            const result = await response.json();
            localStorage.setItem("atoken", result["jwt"])
            localStorage.setItem("username", result.userDetails.username)
            localStorage.setItem("role", result.userDetails.roles[0])
            window.location.href = "/"
        } catch (error) {
            console.error(`Login failed: ${error}`)
        }
    })
}

let registerForm = document.getElementById("register-form")
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("username").value.trim()
        const password = document.getElementById("password").value

        if (username === "" || password === "") {
            const registerMsg = document.getElementById("register-msg")
            registerMsg.classList.remove("hidden")
            registerMsg.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: #e82626;"></i> Credentials missing'
            return
        }

        try {
            const response = await fetch('http://localhost:9000/api/v1/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password,
                    "roles": [
                        document.getElementById("user-role").value
                    ]
                })
            });

            if (!response.ok) {
                console.log(`Registration failed: ${response.status}`)
                document.getElementById("register-msg").innerHTML = "We are experiencing some issues!! Please try later!"
                return
            }

            const result = await response.json();
            localStorage.setItem("atoken", result["jwt"])
            localStorage.setItem("username", result.userDetails.username)
            localStorage.setItem("role", result.userDetails.roles[0])
            window.location.href = "/"
        } catch (error) {
            console.error(`Login failed: ${error}`)
        }
    })
}