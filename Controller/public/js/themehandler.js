var themeCookieName = "theme"
let theme = "light"

function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
}

var themeCookie = getCookie(themeCookieName)

if (themeCookie) {
    if (themeCookie.toString().toLowerCase() === "light") {
        console.log("Light theme in cookies")
    }
    else if (themeCookie.toString().toLowerCase() === "dark") {
        console.log("Dark theme in cookies")
        theme = "dark"

        var head = document.head;
        var link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = "css/darktheme.css";

        head.appendChild(link);
    }
    else {
        console.log("Unknown theme, setting to light")
        setTheme("light")
    }
}
else {
    console.log("No theme cookie")
    // Create cookie
    setTheme("light")
}

let themeChooser = document.getElementsByClassName("themeSwitch")[0]
themeChooser.textContent = (theme === "light") ? "Dark Theme" : "Light Theme"
themeChooser.onclick = function() { (theme === "light") ? setTheme("dark") : setTheme("light"); location.reload() }

function setTheme(mode) {
    document.cookie = themeCookieName + "="+ mode + "; expires=Thu, 01 Jan 3000 00:00:00 UTC; path=/;"
}