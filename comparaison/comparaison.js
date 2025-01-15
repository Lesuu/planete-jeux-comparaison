//#region Chargement des données
// Récupération du CSV 
let CSVdata = []

async function getCSV(url){
    const response = await fetch(url);
    const csvText = await response.text();

    const parsedData = Papa.parse(csvText, {
        header: true, 
        skipEmptyLines: true, 
    });
    return parsedData.data; 
}


// Chargement des données dans la variable CSVdata & séparation des données jv/JdS
let questions_JV = []
let questions_JdS = []
async function loadData() {
    CSVdata = await getCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBSQtcLt8CbTPN-TvHnrCt1h24GtoXiWxBCoo3nqbrTSqLuc93FeogkFsOrfS_qF-YDyhTk5E0aau/pub?output=csv');

    for (let i = 0; i < CSVdata.length; i++) {
        if (CSVdata[i].jeu_video == "TRUE") {
            questions_JV.push(CSVdata[i]) 
        } else {
            questions_JdS.push(CSVdata[i])
        }
    }
}

loadData()

// Initialisation de Kaplay
kaplay({
    background : [120,0,30],
    letterbox:true,
    width:1280,
    height:720,
    stretch:true,
})

//#region Asset loading

loadFont("pixel", "assets/fonts/PixelOperator8-Bold.ttf")

loadSprite("card", "assets/sprites/card.png")
loadSprite("jv_icon", "assets/sprites/video_game.png")
loadSprite("jv_color", "assets/sprites/vg_color.png")
loadSprite("jds_icon", "assets/sprites/board_game.png")
loadSprite("jds_color", "assets/sprites/bg_color.png")


const scaleValue = (width()/height())*1.3;

// Variables globales
let jv 
let question_number = 0
let clicked = 0
let categorie
let score = 0

//#region Ecran d'accueil

scene("titleScreen", () => {
    score = 0
    let title = add([
        text("Choisi une option !", {
            font: "pixel",
            size: 16
        }),
        pos(width()/2 , height()/5),
        scale(scaleValue),
        anchor("center")
    ])
    let jv_icon = add([
        sprite("jv_icon"),
        pos(width()/2.5, height()/2),
        scale(scaleValue/5),  
        anchor("right"),
        area(),
        "jv_icon"
    ])
    let jds_icon = add([
        sprite("jds_icon"),
        pos(width()/1.8, height()/2),
        scale(scaleValue/5),  
        anchor("left"),
        area(),
        "jds_icon"
    ])
    // Changement de la texture quand on survole les icones...
    jv_icon.onHover(() => jv_icon.sprite = "jv_color")
    jds_icon.onHover(() => jds_icon.sprite = "jds_color")

    // ... et quand on lâche
    jv_icon.onHoverEnd(() => jv_icon.sprite = "jv_icon")
    jds_icon.onHoverEnd(() => jds_icon.sprite = "jds_icon")

    // Changement de scène
   
    jv_icon.onClick(() => {
        jv = true
        categorie = [...questions_JV]
        go("questions")
    })
    jds_icon.onClick(() => {
        jv = false
        categorie = [...questions_JdS]
        go("questions")
    })
})

scene("questions", () => {
    if (jv){
        setBackground(120,0,30)
    } else {
        setBackground(0,100,0)
    }
  
    question_number = Math.floor(rand(categorie.length))
    let caption = add([
        text("Quelle option consomme-t-elle le moins?", {
            font: "pixel",
            size: 32
        }),
        pos(width()/2, height()/6),
        anchor("center"),
        "question_element"
    ])
    let card1 = add([
        sprite("card"),
        pos(width()/2.5, height()/2),
        scale(scaleValue/1.2),  
        anchor("center"),
        area(),
        "question_element"
    ])
    console.log(categorie)
    let text1 = add([
        text(categorie[question_number].description_activite1, {
            font: "pixel",
            size: 24,
            width: 250,
            align: "center"
        }),
        color(56, 71, 74),
        pos(card1.pos),
        anchor("center"),
        z("100"),
        "question_element"
    ])
    let card2 = add([
        sprite("card"),
        pos(width()/1.5, height()/2),
        scale(scaleValue/1.2),  
        anchor("center"),
        area(),
        "question_element"
    ])
    let text2 = add([
        text(categorie[question_number].description_activite2, {
            font: "pixel",
            size: 22,
            width: 250,
            align: "center"
        }),
        color(56, 71, 74),
        pos(card2.pos),
        anchor("center"),
        z("100"),
        "question_element"
    ])
    card1.onClick(() => {
        clicked = 1
        go("results")
    })
    card2.onClick(() => {
        clicked = 2
        go("results")
    })
})
    
    
let caption_result
scene("results", () =>{
    if (((categorie[question_number].activite1_gagnante == "TRUE") && (clicked == 1)) || 
            (categorie[question_number].activite1_gagnante == "FALSE") && (clicked == 2)){
        caption_result = "C'est correct!"
        score += 100
    } else {
        caption_result = "C'est faux."
    }
    let result = add([
        text(caption_result, {
            font: "pixel",
            size: 32,
            width: 500,
            align: "center"
        }),
        pos(width()/2, height()/6),
        anchor("center"),
        "results_element"
    ])
    let commentaire = add([
        text(categorie[question_number].commentaire, {
            font: "pixel",
            size: 32,
            width: 800,
            align: "center"
        }),
        pos(width()/2, height()/2),
        anchor("center"),
        "results_element"
    ])
    
    if (categorie.length - 1 > 0){ 
        let suivant = add([
            text("Prochaine question",{
                font: "pixel",
                size: 32,
                align: "center"
            }),
            pos(width()/2, height()/1.2),
            anchor("center"),
            area(),
            "results_element"
        ])
        
        suivant.onClick(() => {
            console.log(categorie.length)
            categorie.splice(question_number, 1)
            go("questions")
        })
    } else {
        let fin = add([
            text("Résultats finaux",{
                font: "pixel",
                size: 32,
                align: "center"
            }),
            pos(width()/2, height()/1.2),
            anchor("center"),
            area(),
            "results_element"
        ])
        
        fin.onClick(() => {
            go("finalResults", {score: score})
        })
    }
})

scene("finalResults", ({score}) =>{
    let scoreLabel = add([
        text(`Bravo! Tu as réalisé un score de ${score}.`,{
            font: "pixel",
            size: 32,
            align: "center"
        }),
        pos(width()/2, height()/6),
        anchor("center"),

    ])
    let quit = add([
        text("Terminer",{
            font: "pixel",
            size: 32,
            align: "center"
        }),
        pos(width()/2, height()/1.2),
        anchor("center"),
        area()
    ])
    quit.onClick(()=>{
        go("titleScreen")

    })
})

go("titleScreen")
