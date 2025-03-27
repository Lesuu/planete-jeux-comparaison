import { getTranslation } from "./main.js";
let txt, betty, bulle;
let curDialog = 0;
let isTalking = false;
let isSkipping = false;
let isTweening = false

export function slideshow(){
    const histo_jv_data = [

    ]
    const histo_jds_data = [

    ]

    const dialogs = [
        { text: getTranslation("INTRO"),            bubbleSize: {x: 10, y: 6}},
        { text: getTranslation("ACV"),              bubbleSize: {x: 10, y: 12}},
        { text : getTranslation("HISTOGRAMME JV"),  bubbleSize: {x: 5, y: 5}},
        { text : getTranslation("HISTOGRAMME JDS"), bubbleSize: {x: 5, y: 5}}
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
    let currentDialog = dialogs[curDialog];
    let bulleScaleX = currentDialog.bubbleSize.x
    let bulleScaleY = currentDialog.bubbleSize.y
    bulle = add([
        sprite("bulle"),
        pos(betty.pos.x - (100 * bulleScaleX) , betty.pos.y - (55 * bulleScaleY)),
        scale(bulleScaleX, bulleScaleY),
        "bulle"
    ])
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
        pos(bulle.pos.x + 5 * bulleScaleX, bulle.pos.y + 5 + bulleScaleY),
        color(rgb(56, 71, 74)),
        anchor("topleft"),
        {
            letterCount: 0,
        },
    ]);
    startWriting(dialogs[curDialog].text);
    onClick( async () => {
        if(isTweening) return
        if(isTalking){
            skipDialog()
        } else {
            curDialog++;
            if(curDialog < dialogs.length){
                destroy(bulle);
                destroy(txt);
                if(curDialog === 2){
                    isTweening = true
                    await tweens()
                    isTweening = false
                }
                currentDialog = dialogs[curDialog];
                bulleScaleX = currentDialog.bubbleSize.x;
                bulleScaleY = currentDialog.bubbleSize.y;
                bulle = add([
                    sprite("bulle"),
                    pos(betty.pos.x - (100 * bulleScaleX), betty.pos.y - (55 * bulleScaleY)),
                    scale(bulleScaleX, bulleScaleY),
                    "bulle"
                ]);
                txt = add([
                    text("", {
                        font: "pixelthin",
                        size: 48,
                        width: (bulle.width - 10) * bulleScaleX,
                        transform: (idx, ch) => {
                            return { opacity: idx < txt.letterCount ? 1 : 0 };
                        },
                    }),
                    pos(bulle.pos.x + 5 * bulleScaleX, bulle.pos.y + 5 + bulleScaleY),
                    color(rgb(56, 71, 74)),
                    anchor("topleft"),
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
    })
}



function startWriting(dialog) {
    isTalking = true;
    txt.letterCount = 0;
    txt.text = dialog;
    isSkipping = false;
    betty.play("talk")

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

function tweens(){
    tween(
        betty.pos,
        vec2(1700, 350),
        1,
        (val) => {
            betty.pos = val
        },
        easings.easeInOutQuad
    )
    
    // tween(

    // )
}