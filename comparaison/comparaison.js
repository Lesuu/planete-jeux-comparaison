//#region Chargement des données
// Récupération du CSV 
let CSVdata = []
let metaText = []

async function getCSV(url){
    const response = await fetch(url);
    const csvText = await response.text();

    const parsedData = Papa.parse(csvText, {
        header: true, 
        skipEmptyLines: true, 
    });
    return parsedData.data; 
}


// Chargement des données dans la variable CSVdata & séparation des données jv/JdS/autres
let questions_JV = []
let questions_JV_egales = []

let questions_JdS = []
let questions_JdS_egales = []

let translations = {}

let questions_autres = []
async function loadData() {
    CSVdata = await getCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBSQtcLt8CbTPN-TvHnrCt1h24GtoXiWxBCoo3nqbrTSqLuc93FeogkFsOrfS_qF-YDyhTk5E0aau/pub?gid=0&single=true&output=csv');
    metaText = await getCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBSQtcLt8CbTPN-TvHnrCt1h24GtoXiWxBCoo3nqbrTSqLuc93FeogkFsOrfS_qF-YDyhTk5E0aau/pub?gid=826164962&single=true&output=csv')
    
    metaText.forEach(row=>{
        translations[row.TEXTE] = {
            fr: row.fr,
            eng: row.eng
        };
    });
    
    // Séparation des données - pairings
    for (let i = 0; i < CSVdata.length; i++) {
        if (CSVdata[i].autre === "oui"){
            questions_autres.push(CSVdata[i])
        } else if (CSVdata[i].jeu_video == "TRUE") {
            if (CSVdata[i].egal === "oui"){
                questions_JV_egales.push(CSVdata[i])
            } else {
                questions_JV.push(CSVdata[i]) 
            }
        } else if (CSVdata[i].jeu_video == "FALSE") {
            if (CSVdata[i].egal === "oui"){
                questions_JdS_egales.push(CSVdata[i])
            } else {
                questions_JdS.push(CSVdata[i])
            }
        }
    }
}

// Initialisation de Kaplay
kaplay({
    background : [102,0,0],
    letterbox:true,
    width:1920,
    height:1080,
    stretch:true,
})

main()
async function main() {
    // On attend que les données soient chargées pour lancer le programme
    await loadData()
    //#endregion
    //#region Asset loading

    loadFont("pixel", "assets/fonts/m6x11plus.ttf")
    loadFont("pixelthin", "assets/fonts/PixelOperator8.ttf")

    loadSound("card1","assets/audio/card-place-1.ogg")
    loadSound("card2","assets/audio/card-place-2.ogg")
    loadSound("card3","assets/audio/card-place-3.ogg")
    loadSound("card4","assets/audio/card-place-4.ogg")

    let cardSounds = ["card1", "card2", "card3", "card4"]

    loadSprite("jv_icon", "assets/sprites/video_game.png")
    loadSprite("jv_color", "assets/sprites/vg_color.png")
    loadSprite("jds_icon", "assets/sprites/board_game.png")
    loadSprite("jds_color", "assets/sprites/bg_color.png")
    loadSprite("button_next", "assets/sprites/button.png")
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


    const scaleValue = (width()/height())*1.3;
    //#endregion
    // #region Variables
    // Variables globales
    let jv 
    let question_number = 0
    let clicked = 0
    let categorie
    let autres
    let egales
    let score = 0
    let compteur_question 
    let jv_hover
    let jds_hover
    let question = {}

    // Constantes
    const nbr_questions = 10
    const num_questions_scriptees = [4, 7, 9]
    const langue = "fr"
    //#endregion
    // #region Ecran d'accueil

    //Fonction pour la traduction des textes
    function getTranslation(key){
        return translations[key][langue]
    }

    scene("titleScreen", async () => {
        // Réinitialisation du score
        score = 0
        compteur_question = 0

        // Elements UI
        let title = add([
            text(getTranslation("OPTION"), {
                font: "pixel",
                size: 54
            }),
            pos(width()/2 , height()/5),
            anchor("center")
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
                    egales = [...questions_JV_egales]
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
                    egales = [...questions_JdS_egales]
                    go("questions")
                }
            })
        })
    })
    //#endregion
    // #region Questions
    // Scène où on pose les questions
    scene("questions", () => {
        // Couleur du background dépend du support choisi
        let icon_sprite
        if (jv){
            setBackground(102,0,0)
            icon_sprite = "jv_color"
        } else {
            setBackground(0,100,0)
            icon_sprite = "jds_color" 
        }
    
        // Compteur de question

        compteur_question ++
        let compteur_caption = add([
            text(`Question ${compteur_question}/${nbr_questions}`, {
                font: "pixel",
                size: 36
            }),
            pos(width() - width()/1.1, height()*0.04),
            anchor("center"),
        ])

        // Compteur de score
        let score_caption = add([
            text(`Score: ${score}`, {
                font: "pixel",
                size: 36
            }),
            pos(width()/1.1, height()*0.04),
            anchor("center"),
        ])

        // Icone du support
        let icon = add([
            sprite(icon_sprite),
            pos(width() - width()/1.21, height()*0.04),
            anchor("center"),
        ])


        // Choisi une question aléatoire
        question_number = Math.floor(rand(categorie.length))

        // Caption de la question
        let caption = add([
            text(getTranslation("QUESTION"), {
                font: "pixel",
                lineSpacing: 10,
                size: 54,
                width: 1000,
                align: "center"
            }),
            pos(width()/2, height()/6),
            anchor("center"),
        ])

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

        //#region Logique question
        function choixQuestion(){
            // Si c'est la dernière scriptée, on prend une question 'égale'
            if (compteur_question === Math.max(...num_questions_scriptees) && egales.length > 0){
                let randnum = Math.floor(rand(egales.length))
                return {
                    scriptee : false,
                    text1 : egales[randnum].description_activite1,
                    text2 : egales[randnum].description_activite2,
                    activite1_gagne : true,
                    commentaire : egales[randnum].commentaire,
                    categorie : "egal",
                    egal : true
                }
            // Si c'est une question scriptée mais pas la dernière, on prend une question 'autre'
            } else if (num_questions_scriptees.includes(compteur_question)){
                let randnum = Math.floor(rand(autres.length))
                if (autres[randnum].activite1_gagnante === "TRUE"){
                    return {
                        scriptee : true,
                        text1 : autres[randnum].description_activite1,
                        text2 : autres[randnum].description_activite2,
                        activite1_gagne : true,
                        commentaire : autres[randnum].commentaire,
                        categorie : "autres"
                    }
                } else {
                    return{
                        scriptee : true,
                        text1 : autres[randnum].description_activite1,
                        text2 : autres[randnum].description_activite2,
                        activite1_gagne : false,
                        commentaire : autres[randnum].commentaire,
                        categorie : "autres"
                    }
                }
            // Sinon, on prend une question normale aléatoire
            } else{
                if (categorie[question_number].activite1_gagnante === "TRUE"){
                    return{
                        scriptee : false,
                        text1 : categorie[question_number].description_activite1,
                        text2 : categorie[question_number].description_activite2,
                        activite1_gagne : true,
                        commentaire : categorie[question_number].commentaire,
                        categorie : "normal"
                    }
                } else if (categorie[question_number].activite1_gagnante === "FALSE"){
                    return{
                        scriptee : false,
                        text1 : categorie[question_number].description_activite1,
                        text2 : categorie[question_number].description_activite2,
                        activite1_gagne : false,
                        commentaire : categorie[question_number].commentaire,
                        categorie : "normal"
                    }
                } 
            }
        }
        //#endregion

        //#region Cartes
        // Carte 1

        question = choixQuestion()

        let card1 = add([
            sprite(sprite1),
            pos(x_card1, height()*1.2),
            scale(scaleValue),  
            anchor("center"),
            area(),
            z(50),
            animate(),
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
            animate(),
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
            z("100"),
        ])

        // Carte 2
        let card2 = add([
            sprite(sprite2),
            pos(x_card2, height()*1.3),
            scale(scaleValue),  
            anchor("center"),
            area(),
            animate(),
            z("50"),
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
            animate(),
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
            z("100"),
            animate(),
            "card2"
        ])

        // Tween!!
        // Carte 1
        // Son de la carte
        play(choose(cardSounds), {
            volume: 0.5, 
        });
        tween(
            card1.pos,
            vec2(x_card1, height()/1.8),
            1,
            (val) => {
                card1.pos = val;
                card1_shadow.pos = vec2(val.x + 20, val.y + 20);
                card1_text.pos = val;
            },
            easings.easeOutQuad
        );

        // Carte 2
        wait(0.5, ()=>{
            play(choose(cardSounds), {
                volume: 0.5, 
            });
            tween(
                card2.pos,
                vec2(x_card2, height()/1.8),
                1,
                (val) => {
                    card2.pos = val;
                    card2_shadow.pos = vec2(val.x + 20, val.y + 20) ;
                    card2_text.pos = val;
                },
                easings.easeOutQuad
            );
        })
        

        // Logique de quand on clique sur les cartes
        card1.onClick(() => {
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
                wait(0.1, () => {
                    go("results", question);
                });
            });
         });
         card2.onClick(() => {
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
                wait(0.1, () => {
                    go("results", question);
                });
            });
         });
    })
        //#endregion
 
    //#endregion
    // #region Réponse question
    // Scène qui affiche la réponse à la question
    let caption_result
    scene("results", (question) =>{
        console.log("clicked: " + clicked)
        if (((question.activite1_gagne) && (clicked == 1)) 
            || (!question.activite1_gagne) && (clicked == 2)
        ){
            caption_result = getTranslation("CORRECT")
            score += 100
            console.log(question, score)
        } else if (question.egal){
            caption_result = getTranslation("DEPENDS")
            score += 100
            console.log(question, score)
        } else {
            console.log(question, score)
            caption_result = getTranslation("INCORRECT")
        }

        let icon_sprite
        if (jv){
            icon_sprite = "jv_color"
        } else {
            icon_sprite = "jds_color" 
        }

        // Afficher le score
        let score_caption = add([
            text(`Score: ${score}`, {
                font: "pixel",
                size: 36
            }),
            pos(width()/1.1, height()*0.04),
            anchor("center"),
        ])

        // Afficher le compteur de question
        let compteur_caption = add([
            text(`Question ${compteur_question}/${nbr_questions}`, {
                font: "pixel",
                size: 36
            }),
            pos(width() - width()/1.1, height()*0.04),
            anchor("center"),
        ])

        // Icone du support
        let icon = add([
            sprite(icon_sprite),
            pos(width() - width()/1.21, height()*0.04),
            anchor("center"),
        ])

        let result = add([
            text(caption_result, {
                font: "pixel",
                size: 64,
                width: 500,
                align: "center"
            }),
            pos(width()/2, height()/20),
            anchor("center"),
            "results_element"
        ])
        let commentaire = add([
            text(question.commentaire, {
                font: "pixel",
                lineSpacing: 15,
                size: 64,
                width: 1200,
                align: "center"
            }),
            pos(width()/2, height()/2),
            anchor("center"),
            "results_element"
        ])
        
        if ((categorie.length - 1 > 0) && (compteur_question < nbr_questions)){ 
            let suivant_bouton = add([
                sprite("button"),
                pos(width()/2, height()/1.1),
                scale(scaleValue*1.5),  
                anchor("center"),
                area(),
            ])
            
            suivant_bouton.onClick(() => {
                categorie.splice(question_number, 1)
                go("questions")
            })

            let suivant = add([
                text(getTranslation("SUIVANT"),{
                    font: "pixelthin",
                    width: 250,
                    lineSpacing: 10,
                    size: 32,
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
                    width: 250,
                    lineSpacing: 10,
                    size: 32,
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
    })
    //#endregion
    //#region Résultats finaux
    scene("finalResults", ({score}) =>{
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