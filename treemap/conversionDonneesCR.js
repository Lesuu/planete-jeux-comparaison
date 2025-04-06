
//#region Conversion/filtrage des données
function conversionDonnees(allData, plateforme, scenario, contribution, etage1) {
    let title = `${plateforme} - ${scenario}`;
    let root = { name: title, path: etage1, children: [] };
    
    // Filtrage des données
    let data = allData.filter(d => d.treemap === plateforme && d.scenario === scenario && d.etage_1 === etage1 && d.contribution === contribution);
    setCurrentTreemapExplanation(data[0].explication);

    // On progresse à travers les différents étages
    data.forEach(row => {
        let levels = ["etage_1", "etage_2", "etage_3"];
        let val = parseFloat(row.case) || 0;

        let etageActuel = root;
        let currentPath = title;

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

    // Convert the result to JSON and trigger a 
    if (downloadData) {
        let jsonStr = JSON.stringify(root, null, 2);
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

    return root;
}//#endregion