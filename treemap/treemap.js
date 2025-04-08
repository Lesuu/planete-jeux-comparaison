import { getTranslation, langue, loading } from "./main.js"
import { setCurrentTreemapExplanation } from "./global.js"; 

// Tout ce qui s'appelle "scenario" devrait s'appeler "indicateur", mais changer cause des problèmes.

export let etage1_jv = []
export let etage1_jds = []

export function listEtages() {
    // const lien_fr = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';
    // const lien_eng = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=895638476&single=true&output=csv';

    const lien_fr = 'data/data_fr.csv'
    const lien_eng = 'data/data_eng.csv'

    let csvUrl = langue === "fr" ? lien_fr : lien_eng;

    let jeuVideo = langue === "fr" ? "Jeu vidéo" : "Video game";
    let jeuDeSociete = langue === "fr" ? "Jeu de société" : "Board game";

    return new Promise((resolve, reject) => {
        $.get(csvUrl, function(csvText) {
            // Parse CSV using PapaParse.
            const parsed = Papa.parse(csvText, { header: true });
            const allData = parsed.data;    

            etage1_jv = [...new Set(allData.filter(d => d.treemap === jeuVideo).map(d => d.etage_1))];
            etage1_jds = [...new Set(allData.filter(d => d.treemap === jeuDeSociete).map(d => d.etage_1))];

            resolve({ etage1_jv, etage1_jds });
        }).fail((err) => {
            reject(err);
        });
    });
}

let isGenerating = false;
export function isGeneratingTreemap() {
    return isGenerating;
}
function createLoadingOverlay() {
    let loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loadingOverlay";
    loadingOverlay.style.position = "absolute";
    loadingOverlay.style.top = "100px";
    loadingOverlay.style.left = "387px";
    loadingOverlay.style.right = "220px";
    loadingOverlay.style.bottom = "5px";
    loadingOverlay.style.width = "1507px";
    loadingOverlay.style.height = "730px";
    loadingOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    loadingOverlay.style.display = "flex";
    loadingOverlay.style.justifyContent = "center";
    loadingOverlay.style.alignItems = "center";
    loadingOverlay.style.zIndex = "20"; 
    loadingOverlay.innerHTML = `<h1 style='color: white;'>${getTranslation("CHARGEMENT")}</h1>`;
    document.body.appendChild(loadingOverlay);

    return loadingOverlay
}

export function generateTreemap(plateforme, scenario, contribution, etage1, zoom) {    
    if (isGenerating){
        return;
    }
    isGenerating = true;
    const lien_fr = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';
    const lien_eng = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=895638476&single=true&output=csv';

    let csvUrl = langue === "fr" ? lien_fr : lien_eng;

    let existingContainer = document.getElementById("treemapContainer");
    if (existingContainer) {
        existingContainer.remove();
    }

    const treemapContainer = document.createElement("div");
    treemapContainer.id = "treemapContainer";
    treemapContainer.style.position = "absolute";
    treemapContainer.style.top = "100px";
    treemapContainer.style.left = "387px";
    treemapContainer.style.right = "220px";
    treemapContainer.style.bottom = "5px";
    treemapContainer.style.width = "1507px";
    treemapContainer.style.height = "730px";
    treemapContainer.style.pointerEvents = "auto";
    treemapContainer.style.zIndex = "10";
    document.body.appendChild(treemapContainer);

    let loadingOverlay = createLoadingOverlay();

    return new Promise((resolve, reject) => {
        $.get(csvUrl, function(csvText) {
            // Parse CSV using PapaParse.
            const parsed = Papa.parse(csvText, { header: true });
            const allData = parsed.data;  

            // Conversion des données
            let convertedData = conversionDonnees(allData, plateforme, scenario, contribution, etage1);
            
            //generate treemap
            if (!treemapContainer) {
                console.error('Treemap container not found');
                return;
            }
            var myChart = echarts.init(
                treemapContainer,
                null,
                {
                    renderer: 'canvas',
                    useDirtyRect: false,
                    useCoarsePointer:false,
                },
            );

            // Build the treemap using the converted data.
            //#region Treemap config
            myChart.setOption({
                series: [{
                    roam: zoom, 
                    name: 'Treemap',
                    type: 'treemap',
                    visibleMin: 0.0001,
                    breadcrumb: {
                        // Ajuste la taille du path en bas du treemap
                        height: 40,
                        itemStyle: {
                            textStyle: {
                                fontSize: 32,
                                fontFamily: 'm6x11'
                            },
                        },
                    },
                    label: {
                        // Texte à l'intérieur des cases
                        show: true,
                        formatter: '{b}',
                        textStyle: {
                            fontFamily: 'm6x11', 
                            fontSize: 27, 
                            textBorderColor: '#38474a',
                            textBorderWidth: 2,
                            // fontWeight: 'bold' 
                        }
                    },
                    upperLabel: {
                    show: false,
                    height: 45,
                    // Texte de l'intitulé du treemap
                    textStyle: {
                        fontFamily : 'm6x11',
                        fontSize: 40,
                        textBorderColor: '#38474a',
                        textBorderWidth: 2,
                        color: '#fff'
                    }
                    },
                    itemStyle: {
                        borderColor: '#fff',
                    },
                    levels: [ // from echarts: getLeveOption()
                    {
                        itemStyle: {
                            borderColor: '#777',
                            borderWidth: 0, // tout le tour du treemap
                            gapWidth: 0 // tour des boites de différentes couleurs
                        },
                        upperLabel: { show: false } // header treemap
                    },
                    {colorSaturation: [0, 0],
                        itemStyle: {
                            // Couleur du tour du treemap
                            // borderColor: '' ,
                            borderWidth: 10, // tour des boites de différentes couleurs
                            gapWidth: 10, // espace entre différentes boites de meme couleurs
                            borderColorSaturation: 0.5
                        },
                        // emphasis: { itemStyle: { borderColor: '#777' } },
                        upperLabel: {
                            show: true
                          }
                    }],
                    data: convertedData
                }]
            });

    
    let downloadData = false ;

    // Optionally trigger a JSON download
    if (downloadData) {
        let jsonStr = JSON.stringify(convertedData, null, 2);
        let blob = new Blob([jsonStr], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "convertedData.json"; // Name of the downloaded file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }   

        // Resolve the promise when treemap is rendered
            resolve();
        }).fail((err) => {
            reject(err);
        }).always(() => {
            isGenerating = false;
            document.body.removeChild(loadingOverlay);
        });
    }); 
}



//#region Conversion/filtrage des données
function conversionDonnees(allData, plateforme, scenario, contribution, etage1) {
    // Remove root and directly build the structure based on etage_2 and etage_3
    let etage2Map = {};

    // Filter data based on the criteria
    let data = allData.filter(d =>
        d.treemap === plateforme &&
        d.scenario === scenario &&
        d.etage_1 === etage1 &&
        d.contribution === contribution
    );

    setCurrentTreemapExplanation(data[0].explication);

    // Iterate through the filtered data and build the structure
    data.forEach(row => {
        let levels = ["etage_2", "etage_3"];
        let val = parseFloat(row.case) || 0;
        let currentPath = "";

        // Process etage_2 and etage_3 as child nodes of etage_2
        if (row.etage_2) {
            if (!etage2Map[row.etage_2]) {
                etage2Map[row.etage_2] = { name: row.etage_2, path: `${row.etage_2}`, children: [] };
            }

            // Add etage_3 as a child of etage_2
            if (row.etage_3) {
                let etage3Node = {
                    name: row.etage_3,
                    path: `${row.etage_2}/${row.etage_3}`,
                    value: val,
                    explication: row.explication
                };
                etage2Map[row.etage_2].children.push(etage3Node);
            }

            // Add the value to etage_2
            etage2Map[row.etage_2].value = (etage2Map[row.etage_2].value || 0)+ val;
            etage2Map[row.etage_2].explication = row.explication;
        }
    });

    // Convert the final data structure
    let finalData = Object.values(etage2Map);

    // Return the final data with etage_2 as the top-level and etage_3 as its children
    return finalData;
}
//#endregion
