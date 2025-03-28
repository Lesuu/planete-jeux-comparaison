// Chargement des assets
export async function loadAssets(){
    // Polices
    loadFont("pixel", "assets/fonts/m6x11plus.ttf")
    loadFont("pixelthin", "assets/fonts/m5x7.ttf")
    //#region UI
    // Boutons windows:
    loadSpriteAtlas("assets/sprites/windowsbutton.png", {
        "button":{
            "x": 0,
            "y": 0,
            "width": 80,
            "height": 80
        },
        "button_pressed":{
            "x": 80,
            "y": 0,
            "width": 80,
            "height": 80
        },
    });
    // Icones + checkbox:
    loadSpriteAtlas("assets/sprites/icons_spreadsheet.png", {
        "bg_icon": {
            "x": 64,
            "y": 0,
            "width": 64,
            "height": 64
        },
        "bg_color": {
            "x": 0,
            "y": 0,
            "width": 64,
            "height": 64
        },
        "vg_icon": {
            "x": 80,
            "y": 64,
            "width": 80,
            "height": 64
        },
        "vg_color": {
            "x": 0,
            "y": 64,
            "width": 80,
            "height": 64
        },
        "empty_checkbox": {
            "x": 128,
            "y": 0,
            "width": 32,
            "height": 32
        },
        "full_checkbox": {
            "x": 128,
            "y": 32,
            "width": 32,
            "height": 32
        },
    });
    // Bouton
    loadSprite("button_red", "assets/sprites/button_textless.png")
    // Bulle de dialogue
    loadSprite("bulle", "assets/sprites/bulle.png")
    //#endregion
    //#region Betty
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
    });
    // Pictogrammes:
    // Sheet
    loadSpriteAtlas("assets/pictos/picto_sheet.png", {
        "changement_climatique": {
            "x": 0,
            "y": 155,
            "width": 96,
            "height": 96
        },
        "cloud": {
            "x" : 96,
            "y" : 155,
            "width": 65,
            "height": 65
        },
        "console": {
            "x" : 0,
            "y" : 59,
            "width": 57,
            "height": 58
        },
        "cycle_de_vie": {
            "x" : 161,
            "y" : 155,
            "width": 96,
            "height": 96
        },
        "console_full": {
            "x": 0,
            "y": 0,
            "width": 57,
            "height": 58
        },
        "pc_full": {
            "x" : 57,
            "y" : 0,
            "width": 62,
            "height": 61
        },
        "portable_full": {
            "x" : 119,
            "y" : 0,
            "width": 65,
            "height": 64
        },
        "telephone_full": {
            "x" : 184,
            "y" : 0,
            "width": 60,
            "height": 59
        },
        "jeu_moyen": {
            "x" : 280,
            "y" : 0,
            "width": 64,
            "height": 64
        },
        "jeu_moyen_full": {
            "x" : 57,
            "y" : 64,
            "width": 64,
            "height": 64
        },
        "metaux": {
            "x" : 184,
            "y" : 59,
            "width": 96,
            "height": 96
        },
        "particules_fines": {
            "x" : 257,
            "y" : 245,
            "width": 96,
            "height": 16
        },
        "pc": {
            "x" : 121,
            "y" : 64,
            "width": 61,
            "height": 62
        },
        "petit_jeu": {
            "x" : 280,
            "y" : 64,
            "width": 64,
            "height": 64
        },
        "petit_jeu_full": {
            "x" : 96,
            "y" : 245,
            "width": 64,
            "height": 64
        },
        "portable": {
            "x" : 0,
            "y" : 261,
            "width": 64,
            "height": 65
        },
        "telephone": {
            "x" : 160,
            "y" : 261,
            "width": 60,
            "height": 59
        },
    })
    //#endregion
    //#region Sounds
    loadSound("talk", "assets/audio/talk2.wav")
    //#endregion
};

//#region Importation du texte
export async function importText(lien){
    let translations = []
    let metaText = await getCSV(lien);
    metaText.forEach(row => {
        translations[row.TEXTE] = {
            fr: row.fr,
            eng: row.eng
        };
    });
    return translations;
};

async function getCSV(url) {
    const response = await fetch(url);
    const csvText = await response.text();

    const parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
    });
    return parsedData.data;
}
//#endregion