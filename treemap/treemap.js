d3.csv("treemap.csv").then(function(data){
    
    // Dimensions
    const width = 1080
    const height = 650

        // Séparation des données entre jeu vidéo et jeu de société
        const jv_data = data.filter(d => d.treemap === "Jeu vidéo");
        const jds_data = data.filter(d => d.treemap === "Jeu de société");

        // Conversion des données de CSV à JSON, hierarchisées
        function conversionDonnees(data, title) {
            let root = {name: title, children: []};
            
            // On progresse à travers les différents étages
            data.forEach(row => {
                let levels = ["etage_1", "etage_2", "etage_3", "etage_4"];
                let value = row.case

                let etageActuel = root;

                // On passe à travers chaque étage
                levels.forEach((level) => {
                    if (row[level]) {
                        
                        let nodeExistante = etageActuel.children.find(d => d.name === row[level]);
    
                        if (!nodeExistante) {
                            nodeExistante = { name: row[level], children: [] };
                            etageActuel.children.push(nodeExistante);
                        }
                        // On passe à l'étage suivant
                        etageActuel = nodeExistante;
                    }
                });
    
                // Si c'est le dernier étage, on remplace 'children' par 'value'
                if (value) {
                    delete etageActuel.children; 
                    etageActuel.value = value;
                }
            });
            return root;
        }
        
        // Exécution de la fonction pour les données du jeu vidéo
        let title_jv = "Jeu vidéo"
        let dataset_jv = conversionDonnees(jv_data, title_jv);

        // Exécution de la fonction pour les données du jeu de société
        let title_jds = "Jeu de société"
        let dataset_jds = conversionDonnees(jds_data, title_jds);

    
    // téléchargement des données converties (temporaire)
    // Convert JSON to Blob and create a downloadable link
    const blob = new Blob([JSON.stringify(dataset_jv, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create a visible download button
    const button = document.createElement("button");
    button.textContent = "Download JSON";
    button.style.padding = "10px";
    button.style.margin = "10px";
    button.style.cursor = "pointer";

    button.onclick = function () {
        const a = document.createElement("a");
        a.href = url;
        a.download = "output.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    document.body.appendChild(button);        

});