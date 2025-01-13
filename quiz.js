// import kaplay
import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";
console.log("wowzers")

// Initialisation
kaplay({
    background : [151,42,39],
    letterbox:true,
    width:1280,
    height:720,
    stretch:true,
})

// Sprites
loadSprite("menu_background", "assets/sprites/menu_background.png")
loadSprite("card", "assets/sprites/card.png")

scene("titleScreen", () => {
    add([
        sprite("card")
    ])
    // Rest of the 'titleScreen' scene
})

go("titleScreen")