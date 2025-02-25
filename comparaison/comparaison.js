import { loadData, questions_JV, questions_JdS, questions_autres, translations} from './dataLoader.js';

//#region initialisation 
// false: fiche v1, true: fiche v3
let testing = true

// Initialisation de Kaplay
kaplay({
    background : [42, 138, 109],
    letterbox:true,
    width:1920,
    height:1080,
    stretch:true,
})

main()
async function main() {
    // On attend que les données soient chargées pour lancer le programme
    await loadData(testing)
    //#endregion
    //#region Asset loading

    loadFont("pixel", "assets/fonts/m6x11plus.ttf")
    loadFont("pixelthin", "assets/fonts/PixelOperator8.ttf")
    loadFont("kaph", "assets/fonts/Kaph-Regular.ttf", {
        outline: {
            width: 3,
            color: rgb(0,0,0),
        },
        lineSpacing : 40,
    });

    loadSound("fail","assets/audio/fail.mp3")

    loadSound("card1","assets/audio/card-place-1.ogg")
    loadSound("card2","assets/audio/card-place-2.ogg")
    loadSound("card3","assets/audio/card-place-3.ogg")
    loadSound("card4","assets/audio/card-place-4.ogg")

    loadSound("score1","assets/audio/score.wav")
    loadSound("score2","assets/audio/score-streak.wav")
    loadSound("score3","assets/audio/score-streak-max.wav")

    let scoreSound = ["score1", "score2", "score3"]
    let cardSounds = ["card1", "card2", "card3", "card4"]

    loadSprite("jv_icon", "assets/sprites/video_game.png")
    loadSprite("jv_color", "assets/sprites/vg_color.png")
    loadSprite("jds_icon", "assets/sprites/board_game.png")
    loadSprite("jds_color", "assets/sprites/bg_color.png")
    loadSprite("button", "assets/sprites/button_textless.png")
    loadSpriteAtlas("assets/sprites/cards.png", {
        "spades" : {
            "x": 0,
            "y": 0,
            "width": 173,
            "height": 236
        },
        "clubs" : {
            "x": 173,
            "y": 0,
            "width": 173,
            "height": 236
        },
        "hearts" : {
            "x": 346,
            "y": 0,
            "width": 173,
            "height": 236
        },
        "diamonds" : {
            "x": 519,
            "y": 0,
            "width": 173,
            "height": 236
        }
    })

    // Shader CRT
    loadShaderURL("crt", null, "assets/shaders/crt.frag");
    const crtEffect = () => ({
        "u_flatness": 4 ,
    });   

    const scaleValue = 2.3;
    //#endregion
    // #region Variables
    // Variables globales
    let jv 
    let question_number = 0
    let clicked = 0
    let categorie
    let autres
    let score = 0
    let compteur_question 
    let jv_hover
    let jds_hover
    let question = {}
    let score_effect = null
    let streak = 0
    let multiplier = 1
    let locked = false
    let showingResults = false

    // Constantes
    const nbr_questions = 10
    const num_questions_scriptees = [4, 7, 9]
    const langue = "fr"

    // Couleurs
    const background_col = rgb(42, 138, 109)
    const correct_color = hsl2rgb(120/360, 0.6, 0.65)
    const wrong_color = hsl2rgb(337/360, 0.8, 0.7)
    //#endregion
    // #region Ecran d'accueil

    //Fonction pour la traduction des textes
    function getTranslation(key){
        return translations[key][langue]
    }

    scene("titleScreen", async () => {

        // Testing
        // Add a button that uses the 'button' sprite
        let start_button = add([
            sprite("button"),
            pos(width()/2, height()/1.2),
            scale(scaleValue*1.5),  
            anchor("center"),
            area(),
            "start_button"
        ])

        let start_text = add([
            text(`mode test : ${testing}`, {
                font: "pixel",
                size: 32,
                align: "center"
            }),
            pos(start_button.pos),
            anchor("center"),
            z(100),
            "start_button"
        ])

        start_button.onClick(async () => {
            testing = !testing
            await loadData()
            start_text.text = `mode test : ${testing}`
        })

        // Shader CRT
        onUpdate(() => {
            usePostEffect("crt", crtEffect());
        });
        // Réinitialisation du score
        score = 0
        compteur_question = 0
        multiplier = 1
        streak = 0

        // Elements UI
        let title = add([
            text(/*getTranslation("OPTION")*/ 'Choisis une option!', {
                font: "pixel",
                size: 54
            }),
            pos(width()/2 , height()/5),
            anchor("center"),
            z(50)
        ])
        let title_shadow = add([
            text(/*getTranslation("OPTION")*/ 'Choisis une option!', {
                font: "pixel",
                size: 54
            }),
            pos(title.pos.x + 6, title.pos.y + 6),
            anchor("center"),
            color(0,0,0),
            opacity(0.4)
        ])
        let jv_icon = add([
            sprite("jv_icon"),
            pos(width()/2.5, height()/2),
            scale(scaleValue*1.3),  
            anchor("right"),
            area(),
            "jv_icon"
        ])
        let jds_icon = add([
            sprite("jds_icon"),
            pos(width()/1.8, height()/2),
            scale(scaleValue*1.8),  
            anchor("left"),
            area(),
            "jds_icon"
        ])
        // Changement de la texture quand on survole les icones...
        jv_icon.onHover(() => {
            jv_icon.sprite = "jv_color"
            jv_hover = true
        })
        jds_icon.onHover(() => {
            jds_icon.sprite = "jds_color"
            jds_hover = true
        })

        // ... et quand on lâche
        jv_icon.onHoverEnd(() => {
            jv_icon.sprite = "jv_icon"
            jv_hover = false
        })
        jds_icon.onHoverEnd(() => {
            jds_icon.sprite = "jds_icon"
            jds_hover = false
        })

        // Changement de scène, établit si on a cliqué sur jv ou jds grâce a la variable jv
        await jv_icon.onClick(() => {
            onMouseRelease(()=>{
                if (jv_hover){
                    jv = true
                    categorie = [...questions_JV]
                    autres = [...questions_autres]
                    go("questions")
                }
            })
        })
        await jds_icon.onClick(() => {
            onMouseRelease(()=>{
                if (jds_hover){
                    jv = false
                    categorie = [...questions_JdS]
                    autres = [...questions_autres]
                    go("questions")
                }
            })
        })
    })
    //#endregion
    // #region Questions
    // Scène où on pose les questions
    
    scene("questions", async () => {
        // Shader CRT
        onUpdate(() => {
            usePostEffect("crt", crtEffect());
        });
        // Couleur du background dépend du support choisi
        let icon_sprite
        if (jv){
            setBackground(background_col)
            icon_sprite = "jv_color"
        } else {
            setBackground(background_col)
            icon_sprite = "jds_color" 
        }

        // Compteur de question

        compteur_question ++
        let compteur_caption = add([
            text(`Question ${compteur_question}/${nbr_questions}`, {
                font: "pixel",
                size: 54
            }),
            pos(width() - width()/1.11, height()*0.06),
            anchor("center"),
            z(50)
        ]);
        let compteur_shadow = add([
            text(`Question ${compteur_question}/${nbr_questions}`, {
                font: "pixel",
                size: 54
            }),
        pos(compteur_caption.pos.x + 5, compteur_caption.pos.y + 6),
            anchor("center"),
            color(0,0,0),
            opacity(0.4),
        ]);

        // Compteur de score
        let score_caption = add([
            text(`Score: ${score}`, {
                font: "pixel",
                size: 54
            }),
            pos(width()/1.1, height()*0.06),
            anchor("center"),
            z(50)
        ])
        let score_shadow = add([
            text(`Score: ${score}`, {
                font: "pixel",
                size: 54
            }),
            pos(score_caption.pos.x+ 5, score_caption.pos.y + 6),
            anchor("center"),
            opacity(0.4),
            color(0,0,0),

        ])

        // Icone du support
        let icon = add([
            sprite(icon_sprite),
            pos(width() - width()/1.255, height()*0.058),
            anchor("center"),
        ])


        displayQuestion()
        function displayQuestion(){
            locked = false
            showingResults = false
            // Choisi une question aléatoire
            question_number = Math.floor(rand(categorie.length))

            // Sépare les questions 'égales'
            let questionsEgales = categorie.filter(question => question.theme === "Egal")
            console.log(questionsEgales)

            // Randomiser la position des cartes 
            let x_card1 = width() / 3;
            let x_card2 = width() / 1.5

            // Randomly decide whether to swap the positions of the cards
            if (randi() === 0) {
                [x_card1, x_card2] = [x_card2, x_card1];
            }

            // Choix aléatoire du type la carte
            let sprite1 = (randi() === 0 ? "spades" : "clubs")
            let sprite2 = (randi() === 0 ? "diamonds" : "hearts")

            //#region choixQuestion
            function choixQuestion(){
                // Si c'est la dernière scriptée, on prend une question 'égale'
                if (compteur_question === Math.max(...num_questions_scriptees) && questionsEgales.length > 0){
                    console.log("question egale")
                    let randnum = Math.floor(rand(questionsEgales.length))
                    return {
                        scriptee : false,
                        text1 : questionsEgales[randnum].description_activite1,
                        text2 : questionsEgales[randnum].description_activite2,
                        theme : questionsEgales[randnum].theme,
                        caption : questionsEgales[randnum].question,
                        activite1_gagne : true,
                        commentaire : questionsEgales[randnum].commentaire,
                    }
                // Si c'est une question scriptée mais pas la dernière, on prend une question 'autre'
                } else if (num_questions_scriptees.includes(compteur_question)){
                    let randnum = Math.floor(rand(autres.length))
                    if (autres[randnum].activite1_gagnante === "TRUE"){
                        return {
                            scriptee : true,
                            text1 : autres[randnum].description_activite1,
                            text2 : autres[randnum].description_activite2,
                            theme : autres[randnum].theme,
                            caption : autres[randnum].question,
                            activite1_gagne : true,
                            commentaire : autres[randnum].commentaire
                        }
                    } else {
                        return{
                            scriptee : true,
                            text1 : autres[randnum].description_activite1,
                            text2 : autres[randnum].description_activite2,
                            theme : autres[randnum].theme,
                            caption : autres[randnum].question,
                            activite1_gagne : false,
                            commentaire : autres[randnum].commentaire
                        }
                    }
                // Sinon, on prend une question normale aléatoire
                } else{
                    if (categorie[question_number].activite1_gagnante === "TRUE"){
                        return{
                            scriptee : false,
                            text1 : categorie[question_number].description_activite1,
                            text2 : categorie[question_number].description_activite2,
                            theme : categorie[question_number].theme,
                            caption : categorie[question_number].question,
                            activite1_gagne : true,
                            commentaire : categorie[question_number].commentaire
                        }
                    } else if (categorie[question_number].activite1_gagnante === "FALSE"){
                        return{
                            scriptee : false,
                            text1 : categorie[question_number].description_activite1,
                            text2 : categorie[question_number].description_activite2,
                            theme : categorie[question_number].theme,
                            caption : categorie[question_number].question,
                            activite1_gagne : false,
                            commentaire : categorie[question_number].commentaire
                        }
                    } 
                }
            }
            //#endregion

            //#region Cartes
            // Carte 1

            question = choixQuestion()
            let scoreEffectTriggered = false

            let card1 = add([
                sprite(sprite1),
                pos(x_card1, height()*1.2),
                scale(scaleValue),  
                anchor("center"),
                area(),
                z(50),
                color(),
                rotate(0),
                "card1"
            ])
            let card1_shadow = add([
                sprite(sprite1),
                color(0,0,0),
                opacity(0.4),
                pos(x_card1 + 20, height()*1.2),
                scale(scaleValue),  
                anchor("center"),
                area(),
                rotate(0),
                "card1"
            ])
            let card1_text = add([
                text(question.text1, {
                    font: "pixel",
                    size: 36,
                    width: 330,
                    lineSpacing : 10, 
                    align: "center"
                }),
                color(56, 71, 74),
                pos(card1.pos),
                anchor("center"),
                z(55),
                rotate(0),
                "card1"
            ])

            // Carte 2
            let card2 = add([
                sprite(sprite2),
                pos(x_card2, height()*1.3),
                scale(scaleValue),  
                anchor("center"),
                area(),
                z(50),
                color(),
                rotate(0),
                "card2"
            ])
            let card2_shadow = add([
                sprite(sprite2),
                color(0,0,0),
                opacity(0.4),
                pos(x_card2 + 20, height()*1.3),
                scale(scaleValue),  
                anchor("center"),
                area(),
                rotate(0),
                "card2"
            ])
            let card2_text = add([
                text(question.text2, {
                    font: "pixel",
                    size: 36,
                    width: 330,
                    lineSpacing : 10,
                    align: "center"
                }),
                color(56, 71, 74),
                pos(card2.pos),
                anchor("center"),
                z(55),
                rotate(0),
                "card2"
            ])
            //#endregion

            //#region Tween!!
            // Carte 1
            // Son de la carte
            play(choose(cardSounds), {
                volume: 0.3, 
            });
            tween(
                card1.pos,
                vec2(x_card1, height()/1.8),
                0.8,
                (val) => {
                    card1.pos = val;
                    card1_shadow.pos = vec2(val.x + 20, val.y + 20);
                    card1_text.pos = val;
                },
                easings.easeOutQuad
            );

            // Carte 2
            wait(0.3, ()=>{
                play(choose(cardSounds), {
                    volume: 0.5, 
                });
                tween(
                    card2.pos,
                    vec2(x_card2, height()/1.8),
                    0.8,
                    (val) => {
                        card2.pos = val;
                        card2_shadow.pos = vec2(val.x + 20, val.y + 20) ;
                        card2_text.pos = val;
                    },
                    easings.easeOutQuad
                );
            })
            

            // Logique de quand on clique sur les cartes
            function scoreEffect(card, card_text){
                if (scoreEffectTriggered) return;
                scoreEffectTriggered = true;
                if (((question.activite1_gagne) && (clicked == 1)) 
                    || (!question.activite1_gagne) && (clicked == 2)
                    || (question.theme === "Egal")){
                    streak++
                    let score_color
                    // Multiplicateur
                    switch (true) {
                        case (streak <= 1):
                            multiplier = 1;
                            score_color = rgb(0, 255, 0);
                            break;
                        case (streak == 2):
                            multiplier = 2;
                            score_color = rgb(157, 0, 255);
                            break;
                        case (streak >= 3):
                            multiplier = 3;
                            score_color = hsl2rgb((time() * 3) % 1, 1, 0.5);
                            break;

                    }
                    score += 100 * multiplier
                    score_caption.text = `Score: ${score}`
                    score_shadow.text = `Score: ${score}`

                    play(scoreSound[multiplier - 1], {
                        volume: 0.8
                    })
                    score_effect = add([
                        text(`+${100 * multiplier}!`,{
                            font: "kaph",
                            size: 64,
                        }),
                        color(score_color),
                        pos(mousePos()),
                        z(200),
                        anchor("bot"),
                        rotate(rand(10, 30)),
                        opacity(1)
                    ])

                    
                    card.color = correct_color
                    card.z = 60
                    card_text.z = 65
                    console.log(question.theme)

                    if (clicked == 2 && question.theme !== "Egal"){
                        wait(0.5, () =>{
                            tween(
                                card1.color,
                                wrong_color,
                                1,
                                (value) => {
                                    card1.color = value
                                },
                            )    
                        })
                    } else if (question.theme !== "Egal"){
                        wait(0.5, () =>{
                            tween(
                                card2.color,
                                wrong_color,
                                1,
                                (value) => {
                                    card2.color = value
                                },
                            )    
                        })
                    } else {
                        wait(0.5, () =>{
                            tween(
                                card2.color,
                                correct_color,
                                1,
                                (value) => {
                                    card2.color = value
                                },
                            )    
                        })
                    }

                    if (streak >= 3) {
                        score_effect.onUpdate(() => {
                            score_effect.color = hsl2rgb((time() * 1.5) % 1, 1, 0.5);
                        });
                    } 

                    tween(
                        score_effect.pos,
                        vec2(score_effect.pos.x * 1.1, score_effect.pos.y * 0.9),
                        0.5,
                        (value) => {
                            score_effect.pos = value
                        },
                        easings.easeOutQuint
                    )
                    tween(
                        score_effect.opacity,
                        0,
                        0.5,
                        (value) => {
                            score_effect.opacity = value
                        },
                        easings.easeInQuart
                    )
                } else {
                    card.color = wrong_color

                    play("fail", {
                        volume: 0.5
                    })
                    if (clicked == 2){
                        wait(0.5, () =>{
                            tween(
                                card1.color,
                                correct_color,
                                1,
                                (value) => {
                                    card1.color = value
                                },
                            )    
                        })
                        card1.z = 60
                        card1_text.z = 65
                    } else {
                        wait(0.5, () =>{
                            tween(
                                card2.color,
                                correct_color,
                                1,
                                (value) => {
                                    card2.color = value
                                },
                            )    
                        })
                        card2.z = 60
                        card2_text.z = 65
                    }
                } 
            }
            card1.onClick(() => {
                if (locked || showingResults) return
                    locked = true
                    clicked = 1
                    tween(
                        scaleValue,
                        scaleValue * 1.05,
                        0.3,
                        (value) => {
                            card1.scale = vec2(value, value);
                            card1_shadow.scale = vec2(value, value);
                            card1_text.scale = vec2(value/scaleValue, value/scaleValue);
                        },
                        easings.easeOutElastic
                    );
                    onMouseRelease(() => { 
                        if (showingResults) return
                        scoreEffect(card1, card1_text)
                        wait(0.4, () => {
                            displayResults(question, card1, card1_shadow, card1_text, card2, card2_shadow, card2_text)
                        });
                    });    
            });
            card2.onClick(() => {
                if (locked || showingResults) return
                locked = true
                clicked = 2
                tween(
                    scaleValue,
                    scaleValue * 1.05,
                    0.3,
                    (value) => {
                        card2.scale = vec2(value, value);
                        card2_shadow.scale = vec2(value, value);
                        card2_text.scale = vec2(value/scaleValue, value/scaleValue);
                    },
                    easings.easeOutElastic
                );
                onMouseRelease(() => {
                    if (showingResults) return
                    scoreEffect(card2, card2_text)
                    wait(0.4, () => {
                        displayResults(question, card1, card1_shadow, card1_text, card2, card2_shadow, card2_text)
                    });
                });
            });
        }
    
    //#endregion
    //#endregion

    //#region Caption

    // Caption de la question
    let caption = add([
        text(question.caption, {
            font: "pixel",
            lineSpacing: 10,
            size: 54,
            width: 1000,
            align: "center"
        }),
        pos(width()/2, height()/6),
        anchor("center"),
        z(40),
        "caption"
    ])
    let caption_shadow = add([
        text(question.caption, {
            font: "pixel",
            lineSpacing: 10,
            size: 54,
            width: 1000,
            align: "center"
        }),
        pos(caption.pos.x + 5, caption.pos.y + 5),
        anchor("center"),
        color(0,0,0),
        opacity(0.4),
        "caption"
    ])
    //#endregion

    // #region Réponse question
    // Fonction qui affiche la réponse à la question    
        function displayResults(question, card1, card1_shadow, card1_text, card2, card2_shadow, card2_text){
            locked = true
            showingResults = true
            destroyAll("caption")
            // Reset la taille des cartes 
            let scaleReset = vec2(scaleValue, scaleValue)
            card1.scale = scaleReset
            card1_shadow.scale = scaleReset
            card2_text.scale = scaleReset / scaleValue
            card2.scale = scaleReset
            card2_shadow.scale = scaleReset
            card2_text.scale = scaleReset / scaleValue

            let curTween1 = null
            let curTween2 = null

            // tween: card1 pos
            curTween1 = tween(
                card1.pos,
                vec2(width()/8, height()/1.5),
                1,
                (val) => {
                    card1.pos = val;
                    card1_shadow.pos = vec2(val.x + 20, val.y + 20);
                    card1_text.pos = val;
                },
                easings.easeInOutQuad
            );

            //tween: size
            tween(
                card1.scale,
                vec2(card1.scale.x * 0.8, card1.scale.y * 0.8),
                1,
                (val) => {
                    card1.scale = val;
                    card1_shadow.scale = val;
                    card1_text.scale = vec2(val.x / scaleValue, val.y / scaleValue)
                    card2.scale = val;
                    card2_shadow.scale = val;
                    card2_text.scale = vec2(val.x / scaleValue, val.y / scaleValue)
                },
                easings.easeInOutQuad
            );

            //tween: card1 rotation
            tween(
                card1.angle,
                randi(-20, 20), 
                1,
                (val) => {
                    card1.angle = val;
                    card1_shadow.angle = val;
                    card1_text.angle = val;
                },
                easings.easeInOutQuad
            )

            // tween: card2 rotation
            tween(
                card2.angle,
                randi(-20, 20), 
                1,
                (val) => {
                    card2.angle = val;
                    card2_shadow.angle = val;
                    card2_text.angle = val;
                },
                easings.easeInOutQuad
            )

            //tween: card2 pos
            curTween2 = tween(
                card2.pos,
                vec2(width()/8, height()/2.5),
                1,
                (val) => {
                    card2.pos = val;
                    card2_shadow.pos = vec2(val.x + 20, val.y + 20);
                    card2_text.pos = val;
                },
                easings.easeInOutQuad
            );

            let caption_result
            if (((question.activite1_gagne) && (clicked == 1) && (question.theme !== "Egal")) 
                || ((!question.activite1_gagne) && (clicked == 2) && (question.theme !== "Egal"))
            ){
                caption_result = getTranslation("CORRECT")
            } else if (question.theme === "Egal"){
                console.log("caption depends")
                caption_result = getTranslation("DEPENDS")
                score += 100
            } else {
                caption_result = getTranslation("INCORRECT")
                streak = 0
            }

            let result = add([
                text(caption_result, {
                    font: "pixel",
                    size: 64,
                    width: 500,
                    align: "center"
                }),
                pos(width()/2, height()/16),
                anchor("center"),
                z(50),
                "results_element"
            ]);
            let result_shadow = add([
                text(caption_result, {
                    font: "pixel",
                    size: 64,
                    width: 500,
                    align: "center"
                }),
                pos(result.pos.x + 6, result.pos.y + 6),
                anchor("center"),
                color(0,0,0),
                opacity(0.4),
                "results_element"
            ]);
            let commentaire = add([
                text(question.commentaire, {
                    font: "pixel",
                    lineSpacing: 15,
                    size: 64,
                    width: 1200,
                    align: "center"
                }),
                pos(width()/1.75, height()/2),
                anchor("center"),
                z(30),
                "results_element"
            ])
            let commentaire_shadow = add([
                text(question.commentaire, {
                    font: "pixel",
                    lineSpacing: 15,
                    size: 64,
                    width: 1200,
                    align: "center"
                }),
                pos(commentaire.pos.x + 6, commentaire.pos.y + 5),
                anchor("center"),
                color(0,0,0),
                opacity(0.4),   
                "results_element"
            ])
            
            if ((categorie.length - 1 > 0) && (compteur_question < nbr_questions)){ 
                let suivant_bouton = add([
                    sprite("button"),
                    pos(width()/2, height()/1.1),
                    scale(scaleValue*2),  
                    anchor("center"),
                    area(),
                    "results_element"
                ])
                let lock = false
                suivant_bouton.onClick(() => {
                    if(lock) return
                    lock = true
                    categorie.splice(question_number, 1)
                    if (curTween1) curTween1.cancel()
                    if (curTween2) curTween2.cancel()
                    curTween1 = tween(
                        card1.pos,
                        vec2(-300, card1.pos.y),
                        0.5,
                        val => {
                            card1.pos = val;
                            card1_shadow.pos = vec2(val.x + 20, val.y + 20);
                            card1_text.pos = val;
                        },
                        easings.easeInQuart
                    );
                    curTween2 = tween(
                        card2.pos,
                        vec2(-300, card2.pos.y),
                        0.3,
                        val => {
                            card2.pos = val;
                            card2_shadow.pos = vec2(val.x + 20, val.y + 20);
                            card2_text.pos = val;
                        },
                        easings.easeInQuart
                    );
                
                    lock = true
                    wait(0.6, () => {
                        lock = false
                        go("questions")   
                    })
                })

                let suivant = add([
                    text(getTranslation("SUIVANT"),{
                        font: "pixelthin",
                        width: 400,
                        lineSpacing: 10,
                        size: 40,
                        align: "center"
                    }),
                    pos(suivant_bouton.pos),
                    anchor("center"),
                    area(),
                    z("100"),
                    "results_element"
                ])

                let suivant_shadow = add([
                    text(getTranslation("SUIVANT"),{
                        font: "pixelthin",
                        width: 400,
                        lineSpacing: 10,
                        size: 40,
                        align: "center"
                    }),
                    color(93, 27, 27),
                    pos(suivant_bouton.pos.x + 4, suivant_bouton.pos.y + 4),
                    anchor("center"),
                    area(),
                    z("99"),
                    "results_element"            
                ])

            } else {
                let suivant_bouton = add([
                    sprite("button"),
                    pos(width()/2, height()/1.1),
                    scale(scaleValue*1.5),  
                    anchor("center"),
                    area(),
                    "results_elements"
                ])

                let fin = add([
                    text(getTranslation("RESULTATS"),{
                        font: "pixelthin",
                        size: 32,
                        align: "center"
                    }),
                    pos(suivant_bouton.pos),
                    anchor("center"),
                    area(),
                    z("100"),
                    "results_element"
                ])

                let fin_shadow = add([
                    text(getTranslation("RESULTATS"),{
                        font: "pixelthin",
                        size: 32,
                        align: "center"
                    }),
                    color(93, 27, 27),
                    pos(suivant_bouton.pos.x + 5, suivant_bouton.pos.y + 5),
                    anchor("center"),
                    area(),
                    z("99"),
                    "results_element"
                ])

                
                suivant_bouton.onClick(() => {
                    go("finalResults", {score: score})
                })
            }
        }
    })
    //#endregion
    //#region Résultats finaux
    scene("finalResults", ({score}) =>{
        // Shader CRT
        onUpdate(() => {
            usePostEffect("crt", crtEffect());
        });
        let scoreLabel = add([
            text(getTranslation("FINAL").replace("{score}", score),{
                font: "pixel",
                size: 64,
                align: "center"
            }),
            pos(width()/2, height()/6),
            anchor("center"),

        ])
        let suivant_bouton = add([
            sprite("button"),
            pos(width()/2, height()/1.1),
            scale(scaleValue*1.5),  
            anchor("center"),
            area(),
        ])

        let fin = add([
            text(getTranslation("TERMINER"),{
                font: "pixelthin",
                size: 32,
                align: "center"
            }),
            pos(suivant_bouton.pos),
            anchor("center"),
            area(),
            z("100"),
            "results_element"
        ])

        let fin_shadow = add([
            text(getTranslation("TERMINER"),{
                font: "pixelthin",
                size: 32,
                align: "center"
            }),
            color(93, 27, 27),
            pos(suivant_bouton.pos.x + 5, suivant_bouton.pos.y + 5),
            anchor("center"),
            area(),
            z("99"),
            "results_element"
        ])

        suivant_bouton.onClick(()=>{
            go("titleScreen")
        })
    })
    //#endregion
    go("titleScreen")
}