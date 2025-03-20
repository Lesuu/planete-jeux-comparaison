//#region Initialisation
import { generateTreemap, etage1_jds, etage1_jv, listEtages } from "./treemap.js";
import { loadAssets, importText } from "./initialize.js";
import { createWindow, windowButtons, windowsTreemapContainer } from "./windowMaker.js";

let plateforme_choisie = "Jeu vidéo";
let scenario_choisi = "Changement climatique";
let contribution_choisie = "par équipement";
let etage1_choisi = "Jouer sur console";
let current_button_pressed = null;
let current_icon = null;

// Constantes:
const zoom = true; // Est-ce qu'on active le zoom/roam dans le treemap ou non
const lien_meta_text = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=919408839&single=true&output=csv'

// Variable globales:
let restart_button, eng_button, fr_button;
export let langue = "fr";

// Initialisation de Kaplay
kaplay({
    background : [138, 42 ,42],
    letterbox:false,
    width:1920,
    height:1080,
    stretch:false,
    canvas: document.querySelector("#game"),
});

// etage1
listEtages().then(({ etage1_jv, etage1_jds }) => {
    console.log("etage1_jv from main.js:", etage1_jv);
    console.log("etage1_jds from main.js:", etage1_jds);
}).catch(err => {
    console.error("Error fetching etage1 data:", err);
});

// Charge les assets
loadAssets();

// Chargement du texte
let translations = await load(importText(lien_meta_text));
// Effet CRT
loadShaderURL("crt", null, "assets/shaders/crt.frag");
const crtEffect = () => ({
    "u_flatness": 4 ,
});   

// Traductions
export function getTranslation(key){
    return translations[key][langue]
}
//#endregion
//#region Menu principal
scene("titleScreen", async () => {
    // onUpdate(() =>{
    //     usePostEffect("crt", crtEffect());
    // })

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
        go("treemap")
    })
})

scene("treemap", async () => {
    // Fonction des boutons de la fenêtre windows
    windowButtons(restart_button, eng_button, fr_button)
    windowsTreemapContainer();
    treemapButtons();

    // Ecran de chargement
    // let loadingOverlay = document.createElement("div");
    // loadingOverlay.id = "loadingOverlay";
    // loadingOverlay.style.position = "absolute";
    // loadingOverlay.style.top = "230px";
    // loadingOverlay.style.left = "387px";
    // loadingOverlay.style.right = "220px";
    // loadingOverlay.style.bottom = "5px";
    // loadingOverlay.style.width = "1507px";
    // loadingOverlay.style.height = "830px";
    // loadingOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    // loadingOverlay.style.display = "flex";
    // loadingOverlay.style.justifyContent = "center";
    // loadingOverlay.style.alignItems = "center";
    // loadingOverlay.style.zIndex = "9999"; 
    // loadingOverlay.innerHTML = `<h1 style='color: white;'>${getTranslation("CHARGEMENT")}</h1>`;
    // document.body.appendChild(loadingOverlay);

    await generateTreemap(plateforme_choisie, scenario_choisi, contribution_choisie, etage1_choisi, zoom);
    document.body.removeChild(loadingOverlay);
})

//#region Menu treemap
function treemapButtons(){
    let vg_button = add([
        sprite("button"),
        pos(109, 170),
        area(),
        anchor("center"),
        scale(1.8)
    ])
    let vg_button_icon = vg_button.add([
        sprite("vg_icon"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.15)
    ])
    vg_button.add([
        text(getTranslation("JEU VIDEO"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43)
    ])
    let bg_button = add([
        sprite("button"),
        pos(279, 170),
        area(),
        anchor("center"),
        scale(1.8)
    ])
    let bg_button_icon = bg_button.add([
        sprite("bg_icon"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.15)
    ])
    bg_button.add([
        text(getTranslation("JEU DE SOCIETE"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43)
    ])
    bg_button.onClick(() => {
        buttonPressed(bg_button, bg_button_icon, "Jeu de société", "plateforme");
        bg_button_icon.sprite = "bg_color";
        vg_button_icon.sprite = "vg_icon";
    });
    vg_button.onClick(() => {
        buttonPressed(vg_button, vg_button_icon, "Jeu vidéo", "plateforme");
        vg_button_icon.sprite = "vg_color";
        bg_button_icon.sprite = "bg_icon";
    });

    onMouseRelease(() => {
        if (current_button_pressed){
            current_button_pressed.sprite = "button";
            current_icon.pos = vec2(current_icon.pos.x - 2, current_icon.pos.y - 2);
        current_button_pressed = null;
        current_icon = null;
        }
    })
}

// Fonction pour quand on appuie sur un bouton
async function buttonPressed(button, icon, choix, catégorie){
    switch(catégorie){
        case "plateforme":
            plateforme_choisie = choix;
            console.log("plateforme!", etage1_jds, etage1_jv)
            if (!etage1_jds.includes(etage1_choisi)){
                etage1_choisi = "Jouer à un petit jeu de société (ex. Bandido)";
                console.log(etage1_choisi)
            } else if (!etage1_jv.includes(etage1_choisi)){
                etage1_choisi = "Jouer sur console";
                console.log(etage1_choisi)
            };
            break;
        case "scenario":
            scenario_choisi = choix;
            break;
        case "contribution":
            contribution_choisie = choix;
            break;
        case "etage1":
            etage1_choisi = choix;
            break;
    };
    current_button_pressed = button;
    current_icon = icon;
    button.sprite = "button_pressed";
    icon.pos = vec2(icon.pos.x + 2, icon.pos.y + 2);
    console.log(plateforme_choisie)
    await generateTreemap(plateforme_choisie, scenario_choisi, contribution_choisie, etage1_choisi, zoom);
    document.body.removeChild(loadingOverlay);
}
//#endregion

go("titleScreen");