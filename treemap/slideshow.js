import { getTranslation } from "./main.js";
let txt, betty, bulle, retour;
let curDialog = 0;
let isTalking = false;
let isSkipping = false;
let isTweening = false

// Constantes pour les histogrammes
const barScaleJv = 2000;
const barScaleJds = 100
const baseLineXJds = 730
const baseLineX = 615;
const baseLineY = 750;
const barWidth = 80;

let histo_jv_data, histo_jds_data

export function slideshow(){
    // Données pour les histogrammes
    histo_jv_data = [
        {label: getTranslation("HISTOGRAMME JV 1"), value: 0.260300000000000,  icon : "console_full"},
        {label: getTranslation("HISTOGRAMME JV 2"), value: 0.133547000000000,  icon : "pc_full"},
        {label: getTranslation("HISTOGRAMME JV 3"), value: 0.083747000000000,  icon : "portable_full"},
        {label: getTranslation("HISTOGRAMME JV 4"), value:	0.046833172839506, icon : "telephone_full"},    
    ];
    histo_jds_data = [
        {label: getTranslation("HISTOGRAMME JDS 1"), value: 4.082425600000000, icon: "bg_color" },
        {label: getTranslation("HISTOGRAMME JDS 2"), value: 1.223896000000000, icon:"jeu_moyen_full"},
        {label: getTranslation("HISTOGRAMME JDS 3"), value: 0.732836000000000, icon:"petit_jeu_full"},
    ];
    // Dialogues pour le slideshow
    const dialogs = [
        { text: getTranslation("INTRO"),            bubbleSize: {x: 8, y: 5.5}},
        { text: getTranslation("ACV"),              bubbleSize: {x: 8, y: 9}},
        { text : getTranslation("HISTOGRAMME JV"),  bubbleSize: {x: 6, y: 5.7}},
        { text : getTranslation("HISTOGRAMME JDS"), bubbleSize: {x: 5, y: 5.5}}
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
                if (curDialog === 3){
                    isTweening = true
                    await tweens2()
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
                go("tutorial")
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

async function tweens(){
    await tween(
        betty.pos,
        vec2(1700, 450),
        1,
        (val) => {
            betty.pos = val
        },
        easings.easeInOutQuad
    )

    let startColor = { r: 0, g: 0, b: 139 } 
    let endColor   = { r: 30, g: 144, b: 255 } 
    
    histo_jv_data.forEach((d, i) =>{
        const barHeight = d.value * barScaleJv;
        const xPos = baseLineX + i * (barWidth + 150);
        const yPos = baseLineY;

        const factor = i / (histo_jv_data.length - 1)

        const barColor = interpolateColor(
            startColor.r, startColor.g, startColor.b,
            endColor.r,   endColor.g,   endColor.b,
            factor
        )

        let bar = add([
            rect(barWidth, 0),
            pos(xPos, yPos),
            anchor("bot"),
            color(barColor),
            outline(2, rgb(0,0,0)),
            area(),
            "bar"
        ]);

        // Animation de la barre qui se construit
        let barTween = tween(
            bar.height,
            barHeight,
            1.5,
            (val) => {
                bar.height = val
            },
            easings.easeInOutQuad
        )

        //tweens.push(barTween)

        // Ajout de l'icone
        add([
            sprite(d.icon),
            pos(xPos, baseLineY + 43),
            anchor("center"),
            "bar"
        ])
        // Ajout du label de la barre & son ombre
        let shadow = add([
            text(d.label, {
                font: "pixel",
                size: 36,
                width : 200,
                align : "center"
            }),
            pos(xPos + 4, baseLineY + 75 + 3),
            anchor("top"),
            color(0,0,0),
            opacity(0.4),
            "bar"
        ])
        shadow.add([
            text(d.label, {
                font: "pixel",
                size: 36,
                width : 200,
                align : "center"
            }),
            pos(-4, -3),
            anchor("top"),
            "bar"
        ])
    })
}

async function tweens2(){
    destroyAll("bar")

    let startColor = { r: 0, g: 0, b: 139 } 
    let endColor   = { r: 30, g: 144, b: 255 } 

    histo_jds_data.forEach((d, i) =>{
        const barHeight = d.value * barScaleJds;
        const xPos = baseLineXJds + i * (barWidth + 150);
        const yPos = baseLineY;

        const factor = i / (histo_jv_data.length - 1)

        const barColor = interpolateColor(
            startColor.r, startColor.g, startColor.b,
            endColor.r,   endColor.g,   endColor.b,
            factor
        )

        let bar = add([
            rect(barWidth, 0),
            pos(xPos, yPos),
            anchor("bot"),
            color(barColor),
            outline(2, rgb(0,0,0)),
            area(),
            "bar"
        ]);

        // Animation de la barre qui se construit
        let barTween = tween(
            bar.height,
            barHeight,
            1.5,
            (val) => {
                bar.height = val
            },
            easings.easeInOutQuad
        )

        //tweens.push(barTween)

        // Ajout des icones
        add([
            sprite(d.icon),
            pos(xPos, baseLineY + 43),
            anchor("center"),
            "bar"
        ])
        // Ajout du label de la barre & son ombre
        let shadow = add([
            text(d.label, {
                font: "pixel",
                size: 36,
                width : 200,
                align : "center"
            }),
            pos(xPos + 4, baseLineY + 75 + 3),
            anchor("top"),
            color(0,0,0),
            opacity(0.4),
            "bar"
        ])
        shadow.add([
            text(d.label, {
                font: "pixel",
                size: 36,
                width : 200,
                align : "center"
            }),
            pos(-4, -3),
            anchor("top"),
            "bar"
        ])
    })
}

// Eclaircir la couleur des bars
function interpolateColor(r1, g1, b1, r2, g2, b2, factor) {
    return rgb(
        Math.round(r1 + (r2 - r1) * factor),
        Math.round(g1 + (g2 - g1) * factor),
        Math.round(b1 + (b2 - b1) * factor)
    )
}