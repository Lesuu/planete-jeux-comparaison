import { generateTreemap } from "./treemap.js";
import { loadAssets, importText } from "./initialize.js";
import { createWindow, windowButtons, windowsTreemapContainer } from "./windowMaker.js";

let plateforme_choisie = "Jeu vidéo";
let scenario_choisi = "Changement climatique";
let contribution_choisie = "par équipement";
let etage1_choisi = "Jouer sur console";

// Constantes:
const zoom = true; // Est-ce qu'on active le zoom/roam dans le treemap ou non
const lien_meta_text = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=919408839&single=true&output=csv'

// Variable globales:
let restart_button, eng_button, fr_button;
let langue = "fr";

// Initialisation de Kaplay
kaplay({
    background : [200,60,60],
    letterbox:true,
    width:1920,
    height:1080,
    stretch:false,
    canvas: document.querySelector("#game"),
});

// Charge les assets
loadAssets();

// Chargement du texte
let translations = await load(importText(lien_meta_text));
// Effet CRT
// loadShaderURL("crt", null, "assets/shaders/crt.frag");
// const crtEffect = () => ({
//     "u_flatness": 9 ,
// });   

// Traductions
function getTranslation(key){
    return translations[key][langue]
}

// Menu principal
scene("titleScreen", async () => {
    // Fenêtre windows autour de l'écran:
    createWindow();
    restart_button = add([
        sprite("restart"),
        pos(width() - 55, 10),
        scale(2),
        area(/*{ shape: new Rect(vec2(-16, 10), 25, 25 ) }*/),
        stay(),
        "window"
    ])
    eng_button = add([
        sprite("en"),
        pos(width() - 105, 10),
        scale(2),
        area(/*{ shape: new Rect(vec2(-16, 8), 25, 25 ) }*/),
        stay(),
        "window"
    ])
    fr_button = add([
        sprite("fr"),
        pos(width() - 155, 10),
        scale(2),
        area(/*{ shape: new Rect(vec2(-16, 0), 25, 25 ) }*/),
        stay(),
        "window"
    ])
    windowButtons(restart_button, eng_button, fr_button)
   

    // Effet CRT:
    // onUpdate(() => {
    //     usePostEffect("crt", crtEffect());
    // });

    // 'appuyez pour commencer'
    let start_shadow = add([
        text(getTranslation("START"), {
            font: "pixel",
            size: 72,
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
        }),
        pos(960 + 5, 900 + 5),
        anchor("center"),
        color(0,0,0),
        opacity(0.4)
    ])        

    let start_caption = start_shadow.add([
        text(getTranslation("START"), {
            font: "pixel",
            size: 72,
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
        }),
        pos(-5, -5),
        anchor("center"),
        opacity(),
    ])

    let betty = add([
        sprite("betty", {anim: "happy"}),
        pos(1550, 540),
        scale(4),
        anchor("center"),
        z(20)
    ])
    let betty_shadow = add([
        pos(betty.pos.x, betty.pos.y + 75),
        opacity(0.3),
        circle(40),
        scale(1.5, 0.5),
        color(0, 0, 0),
        anchor("center"),
    ])

    betty.flipX = true
    // On fait flasher le texte 'appuie pour commencer'
    loop(1.7, () =>{
        console.log("flash")
        start_caption.opacity = 1
        start_shadow.opacity = 0.4
        wait(1, () => {
            start_caption.opacity = 0
            start_shadow.opacity = 0
        })
    })
    let clickArea = add([
        rect(1910, 1015),
        pos(5, 60),
        area(),
        opacity(0)
    ])
    clickArea.onClick(() => {
        console.log("click")
        go("treemap")
    })
})

scene("treemap", async () => {
    // Fonction des boutons de la fenêtre windows
    windowButtons(restart_button, eng_button, fr_button)
    windowsTreemapContainer();

    // Ecran de chargement
    let loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loadingOverlay";
    loadingOverlay.style.position = "absolute";
    loadingOverlay.style.top = "230px";
    loadingOverlay.style.left = "203px";
    loadingOverlay.style.right = "220px";
    loadingOverlay.style.bottom = "5px";
    loadingOverlay.style.width = "1694px";
    loadingOverlay.style.height = "830px";
    loadingOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    loadingOverlay.style.display = "flex";
    loadingOverlay.style.justifyContent = "center";
    loadingOverlay.style.alignItems = "center";
    loadingOverlay.style.zIndex = "9999"; // Ensure it appears on top
    loadingOverlay.innerHTML = "<h1 style='color: white;'>Loading...</h1>";
    document.body.appendChild(loadingOverlay);

    await generateTreemap(plateforme_choisie, scenario_choisi, contribution_choisie, etage1_choisi, zoom);
    document.body.removeChild(loadingOverlay);
})



go("titleScreen");