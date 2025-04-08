import { currentTreemapExplanation } from "./global.js"
import { getTranslation, currentScenario, langue } from "./main.js"
import { isGeneratingTreemap } from "./treemap.js"

let bettyEngaged = false
let betty
let quest_marker
let backgroundRectangle
let timer = 0.5
let betty_highlight
let bettyPeaking = false
let nothingToSay = false
let curTween;
let canJump = false
let infoBubble = false
let isTalking = false
let isGenerating = false
let isSkipping = false

let jouerSurConsole, jouerSurPortable, jouerSurTelephone, jouerSurFixe, jouerPetitJeu, jouerJeuMoyen, jouerGrandJeu, changementClimatique, metaux, particulesFines;

function onClicked(){
    if (!isTalking) return
    if (speechBubble){
        speechBubble.remove()
    }
    betty.play("idle")
    betty_highlight.play("white")
    document.getElementById("treemapOverlay").remove()
    backgroundRectangle.opacity = 0
    treemapContainer.style.pointerEvents = "auto"
    wait(0.1, () => {
        isTalking = false
        infoBubble = false
    })
}

export function isBettyTalking() {
    return isTalking;
}

export function initializeBetty() {
    document.removeEventListener('mousedown', onClicked);
    bettyEngaged = false;
    bettyPeaking = false;
    nothingToSay = false;
    infoBubble = false;
    isTalking = false;
    canJump = false;
    curTween = null;
    timer = 0.5;

    document.addEventListener('mousedown', onClicked);
}

function createTreemapOverlay() {
    let treemapOverlay = document.createElement("div");
    treemapOverlay.id = "treemapOverlay";
    treemapOverlay.style.position = "absolute";
    treemapOverlay.style.top = "100px";
    treemapOverlay.style.left = "387px";
    treemapOverlay.style.right = "220px";
    treemapOverlay.style.bottom = "5px";
    treemapOverlay.style.width = "1507px";
    treemapOverlay.style.height = "730px";
    treemapOverlay.style.display = "flex";
    treemapOverlay.style.justifyContent = "center";
    treemapOverlay.style.alignItems = "center";
    treemapOverlay.style.zIndex = "20"; 
    treemapOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    treemapContainer.style.pointerEvents = "none"
    document.body.appendChild(treemapOverlay);

    return treemapOverlay
}

export function callBetty() {
    let treemapContainer = document.getElementById("treemapContainer")
    isTalking = false
    if (currentTreemapExplanation == ""){
        nothingToSay = true
    } else{
        nothingToSay = false
    }
    if (nothingToSay) return
    bettyAppears()
    betty.onClick(() => {
        isGenerating = isGeneratingTreemap()
        if (isTalking||nothingToSay||infoBubble||isGenerating)return
        if (!bettyEngaged){
            betty_highlight.opacity = 0
            tween(
                betty.pos.x,
                betty.pos.x - 90,
                0.5,
                (val) => {
                    betty.pos.x = val
                    // betty_highlight.pos.x = val
                },
                easings.easeInOutQuad
            )
            if (curTween) {
                curTween.cancel(); 
                betty.angle = -20;
            };
            curTween = tween(
                betty.angle,
                betty.angle + 20,
                0.3,
                (val) => {
                    betty.angle = val
                    // betty_highlight.angle = val
                },
                easings.easeInOutQuad
            )
            bettyEngaged = true
            timer = 0
        }
        quest_marker.opacity = 0
        backgroundRectangle.opacity = 0.5
        let treemapOverlay = createTreemapOverlay()
        isTalking = true
        wait(timer, () => {
            bettyExplication(betty, currentTreemapExplanation) 
        })  
    })    
}

function bettyAppears(){
    if (bettyEngaged || bettyPeaking) {
        quest_marker.opacity = 1;  
        betty.play("idle_active"); 
        betty_highlight.opacity = 1;
        setGravity(1200);
        if (canJump){
            betty.jump(400);
            canJump = false;
        }
        if (betty_highlight){
            betty_highlight.play("white");
        }; 
        return;
    };
    destroyAll("betty")
    bettyPeaking = true
    createBetty()
    wait(0.5, () => {
        tween(
            betty.pos.x,
            betty.pos.x - 60,
            1,
            (val) => {
                betty.pos.x = val
                // betty_highlight.pos.x = val
            },
            easings.easeInOutQuad
        )

        curTween = tween(
            betty.angle,
            betty.angle - 20,
            1,
            (val) => {
                betty.angle = val
                // betty_highlight.angle = val
            },
            easings.easeInOutQuad
        )
    })
}

async function bettyExplication(betty, text){
    betty.play("talk")
    betty_highlight.opacity = 0
    // Création de la bulle
    let speechBubble = document.createElement("div")
    speechBubble.id = "speechBubble"
    if(infoBubble){
        speechBubble.style.transform = "scale(1.1)"; 
        speechBubble.style.transformOrigin = "bottom right";
    }
    await document.body.appendChild(speechBubble)

    // Création du paragraphe
    let speechText = document.createElement("p")
    speechText.id = "speechText"
    if(infoBubble){
        speechText.style.transform = "scale(0.9)";
        speechText.style.transformOrigin = "top left";
        speechText.style.width = "100%"
        speechText.style.lineHeight = "95%"
    }
    speechText.innerHTML = text
    speechBubble.appendChild(speechText)
}

export function iButtons(){
    let info_shadow = add([
        sprite("info"),
        // 194: position du label indicateurs
        // 113: offset par rapport au label
        // 1: offset de l'ombre
        pos(194 + 113 + 1, 390 + 18 + 1),
        scale(1.9),
        color(0,0,0),
        opacity(0.4),

    ]);
    let indicateurs_info = info_shadow.add([
        sprite("info"),
        pos(-1, -1),
        area()
    ]);
    indicateurs_info.onClick(async () => {
        languageCheck()
        let current_scenario = currentScenario()
        console.log(current_scenario)
        let infoTexte = getTranslation("INDICATEURS 2")
        switch (current_scenario.indicateur_choisi){
            // JV
            case changementClimatique:
                infoTexte = getTranslation("INDICATEURS 2")
                break;
            case metaux:
                infoTexte = getTranslation("INDICATEURS 3")
                break;
            case particulesFines:
                infoTexte = getTranslation("INDICATEURS 4")
                break;
        }
        iClick(infoTexte)
    });

    let scenario_info_shadow = add([
        sprite("info"),
        pos(1090 + 78 + 1, 836 + 12 + 1),
        scale(1.5),
        color(0,0,0),
        opacity(0.4),
    ])
    let scenario_info = scenario_info_shadow.add([
        sprite("info"),
        pos(-1, -1),
        area()
    ]);

    scenario_info.onClick(async () => {
        languageCheck()
        let current_scenario = currentScenario()
        console.log(current_scenario)
        let infoTexte = getTranslation("CONSOLE 2")
        switch (current_scenario.etage1_choisi){
            // JV
            case jouerSurConsole:
                infoTexte = getTranslation("CONSOLE 2")
                break;
            case jouerSurPortable:
                infoTexte = getTranslation("ORDI PORTABLE")
                break;
            case jouerSurFixe:
                infoTexte = getTranslation("ORDI FIXE")
                break;
            case jouerSurTelephone:
                infoTexte = getTranslation("TELEPHONE 2")
                break;
            // JDS
            case jouerPetitJeu:
                infoTexte = getTranslation("PETIT")
                break;
            case jouerJeuMoyen:
                infoTexte = getTranslation("MOYEN")
                break;
            case jouerGrandJeu:
                infoTexte = getTranslation("GRAND")
                break;
        }
        iClick(infoTexte)
    });
    let info_treemap_shadow = add([
        sprite("info"),
        pos(476 + 1, 76 + 1),
        scale(1.1),
        color(0,0,0),
        opacity(0.4),
    ])
    let info_treemap = info_treemap_shadow.add([
        sprite("info"),
        pos(-1, -1),
        area()
    ]);
    info_treemap.onClick(async () => {
        languageCheck()
        let infoTexte = getTranslation("CASE")
        iClick(infoTexte)
    })
}

async function iClick(texte){
    if (isTalking || infoBubble) return
    infoBubble = true
    if (bettyEngaged){
        bettyExplication(betty, texte)
        quest_marker.opacity = 0
        backgroundRectangle.opacity = 0.5
        let treemapOverlay = createTreemapOverlay()
        isTalking = true
    } else if (!bettyEngaged){
        if (!betty) createBetty()
        betty_highlight.opacity = 0
        quest_marker.opacity = 0
        tween(
            betty.pos.x,
            betty.pos.x - 150,
            0.5,
            (val) => {
                betty.pos.x = val
                // betty_highlight.pos.x = val
            },
            easings.easeInOutQuad
        )
        if (curTween) {
            curTween.cancel(); 
            betty.angle = -20;
        };
        if (bettyPeaking){
            curTween = tween(
                betty.angle,
                betty.angle + 20,
                0.3,
                (val) => {
                    betty.angle = val
                },
                easings.easeInOutQuad
            )
        }
        bettyEngaged = true
        timer = 0

        await wait(0.2)
        bettyExplication(betty, texte)
        quest_marker.opacity = 0
        backgroundRectangle.opacity = 0.5
        let treemapOverlay = createTreemapOverlay()
        isTalking = true
    }
}


function createBetty(){
    backgroundRectangle = add([
        rect(width(), height()),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0),
        z(1),
        area(),
        "betty"
    ])
    betty = add([
        sprite("betty", {anim : "idle_active"}),
        pos(1990, 1020),
        scale(4),
        area(),
        anchor("bot"),
        rotate(0),
        move(0),
        body(),
        z(2),
        "betty"
    ])
    betty.flipX = true
    let betty_platform = add([
        rect(width(), 10),
        pos(0, 1020),
        area(),
        opacity(0),
        body({isStatic: true}),
        "platform"
    ])
    quest_marker = betty.add([
        sprite("quest"),
        pos(0, -45),
        anchor("bot"),
        opacity(1),
        "betty"
    ])
    betty_highlight = add([
        sprite("betty", {anim : "white"}),
        pos(betty.pos.x, betty.pos.y + 5),
        scale(4.3),
        anchor("bot"),
        z(-5),
        color(255, 255, 0),
        opacity(1),
        "betty"
    ])
    onUpdate(() => {
        betty_highlight.pos = vec2(betty.pos.x, betty.pos.y + 5);
        betty_highlight.angle = betty.angle;
    });
    betty.onCollide("platform", () => {
        canJump = true;
    });
    betty_highlight.flipX = true
}

function languageCheck(){
if (langue == "fr"){
    jouerSurConsole = "Jouer sur console";
    jouerSurPortable = "Jouer sur ordinateur portable";
    jouerSurTelephone = "Jouer sur téléphone";
    jouerSurFixe = "Jouer sur ordinateur fixe";
    jouerPetitJeu = "Petit format";
    jouerJeuMoyen = "Format moyen";
    jouerGrandJeu = "Grand format";
    changementClimatique = "Changement climatique";
    metaux = "Ressources minérales et métalliques";
    particulesFines = "Particules fines";
} else if (langue == "eng"){
    jouerSurConsole = "Console";
    jouerSurPortable = "Laptop";
    jouerSurTelephone = "Phone";
    jouerSurFixe = "Desktop computer";
    jouerPetitJeu = "Small game";
    jouerJeuMoyen = "Midsize game";
    jouerGrandJeu = "Large game";
    changementClimatique = "Climate change";
    metaux = "Metallic and mineral resources";
    particulesFines = "Particulate matter";
}
}