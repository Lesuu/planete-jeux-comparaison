//#region Initialisation
import { generateTreemap, etage1_jds, etage1_jv, listEtages } from "./treemap.js";
import { loadAssets, importText } from "./initialize.js";
import { createWindow, windowsTreemapContainer } from "./windowMaker.js";
import { callBetty, initializeBetty, iButtons, isBettyTalking } from "./betty.js";
import { slideshow } from "./slideshow.js";
import { tutorial } from "./tutorial.js";

let plateforme_choisie, indicateur_choisi, contribution_choisie, etage1_choisi;
let current_button_pressed = null;
let current_icon = null;
let isTalking = false;

// Constantes:
const zoom = true; // Est-ce qu'on active le zoom/roam dans le treemap ou non
const lien_meta_text = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=919408839&single=true&output=csv'
// const lien_meta_text = 'data/meta_texts.csv'

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

// Charge les assets
await loadAssets();

// Chargement du texte
let translations = await load(importText(lien_meta_text));

// Traductions
export function getTranslation(key){
    return translations[key][langue]
}

// Timer: recharge la page après 2 minutes d'inactivité
let inactivityTimer

function resetTimer(){
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        location.reload(); 
    }, 300000); // 5 minutes en milisecondes 
}
// Reset le timer à chaque fois qu'on clique
document.addEventListener('click', resetTimer);

let jeuVideo, jeuSociete, changementClimatique, metaux, particulesFines, cycleDeVie, parEquipement, jouerSurConsole, jouerSurPortable, jouerSurTelephone, jouerSurFixe, cloudConsole, jouerPetitJeu, jouerJeuMoyen, jouerGrandJeu;
function languageChange(){
    // etage1
    listEtages().then(({ etage1_jv, etage1_jds }) => {
    }).catch(err => {
        console.error("Error fetching etage1 data:", err);
    });
    if (langue == "fr"){
        jeuVideo = "Jeu vidéo";
        jeuSociete = "Jeu de société";
        changementClimatique = "Changement climatique";
        metaux = "Ressources minérales et métalliques";
        particulesFines = "Particules fines";
        cycleDeVie = "par étape de cycle de vie";
        parEquipement = "par équipement";
        jouerSurConsole = "Jouer sur console";
        jouerSurPortable = "Jouer sur ordinateur portable";
        jouerSurTelephone = "Jouer sur téléphone";
        jouerSurFixe = "Jouer sur ordinateur fixe";
        cloudConsole = "Cloud gaming sur console";
        jouerPetitJeu = "Petit format";
        jouerJeuMoyen = "Format moyen";
        jouerGrandJeu = "Grand format";
    } else if (langue == "eng"){
        jeuVideo = "Video game";
        jeuSociete = "Board game";
        changementClimatique = "Climate change";
        metaux = "Metallic and mineral resources";
        particulesFines = "Particulate matter";
        cycleDeVie = "per life cycle stage";
        parEquipement = "per equipment";
        jouerSurConsole = "Console";
        jouerSurPortable = "Laptop";
        jouerSurTelephone = "Phone";
        jouerSurFixe = "Desktop computer";
        cloudConsole = "Cloud gaming";
        jouerPetitJeu = "Small game";
        jouerJeuMoyen = "Midsize game";
        jouerGrandJeu = "Large game";
    }
    plateforme_choisie = jeuVideo;
    indicateur_choisi = changementClimatique;
    contribution_choisie = cycleDeVie;
    etage1_choisi = jouerSurConsole;
}
// Initialization des langues
languageChange();
function createLanguageButtons(){
      // Boutons de la fenêtre windows
    restart_button = add([
        sprite("restart"),
        pos(width() - 55, 10),
        scale(2),
        area(/*{ shape: new Rect(vec2(-16, 10), 25, 25 ) }*/),
        stay(),
        "window"
    ]);
    if (getSceneName() == "titleScreen" || getSceneName() == "treemap"){
        eng_button = add([
            sprite("en"),
            pos(width() - 105, 10),
            scale(2),
            area(/*{ shape: new Rect(vec2(-16, 8), 25, 25 ) }*/),
            "window"
        ]);
        fr_button = add([
            sprite("fr"),
            pos(width() - 155, 10),
            scale(2),
            area(/*{ shape: new Rect(vec2(-16, 0), 25, 25 ) }*/),
            "window"
        ]);
    }
};
//#endregion
//#region Menu principal
scene("titleScreen", async () => {
    // Fenêtre windows autour de l'écran:
    createWindow();
    createLanguageButtons();
    // Fonctionnalité des boutons
    windowButtons(restart_button, eng_button, fr_button);
   
    // Titre
    let main_shadow = add([
        text(getTranslation("TITRE"), {
            font: "pixel",
            size: 126,
            width : 1200,
            align: "center", 
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
        }),
        pos(960 + 10, 280 + 10),
        anchor("center"),
        color(0,0,0),
        opacity(0.4),
    ])
    let main_title = main_shadow.add([
        text(getTranslation("TITRE"), {
            font: "pixel",
            size: 126,
            width: 1200,
            align: "center",
            transform: (idx, ch) => ({
                color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
        }),
        pos(-10, -10),
        anchor("center"),
        scale()
    ])

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
        pos(1550, 600),
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
        go("slideshow")
    })
})

// Slideshow
scene("slideshow", () => {
    slideshow()
    windowButtons(restart_button, eng_button, fr_button)
})

scene("tutorial", () => {
    tutorial()
    windowButtons(restart_button, eng_button, fr_button)
})

scene("treemap", async () => {
    // Réinitialise les variables pr la logique de betty
    initializeBetty()
    // Fonction des boutons de la fenêtre windows
    createLanguageButtons();
    windowButtons(restart_button, eng_button, fr_button)
    windowsTreemapContainer();
    treemapButtons();
    scenarioJvButtons();

    await generateTreemap(plateforme_choisie, indicateur_choisi, contribution_choisie, etage1_choisi, zoom);
    callBetty()
})

//#region Boutons permanents 
function treemapButtons(){
    //#region "Catégorie":
    let vg_button = add([
        sprite("button"),
        pos(109, 190),
        area(),
        anchor("center"),
        color(0,230,0),
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
            width: 50,
            align: "center"
        }),
        anchor("top"),
        pos(0,43)
    ])
    let bg_button = add([
        sprite("button"),
        pos(279, 190),
        area(),
        anchor("center"),
        color(),
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
            width: 50,
            align: "center"
        }),
        anchor("top"),
        pos(0,43)
    ])
    onUpdate(() => {
        isTalking = isBettyTalking()
    })
    bg_button.onClick(() => {
        if (isTalking) return;
        scenarioJdsButtons();
        buttonPressed(bg_button, bg_button_icon, jeuSociete, "plateforme");
        bg_button_icon.sprite = "bg_color";
        vg_button_icon.sprite = "vg_icon";
        bg_button.color = rgb(0, 230, 0)
        vg_button.color = rgb(255, 255, 255)
    });
    vg_button.onClick(() => {
        if (isTalking) return;
        scenarioJvButtons();
        buttonPressed(vg_button, vg_button_icon, jeuVideo, "plateforme");
        vg_button_icon.sprite = "vg_color";
        bg_button_icon.sprite = "bg_icon";
        vg_button.color = rgb(0, 230, 0)
        bg_button.color = rgb(255,255,255)
    });
    //#endregion
    //#region Indicateurs:
    let indicateurs = add([
        text(getTranslation("INDICATEURS LABEL"), {
            font: "pixel",
            size: 54,
        }),
        pos(194 + 4, 390 + 4),
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
    ]);
    let changclim_button = add([
        sprite("button"),
        pos(194, 540),
        area(),
        anchor("center"),
        color(0, 230 ,0),
        scale(1.3)
    ])
    // Changement climatique
    let changclim_button_icon = changclim_button.add([
        sprite("changement_climatique_full"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.3)
    ])
    changclim_button.add([
        text(getTranslation("CHANGEMENT CLIMATIQUE"), {
            font: "pixel",
            size: 20,
            width: 200,
            align: "center"
        }),
        anchor("top"),
        pos(0,43)
    ])

    // Métaux
    let metaux_button = add([
        sprite("button"),
        pos(194, 740),
        area(),
        anchor("center"),
        color(),
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
            size: 20,
            width: 200,
            align: "center"
        }),
        anchor("top"),
        pos(0,43)
    ])
    // Particules fines
    let particules_fines_button = add([
        sprite("button"),
        pos(194, 940),
        area(),
        anchor("center"),
        color(),
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
            size: 20,
            width: 200,
            align: "center"
        }),
        anchor("top"),
        pos(0,43)
    ])
    changclim_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(changclim_button, changclim_button_icon, changementClimatique, "indicateur");
        changclim_button_icon.sprite = "changement_climatique_full"
        metaux_button_icon.sprite = "metaux"
        particules_fines_button_icon.sprite = "particules_fines"
        changclim_button.color = rgb(0,230,0)
        metaux_button.color = rgb(255, 255, 255)
        particules_fines_button.color = rgb(255, 255, 255)
    });
    metaux_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(metaux_button, metaux_button_icon, metaux, "indicateur");
        changclim_button_icon.sprite = "changement_climatique"
        metaux_button_icon.sprite = "metaux_full"
        particules_fines_button_icon.sprite = "particules_fines"
        changclim_button.color = rgb(255, 255, 255)
        metaux_button.color = rgb(0, 230, 0)
        particules_fines_button.color = rgb(255, 255, 255)
    });
    particules_fines_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(particules_fines_button, particules_fines_button_icon, particulesFines, "indicateur");
        changclim_button_icon.sprite = "changement_climatique"
        metaux_button_icon.sprite = "metaux"
        particules_fines_button_icon.sprite = "particules_fines_full"
        changclim_button.color = rgb(255, 255, 255)
        metaux_button.color = rgb(255, 255, 255)
        particules_fines_button.color = rgb(0, 230, 0)
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
    let offset = 200
    let scenario_label_shadow = add([
        text(getTranslation("SCENARIO LABEL"), {
            font: "pixel",
            size: 45,
        }),
        pos(890 + 4 + offset, 834 + 4),
        color(0,0,0),
        anchor("top"),
        opacity(0.4),
        area()
    ])
    scenario_label_shadow.add([
        text(getTranslation("SCENARIO LABEL"), {
            font: "pixel",
            size: 45,
        }),
        pos(-4, -4),
        anchor("top"),
    ]);
    iButtons()
}

//#region Scénarios:
// Fonctions pour les boutons scénarios:
// JV
function scenarioJvButtons(){
    let offset = 285
    destroyAll("bg_buttons")
    // telephone
    let telephone_button = add([
        sprite("button"),
        pos(550 + offset, 940),
        area(),
        anchor("center"),
        color(),
        scale(1.3),
        "vg_buttons"
    ])
    let telephone_button_icon = telephone_button.add([
        sprite("telephone"),
        anchor("center"),
        pos(0, 0),
        scale(1),
        "vg_buttons"
    ])
    telephone_button.add([
        text(getTranslation("TELEPHONE"), {
            font: "pixel",
            size: 18,
            width: 100,
            align: "center"
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ])
    // portable
    let portable_button = add([
        sprite("button"),
        pos(720 + offset, 940),
        area(),
        anchor("center"),
        color(),
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
        pos(890 + offset, 940),
        area(),
        anchor("center"),
        color(),
        scale(1.3),
        "vg_buttons"
    ])
    let fixe_button_icon = fixe_button.add([
        sprite("pc"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.62),
        "vg_buttons"
    ])
    fixe_button.add([
        text(getTranslation("FIXE"), {
            font: "pixel",
            size: 18,
            width: 90,
            align: "center"
        }),
        anchor("top"),
        pos(0,43),
        "vg_buttons"
    ])
    // Console
    let console_button = add([
        sprite("button"),
        pos(1060 + offset, 940),
        area(),
        anchor("center"),
        color(0, 230, 0),
        scale(1.3),
        "vg_buttons"
    ])
    let console_button_icon = console_button.add([
        sprite("console_full"),
        anchor("center"),
        pos(0, 0),
        scale(1/1.2),
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
    portable_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(portable_button, portable_button_icon, jouerSurPortable, "etage1");
        portable_button_icon.sprite = "portable_full"
        telephone_button_icon.sprite = "telephone"
        console_button_icon.sprite = "console"
        fixe_button_icon.sprite = "pc"
        portable_button.color = rgb(0, 230, 0)
        telephone_button.color = rgb(255,255,255)
        console_button.color = rgb(255,255,255)
        fixe_button.color = rgb(255,255,255)
    });
    telephone_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(telephone_button, telephone_button_icon, jouerSurTelephone, "etage1");
        portable_button_icon.sprite = "portable"
        telephone_button_icon.sprite = "telephone_full"
        console_button_icon.sprite = "console"
        fixe_button_icon.sprite = "pc"
        portable_button.color = rgb(255,255,255)
        telephone_button.color = rgb(0, 230, 0)
        console_button.color = rgb(255,255,255)
        fixe_button.color = rgb(255,255,255)
    });
    console_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(console_button, console_button_icon, jouerSurConsole, "etage1");
        portable_button_icon.sprite = "portable"
        telephone_button_icon.sprite = "telephone"
        console_button_icon.sprite = "console_full"
        fixe_button_icon.sprite = "pc"
        portable_button.color = rgb(255,255,255)
        telephone_button.color = rgb(255,255,255)
        console_button.color = rgb(0, 230, 0)
        fixe_button.color = rgb(255,255,255)
    });
    fixe_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(fixe_button, fixe_button_icon, jouerSurFixe, "etage1");
        portable_button_icon.sprite = "portable"
        telephone_button_icon.sprite = "telephone"
        console_button_icon.sprite = "console"
        fixe_button_icon.sprite = "pc_full"
        portable_button.color = rgb(255,255,255)
        telephone_button.color = rgb(255,255,255)
        console_button.color = rgb(255,255,255)
        fixe_button.color = rgb(0, 230, 0)
    });

}
// JdS
function scenarioJdsButtons(){
    destroyAll("vg_buttons")
    // Petit jeu
    let offset = 200
    let petit_jeu_button = add([
        sprite("button"),
        pos(720 + offset, 940),
        area(),
        anchor("center"),
        color(0, 230, 0),
        scale(1.3),
        "bg_buttons"
    ])
    let petit_jeu_button_icon = petit_jeu_button.add([
        sprite("petit_jeu_full"),
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
        pos(890 + offset, 940),
        area(),
        anchor("center"),
        color(),
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
            width: 100,
            align: "center"
        }),
        anchor("top"),
        pos(0,43),
        "bg_buttons"
    ])
    // Grand jeu
    let grand_jeu_button = add([
        sprite("button"),
        pos(1060 + offset, 940),
        area(),
        anchor("center"),
        color(),
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
        if (isTalking) return;
        buttonPressed(petit_jeu_button, petit_jeu_button_icon, jouerPetitJeu, "etage1");
        petit_jeu_button_icon.sprite = "petit_jeu_full"
        jeu_moyen_button_icon.sprite = "jeu_moyen"
        grand_jeu_button_icon.sprite = "bg_icon"
        petit_jeu_button.color = rgb(0, 230, 0)
        jeu_moyen_button.color = rgb(255,255,255)
        grand_jeu_button.color = rgb(255,255,255)
    });
    jeu_moyen_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(jeu_moyen_button, jeu_moyen_button_icon, jouerJeuMoyen, "etage1");
        petit_jeu_button_icon.sprite = "petit_jeu"
        jeu_moyen_button_icon.sprite = "jeu_moyen_full"
        grand_jeu_button_icon.sprite = "bg_icon"
        petit_jeu_button.color = rgb(255,255,255)
        jeu_moyen_button.color = rgb(0, 230, 0)
        grand_jeu_button.color = rgb(255,255,255)
    });
    grand_jeu_button.onClick(() => {
        if (isTalking) return;
        buttonPressed(grand_jeu_button, grand_jeu_button_icon, jouerGrandJeu, "etage1");
        petit_jeu_button_icon.sprite = "petit_jeu"
        jeu_moyen_button_icon.sprite = "jeu_moyen"
        grand_jeu_button_icon.sprite = "bg_color"
        petit_jeu_button.color = rgb(255,255,255)
        jeu_moyen_button.color = rgb(255,255,255)
        grand_jeu_button.color = rgb(0, 230, 0)
    });
};

// Fonction pour quand on appuie sur un bouton
async function buttonPressed(button, icon, choix, catégorie){
    switch(catégorie){
        case "plateforme":
            plateforme_choisie = choix;
            if (etage1_jds.includes(etage1_choisi) && plateforme_choisie === jeuVideo){
                etage1_choisi = jouerSurConsole;
            }
            if (etage1_jv.includes(etage1_choisi) && plateforme_choisie === jeuSociete){
                etage1_choisi = jouerPetitJeu;
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
        if (isTalking) return;
        location.reload()
    })
    if (currentScene == "titleScreen" || currentScene == "treemap"){
        eng.onClick(()=>{
            if (isTalking) return;
            langue = "eng"
            languageChange()
            go(currentScene)
        })
        fr.onClick(()=>{
            if (isTalking) return;
            langue = "fr"
            languageChange()
            go(currentScene)
        })
    }

}

export function currentScenario(){
    return {
        plateforme_choisie,
        indicateur_choisi,
        contribution_choisie,
        etage1_choisi
    }
}

go("titleScreen");