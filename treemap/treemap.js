d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?output=csv").then(function(data){

    // #region Data processing
   

    // Séparation des données : chaque dataset correspond à un treemap
    const jv_data = data.filter(d => d.treemap === "Jeu vidéo");
    const jds_data = data.filter(d => d.treemap === "Jeu de société");

    const jv_changementClimatique = jv_data.filter (d => d.scenario === "Changement climatique")
    const jv_metaux = jv_data.filter (d=> d.scenario === "Ressources minérales et métalliques")
    
    const jds_changementClimatique = jds_data.filter (d=> d.scenario === "Changement climatique")

    // Conversion des données de CSV à JSON, hierarchisées
    function conversionDonnees(data, title) {
        let root = {name: title, children: []};
        
        // On progresse à travers les différents étages
        data.forEach(row => {
            let levels = ["etage_1", "etage_2", "etage_3"];
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

    //#endregion

    // Exécution de la fonction pour les données du jeu vidéo
    let jv_data_changement_climatique = conversionDonnees(jv_changementClimatique, "Changement climatique");
    let jv_data_metaux = conversionDonnees(jv_metaux, "Ressources minérales et métalliques")

    // Exécution de la fonction pour les données du jeu de société
    let dataset_jds = conversionDonnees(jds_data, "Jeu de société");

    // Dimensions

    const marge = {
        haute : "60px",
        basse : "20px",
        droite : "50px",
        gauche : "20px"
    } 

    // Fonction pour créer les treemaps. On donne le dataset, la largeur, la hauteur
    // Ainsi que la marge qui sépare les éléments entre eux
    buildTreemap(jv_data_changement_climatique, 800, 850, marge)

    buildTreemap(jv_data_metaux, 800, 850, marge)

        //#region Treemaps
    function buildTreemap(data, width, height, marge){
        // This custom tiling function adapts the built-in binary tiling function
        // for the appropriate aspect ratio when the treemap is zoomed-in.
        function tile(node, x0, y0, x1, y1) {
            d3.treemapBinary(node, 0, 0, width, height);
            for (const child of node.children) {
                child.x0 = x0 + child.x0 / width * (x1 - x0);
                child.x1 = x0 + child.x1 / width * (x1 - x0);
                child.y0 = y0 + child.y0 / height * (y1 - y0);
                child.y1 = y0 + child.y1 / height * (y1 - y0);
            }
        }

        // Compute the layout.
        const hierarchy = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        const root = d3.treemap().tile(tile)(hierarchy);

        // Create the scales.
        const x = d3.scaleLinear().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([0, height]);

        // Formatting utilities.
        const format = d3.format(".4f");
        const name = d => d.ancestors().reverse().map(d => d.data.name).join("/");

        // Create the SVG container.
        const svg = d3.select("#chart")
            .append("svg")
            .attr("viewBox", [0.5, -30.5, width, height + 30])
            .attr("width", width)
            .attr("height", height + 30 )
            .attr("style", "max-width: 100%; height: auto;")
            .style("font", "10px sans-serif")
            .style("margin-right", marge.droite);

        // UID
        function uid(name) {
            return `${name}-${Math.random().toString(36).substr(2, 9)}`;
        }

        // Display the root.
        let group = svg.append("g")
            .call(render, root);

        function render(group, root) {
            const node = group
                .selectAll("g")
                .data(root.children.concat(root))
                .join("g");

            node.filter(d => d === root ? d.parent : d.children)
                .attr("cursor", "pointer")
                .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d));

            node.append("title")
                .text(d => `${name(d)}`);

                //\n${format(d.value)}

            node.append("rect")
                .attr("id", d => (d.leafUid = uid("leaf")))
                .attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
                .attr("stroke", "#fff");

            node.append("clipPath")
                .attr("id", d => (d.clipUid = uid("clip")))
                .append("use")
                .attr("xlink:href", d => d.leafUid.href);

            node.append("text")
                .attr("clip-path", d => d.clipUid)
                .attr("font-weight", d => d === root ? "bold" : null)
                .selectAll("tspan")
                .data(d => (d === root ? name(d) : d.data.name)
                    .split(/(?=[A-Z][^A-Z])/g)
                    .concat(format(d.value))
                )
                .join("tspan")
                .attr("x", 3)
                .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
                .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
                .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
                .text(d => d);

            group.call(position, root);
        }

        function position(group, root) {
            group.selectAll("g")
                .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
                .select("rect")
                .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
                .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
        }

        // When zooming in, draw the new nodes on top, and fade them in.
        function zoomin(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svg.append("g").call(render, d);

            x.domain([d.x0, d.x1]);
            y.domain([d.y0, d.y1]);

            svg.transition()
                .duration(750)
                .call(t => group0.transition(t).remove()
                    .call(position, d.parent))
                .call(t => group1.transition(t)
                    .attrTween("opacity", () => d3.interpolate(0, 1))
                    .call(position, d));
        }

        // When zooming out, draw the old nodes on top, and fade them out.
        function zoomout(d) {
            const group0 = group.attr("pointer-events", "none");
            const group1 = group = svg.insert("g", "*").call(render, d.parent);

            x.domain([d.parent.x0, d.parent.x1]);
            y.domain([d.parent.y0, d.parent.y1]);

            svg.transition()
                .duration(750)
                .call(t => group0.transition(t).remove()
                    .attrTween("opacity", () => d3.interpolate(1, 0))
                    .call(position, d))
                .call(t => group1.transition(t)
                    .call(position, d.parent));
        }
    }

        // Code par Observable (à vérifier)

    //#region test dl
    /*
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
    */
});     