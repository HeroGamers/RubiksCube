var isPhone = /iPad|iPhone|iPod|android/i.test(navigator.userAgent) && !window.MSStream
var bookmarkCookieName = "hasSeenBookmarkWidget"

function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
}

if (isPhone) {
    console.log("Is phone")
}

var bookmarkCookie = getCookie(bookmarkCookieName)
var seenWidget = false

if (bookmarkCookie) {
    if (bookmarkCookie === "true") {
        console.log("They have seen the widget")
        seenWidget = true
    }
    else if (bookmarkCookie === "false") {
        console.log("They haven't seen the widget")
    }
}
else {
    console.log("No bookmark cookie")
    // Create cookie
    document.cookie = bookmarkCookieName + "=false; expires=Thu, 01 Jan 3000 00:00:00 UTC; path=/;"
}

if (seenWidget === false) {

}