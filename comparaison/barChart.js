import { getTranslation } from "./comparaison.js";

let isTalking = false;
let isSkipping = false;
let continue_prompt;
let terminer_label
let continue_label
let startedTalking = false;
let betty, bulle;
let sequence = 0;
let terminer_scale 

// Version du jeu (normal, bus, interne_bus) pour le bouton final
const version = "normal"

const lien1 = "https://forms.gle/GMwGXPwwfqtjQT1p9"
const lien2 = "https://forms.gle/puxiijgLkFG1YTi59"

export function createBarChart(langue, score){
    // reset les variables
    sequence = 0
    isTalking = false
    isSkipping = false
    startedTalking = false
    // Données du bar chart
    const data = [
        { label: getTranslation("LEGENDE HISTOGRAMME 3"),               carbon: 193,  impact: 48.47 },
     // { label: "Manger un steak de boeuf",            carbon: 130,  impact: 32.65 },
        { label: getTranslation("LEGENDE HISTOGRAMME 4"),                         carbon: 85.9, impact: 21.57 },
        { label: getTranslation("LEGENDE HISTOGRAMME 5"),  carbon: 4.08, impact: 1.02 },
        { label: getTranslation("LEGENDE HISTOGRAMME 6"),  carbon: 3.982, impact: 1 },
    ];
    const finalData = { label: getTranslation("LEGENDE HISTOGRAMME 2"), carbon: 1770, impact: 444.5 }
    const finalFinalData = { label: getTranslation("LEGENDE HISTOGRAMME 1"), carbon : 9880, impact: 2481}

    let done = false
    let done2 = false
    // Constantes pour les positions/échelles du bar chart
    const barScale = 2;
    const baseLineY = 700;
    const baseLineX = 615;
    const barWidth = 80;
    let bars = []
    let tweens = []

    let scoreLabel = add([
        text(getTranslation("FINAL").replace("{score}", score),{
            font: "pixeloutline",
            size: 90,
            align: "center",
            width: 1200,
            letterSpacing: 6,
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
                scale: wave(1, 1.2, time() * 3 + idx),
                angle: wave(-9, 9, time() * 3 + idx),
            }),
        }),
        pos(width()/2 + 5, 450 + 5),
        anchor("center"),
        color(0,0,0),
        opacity(0.4)
    ])
    let scoreLabel_shadow = scoreLabel.add([
        text(getTranslation("FINAL").replace("{score}", score),{
            font: "pixeloutline",
            size: 90,
            align: "center",
            width: 1200,
            letterSpacing: 6,
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
                scale: wave(1, 1.2, time() * 3 + idx),
                angle: wave(-9, 9, time() * 3 + idx),
            }),
        }),
        pos(- 5, - 5),
        anchor("center"),
    ])


    betty = add([
        sprite("betty", {anim : "happy"}),
        pos(1700, 800),
        scale(4),
        "betty"
    ])
    betty.flipX = true

    // Initialize a timer variable
    let starTimer = 0;
    setGravity(800)

    betty.onUpdate(() => {
        if(sequence === 0 && !startedTalking){
            starTimer += dt();
            if (starTimer >= 0.5) {
                starTimer = 0;
                const star = add([
                    pos(betty.pos.x + 65, betty.pos.y + 30),
                    sprite("star"),
                    scale(rand(0.5, 1)),
                    body(),
                    lifespan(1, { fade: 0.5 }),
                    opacity(1),
                    rotate(rand(0, 360)),
                    move(choose([LEFT, RIGHT]), rand(60, 240)),
                    z(-5),
                    "betty"
                ]);
                star.jump(rand(320, 640));
            }
        }
    });

    wait(2, () => {
        if (sequence > 0){
            betty.play("idle")
            return
        }
        bulle = add([
            sprite("bulle"),
            pos(betty.pos.x  - 350, betty.pos.y - 230),
            scale(4),
            anchor("topleft"),
            "bulle"
        ]);
        startWriting(getTranslation("HISTOGRAMME 1"))
    })
    function skipDialog() {
        isSkipping = true
    }
    onClick(()=>{
        if(isTalking){
            skipDialog()
            return
        }
        if (sequence === 0){
            // On itère à travers les données pour créer les barres
            wait(1, () => {
                bulle = add([
                    sprite("bulle"),
                    pos(betty.pos.x - 340, betty.pos.y - 450),
                    scale(4, 8),
                    anchor("topleft"),
                    "bulle"
                ]);
                startWriting(getTranslation("HISTOGRAMME 2"))
            })
            destroyAll("bulle")
            betty.play("idle")
            tween(
                scoreLabel.pos.y,
                scoreLabel.pos.y - 300,
                1,
                (val) => {
                    scoreLabel.pos.y = val
                },
                easings.easeOutQuad
            )
            data.forEach((d, i) =>{
                const barHeight = d.carbon * barScale;
                const xPos = baseLineX + i * (barWidth + 150);
                const yPos = baseLineY;

                let bar = add([
                    rect(barWidth, 0),
                    pos(xPos, yPos),
                    anchor("bot"),
                    outline(2, rgb(56, 71, 74)),
                    area()
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

                tweens.push(barTween)

                // Ajout du label de la barre & son ombre
                let shadow = add([
                    text(d.label, {
                        font: "pixel",
                        size: 36,
                        width : 200,
                        align : "center"
                    }),
                    pos(xPos + 4, baseLineY + 10 + 3),
                    anchor("top"),
                    color(0,0,0),
                    opacity(0.4)
                ])
                shadow.add([
                    text(d.label, {
                        font: "pixel",
                        size: 36,
                        width : 200,
                        align : "center"
                    }),
                    pos(-4, -3),
                    anchor("top")
                ])
                // On ajoute les barres dans un tableau pour les modifier plus tard
                bars.push({bars: bar, text: shadow})
            });
            switch(langue){
                case "fr": 
                    switch(version){
                        case "bus":
                        case "interne_bus":
                            terminer_label = "GAGNE TON TICKET POUR PLANÈTE JEUX !";
                            terminer_scale = vec2(6, 4.5)
                            break;
                        case "normal":
                            terminer_label = "TERMINER";
                            terminer_scale = vec2(3.5, 3.5)
                            break;
                    }
                    continue_label = "Appuie pour continuer"
                    break;
                case "eng": 
                    switch(version){
                        case "bus":
                        case "interne_bus":
                            terminer_label = "WIN AN ENTRY FOR PLANÈTE JEUX!";
                            terminer_scale = vec2(6, 4.5)
                            break;
                        case "normal":
                            terminer_label = "FINISH";
                            terminer_scale = vec2(3.5, 3.5)
                            break;
                    }
                    continue_label = "Press to continue"
                    break;
            }
            // Prompt pour continuer
            continue_prompt = add([
                text(continue_label, {
                    font: "pixelthin",
                    size: 54,
                    width: 1070,
                    align: "center",
                    transform: (idx, ch) => ({
                        pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                        angle: wave(-2, 2, time() * 3 + idx),
                    }),
                }),
                pos(960, baseLineY + 200),
                color(150, 200, 150),
                z(110),
                anchor("center"),
                opacity(1),
            ])
            sequence += 1
        } else if (sequence === 1){
            // Quand l'utilisateur clique, on rajoute la dernière barre (même logique)
            if (done) return
            done = true
            destroyAll("bulle")
            continue_prompt.opacity = 0
            tweens.forEach(tween => tween.finish());
            // On recalcule la taille des barres existantes
            bars.forEach(({bars, text}) => { 
                tween(
                    bars.height,
                    bars.height * 0.1,
                    1.5,
                    (val) => {
                        bars.height = val
                    },
                    easings.easeInOutQuad
                )
                tween(
                    bars.pos.x,
                    bars.pos.x + (barWidth + 35),
                    1.5,
                    (val) => {
                        bars.pos.x = val
                        text.pos.x = val
                    },
                    easings.easeInOutQuad
                )
            })
            // On ajoute la barre finale
            wait(1.5, () => {
                let finalBar = add([
                    rect(barWidth, 0),
                    pos(500, baseLineY),
                    anchor("bot"),
                    outline(2, rgb(56, 71, 74)),
                    area()
                ]);
                tween(
                    finalBar.height,
                    finalData.carbon * 0.2,
                    1.5,
                    (val) => {
                        finalBar.height = val
                    },
                    easings.easeInOutQuad
                )
                let finalShadow = add([
                    text(finalData.label, {
                        font: "pixel",
                        size: 36,
                        width : 200,
                        align : "center"
                    }),
                    pos(finalBar.pos.x + 4, baseLineY + 10 + 3),
                    anchor("top"),
                    color(25,82,64),
                    opacity(0)
                ])
                let finalBarLabel = finalShadow.add([
                    text(finalData.label, {
                        font: "pixel",
                        size: 36,
                        width : 200,
                        align : "center"
                    }),
                    pos(-4, -3),
                    anchor("top"),
                    opacity(0)
                ])
                tween(
                    finalShadow.opacity,
                    1,
                    0.5,
                    (val) => {
                        finalShadow.opacity = val 
                        finalBarLabel.opacity = val 
                    },
                    easings.easeInQuad
                )
                bars.push({bars: finalBar, text: finalShadow})  
            })   
            sequence += 1
            done2 = true
            wait(3, () => {
                done2 = false
                continue_prompt.opacity = 1
            })
        } else if(sequence === 2){
            if (done2) return
            done2 = true
            destroyAll("bulle")
            sequence += 1
            continue_prompt.opacity = 0
            bars.forEach(({bars, text}) => { 
                tween(
                    bars.height,
                    bars.height * 0.1,
                    1.5,
                    (val) => {
                        bars.height = val
                    },
                    easings.easeInOutQuad
                )
                tween(
                    bars.pos.x,
                    bars.pos.x + (barWidth + 35),
                    1.5,
                    (val) => {
                        bars.pos.x = val
                        text.pos.x = val
                    },
                    easings.easeInOutQuad
                )
            })
            wait(1.5, () => {
                let finalBar = add([
                    rect(barWidth, 0),
                    pos(385, baseLineY),
                    anchor("bot"),
                    outline(2, rgb(56, 71, 74))
                ]);
                tween(
                    finalBar.height,
                    finalFinalData.carbon * 0.04,
                    1.5,
                    (val) => {
                        finalBar.height = val
                    },
                    easings.easeInOutQuad
                )
                let finalShadow = add([
                    text(finalFinalData.label, {
                        font: "pixel",
                        size: 36,
                        width : 200,
                        align : "center"
                    }),
                    pos(finalBar.pos.x + 4, baseLineY + 10 + 3),
                    anchor("top"),
                    color(25,82,64),
                    opacity(0)
                ])
                let finalBarLabel = finalShadow.add([
                    text(finalFinalData.label, {
                        font: "pixel",
                        size: 36,
                        width : 200,
                        align : "center"
                    }),
                    pos(-4, -3),
                    anchor("top"),
                    opacity(0)
                ])
                tween(
                    finalShadow.opacity,
                    1,
                    0.5,
                    (val) => {
                        finalShadow.opacity = val 
                        finalBarLabel.opacity = val 
                    },
                    easings.easeInQuad
                )

            })
            wait(3, () => {
                bulle = add([
                    sprite("bulle"),
                    pos(betty.pos.x - 550, betty.pos.y - 450),
                    scale(6, 8),
                    anchor("topleft"),
                    "bulle"
                ]);
                startWriting(getTranslation("HISTOGRAMME 3"))
            })
            // Bouton de fin
            let suivant_bouton = add([
                sprite("button"),
                pos(width()/2, height()/1.1),
                scale(terminer_scale),  
                anchor("center"),
                area(),
            ])

            let fin = add([
                text(terminer_label,{
                    font: "pixel",
                    size: 54,
                    align: "center",
                    letterSpacing : 6,
                    width: 500,
                }),
                pos(suivant_bouton.pos),
                anchor("center"),
                z(20),
                "results_element"
            ])
    
            let fin_shadow = add([
                text(terminer_label,{
                    font: "pixel",
                    size: 54,
                    align: "center",
                    letterSpacing : 6,
                    width: 500
                }),
                color(93, 27, 27),
                pos(suivant_bouton.pos.x + 5, suivant_bouton.pos.y + 5),
                anchor("center"),
                "results_element"
            ])
            
            suivant_bouton.onClick(()=>{
                switch (version){
                    case "normal":
                        window.location.reload()
                        break;
                    case "bus":
                        window.location.href = lien1
                        break;
                    case "interne_bus":
                        window.location.href = lien2
                        break;
                }
            })
        } else if (sequence === 3){
            if(isTalking){
                skipDialog()
                return
            }
            destroyAll("bulle")
            return
        }
     })
}

function startWriting(dialog) {
    startedTalking = true
    betty.play("talk")
    let txtWidth = sequence < 3 ? 350 : 550
    let txt = add([
        text("", {
            font: "pixelthin",
            size: 54,
            width: txtWidth,
            lineSpacing: -10,
            transform: (idx, ch) => {
                return {
                    opacity: idx < txt.letterCount ? 1 : 0,
                };
            },
        }),
        anchor("topleft"),
        pos(bulle.pos.x + 50 , bulle.pos.y + 10),
        color(rgb(56, 71, 74)),
        {
            letterCount: 0,
        },
        scale(1),
        z(1000),
        "bulle"
    ]);
    isTalking = true;
    txt.letterCount = 0;
    txt.text = dialog;
    isSkipping = false;

    const writing = loop(0.03, () => {
        if(isSkipping){
            txt.letterCount = txt.renderedText.length;
        } else {
            txt.letterCount = Math.min(
                txt.letterCount + 1,
                txt.renderedText.length,
            );
        }
        play("talk2", {
            volume: 0.1,
        });
        if (txt.letterCount === txt.renderedText.length) {
            isTalking = false;
            writing.cancel();
            betty.play("idle")
            close.opacity = 1
        }
        console.log(txt.renderedText)
    });
}