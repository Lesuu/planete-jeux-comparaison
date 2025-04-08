import { getTranslation, langue } from "./main.js";

let betty, bulle, txt, screenshot, bulleScaleX, bulleScaleY;
let isTalking = false;
let isSkipping = false;
let curDialog = 0;
let offset = 0


//#region Tutoriel
export function tutorial() {
    // Dialogues à afficher
    const dialogs = [
        { text: getTranslation("INDICATEURS"),      bubbleSize: {x: 13, y: 14.5}},
        //{ text: getTranslation("INDICATEURS 2"),      bubbleSize: {x: 15, y: 15}},
        { text: getTranslation("SCENARIOS JV"),     bubbleSize: {x: 5, y: 6.2}},
        { text : getTranslation("SCENARIOS JDS"),   bubbleSize: {x: 5, y: 5}},
        { text : getTranslation("CASE"),            bubbleSize: {x: 11, y: 10.7}}
    ];
    curDialog = 0;
    isTalking = false;

    screenshot = add([
        sprite(`screenshot_jv_${langue}`),
        pos(0, 0)
    ])
    //assombrissement
    assombris(curDialog)

    //#region Betty
    betty = add([
        sprite("betty", {anim : "idle"}),
        pos(1700, 850),
        scale(4),
        z(1),
        "betty"
    ])
    betty.flipX = true
    // Ajout de la bulle
    let currentDialog = dialogs[curDialog];
    bulleScaleX = currentDialog.bubbleSize.x
    bulleScaleY = currentDialog.bubbleSize.y
    bulle = add([
        sprite("bulle"),
        pos(betty.pos.x - (100 * bulleScaleX) , betty.pos.y - (55 * bulleScaleY)),
        scale(bulleScaleX, bulleScaleY),
        z(2),
        "bulle"
    ])
    bulle.flipX = false
    // Texte qu'on modifie avec 'startWriting()' pour écrire les dialogue
    txt = add([
        text("", {
            font: "pixelthin",
            size: 48,
            width: (bulle.width - 10) * bulleScaleX ,
            transform: (idx, ch) => {
                return {
                    opacity: idx < txt.letterCount ? 1 : 0,
                };
            },
        }),
        pos(bulle.pos.x + 5 * bulleScaleX, bulle.pos.y + 7 + bulleScaleY),
        color(rgb(56, 71, 74)),
        anchor("topleft"),
        z(3),
        {
            letterCount: 0,
        },
    ]);
    startWriting(dialogs[0].text);
    onClick(() => {
        if(isTalking){
            skipDialog()
        } else {
            curDialog++;
            progressDialog()
        }
    })
    function progressDialog(){
        if(curDialog < dialogs.length){
            destroy(bulle);
            destroy(txt);
            currentDialog = dialogs[curDialog];
            bulleScaleX = currentDialog.bubbleSize.x;
            bulleScaleY = currentDialog.bubbleSize.y;
            bulle = add([
                sprite("bulle"),
                pos(betty.pos.x - (100 * bulleScaleX), betty.pos.y - (55 * bulleScaleY)),
                scale(bulleScaleX, bulleScaleY),
                z(2),
                "bulle"
            ]);
            assombris(curDialog)
            txt = add([
                text("", {
                    font: "pixelthin",
                    size: 48,
                    width: (bulle.width - 10) * bulleScaleX + 4*offset,
                    transform: (idx, ch) => {
                        return { opacity: idx < txt.letterCount ? 1 : 0 };
                    },
                }),
                pos(bulle.pos.x + 5 * bulleScaleX - 0.6*offset, bulle.pos.y + 7 + bulleScaleY),
                color(rgb(56, 71, 74)),
                anchor("topleft"),
                z(3),
                { letterCount: 0 },
            ]);
            startWriting(currentDialog.text);
        } else {
            betty.play("idle")
            destroy(bulle)
            destroy(txt)
            go("treemap")
        }
    }
}
//#endregion
//#region Assombrissement
function assombris(dialog){
    let assombrissement
    switch (dialog){
        //#region Indicateurs
        case 0:
            // Assombris tout sauf les indicateurs
            // Top
            assombrissement = add([
                rect(384, 350),
                pos(0, 0),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            // Droite
            assombrissement.add([
                rect(width() - 384, height()),
                pos(384, 0),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            break;
        //#region Scénarios Jv
        case 1:
            destroyAll("assombrissement")
            let vg_button = add([
                sprite("button"),
                pos(109, 190),
                area(),
                anchor("center"),
                color(0,230,0),
                scale(1.8),
                z(4),
                "vg_button"
            ])
            vg_button.add([
                sprite("vg_color"),
                anchor("center"),
                pos(0, 0),
                scale(1/1.15),
                z(4),
                "vg_button"
            ])
            vg_button.add([
                text(getTranslation("JEU VIDEO"), {
                    font: "pixel",
                    size: 18,
                    width: 50,
                    align: "center"
                }),
                anchor("top"),
                pos(0,43),
                z(4),
                "vg_button"
            ])
            // Assombris tout sauf les scénarios:
            // Top
            assombrissement = add([
                rect(width(), 833),
                pos(0, 0),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            // Gauche
            assombrissement.add([
                rect(700, 247),
                pos(0, 833),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            //Droite
            assombrissement.add([
                rect(440, 247),
                pos(1480, 833),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            break;
        //#region Scénarios JdS
        case 2:
            destroyAll("assombrissement")
            destroyAll("vg_button")
        screenshot.sprite = `screenshot_jds_${langue}`
            // Ajoute le bouton jds
            let bg_button = add([
                sprite("button"),
                pos(279, 190),
                area(),
                anchor("center"),
                color(0, 230, 0),
                scale(1.8),
                z(4),
                "bg_button"
            ])
            bg_button.add([
                sprite("bg_color"),
                anchor("center"),
                pos(0, 0),
                scale(1/1.15),
                "bg_button"
            ])
            bg_button.add([
                text(getTranslation("JEU DE SOCIETE"), {
                    font: "pixel",
                    size: 18,
                    width: 50,
                    align: "center"
                }),
                anchor("top"),
                pos(0,43),
                "bg_button"
            ])
            // Assombris tout sauf les scénarios:
            // Top
            assombrissement = add([
                rect(width(), 833),
                pos(0, 0),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            // Gauche
            assombrissement.add([
                rect(700, 247),
                pos(0, 833),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            //Droite
            assombrissement.add([
                rect(440, 247),
                pos(1480, 833),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])

            break;
        //#region Treemap
        case 3:
            destroyAll("assombrissement")
            destroyAll("bg_button")
            // On déplace Betty & sa bulle
            betty.pos = vec2(20, 900)
            betty.flipX = false
            bulle.sprite = "bulle_vert"
            bulle.pos = vec2(betty.pos.x + bulleScaleX - 20, betty.pos.y - (82* bulleScaleY))
            offset = 12
            // Assombris tout sauf la fenêtre treemap:
            // Gauche
            assombrissement = add([
                rect(384, height()),
                pos(0, 0),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            // Top
            assombrissement.add([
                rect(1536, 70),
                pos(384, 0),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            // Bas
            assombrissement.add([
                rect(1536, 790),
                pos(384, 832),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            // Droite
            assombrissement.add([
                rect(23, 762),
                pos(1897, 70),
                color(0, 0, 0),
                opacity(0.5),
                "assombrissement"
            ])
            break;
    }
    
}
//#endregion
//#region Writing
function startWriting(dialog) {
    isTalking = true;
    txt.letterCount = 0;
    txt.text = dialog;
    isSkipping = false;
    betty.play("talk")
    let counter = 0

    const writing = loop(0.02, () => {
        if(isSkipping){
            txt.letterCount = txt.renderedText.length;
        } else {
            txt.letterCount = Math.min(
                txt.letterCount + 1,
                txt.renderedText.length,
            );
        }
        counter += 1
        if (counter % 2 === 0){
            play("talk", {
                volume: 0.05,
            });
        }
        
        if (txt.letterCount === txt.renderedText.length) {
            isTalking = false;
            writing.cancel();
            betty.play("idle_active")
            close.opacity = 1
        }
    });
}
function skipDialog() {
    isSkipping = true
}