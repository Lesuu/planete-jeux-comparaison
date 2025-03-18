// Chargement des assets
export function loadAssets(){
    // Polices
    loadFont("pixel", "assets/fonts/m6x11plus.ttf")
    loadFont("pixelthin", "assets/fonts/m5x7.ttf")
    //#region UI
    // Icones + checkbox:
    loadSpriteAtlas("assets/sprites/icons_spreadsheet.png", {
        "bg_icon": {
            "x": 0,
            "y": 0,
            "width": 64,
            "height": 64
        },
        "bg_color": {
            "x": 64,
            "y": 0,
            "width": 64,
            "height": 64
        },
        "vg_icon": {
            "x": 0,
            "y": 64,
            "width": 160,
            "height": 128
        },
        "vg_color": {
            "x": 160,
            "y": 64,
            "width": 160,
            "height": 128
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
    loadSprite("button", "assets/sprites/button_textless.png")
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