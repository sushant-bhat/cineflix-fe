let loginForm = document.getElementById("login-form")
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value
    
        try {
            const response = await fetch('http://localhost:8080/api/v1/user/login', {
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
                    document.getElementById("login-msg").innerHTML = "Incorrect credentials!! Please try again"
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
        const username = document.getElementById("username").value
        const password = document.getElementById("password").value

        try {
            const response = await fetch('http://localhost:8080/api/v1/user/register', {
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