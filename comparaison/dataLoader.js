// Déclaration des arrays
let CSVdata = [];
let metaText = [];
let questions_JV = [];
let questions_JdS = [];
let questions_autres = [];
let translations = {};


// Liens vers les fichiers CSV
const lien_eng = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBSQtcLt8CbTPN-TvHnrCt1h24GtoXiWxBCoo3nqbrTSqLuc93FeogkFsOrfS_qF-YDyhTk5E0aau/pub?gid=1414253908&single=true&output=csv';
const lien_fr = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBSQtcLt8CbTPN-TvHnrCt1h24GtoXiWxBCoo3nqbrTSqLuc93FeogkFsOrfS_qF-YDyhTk5E0aau/pub?gid=1185013817&single=true&output=csv';
const lien_meta = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQWBSQtcLt8CbTPN-TvHnrCt1h24GtoXiWxBCoo3nqbrTSqLuc93FeogkFsOrfS_qF-YDyhTk5E0aau/pub?gid=826164962&single=true&output=csv';
let lien

async function getCSV(url) {
    const response = await fetch(url);
    const csvText = await response.text();

    const parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
    });
    return parsedData.data;
}

async function loadData(langue) {
    questions_JV = [];
    questions_JdS = [];
    translations = {};
    //questions_autres = [];
    if (langue === "fr"){
        lien = lien_fr;
    } else if (langue === "eng"){
        lien = lien_eng;
    }
    console.log("lien", langue, lien)

    CSVdata = await getCSV(lien);
    metaText = await getCSV(lien_meta);

    metaText.forEach(row => {
        translations[row.TEXTE] = {
            fr: row.fr,
            eng: row.eng
        };
    });

    // Séparation des données - pairings
    for (let i = 0; i < CSVdata.length; i++) {
        /*if (CSVdata[i].theme === "Autre") {
            questions_autres.push(CSVdata[i]);
        } else*/ if (CSVdata[i].jeu_video == "TRUE" && CSVdata[i].theme !== "Autre") {
            questions_JV.push(CSVdata[i]);
        } else if (CSVdata[i].jeu_video == "FALSE" && CSVdata[i].theme !== "Autre") {
            questions_JdS.push(CSVdata[i]);
        }
    }
}

export { loadData, questions_JV, questions_JdS, questions_autres, translations };