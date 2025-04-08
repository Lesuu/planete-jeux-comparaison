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
    // Bulle de dialogue
    loadSprite("bulle", "assets/sprites/bulle.png")
    loadSprite("bulle_vert", "assets/sprites/bulle_vert.png")
    // Tutoriel
    loadSprite("screenshot_jv_fr", "assets/sprites/screenshot_jv.png")
    loadSprite("screenshot_jds_fr", "assets/sprites/screenshot_jds.png")
    loadSprite("screenshot_jv_eng", "assets/sprites/screenshot_jv_eng.png")
    loadSprite("screenshot_jds_eng", "assets/sprites/screenshot_jds_eng.png")
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
            "x": 297,
            "y": 0,
            "width": 38,
            "height": 84
        },
        "console": {
            "x" : 114,
            "y" : 60,
            "width": 76,
            "height": 47
        },
        "jeu_moyen": {
            "x" : 0,
            "y" : 69,
            "width": 51,
            "height": 49
        },
        "metaux": {
            "x" : 206,
            "y" : 0,
            "width": 91,
            "height": 67
        },
        "particules_fines": {
            "x" : 114,
            "y" : 0,
            "width": 92,
            "height": 7
        },
        "pc": {
            "x" : 0,
            "y" : 0,
            "width": 114,
            "height": 69
        },
        "petit_jeu": {
            "x" : 51,
            "y" : 69,
            "width": 48,
            "height": 48
        },
        "portable": {
            "x" : 114,
            "y" : 7,
            "width": 86,
            "height": 53
        },
        "telephone": {
            "x" : 190,
            "y" : 67,
            "width": 32,
            "height": 55
        },
    })
    loadSpriteAtlas("assets/pictos/picto-sheet-color.png", {
        "changement_climatique_full": {
            "x": 297,
            "y": 0,
            "width": 38,
            "height": 84
        },
        "console_full": {
            "x" : 114,
            "y" : 60,
            "width": 76,
            "height": 47
        },
        "jeu_moyen_full": {
            "x" : 0,
            "y" : 69,
            "width": 51,
            "height": 49
        },
        "metaux_full": {
            "x" : 206,
            "y" : 0,
            "width": 91,
            "height": 67
        },
        "particules_fines_full": {
            "x" : 114,
            "y" : 0,
            "width": 92,
            "height": 7
        },
        "pc_full": {
            "x" : 0,
            "y" : 0,
            "width": 114,
            "height": 69
        },
        "petit_jeu_full": {
            "x" : 51,
            "y" : 69,
            "width": 48,
            "height": 48
        },
        "portable_full": {
            "x" : 114,
            "y" : 7,
            "width": 86,
            "height": 53
        },
        "telephone_full": {
            "x" : 190,
            "y" : 67,
            "width": 32,
            "height": 55
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