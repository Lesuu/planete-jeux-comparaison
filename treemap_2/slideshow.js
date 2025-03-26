import { getTranslation } from "./main.js";
let txt, betty, bulle;
let curDialog = 0;
let isTalking = false;
let isSkipping = false;



export function slideshow(){
    const dialogs = [
        getTranslation("INTRO"),
        getTranslation("ACV"),
    ];
    curDialog = 0;
    isTalking = false;

    // Ajout de betty
    betty = add([
        sprite("betty", {anim : "talk"}),
        pos(1400, 750),
        scale(4),
        area(),
        //anchor("bot"),
        "betty"
    ])
    betty.flipX = true

    // Ajout de la bulle
    let bulleScale = 10
    bulle = add([
        sprite("bulle"),
        pos(betty.pos.x - (100 * bulleScale) , betty.pos.y - (55 * bulleScale)),
        scale(bulleScale),
        "bulle"
    ])
    // Texte qu'on modifie avec 'startWriting()' pour écrire les dialogue
    txt = add([
        text("", {
            font: "pixelthin",
            size: 48,
            width: (bulle.width - 20) * bulleScale ,
            transform: (idx, ch) => {
                return {
                    opacity: idx < txt.letterCount ? 1 : 0,
                };
            },
        }),
        pos(bulle.pos.x + 10 * bulleScale, bulle.pos.y + 10 + bulleScale),
        color(rgb(56, 71, 74)),
        anchor("topleft"),
        {
            letterCount: 0,
        },
    ]);
    startWriting(dialogs[curDialog]);
    onClick(() => {
        if(isTalking){
            skipDialog()
        } else {
            curDialog++;
            if(curDialog < dialogs.length){
                startWriting(dialogs[curDialog]);
            } else {
                betty.play("idle")
                destroy(bulle)
                destroy(txt)
                go("treemap")
            }
        }
    })
}



function startWriting(dialog) {
    isTalking = true;
    txt.letterCount = 0;
    txt.text = dialog;
    isSkipping = false;

    const writing = loop(0.02, () => {
        if(isSkipping){
            txt.letterCount = txt.renderedText.length;
        } else {
            txt.letterCount = Math.min(
                txt.letterCount + 1,
                txt.renderedText.length,
            );
        }
        play("talk", {
            volume: 0.1,
        });
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