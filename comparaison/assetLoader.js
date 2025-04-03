export function loadAssets(){
    let text_color = rgb(56, 71, 74)
    
    loadFont("pixel", "assets/fonts/m6x11plus.ttf")
    loadFont("pixelthin", "assets/fonts/m5x7.ttf")
    loadFont("kaph", "assets/fonts/Kaph-Regular.ttf", {
        outline: {
            width: 3,
            color: text_color
        },
        letterSpacing : -5,
    });
    loadFont("pixeloutline", "assets/fonts/m6x11plus.ttf", {
        outline: {
            width: 3,
            color: text_color,
        },
        letterSpacing : 5
    });

    loadSound("fail","assets/audio/fail.mp3")

    loadSound("card1","assets/audio/card-place-1.ogg")
    loadSound("card2","assets/audio/card-place-2.ogg")
    loadSound("card3","assets/audio/card-place-3.ogg")
    loadSound("card4","assets/audio/card-place-4.ogg")

    loadSound("score1","assets/audio/score.wav")
    loadSound("score2","assets/audio/score-streak.wav")
    loadSound("score3","assets/audio/score-streak-max.wav")

    loadSound("talk1", "assets/audio/talk1.wav")
    loadSound("talk2", "assets/audio/talk2.wav")



    loadSprite("jv_icon", "assets/sprites/video_game.png")
    loadSprite("jv_color", "assets/sprites/vg_color.png")
    loadSprite("jds_icon", "assets/sprites/board_game.png")
    loadSprite("jds_color", "assets/sprites/bg_color.png")
    loadSprite("button", "assets/sprites/button_textless.png")
    loadSprite("bulle", "assets/sprites/bulle.png")
    loadSprite("blank_card", "assets/sprites/blank_card.png")
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

    loadSpriteAtlas("assets/sprites/BETTY-sheet.png", {
        "betty" : {
            "x": 0,
            "y": 0,
            "width": 124,
            "height": 156,
            "sliceX": 4,
            "sliceY": 4,
            "anims": {
                "idle": {
                    "from": 0,
                    "to": 1,
                    "speed": 1.5,
                    "loop": true,
                },
                "idle_active":{
                    "from": 2,
                    "to": 3,
                    "speed": 1.5,
                    "loop": true,
                },
                "talk": {
                    "from": 4,
                    "to": 7,
                    "speed": 10,
                    "loop": true,
                },
                "happy": {
                    "from": 8,
                    "to": 9,
                    "speed": 2,
                    "loop": true,
                },
                "white": {
                    "from": 10,
                    "to": 11,
                    "speed": 1.5,
                    "loop": true,
                },
                "owch": {
                    "from": 12,
                    "to": 12,
                    "speed": 0.2,
                }
            }
        },
        "quest":{
            "x": 124,
            "y": 0,
            "width": 6,
            "height": 25,
        },
        "info": {
            "x": 130,
            "y": 0,
            "width": 18,
            "height": 17
        },
        "star": {
            "x" : 124,
            "y" : 25,
            "width": 30,
            "height": 30,
        }, 
        "restart": {
            "x" : 124,
            "y" : 55,
            "width": 22,
            "height": 21,
        },
        "fr": {
            "x" : 124,
            "y" : 76,
            "width": 22,
            "height": 21,
        },
        "en": {
            "x" : 124,
            "y" : 97,
            "width": 22,
            "height": 21,
        },
    })
}