import { createBarChart } from './barChart.js';
import { loadAssets } from './assetLoader.js';
import { loadData, questions_JV, questions_JdS, translations} from './dataLoader.js';

//#region initialisation 

// Initialisation de Kaplay
kaplay({
    background : [0,0,0],
    letterbox:true,
    width:1920,
    height:1080,
    stretch:false,
})

// On attend que les données soient chargées pour lancer le programme

let langue = "fr"

//Fonction pour la traduction des textes
export function getTranslation(key){
    return translations[key][langue]
}

main()
async function main() {
    //#endregion
    //#region Data loading
    // Langue
    await load(loadData(langue))
    //#endregion

    // #region Variables
    // Variables globales
    let categorie_choisie 
    let clicked = 0
    let categorie
    //let autres
    let questionsEgales
    let autres_jeu
    let score = 0
    let compteur_question 
    let jv_hover
    let jds_hover
    let both_hover = false
    let question = {}
    let score_effect = null
    let streak = 0
    let multiplier = 1
    let locked = false
    let showingResults = false
    let usedThemes = []
    let explanation = false
    let dernierThemeChoisi = null
    let isTalking = false
    let exited = true
    let closeCooldown = false
    let isSkipping = false
    let picto_sprite
    let picto_pos
    let picto_scale
    let streak_opacity = 0
    let restart_button
    let eng_button
    let fr_button
    let loading = false
    let canJump = true

    // Constantes: détermine le nombre de questions & lesquelles sont scriptées.
    const nbr_questions = 10
    const question_autre_jeu = [4, 7]
    const question_egale = 9

    // Couleurs
    const background_col = rgb(42, 138, 109)
    const text_color = rgb(56, 71, 74)
    const correct_color = hsl2rgb(120/360, 0.6, 0.65)
    const wrong_color = hsl2rgb(337/360, 0.8, 0.7)
    const egal_color = hsl2rgb(60/360, 0.7, 0.65)
    //#endregion

    //#region Asset loading
    loadAssets()

    let scoreSound = ["score1", "score2", "score3"]
    let cardSounds = ["card1", "card2", "card3", "card4"]
    let foldSounds = []

    for (let i = 1; i <= 8; i++) {
        loadSound(`fold${i}`, `assets/audio/card-slide-${i}.ogg`)
        foldSounds.push(`fold${i}`)
    }

    // Shader CRT
    loadShaderURL("crt", null, "assets/shaders/crt.frag");
    const crtEffect = () => ({
        "u_flatness": 4 ,
    });   

    const scaleValue = 2.3;
    //#endregion

    // #region Ecran d'accueil
    // Fonction pour restart
    function windowButtons(){
        restart_button.onClick(()=>{
            location.reload()
        })
        eng_button.onClick(()=>{
            langue = "eng"
            updateTexts()
        })
        fr_button.onClick(()=>{
            langue = "fr"
            updateTexts()
        })
    }
    async function updateTexts(){
        loading = true
        let currentScene = getSceneName()
        add([
            text("Loading...", {
                font: "pixel",
                size: 54,
            }),
            pos(width()/2, height()/2),
            z(150),
            anchor("center"),
            "loading"
        ])
        add([
            rect(width(), height()),
            color(0,0,0),
            opacity(0.5),
            z(140),
            area(),
            "loading"
        ])
        await loadData(langue)
        destroyAll("loading")
        loading = false
        go(currentScene)
    }

    scene("titleScreen", async () => {
        add([
            rect(1920, 1080),
            pos(0, 0),
            color(42, 138, 109),
            z(-50),  
            stay()
        ]);
        //éléments universels
        // Shader CRT
        onUpdate(() => {
            usePostEffect("crt", crtEffect());
        });

        // Barre windows en haut de l'écran
        let windowsBar = add([
            rect(width(), 60),
            pos(0,0),
            color(180, 180, 180),
            stay(),
            "window"
        ])
        windowsBar.add([
            rect(width()- 10, 50),
            pos(5, 5),
            color(0, 0, 255),
            "window"
        ])
        windowsBar.add([
            text("quiz.exe", {
                font: "pixel",
                size: 36
            }),
            pos(15, 7),
            stay(),
            "window"
        ])
        windowsBar.add([
            rect(5, height()),
            color(180,180,180),
            stay(),
            "window"
        ])
        windowsBar.add([
            rect(5, height()),
            pos(width() - 5, 0),
            color(180,180,180),
            stay(),
            "window"
        ])
        windowsBar.add([
            rect(width(), 5),
            pos(0, height()-5),
            color(180,180,180),
            stay(),
            "window"
        ])
        restart_button = add([
            sprite("restart"),
            pos(width() - 55, 10),
            scale(2),
            area({ shape: new Rect(vec2(-16, 10), 25, 25 ) }),
            stay(),
            "window"
        ])
        eng_button = add([
            sprite("en"),
            pos(width() - 105, 10),
            scale(2),
            area({ shape: new Rect(vec2(-16, 8), 25, 25 ) }),
            stay(),
            "window"
        ])
        fr_button = add([
            sprite("fr"),
            pos(width() - 155, 10),
            scale(2),
            area({ shape: new Rect(vec2(-16, 0), 25, 25 ) }),
            stay(),
            "window"
        ])
        
        windowButtons()
        

        // Réinitialisation du score
        score = 0
        compteur_question = 0
        multiplier = 1
        streak = 0

        // "Appuie pour commencer"
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

        // On fait flasher le texte 'appuie pour commencer'
        loop(1.7, () =>{
            start_caption.opacity = 1
            start_shadow.opacity = 0.4
            wait(1, () => {
                start_caption.opacity = 0
                start_shadow.opacity = 0
            })
        })

        // Titre principal
        let main_shadow = add([
            text(getTranslation("TITRE"), {
                font: "pixeloutline",
                size: 126,
                width : 1200,
                align: "center", 
                transform: (idx, ch) => ({
                    pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                    angle: wave(-2, 2, time() * 3 + idx),
                }),
            }),
            pos(960 + 10, 300 + 10),
            anchor("center"),
            color(0,0,0),
            opacity(0.4),
        ])
        let main_title = main_shadow.add([
            text(getTranslation("TITRE"), {
                font: "pixeloutline",
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
        // On fait bouger le titre 
        const basePos = main_shadow.pos.clone();
        main_shadow.onUpdate(() => {
            const angle = time() * 1.5
            main_shadow.pos.y = basePos.y + 10 * Math.sin(angle) * Math.cos(angle);
            main_shadow.pos.x = basePos.x + 10 * Math.sin(angle);
        });

        // "quiz"
        let quiz_shadow = add([
            text("Quiz", {
                font: "pixeloutline",
                size: 90,
                transform: (idx, ch) => ({
                    pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                    angle: wave(-2, 2, time() * 3 + idx),
                }),
            }),
            pos(960 + 5, 660 + 5),
            anchor("center"),
            color(0,0,0),
            opacity(0.4)
        ])
        let quiz_title = quiz_shadow.add([
            text("Quiz", {
                font: "pixeloutline",
                size: 90,
                transform: (idx, ch) => ({
                    pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                    angle: wave(-2, 2, time() * 3 + idx),
                }),
            }),
            pos(-5, -5),
            anchor("center"),
        ])

        // Eventail
        let cardSprites = ["spades", "clubs", "hearts", "diamonds"]
        let cardFan = 6
        let card1 = add([
            sprite(choose(cardSprites)),
            pos(70, 680),
            rotate(5),
            scale(1.3),
            anchor("botleft"),
            z(50)
        ])
        for (let i = 1; i<cardFan; i++){
            let l = i
            if (i > 3){
                l = i - 4
            }
            card1.add([
                sprite(choose(cardSprites)),
                rotate(i * 12),
                pos(i + 3, 0),
                anchor("botleft"),
                z(50)
            ])
        }
        let cardShadows = add([
            sprite("spades"),
            pos(70 + 10, 680 + 10),
            rotate(5),
            scale(1.3),
            anchor("botleft"),
            color(0,0,0),
            opacity(0.4),
            z(40)
        ])
        for (let i = 1; i<cardFan; i++){
            cardShadows.add([
                sprite("spades"),
                rotate(i * 12),
                pos(i + 3, 0),
                anchor("botleft"),
                color(0,0,0),
                opacity(0.4),
            ])
        }
        let card_icon_sprite = ["jv_color", "jds_color"]
        let card_icon = add ([
            sprite(choose(card_icon_sprite)),
            pos(card1.pos.x + 210, card1.pos.y + 35),
            scale(2),
            rotate(65),
            anchor("center"),
            z(60)
        ])
        let betty = add([
            sprite("betty", {anim: "idle"}),
            pos(1640, 620),
            anchor("center"),
            scale(5),
            z(100)
        ])
        betty.flipX = true
        let betty_shadow = add([
            pos(betty.pos.x, betty.pos.y + 100),
            opacity(0.3),
            circle(40),
            scale(1.5, 0.5),
            color(0, 0, 0),
            anchor("center"),
            z(80)
        ])
        let screen = add([
            rect(width(), height()- 80),
            area(),
            pos(0, 80),
            opacity(0)
        ])

        screen.onClick(() => {
            if (loading) return
            go("chooseCategory")
            //go("finalResults", {score: 0})
        });
        
    })
    scene("chooseCategory", async () => {
        both_hover = false
        windowButtons()
        // Elements UI
        let title = add([
            text(getTranslation("OPTION"), {
                font: "pixel",
                size: 90,
                transform: (idx, ch) => ({
                    pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                    angle: wave(-2, 2, time() * 3 + idx),
                }),
            }),
            pos(width()/2 , height()/5),
            anchor("center"),
            z(50)
        ])
        let title_shadow = add([
            text(getTranslation("OPTION"), {
                font: "pixel",
                size: 90,
                transform: (idx, ch) => ({
                    pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                    angle: wave(-2, 2, time() * 3 + idx),
                }),
            }),
            pos(title.pos.x + 6, title.pos.y + 6),
            anchor("center"),
            color(0,0,0),
            opacity(0.4)
        ])
        let jv_icon = add([
            sprite("jv_icon"),
            pos(480, 470),
            scale(scaleValue*1.5),  
            anchor("center"),
            area(),
            "jv_icon"
        ])

        let jv_shadow = add([
            text(getTranslation("JEU VIDEO"), {
                font:"pixel",
                size : 54
            }),
            anchor("center"),
            pos(jv_icon.pos.x + 5, jv_icon.pos.y + 160 + 5),
            color(0,0,0),
            opacity(0.4),
            z(40)
        ])
        let jv_caption = jv_shadow.add([
            text(getTranslation("JEU VIDEO"), {
                font: "pixel",
                size: 54
            }),
            pos(-5, -5),
            anchor("center"),
            z(50)
        ])

        let jds_icon = add([
            sprite("jds_icon"),
            pos(1440, 470),
            scale(scaleValue*1.8),  
            anchor("center"),
            area(),
            "jds_icon"
        ])

        let jds_shadow = add([
            text(getTranslation("JEU DE SOCIETE"), {
                font:"pixel",
                size : 54
            }),
            anchor("center"),
            pos(jds_icon.pos.x + 5, jds_icon.pos.y + 160 + 5),
            color(0,0,0),
            opacity(0.4),
            z(40)
        ])
        let jds_caption = jds_shadow.add([
            text(getTranslation("JEU DE SOCIETE"), {
                font: "pixel",
                size: 54
            }),
            pos(-5, -5),
            anchor("center"),
            z(50)
        ])

        let jv_both = add([
            sprite("jv_icon"),
            pos(860, 740),
            scale(scaleValue*1.3),  
            anchor("center"),
            rotate(-10),
            "jv_icon"
        ])
        let jds_both = add([
            sprite("jds_icon"),
            pos(1060, 760),
            scale(scaleValue*1.5),  
            anchor("center"),
            rotate(10),
            "jds_icon"
        ])
        let both_area = add([
            pos(740, 620),
            rect(440, 250),
            area(),
            opacity(0)
        ])

        let both_shadow = add([
            text(getTranslation("BOTH"), {
                size: 54,
                font: "pixel"
            }),
            pos(960 + 5, 900 + 5),
            anchor("center"),
            color(0,0,0),
            opacity(0.4)
        ])
        let both_caption = both_shadow.add([
            text(getTranslation("BOTH"), {
                size: 54,
                font: "pixel"
            }),
            pos(-5, -5),
            anchor("center")
        ])

        // Changement de la texture quand on survole les icones...
        jv_icon.onHover(() => {
            //jv_icon.sprite = "jv_color"
            jv_hover = true
        })
        jds_icon.onHover(() => {
            //jds_icon.sprite = "jds_color"
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

        function bothHover(){
            if (!both_hover){
                //jv_both.sprite = "jv_color"
                //jds_both.sprite = "jds_color"
                both_hover = true
            } else if (both_hover){
                jv_both.sprite = "jv_icon"
                jds_both.sprite = "jds_icon"
                both_hover = false
            }
        }

        both_area.onHover(() => bothHover())
        both_area.onHoverEnd(()=> bothHover())

        // Changement de scène, on trie les données selon le support choisit
        async function separationDonnees(cat){
            if (cat === "jv"){
                categorie = [...questions_JV]
            } else if (cat === "jds"){
                categorie = [...questions_JdS]
            } else if (cat === "both"){
                categorie = [...questions_JV, ...questions_JdS]
            }
            //autres = [...questions_autres]

            // Sépare les questions 'égales'
            questionsEgales = categorie.filter(question => question.theme === "Egal")

            // Sépare les questions 'autre jeu'
            autres_jeu = categorie.filter(question => question.theme === "Autre jeu")

            // Supprime ces questions du reste
            categorie = categorie.filter(question => question.theme !== "Egal" && question.theme !== "Autre jeu")
        }

        await jv_icon.onClick(() => {
            jv_icon.sprite = "jv_color"
            onMouseRelease(async ()=>{
                if (loading) return
                if (jv_hover){
                    categorie_choisie = "jv"
                    await separationDonnees(categorie_choisie)
                    go("questions")
                }
            })
        })
        await jds_icon.onClick(() => {
            jds_icon.sprite = "jds_color"
            onMouseRelease(async ()=>{
                if (loading) return
                if (jds_hover){
                    categorie_choisie = "jds"
                    await separationDonnees(categorie_choisie)
                    go("questions")
                }
            })
        })
        await both_area.onClick(() => {
            jv_both.sprite = "jv_color"
            jds_both.sprite = "jds_color"
            onMouseRelease(async () => {
                if (loading) return
                if (both_hover){
                    categorie_choisie = "both"
                    await separationDonnees(categorie_choisie)
                    go("questions")
                }
            })
        })
    })
    //#endregion
    // #region Questions
    // Scène où on pose les questions
    
    scene("questions", async () => {
        windowButtons()
        eng_button.destroy()
        fr_button.destroy()
        // Couleur du background dépend du support choisi
        let icon_sprite
        if (categorie_choisie === "jv"){
            icon_sprite = "jv_color"
        } else if (categorie_choisie === "jds"){
            icon_sprite = "jds_color" 
        } 

        // Compteur de question

        compteur_question ++
        let compteur_caption = add([
            text(`Question ${compteur_question}/${nbr_questions}`, {
                font: "pixel",
                size: 54
            }),
            pos(width() - width()/1.11, 120),
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
            text(`Score: ${score}/2800`, {
                font: "pixel",
                size: 54
            }),
            pos(width()/1.1, 120),
            anchor("center"),
            z(50)
        ])
        let score_shadow = add([
            text(`Score: ${score}/2800`, {
                font: "pixel",
                size: 54
            }),
            pos(score_caption.pos.x+ 5, score_caption.pos.y + 6),
            anchor("center"),
            opacity(0.4),
            color(0,0,0),

        ])
        // Streak
        let streak_caption = add([
            text(getTranslation("STREAK").replace("{streak}", streak) + (streak > 1 ? "!" : "."), {
                font: "pixel",
                size: 36,
                transform: streak >= 3 ? (idx, ch) => ({
                    color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                    pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
                    scale: wave(1, 1.2, time() * 3 + idx),
                    angle: wave(-9, 9, time() * 3 + idx),
                }) : undefined,
            }),
            pos(width()/2, 28),
            anchor("center"),
            opacity(streak_opacity),
            z(50)
        ])
        let streak_shadow = add([
            text(streak_caption.text, {
                font: "pixel",
                size: 36,
                transform: streak >= 3 ? (idx, ch) => ({
                    color: hsl2rgb((time() * 0.2 + idx * 0.1) % 1, 0.7, 0.8),
                    pos: vec2(0, wave(-4, 4, time() * 4 + idx * 0.5)),
                    scale: wave(1, 1.2, time() * 3 + idx),
                    angle: wave(-9, 9, time() * 3 + idx),
                }) : undefined,
            }),
            pos(streak_caption.pos.x +4, streak_caption.pos.y +4),
            anchor("center"),
            color(0,0,0),
            opacity(streak_opacity - 0.6)
        ])

        // Icone du support
        if (categorie_choisie === "both"){
            let icon1 = add([
                sprite("jv_color"),
                pos(380, compteur_caption.pos.y),
                anchor("center"),
                rotate(-10)
            ])
            let icon2 = add([
                sprite("jds_color"),
                pos(440, compteur_caption.pos.y),
                anchor("center"),
                scale(1.3),
                rotate(10)
            ])
        } else { 
            let icon = add([
                sprite(icon_sprite),
                pos(390, compteur_caption.pos.y),
                anchor("center"),
            ])
        }

        //#region Betty    
        // On choisi l'animation selon la streak
        let streak_anim = streak >= 3 ? "happy" : "idle"
        let betty = add([
            sprite("betty", {anim: streak_anim}),
            pos(1730, 930),
            scale(scaleValue*2),
            anchor("bot"),
            z(90),
            body(),
            area(31*scaleValue, 200*scaleValue),
            "betty"
        ])
        let betty_shadow = add([
            pos(betty.pos.x, betty.pos.y),
            opacity(0.3),
            circle(40),
            scale(1.5, 0.5),
            color(0, 0, 0),
            anchor("center"),
            z(80)
        ])
        let betty_platform = add([
            rect(width(), 10),
            pos(0, 930),
            area(),
            body({isStatic: true}),
            opacity(0),
            "platform"
        ])
        betty.flipX = true

        // Le highlight suit tjrs betty
        onUpdate(() => {
            betty_highlight.pos = vec2(betty.pos.x, betty.pos.y - 91);
            betty_shadow.pos = vec2(betty.pos.x, betty.pos.y)
            info_shadow.pos = vec2(betty.pos.x + 7 + 1.5, betty.pos.y - 270 + 1.5)
        });
        // Logique pour le saut
        setGravity(1200)
        betty.onCollide("platform", () => {
            canJump = true;
        });

        // Star emitter
        // Initialize a timer variable
        let starTimer = 0;

        betty.onUpdate(() => {
            if (streak >= 3 && !showingResults) {
                starTimer += dt();
                if (starTimer >= 0.5) {
                    starTimer = 0;

                    const star = add([
                        pos(betty.pos.x, betty.pos.y - 90),
                        sprite("star"),
                        scale(rand(0.5, 1)),
                        body(),
                        lifespan(1, { fade: 0.5 }),
                        opacity(1),
                        rotate(rand(0, 360)),
                        move(choose([LEFT, RIGHT]), rand(60, 240)),
                        "betty"
                    ]);
                    star.jump(rand(480, 820));
                }
            }
        });
        // Hihlight jaune derrière Betty pour quand iel a qqch à dire
        let betty_highlight = add([
            sprite("betty", {anim: "white"}),
            pos(betty.pos.x, betty.pos.y - 91),
            scale(scaleValue*2.2),
            anchor("center"),
            z(85),
            area(31*scaleValue, 200*scaleValue),
            color(255, 255, 0),
            opacity(0),
            "betty"
        ])
        betty_highlight.flipX = true
        let info_shadow = add([
            sprite("quest"),
            pos(betty.pos.x + 1.5, betty.pos.y - 600 + 1.5),
            scale(scaleValue * 2.2),
            anchor("center"),
            color(0,0,0),
            opacity(0),
            z(70),
            "betty"
        ])
        let betty_info = info_shadow.add([
            sprite("quest"),
            pos(-1.5, -1.5),
            anchor("center"),
            area(),
            z(80),
            opacity(0),
            "betty"
        ])
        let baseScale = betty.scale.clone()
        info_shadow.onUpdate(() => {
            info_shadow.scale = vec2(baseScale.x + wave(-0.5, 0.5, time() * 4), baseScale.y + wave(-0.5, 0.5, time() * 4))
        })
        //#endregion

        displayQuestion()
        function displayQuestion(){
            locked = false
            showingResults = false

            // Randomiser la position des cartes 
            let x_card1 = width() / 3;
            let x_card2 = width() / 1.5

            // On swap la position des cartes de façon aléatoire
            if (randi() === 0) {
                [x_card1, x_card2] = [x_card2, x_card1];
            }

            // Choix aléatoire du type la carte
            // let sprite1 = (randi() === 0 ? "spades" : "clubs")
            // let sprite2 = (randi() === 0 ? "diamonds" : "hearts")
            let card_sprite = "blank_card"

            //#region choixQuestion
            function choixQuestion(){
                // Questions 'scriptées':
                // On prend une question 'égale' selon la position déterminée dans question_egale
                if (compteur_question === question_egale && questionsEgales.length > 0){
                    let randnum = Math.floor(rand(questionsEgales.length))
                    return {
                        scriptee : false,
                        text1 : questionsEgales[randnum].description_activite1,
                        text2 : questionsEgales[randnum].description_activite2,
                        theme : questionsEgales[randnum].theme,
                        caption : questionsEgales[randnum].question,
                        activite1_gagne : true,
                        commentaire : questionsEgales[randnum].commentaire,
                        explication : questionsEgales[randnum].explication,
                        categorie : questionsEgales[randnum].jeu_video
                    }
                // On prend une question 'autre jeu' selon la position déterminée dans question_autre_categorie
                } else if (question_autre_jeu.includes(compteur_question)){
                    let randnum = Math.floor(rand(autres_jeu.length))
                    if (autres_jeu[randnum].activite1_gagnante === "TRUE"){
                        return {
                            scriptee : true,
                            text1 : autres_jeu[randnum].description_activite1,
                            text2 : autres_jeu[randnum].description_activite2,
                            theme : autres_jeu[randnum].theme,
                            caption : autres_jeu[randnum].question,
                            activite1_gagne : true,
                            commentaire : autres_jeu[randnum].commentaire,
                            explication : autres_jeu[randnum].explication,
                            categorie : autres_jeu[randnum].jeu_video
                        }
                    } else {
                        return{
                            scriptee : true,
                            text1 : autres_jeu[randnum].description_activite1,
                            text2 : autres_jeu[randnum].description_activite2,
                            theme : autres_jeu[randnum].theme,
                            caption : autres_jeu[randnum].question,
                            activite1_gagne : false,
                            commentaire : autres_jeu[randnum].commentaire,
                            explication : autres_jeu[randnum].explication,
                            categorie : autres_jeu[randnum].jeu_video
                        }
                    }

                // Question normales:
                } else {
                    // Gérer les thèmes: éviter les répétitions
                    // Reset si tous les thèmes sont déjà passés
                    if (usedThemes.length === categorie.length){
                        usedThemes = [];
                    }

                    // Filtrer les questions disponibles selon les thèmes restant
                    let availableQuestions = categorie.filter(question => !usedThemes.includes(question.theme));
                    
                    // S'il n'y a plus de questions dispo, on reset
                    if (availableQuestions.length === 0) {
                        usedThemes = [];
                        availableQuestions = categorie;
                    }

                    // On choisit une question aléatoire parmi les questions disponibles
                    let questionIndex = Math.floor(Math.random() * availableQuestions.length);
                    let chosenQuestion = availableQuestions[questionIndex];

                    // Ajoute le thème dans la blacklist et garde en mémoire le dernier thème choisi
                    usedThemes.push(chosenQuestion.theme);
                    dernierThemeChoisi = chosenQuestion.theme;

                    // Trouver l'index de la question choisie
                    let chosenQuestionIndex = categorie.findIndex(question => question === chosenQuestion);

                    // Supprimer la question choisie de façon permanente
                    if (chosenQuestionIndex !== -1) {
                        categorie.splice(chosenQuestionIndex, 1);
                    }

                    // Choisi la question
                    if (chosenQuestion.activite1_gagnante === "TRUE"){
                        return{
                            scriptee : false,
                            text1 : chosenQuestion.description_activite1,
                            text2 : chosenQuestion.description_activite2,
                            theme : chosenQuestion.theme,
                            caption : chosenQuestion.question,
                            activite1_gagne : true,
                            commentaire : chosenQuestion.commentaire,
                            explication : chosenQuestion.explication,
                            categorie : chosenQuestion.jeu_video
                        };
                    } else if (chosenQuestion.activite1_gagnante === "FALSE"){
                        return{
                            scriptee : false,
                            text1 : chosenQuestion.description_activite1,
                            text2 : chosenQuestion.description_activite2,
                            theme : chosenQuestion.theme,
                            caption : chosenQuestion.question,
                            activite1_gagne : false,
                            commentaire : chosenQuestion.commentaire,
                            explication : chosenQuestion.explication,
                            categorie : chosenQuestion.jeu_video
                        };
                    } 
                }
            }
            //#endregion

            //#region Cartes
            // Carte 1

            question = choixQuestion()
            let scoreEffectTriggered = false

            let card1 = add([
                sprite(card_sprite),
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
                sprite(card_sprite),
                color(0,0,0),
                opacity(0.4),
                pos(x_card1 + 20, height()*1.2),
                scale(scaleValue),  
                anchor("center"),
                rotate(0),
                "card1"
            ])
            let card1_text = add([
                text(question.text1, {
                    font: "pixel",
                    size: 45,
                    width: 330,
                    lineSpacing : 10, 
                    align: "center"
                }),
                color(text_color),
                pos(card1.pos),
                anchor("center"),
                z(55),
                rotate(0),
                "card1"
            ])
            if (question.categorie === "TRUE") {
                picto_sprite = "jv_color"
                picto_pos = vec2(-58, -97)
                picto_scale = 0.4
            } else if (question.categorie === "FALSE"){
                picto_sprite = "jds_color"
                picto_pos = vec2(-57, -93)
                picto_scale = 0.5
            }
            let card1_picto1 = card1.add([
                sprite(picto_sprite),
                pos(picto_pos),
                anchor("center"),
                scale(picto_scale),
                z(55),
                "card1"
            ])
            let card1_picto2 = card1.add([
                sprite(picto_sprite),
                pos(picto_pos.x * -1, picto_pos.y * -1),
                anchor("center"),
                scale(picto_scale),
                z(55),
                "card1"
            ])
            card1_picto2.flipY = true

            // Carte 2
            let card2 = add([
                sprite(card_sprite),
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
                sprite(card_sprite),
                color(0,0,0),
                opacity(0.4),
                pos(x_card2 + 20, height()*1.3),
                scale(scaleValue),  
                anchor("center"),
                rotate(0),
                "card2"
            ])
            let card2_text = add([
                text(question.text2, {
                    font: "pixel",
                    size: 45,
                    width: 330,
                    lineSpacing : 10,
                    align: "center"
                }),
                color(text_color),
                pos(card2.pos),
                anchor("center"),
                z(55),
                rotate(0),
                "card2"
            ])
            let card2_picto1 = card2.add([
                sprite(picto_sprite),
                pos(picto_pos),
                anchor("center"),
                scale(picto_scale),
                z(55),
                "card1"
            ])
            let card2_picto2 = card2.add([
                sprite(picto_sprite),
                pos(picto_pos.x * -1, picto_pos.y * -1),
                anchor("center"),
                scale(picto_scale),
                z(55),
                "card1"
            ])
            card2_picto2.flipY = true
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
                    streak_caption.text = getTranslation("STREAK").replace("{streak}", streak) + (streak > 1 ? " !" : ".")
                    streak_shadow.text = getTranslation("STREAK").replace("{streak}", streak) + (streak > 1 ? " !" : ".")
                    if (streak == 2){
                        streak_caption.opacity = 1
                        streak_shadow.opacity = 0.4
                        streak_opacity = 1
                    }
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
                    score_caption.text = `Score: ${score}/2800`
                    score_shadow.text = `Score: ${score}/2800`

                    play(scoreSound[multiplier - 1], {
                        volume: 0.8
                    })
                    score_effect = add([
                        text(`+${100 * multiplier}!`,{
                            font: "pixeloutline",
                            size: 100
                        }),
                        color(score_color),
                        pos(mousePos()),
                        z(200),
                        anchor("bot"),
                        rotate(rand(-30, 30)),
                        area({ collisionIgnore: ["particle"] }),
                        body(),
                        opacity(1),
                        lifespan(0.5, {fade: 0.3}),
                        move(choose([LEFT, RIGHT]), rand(60, 240))
                    ])

                    // Effet de saut pour le +100
                    score_effect.jump(rand(400, 440))

                    // Effet de couleur pour le +300
                    if (streak >= 3) {
                        score_effect.onUpdate(() => {
                            score_effect.color = hsl2rgb((time() * 1.5) % 1, 1, 0.5);
                        });
                    }                     
                    card.z = 60
                    card_text.z = 65
                    // Si c'est une question égale, on colorie les 2 cartes en jauneen jaune
                    if (question.theme === "Egal"){
                        card.color = egal_color
                        if (clicked === 2){
                            card1.color = egal_color
                        } else if (clicked === 1){
                            card2.color = egal_color
                        } 
                    } else {
                        // Si c'est correct, on colorie la carte cliquée en vert
                        card.color = correct_color
                        betty.play("happy")
                    }
                } else {
                    // Si c'est faux, on colorie la carte cliquée en rouge
                    card.color = wrong_color
                    card.z = 40
                    card_text.z = 45
                    // On fait trembler l'écran
                    shake(10)
                    // Betty est choquée
                    betty.play("owch")
                    // On joue le son de l'erreur
                    play("fail", {
                        volume: 0.5
                    })
                    streak_caption.text = getTranslation("STREAK").replace("{streak}", streak) + (streak > 1 ? " !" : ".")
                    streak_shadow.text = getTranslation("STREAK").replace("{streak}", streak) + (streak > 1 ? " !" : ".")
                    streak_caption.opacity = 0
                    streak_opacity = 0
                    streak_shadow.opacity = 0
                } 
            }
            card1.onClick(() => {
                if (locked || showingResults) return
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
                        if (showingResults || locked) return
                        locked = true
                        scoreEffect(card1, card1_text)
                        wait(0.4, () => {
                            displayResults(question, card1, card1_shadow, card1_text, card2, card2_shadow, card2_text)
                        });
                    });    
            });
            card2.onClick(() => {
                if (locked || showingResults) return
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
                    if (showingResults || locked) return
                    locked = true
                    scoreEffect(card2, card2_text)
                    wait(0.4, () => {
                        displayResults(question, card1, card1_shadow, card1_text, card2, card2_shadow, card2_text)
                    });
                });
            });
        }
    
        //#endregion
    //#endregion
    //#endregion

    //#region Caption

    // Caption de la question
    let caption = add([
        text(question.caption, {
            font: "pixel",
            lineSpacing: 10,
            size: 72,
            width: 1000,
            align: "center",
            letterSpacing: 6,
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
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
            size: 72,
            width: 1000,
            align: "center",
            letterSpacing: 6,
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
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
                caption_result = getTranslation("DEPENDS")
                score += 100
            } else {
                caption_result = getTranslation("INCORRECT")
                streak = 0
            }

            let result = add([
                text(caption_result, {
                    font: "pixel",
                    size: 72,
                    width: 800,
                    align: "center",
                    letterSpacing: 6,
                    transform: (idx, ch) => ({
                        pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                        angle: wave(-2, 2, time() * 3 + idx),
                    })
                }),
                pos(width()/1.75, height()/8),
                anchor("center"),
                z(50),
                "results_element"
            ]);
            let result_shadow = add([
                text(caption_result, {
                    font: "pixel",
                    size: 72,
                    width: 800,
                    align: "center",
                    letterSpacing: 6,
                    transform: (idx, ch) => ({
                        pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                        angle: wave(-2, 2, time() * 3 + idx),
                    })
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
                    pos(width()/1.75, height()/1.15),
                    scale(scaleValue*2),  
                    anchor("center"),
                    area(),
                    "results_element"
                ])
                let lock = false
                suivant_bouton.onClick(() => {
                    if(lock || explanation) return
                    lock = true
                    if (curTween1) curTween1.cancel()
                    if (curTween2) curTween2.cancel()
                    play(choose(foldSounds), {
                        volume:0.3
                    })
                    wait(0.3, () =>{
                        play(choose(foldSounds), {
                            volume : 0.3
                        })
                    })
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
                        font: "pixel",
                        width: 400,
                        letterSpacing: 6,
                        size: 54,
                        align: "center"
                    }),
                    pos(suivant_bouton.pos.x, suivant_bouton.pos.y - 4),
                    anchor("center"),
                    z(20),  
                    "results_element"
                ])

                let suivant_shadow = add([
                    text(getTranslation("SUIVANT"),{
                        font: "pixel",
                        width: 400,
                        letterSpacing: 6,
                        size: 54,
                        align: "center"
                    }),
                    color(93, 27, 27),
                    pos(suivant.pos.x + 5, suivant.pos.y + 4),
                    anchor("center"),
                    z(10),
                    "results_element"            
                ])

            } else {
                let suivant_bouton = add([
                    sprite("button"),
                    pos(width()/1.75, height()/1.15),
                    scale(scaleValue*1.5),  
                    anchor("center"),
                    area(),
                    "results_elements"
                ])

                let fin = add([
                    text(getTranslation("RESULTATS"),{
                        font: "pixel",
                        size: 54,
                        align: "center",
                        letterSpacing: 6,
                    }),
                    pos(suivant_bouton.pos),
                    anchor("center"),
                    z(20),
                    "results_element"
                ])

                let fin_shadow = add([
                    text(getTranslation("RESULTATS"),{
                        font: "pixel",
                        size: 54,
                        align: "center",
                        letterSpacing: 6,
                    }),
                    color(93, 27, 27),
                    pos(suivant_bouton.pos.x + 5, suivant_bouton.pos.y + 5),
                    anchor("center"),
                    z(15),
                    "results_element"
                ])
                suivant_bouton.onClick(() => {
                    if (explanation) return
                    go("finalResults", {score: score})
                })
            }
            //#endregion
            //#region Betty comment
            // Dialogue

            betty.play("idle_active")
            betty_highlight.play("white")
            betty_info.opacity = 1
            info_shadow.opacity = 0.4
            betty_highlight.opacity = 1
            if (canJump){
                betty.jump(400);
                canJump = false;
            }
            betty.onClick(() => {
                bettyClick()
            })
            betty_info.onClick(()=>{
                bettyClick()
            })
            function bettyClick(){
                if (explanation) return
                closeCooldown = true
                wait(0.3, () => {closeCooldown = false})
                explanation = true
                exited = false
                betty.play("talk")
                betty_info.opacity = 0
                info_shadow.opacity = 0
                betty_highlight.opacity = 0
                let bulle = add([
                    sprite("bulle"),
                    pos(betty.pos.x, betty.pos.y - 180),
                    scale(scaleValue*5),
                    anchor("botright"),
                    area({ shape: new Rect(vec2(-4, -12), 99, 44) }),
                    z(100),
                    "bulle"
                ])
                let txt = add([
                    text("", {
                        font: "pixelthin",
                        size: 54,
                        width: 1070,
                        transform: (idx, ch) => {
                            return {
                                opacity: idx < txt.letterCount ? 1 : 0,
                            };
                        },
                    }),
                    anchor("topleft"),
                    pos(bulle.pos.x - 1120, bulle.pos.y - 590),
                    color(text_color),
                    z(110),
                    {
                        letterCount: 0,
                    },
                    "bulle"
                ])
                let close = add([
                    text(getTranslation("FERMER"), {
                        font: "pixelthin",
                        size: 54,
                        width: 1070,
                        transform: (idx, ch) => ({
                            pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                            angle: wave(-2, 2, time() * 3 + idx),
                        }),
                    }),
                    pos(bulle.pos.x - bulle.width*3.1, bulle.pos.y/1.33),
                    color(150, 150, 150),
                    z(110),
                    anchor("center"),
                    opacity(0),
                    "bulle"
                ])
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
                        play("talk2", {
                            volume: 0.05,
                        });
                        if (txt.letterCount === txt.renderedText.length) {
                            isTalking = false;
                            writing.cancel();
                            betty.play("idle_active")
                            close.opacity = 1
                        }
                        if(exited) writing.cancel()
                    });
                }
                function skipDialog() {
                    isSkipping = true
                }
                startWriting(question.explication)
                let assombrissement = add([
                    rect(1920, 1080),
                    opacity(0.4),
                    color(0,0,0),
                    pos(0,0),
                    z(70),
                    "bulle"
                ])
                onClick(()=>{
                    if (closeCooldown) return
                    if (isTalking){
                        skipDialog()
                    } else{
                        exited = true
                        destroyAll("bulle")
                        betty.play("idle")
                        explanation = false
                    }
                })
            }
        }
    })
    //#endregion
    //#region Résultats finaux
    scene("finalResults", ({score}) =>{
        windowButtons()
        createBarChart(langue, score)
    })
    //#endregion
    go("titleScreen")
}