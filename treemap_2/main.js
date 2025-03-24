//#region Initialisation
import { generateTreemap, etage1_jds, etage1_jv, listEtages } from "./treemap.js";
import { loadAssets, importText } from "./initialize.js";
import { createWindow, windowsTreemapContainer } from "./windowMaker.js";
import { callBetty } from "./betty.js";

let plateforme_choisie = "Jeu vidéo";
let indicateur_choisi = "Changement climatique";
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
export let loading = false

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
    scenarioJvButtons();

    await generateTreemap(plateforme_choisie, indicateur_choisi, contribution_choisie, etage1_choisi, zoom);
})

//#region Boutons permanents 
function treemapButtons(){
    //#region "Catégorie":
    let vg_button = add([
        sprite("button"),
        pos(109, 170),
        area(),
        anchor("center"),
        scale(1.8),
    ])
    let vg_button_icon = vg_button.add([
        sprite("vg_color"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.15),
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
        scenarioJdsButtons();
        buttonPressed(bg_button, bg_button_icon, "Jeu de société", "plateforme");
        bg_button_icon.sprite = "bg_color";
        vg_button_icon.sprite = "vg_icon";
    });
    vg_button.onClick(() => {
        scenarioJvButtons();
        buttonPressed(vg_button, vg_button_icon, "Jeu vidéo", "plateforme");
        vg_button_icon.sprite = "vg_color";
        bg_button_icon.sprite = "bg_icon";
    });
    //#endregion
    //#region Indicateurs:
    let indicateurs = add([
        text(getTranslation("INDICATEURS LABEL"), {
            font: "pixel",
            size: 54,
        }),
        pos(194 + 4, 370 + 4),
        color(0,0,0),
        anchor("top"),
        opacity(0.4)
    ])
    indicateurs.add([
        text(getTranslation("INDICATEURS LABEL"), {
            font: "pixel",
            size: 54,
        }),
        pos(-4, -4),
        anchor("top")
    ])
    let changclim_button = add([
        sprite("button"),
        pos(194, 520),
        area(),
        anchor("center"),
        scale(1.3)
    ])
    // Changement climatique
    let changclim_button_icon = changclim_button.add([
        sprite("changement_climatique"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3)
    ])
    changclim_button.add([
        text(getTranslation("CHANGEMENT CLIMATIQUE"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43)
    ])
    changclim_button.onClick(() => {
        buttonPressed(changclim_button, changclim_button_icon, "Changement climatique", "indicateur");
    });

    // Métaux
    let metaux_button = add([
        sprite("button"),
        pos(194, 720),
        area(),
        anchor("center"),
        scale(1.3)
    ])
    let metaux_button_icon = metaux_button.add([
        sprite("metaux"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3)
    ])
    metaux_button.add([
        text(getTranslation("METAUX"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43)
    ])
    metaux_button.onClick(() => {
        buttonPressed(metaux_button, metaux_button_icon, "Ressources minérales et métalliques", "indicateur");
    });
    // Particules fines
    let particules_fines_button = add([
        sprite("button"),
        pos(194, 920),
        area(),
        anchor("center"),
        scale(1.3)
    ])
    let particules_fines_button_icon = particules_fines_button.add([
        sprite("particules_fines"),
        anchor("center"),
        pos(0, -5),
        scale(1/1.3)
    ])
    particules_fines_button_icon.add([
        sprite("particules_fines"),
        anchor("center"),
        pos(0, 10),
        scale(0.9)
    ])
    particules_fines_button_icon.add([
        sprite("particules_fines"),
        anchor("center"),
        pos(0, 20),
        scale(0.8)
    ])
    particules_fines_button.add([
        text(getTranslation("PARTICULES FINES"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43)
    ])
    particules_fines_button.onClick(() => {
        buttonPressed(particules_fines_button, particules_fines_button_icon, "Particules fines", "indicateur");
    });
    //#endregion
    //#region Contributions:
    // Label
    let contributions_label_shadow = add([
        text(getTranslation("CONTRIBUTIONS LABEL"), {
            font: "pixel",
            size: 45,
        }),
        pos(1650 + 4, 64 + 4),
        color(0,0,0),
        anchor("top"),
        opacity(0.4)
    ])
    contributions_label_shadow.add([
        text(getTranslation("CONTRIBUTIONS LABEL"), {
            font: "pixel",
            size: 45,
        }),
        pos(-4, -4),
        anchor("top")
    ])
    // Par étape de cycle de vie
    let cycle_de_vie_button = add([
        sprite("button"),
        pos(1564, 170),
        area(),
        anchor("center"),
        scale(1.3)
    ])
    let cycle_de_vie_button_icon = cycle_de_vie_button.add([
        sprite("cycle_de_vie"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3)
    ])
    cycle_de_vie_button.add([
        text(getTranslation("CYCLE DE VIE"), {
            font: "pixel",
            size: 18,
            width: 100,
            align: "center"
        }),
        anchor("top"),
        pos(0,43)
    ])
    cycle_de_vie_button.onClick(() => {
        buttonPressed(cycle_de_vie_button, cycle_de_vie_button_icon, "par étape de cycle de vie", "contribution");
    });
    // Par équipement
    let par_equipement_button = add([
        sprite("button"),
        pos(1734, 170),
        area(),
        anchor("center"),
        scale(1.3)
    ])
    let par_equipement_button_icon = par_equipement_button.add([
        sprite("par_equipement"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3)
    ])
    par_equipement_button.add([
        text(getTranslation("PAR EQUIPEMENT"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43)
    ])
    par_equipement_button.onClick(() => {
        buttonPressed(par_equipement_button, par_equipement_button_icon, "par équipement", "contribution");
    });

    onMouseRelease(() => {
        if (current_button_pressed){
            current_button_pressed.sprite = "button";
            current_icon.pos = vec2(current_icon.pos.x - 2, current_icon.pos.y - 2);
        current_button_pressed = null;
        current_icon = null;
        }
    })

    // Label scénario
    let scenario_label_shadow = add([
        text(getTranslation("SCENARIO LABEL"), {
            font: "pixel",
            size: 45,
        }),
        pos(890 + 4, 64 + 4),
        color(0,0,0),
        anchor("top"),
        opacity(0.4)
    ])
    scenario_label_shadow.add([
        text(getTranslation("SCENARIO LABEL"), {
            font: "pixel",
            size: 45,
        }),
        pos(-4, -4),
        anchor("top")
    ])
}

//#region Scénarios:
// Fonctions pour les boutons scénarios:
// JV
function scenarioJvButtons(){
    destroyAll("bg_buttons")
    let telephone_button = add([
        sprite("button"),
        pos(550, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "vg_buttons"
    ])
    let telephone_button_icon = telephone_button.add([
        sprite("telephone"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3),
        "vg_buttons"
    ])
    telephone_button.add([
        text(getTranslation("TELEPHONE"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ])
    // portable
    let portable_button = add([
        sprite("button"),
        pos(720, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "vg_buttons"
    ])
    let portable_button_icon = portable_button.add([
        sprite("portable"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3),
        "vg_buttons"
    ])
    portable_button.add([
        text(getTranslation("PORTABLE"), {
            font: "pixel",
            size: 18,
            width: 100,
            align: "center"
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ])
    // Fixe
    let fixe_button = add([
        sprite("button"),
        pos(890, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "vg_buttons"
    ])
    let fixe_button_icon = fixe_button.add([
        sprite("pc"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3),
        "vg_buttons"
    ])
    fixe_button.add([
        text(getTranslation("FIXE"), {
            font: "pixel",
            size: 18,
            width: 100,
            align: "center"
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ])
    // Console
    let console_button = add([
        sprite("button"),
        pos(1060, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "vg_buttons"
    ])
    let console_button_icon = console_button.add([
        sprite("console"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3),
        "vg_buttons"
    ])
    console_button.add([
        text(getTranslation("CONSOLE"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ])
    // Cloud
    let cloud_button = add([
        sprite("button"),
        pos(1230, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "vg_buttons"
    ])
    let cloud_button_icon = cloud_button.add([
        sprite("cloud"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3),
        "vg_buttons"
    ])
    cloud_button.add([
        text(getTranslation("CLOUD"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ]);

    cloud_button.onClick(() => {
        buttonPressed(cloud_button, cloud_button_icon, "Cloud gaming sur console", "etage1");
    });
    portable_button.onClick(() => {
        buttonPressed(portable_button, portable_button_icon, "Jouer sur ordinateur portable", "etage1");
    });
    telephone_button.onClick(() => {
        buttonPressed(telephone_button, telephone_button_icon, "Jouer sur téléphone", "etage1");
    });
    console_button.onClick(() => {
        buttonPressed(console_button, console_button_icon, "Jouer sur console", "etage1");
    });
    fixe_button.onClick(() => {
        buttonPressed(fixe_button, fixe_button_icon, "Jouer sur ordinateur fixe", "etage1");
    });

}
// JdS
function scenarioJdsButtons(){
    destroyAll("vg_buttons")
    // Petit jeu
    let petit_jeu_button = add([
        sprite("button"),
        pos(720, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "bg_buttons"
    ])
    let petit_jeu_button_icon = petit_jeu_button.add([
        sprite("petit_jeu"),
        anchor("center"),
        pos(0, 0),
        scale(1),
        "bg_buttons"
    ])
    petit_jeu_button.add([
        text(getTranslation("PETIT JEU"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43),
        "bg_buttons"
    ])
    // Jeu moyen
    let jeu_moyen_button = add([
        sprite("button"),
        pos(890, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "bg_buttons"
    ])
    let jeu_moyen_button_icon = jeu_moyen_button.add([
        sprite("jeu_moyen"),
        anchor("center"),
        pos(0, 0),
        scale(1),
        "bg_buttons"
    ])
    jeu_moyen_button.add([
        text(getTranslation("JEU MOYEN"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43),
        "bg_buttons"
    ])
    // Grand jeu
    let grand_jeu_button = add([
        sprite("button"),
        pos(1060, 170),
        area(),
        anchor("center"),
        scale(1.3),
        "bg_buttons"
    ])
    let grand_jeu_button_icon = grand_jeu_button.add([
        sprite("bg_icon"),
        anchor("center"),
        pos(0, 0),
        scale(1),
        "bg_buttons"
    ])
    grand_jeu_button.add([
        text(getTranslation("GRAND JEU"), {
            font: "pixel",
            size: 18,
        }),
        anchor("top"),
        pos(0,43),
        "bg_buttons"
    ])
    // Fonction des boutons
    petit_jeu_button.onClick(() => {
        buttonPressed(petit_jeu_button, petit_jeu_button_icon, "Jouer à un petit jeu de société (ex. Bandido)", "etage1");
    });
    jeu_moyen_button.onClick(() => {
        buttonPressed(jeu_moyen_button, jeu_moyen_button_icon, "Jouer à un jeu de société moyen (ex. Celestia)", "etage1");
    });
    grand_jeu_button.onClick(() => {
        buttonPressed(grand_jeu_button, grand_jeu_button_icon, "Jouer à un grand jeu de société (ex. Catan)", "etage1");
    });
};

// Fonction pour quand on appuie sur un bouton
async function buttonPressed(button, icon, choix, catégorie){
    switch(catégorie){
        case "plateforme":
            plateforme_choisie = choix;
            if (etage1_jds.includes(etage1_choisi) && plateforme_choisie === "Jeu vidéo"){
                etage1_choisi = "Jouer sur console";
            }
            if (etage1_jv.includes(etage1_choisi) && plateforme_choisie === "Jeu de société"){
                etage1_choisi = "Jouer à un petit jeu de société (ex. Bandido)";
            };
            break;
        case "indicateur":
            indicateur_choisi = choix;
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
    await generateTreemap(plateforme_choisie, indicateur_choisi, contribution_choisie, etage1_choisi, zoom);
    callBetty()
}
//#endregion

// Fonction pour les boutons de la fenêtre windows
function windowButtons(restart, eng, fr){
    let currentScene = getSceneName()
    restart.onClick(()=>{
        location.reload()
    })
    eng.onClick(()=>{
        langue = "eng"
        go(currentScene)
    })
    fr  .onClick(()=>{
        langue = "fr"
        go(currentScene)
    })
}

go("titleScreen");