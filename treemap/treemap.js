d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?output=csv").then(function(data){

    // #region Data processing
   

    // Séparation des données : chaque dataset correspond à un treemap
    const jv_data = data.filter(d => d.treemap === "Jeu vidéo");
    const jds_data = data.filter(d => d.treemap === "Jeu de société");

    const jv_changementClimatique = jv_data.filter (d => d.scenario === "Changement climatique");
    const jv_metaux = jv_data.filter (d=> d.scenario === "Ressources minérales et métalliques");
    
    const jds_changementClimatique = jds_data.filter (d=> d.scenario === "Changement climatique");

    // Conversion des données de CSV à JSON, hierarchisées
    function conversionDonnees(data, title) {
        let root = {name: title, children: []};
        
        // On progresse à travers les différents étages
        data.forEach(row => {
            let levels = ["etage_1", "etage_2", "etage_3"];
            let value = row.case;

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

    const background_color = getComputedStyle(document.body).backgroundColor;

    // Exécution de la fonction pour les données du jeu vidéo
    let jv_data_changement_climatique = conversionDonnees(jv_changementClimatique, "Changement climatique");
    let jv_data_metaux = conversionDonnees(jv_metaux, "Ressources minérales et métalliques");

    // Exécution de la fonction pour les données du jeu de société
    let jds_data_changement_climatique = conversionDonnees(jds_changementClimatique, "Changement climatique");
    // Dimensions

    const marge = {
        haute : "60px",
        basse : "20px",
        droite : "50px",
        gauche : "20px"
    };

    let bg_icon = document.getElementById('bg-icon');
    let vg_icon = document.getElementById("vg-icon");

    let bg_toggle = false;
    let vg_toggle = false;
    // Bouton jeu de plateau
    bg_icon.addEventListener("mouseover", function(){bg_icon.src = "assets/bg_color.png"})
    bg_icon.addEventListener("mouseleave", function(){
        if (bg_toggle === false){
            bg_icon.src = "assets/board_game.png";
        };
    });
    bg_icon.addEventListener("click",function(){
        // Fonction pour créer les treemaps. On donne le dataset, la largeur, la hauteur
        // Ainsi que la marge qui sépare les éléments entre eux
        bg_toggle = true;
        vg_toggle = false;
        vg_icon.src = "assets/video_game.png";
        document.getElementById('chart').innerHTML = '';
        buildTreemap(jds_data_changement_climatique, 1000, 600, marge);
    });


    // Bouton jeu vidéo
    vg_icon.addEventListener("mouseover", function(){vg_icon.src = "assets/vg_color.png"});
    vg_icon.addEventListener("mouseleave", function(){
        if (vg_toggle === false){
            vg_icon.src = "assets/video_game.png"
        };
    })
    vg_icon.addEventListener("click",function(){
        // Fonction pour créer les treemaps. On donne le dataset, la largeur, la hauteur
        // Ainsi que la marge qui sépare les éléments entre eux
        bg_toggle = false
        vg_toggle = true
        bg_icon.src = "assets/board_game.png"
        document.getElementById('chart').innerHTML = ''
        buildTreemap(jv_data_changement_climatique, 600, 600, marge)
        buildTreemap(jv_data_metaux, 600, 600, marge)
    });



    //#region Treemaps
    function buildTreemap(data, width, height, marge){
        // Adapte la fonction de tiling binaire de d3 pour correspondre à 
        // l'aspect ration correct quand le treemap est zoomé.
        function tile(node, x0, y0, x1, y1) {
            d3.treemapBinary(node, 0, 0, width, height);
            for (const child of node.children) {
                child.x0 = x0 + child.x0 / width * (x1 - x0);
                child.x1 = x0 + child.x1 / width * (x1 - x0);
                child.y0 = y0 + child.y0 / height * (y1 - y0);
                child.y1 = y0 + child.y1 / height * (y1 - y0);
            }
        }

        // Hierarchisation des données
        const hierarchy = d3.hierarchy(data)
            .sum(d => d.value)
        // Tri par grandeur (pas utilisé)   
        //    .sort((a, b) => b.value - a.value);
        // Tri par ordre alphabétique
            .sort((a, b) => a.data.name.localeCompare(b.data.name))
        const root = d3.treemap().tile(tile)(hierarchy);

        // Create the scales.
        const x = d3.scaleLinear().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([0, height]);

        // Formatage
        // Calcule le nom du root (Root/Category/Subcategory)
        const name = d => d.ancestors().reverse().map(d => d.data.name).join("/");

        // Création du SVG
        const svg = d3.select("#chart")
            .append("svg")
            .attr("viewBox", [0.5, -30.5, width, height + 30])
            .attr("width", width)
            .attr("height", height + 30 )
            .attr("style", "max-width: 100%; height: auto;")
            .style("font", "10px sans-serif")
            .style("margin-right", marge.droite);



        // UID: fonction qui crée un unique ID pour plus tard l'assigner à chaque rectangle
        // (Pas sur de complètement comprendre ce que ça fait)
        function uid(name) {
            return `${name}-${Math.random().toString(36).slice(2, 11)}`;
        }

        // Afficher le Root, en haut du treemap.
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

            // Défini le titre de la node (quand on hover avec la souris)
            node.append("title")
                .text(d => `${name(d)}`);

            // Défini les rectangles
            node.append("rect")
                // Attribue un ID unique à chaque node
                .attr("id", d => (d.leafUid = uid("leaf")))
                // Défini les couleurs: Si c'est le root, couleur 1. 
                // Si c'est un parent, couleur 2. 
                // Si le child n'a plus de children (leaf node), couleur 3.
                .attr("fill", d => d === root ? " #077107 " : d.children ? "#AA2B2B" : "#BB7171")
                // Couleur de fond (entre les nodes)
                .attr("stroke", background_color);

            // Empèche le text de dépasser son rectangle
            node.append("clipPath")
                // Attribution d'un UID pour chaque clipPath (qui contient le texte)
                .attr("id", d => (d.clipUid = uid("clip")))
                .append("use")
                // Se rattache à l'UID de la node défini plus haut
                .attr("xlink:href", d => d.leafUid);

            const textElements = node.append("text")
                    // On ajoute le texte dans le clipPath défini juste avant
                    .attr("clip-path", d => d.clipUid)
                    // Le root est en gras
                    .attr("font-weight", d => d === root ? "bold" : null)
                    .attr("x", 3)
                    .attr("y", 12)
                    .text(d => d === root ? name(d) : d.data.name);

            // Add "↩" symbol below the root node's title
            node.filter(d => d === root && d.parent)
                .append("text")
                .attr("x", 3)
                .attr("y", 25)
                .text("↩")
            
            // Fonction textwrap (de d3-textwrap), censé wrap le texte naus ça cause des problèmes
            textElements.each(function (d) {
                let nodeWidth
                let nodeHeight

                // Si c'est le root, on lui donne toute la largeur du treemap
                if (d === root){
                    nodeWidth = width; 
                    nodeHeight = 1000;
                } else {
                    nodeWidth = Math.max(x(d.x1) - x(d.x0) - 6, 10);
                    nodeHeight = Math.max(y(d.y1) - y(d.y0) - 6, 10)
                }
                d3.select(this).call(d3.textwrap().bounds({
                    width: Math.max(nodeWidth - 6, 5), 
                    height: Math.max(nodeHeight - 6, 5) 
                }).method("tspans"));
            });

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
            
            // On recalcule le textwrap.
            // Sinon, il calcule avec les tailles des nodes minuscules du début de l'animation
            group1.selectAll("text")
            .each(function(d) {
                const nodeWidth = x(d.x1) - x(d.x0);
                const nodeHeight = y(d.y1) - y(d.y0);
                
                d3.select(this).call(d3.textwrap().bounds({
                    width: Math.max(nodeWidth - 6, 10),
                    height: Math.max(nodeHeight - 6, 10)
                }).method("tspans"));
            });
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

            // On recalcule le textwrap pour qu'il wrap correctement pendant un dézoom.
            group1.selectAll("text")
            .each(function(d) {
                const nodeWidth = x(d.x1) - x(d.x0);
                const nodeHeight = y(d.y1) - y(d.y0);
                
                d3.select(this).call(d3.textwrap().bounds({
                    width: Math.max(nodeWidth - 6, 10),
                    height: Math.max(nodeHeight - 6, 10)
                }).method("tspans"));
            });

        }
    }
    // Code original: https://observablehq.com/@d3/zoomable-treemap par Mike Bostock
});     