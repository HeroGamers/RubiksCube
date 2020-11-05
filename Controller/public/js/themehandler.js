let theme = "light"

let themeStorage = localStorage.theme

if (themeStorage) {
    if (themeStorage.toString().toLowerCase() === "light") {
        console.log("Light theme in storage")
    }
    else if (themeStorage.toString().toLowerCase() === "dark") {
        console.log("Dark theme in storage")
        theme = "dark"

        var head = document.head;
        var link = document.createElement("link");

        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = "css/darktheme.css";

        head.appendChild(link);

        // Cube color
        renderer.setClearColor('#2d2d2d', 1);
    }
    else {
        console.log("Unknown theme, setting to light")
        setTheme("light")
    }
}
else {
    console.log("No theme storage")
    // Create cookie
    setTheme("light")
}

let themeChooser = document.getElementsByClassName("themeSwitch")[0]
themeChooser.textContent = (theme === "light") ? "Dark Theme" : "Light Theme"
themeChooser.onclick = function() { (theme === "light") ? setTheme("dark") : setTheme("light"); location.reload() }

function setTheme(mode) {
    localStorage.theme = mode
}