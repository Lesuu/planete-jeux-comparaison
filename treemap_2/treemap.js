// définition d'une taille par défaut
// const cont = document.querySelector("#container");
// cont.style.width = window.innerWidth+20+"px";
// cont.style.height = window.innerHeight-40+"px";


export function generateTreemap(plateforme, scenario, contribution, etage1, zoom) {    
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';
    
    const treemapContainer = document.createElement("div");
    treemapContainer.id = "treemapContainer";
    treemapContainer.style.position = "absolute";
    treemapContainer.style.top = "230px";
    treemapContainer.style.left = "203px";
    treemapContainer.style.right = "220px";
    treemapContainer.style.bottom = "5px";
    treemapContainer.style.width = "1694px";
    treemapContainer.style.height = "830px";
    treemapContainer.style.pointerEvents = "auto";
    treemapContainer.style.zIndex = "10";
    document.body.appendChild(treemapContainer);

    
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
                    // Get the numeric value and build a display path.
                    var value = info.value;
                    var treePath = info.treePathInfo.map(item => item.name).slice(1).join('/');
                    var explication = info.data.explication ? ('<br>' + info.data.explication) : '';
                    return `<div class="tooltip-title">${echarts.format.encodeHTML(treePath)}</div>
                            Case: ${value}${explication}`;
                    }
                },
                series: [{
                    roam: zoom, 
                    name: 'Treemap',
                    type: 'treemap',
                    visibleMin: 0.0001,
                    label: {
                    show: true,
                    formatter: '{b}'
                    },
                    upperLabel: {
                    show: true,
                    height: 30
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
                        borderColor: '#555',
                        borderWidth: 5,
                        gapWidth: 1
                        },
                        emphasis: { itemStyle: { borderColor: '#ddd' } }
                    },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: { borderWidth: 5, gapWidth: 1, borderColorSaturation: 0.6 }
                    }
                    ],
                    // Wrap the converted data in an array if your function returns a single root node.
                    data: [convertedData]
                }]
            });
        // Resolve the promise when treemap is rendered
            resolve();
        }).fail((err) => {
            reject(err);
        });
    }); 
}

// #region Conversion/filtrage des données
function conversionDonnees(allData, plateforme, scenario, contribution, etage1) {
    let title = `${plateforme} - ${scenario} - ${contribution}`;
    let root = { name: title, path: etage1, children: [] };
    
    // Filtrage des données
    console.log(allData)
    let data = allData.filter(d => d.treemap === plateforme && d.scenario === scenario && d.etage_1 === etage1 && d.contribution === contribution);
    console.log(data)

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

        // At the leaf level, add the value (summing if multiple rows end here)
        etageActuel.value = (etageActuel.value || 0) + val;
        // Optionally, attach any explanation.
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