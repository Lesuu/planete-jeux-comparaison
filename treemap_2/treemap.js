import { getTranslation, langue, loading } from "./main.js"
import { setCurrentTreemapExplanation } from "./global.js"; 


// Tout ce qui s'appelle "scenario" devrait s'appeler "indicateur", mais changer cause des problèmes.

export let etage1_jv = []
export let etage1_jds = []

export function listEtages() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';
    
    return new Promise((resolve, reject) => {
        $.get(csvUrl, function(csvText) {
            // Parse CSV using PapaParse.
            const parsed = Papa.parse(csvText, { header: true });
            const allData = parsed.data;    

            etage1_jv = [...new Set(allData.filter(d => d.treemap === "Jeu vidéo").map(d => d.etage_1))];
            etage1_jds = [...new Set(allData.filter(d => d.treemap === "Jeu de société").map(d => d.etage_1))];

            resolve({ etage1_jv, etage1_jds });
        }).fail((err) => {
            reject(err);
        });
    });
}

let isGenerating = false;
export function createLoadingOverlay() {
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
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';
    
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
            var myChart = echarts.init(treemapContainer);

            // Build the treemap using the converted data.
            myChart.setOption({
                tooltip: {
                    formatter: function(info) {
                    // Etiquette quand on hover (désactivée car inutile en tactile)
                    // var value = info.value;
                    // var treePath = info.treePathInfo.map(item => item.name).slice(1).join('/');
                    // var explication = info.data.explication ? ('<br>' + info.data.explication) : '';
                    // return `<div class="tooltip-title">${echarts.format.encodeHTML(treePath)}</div>
                    //         Case: ${value}${explication}`;
                    }
                },
                series: [{
                    roam: zoom, 
                    name: 'Treemap',
                    type: 'treemap',
                    visibleMin: 0.0001,
                    label: {
                        // Texte à l'intérieur des cases
                        show: true,
                        formatter: '{b}',
                        textStyle: {
                            fontFamily: 'm6x11', 
                            fontSize: 27, 
                            textBorderColor: '#38474a',
                            textBorderWidth: 2,
                            //fontWeight: 'bold' 
                        }
                    },
                    upperLabel: {
                    show: true,
                    height: 35,
                    // Texte de l'intitulé du treemap
                    textStyle: {
                        fontFamily : 'm6x11',
                        fontSize: 23,
                        textBorderColor: '#38474a',
                        textBorderWidth: 2,
                        color: '#fff'
                    }
                    },
                    itemStyle: {
                        borderColor: '#fff'
                    },
                    levels: [
                    {
                        itemStyle: {
                            borderColor: '#777',
                            borderWidth: 0,
                            gapWidth: 1
                        },
                        upperLabel: { show: false }
                    },
                    {
                        itemStyle: {
                            // Couleur du tour du treemap
                            borderColor: '#555',
                            borderWidth: 5,
                            gapWidth: 1
                        },
                        emphasis: { itemStyle: { borderColor: '#ddd' } }
                    },
                    // {
                    //     itemStyle: {
                    //         // Couleur du tour du treemap
                    //         borderColor: '#555',
                    //         borderWidth: 5,
                    //         gapWidth: 2
                    //     },
                    // },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: { borderWidth: 5, gapWidth: 1, borderColorSaturation: 0.6 }
                    }
                    ],
                    data: [convertedData]
                }]
            });
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

// #region Conversion/filtrage des données
function conversionDonnees(allData, plateforme, scenario, contribution, etage1) {
    let title = `${plateforme} - ${scenario} - ${contribution}`;
    let root = { name: title, path: etage1, children: [] };
    
    // Filtrage des données
    let data = allData.filter(d => d.treemap === plateforme && d.scenario === scenario && d.etage_1 === etage1 && d.contribution === contribution);

    setCurrentTreemapExplanation(data[0].explication);

    // On progresse à travers les différents étages
    data.forEach(row => {
        let levels = ["etage_1", "etage_2", "etage_3"];
        let val = parseFloat(row.case) || 0;

        let etageActuel = root;
        let currentPath = title

        // On passe à travers chaque étage
        levels.forEach((level) => {
            if (row[level]) {
                currentPath += `/${row[level]}`;
                let nodeExistante = etageActuel.children.find(d => d.name === row[level]);

                if (!nodeExistante) {
                    nodeExistante = { name: row[level], path: currentPath, children: [] };
                    etageActuel.children.push(nodeExistante);
                }
                // On passe à l'étage suivant
                etageActuel = nodeExistante;
            }
        });

        // Additionne la valeur de chaque dernier étage
        etageActuel.value = (etageActuel.value || 0) + val;
        // On attache l'explication.
        etageActuel.explication = row.explication;
    });
    // Recursively aggregate parent node values from their children.
    function aggregateValues(node) {
        if (node.children && node.children.length > 0) {
        // Sum the children's values.
        let sum = 0;
        node.children.forEach(child => {
            sum += aggregateValues(child);
        });
        // If the node already has a value (from direct leaf insertions), add it.
        node.value = (node.value || 0) + sum;
        }
        return node.value || 0;
    }
    
    aggregateValues(root);
    return root;
}   
//#endregion