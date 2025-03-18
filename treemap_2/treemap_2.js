// Constantes
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRC8oZQIgec7mCx7vZ540G2RjJYuns3gy3P3p45n8_pm8yqqDCWqHfVON3xswfWfHk3vLgpdP6YhbIO/pub?gid=74008056&single=true&output=csv';

// #region Menu

// Assets
const vg_icon_path = "assets/video_game.png";
const vg_color_path = "assets/vg_color.png";

const bg_icon_path = "assets/board_game.png";
const bg_color_path = "assets/bg_color.png";

const checkbox_empty = "assets/empty_checkbox.png";
const checkbox_full = "assets/full_checkbox.png";

let scenario_choisi = 'changement climatique'

let bg_icon = document.getElementById('bg-icon');
let vg_icon = document.getElementById("vg-icon");

let jds_toggle = false;
let jv_toggle = false;

// Toutes les options sont cachées par défaut
document.querySelectorAll('.checkbox-container').forEach(container =>{
    container.style.display = 'none';
});
// Bouton jeu de plateau
bg_icon.addEventListener("mouseover", function(){ bg_icon.src = bg_color_path; });
bg_icon.addEventListener("mouseleave", function(){
    if (jds_toggle === false){
        bg_icon.src = bg_icon_path;
    }
});
bg_icon.addEventListener("click", function(){
    jds_toggle = true;
    jv_toggle = false;
    vg_icon.src = vg_icon_path;
    document.getElementById('chart').innerHTML = '';
    //genereJeuDeSociete(jds_changementClimatique, contribution_choisie, marge)

    // On montre seulement les options qui ont du sens pour le JdS
    document.querySelectorAll('.checkbox-container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById('checkbox-equipement').parentElement.style.display = 'flex';
    document.getElementById('checkbox-cycle').parentElement.style.display = 'flex';
});
// Bouton jeu vidéo
vg_icon.addEventListener("mouseover", function(){ vg_icon.src = vg_color_path; });
vg_icon.addEventListener("mouseleave", function(){
    if (jv_toggle === false){
        vg_icon.src = vg_icon_path;
    }
});
vg_icon.addEventListener("click", function(){
    jds_toggle = false;
    jv_toggle = true;
    bg_icon.src = bg_icon_path;
    document.getElementById('chart').innerHTML = '';

    // Show all checkboxes for video game
    document.querySelectorAll('.checkbox-container').forEach(container => {
        container.style.display = 'flex';
    });

    //genereJeuVideo(jv_changementClimatique, jv_metaux, jv_particulesFines, contribution_choisie, scenario_choisi, marge);
});

// Boutons par scenario
let checkbox_changement_climatique = document.getElementById('checkbox-changement-climatique');
//let changement_climatique_toggle = true

let checkbox_metaux = document.getElementById('checkbox-metaux');
//let metaux_toggle = false

let checkbox_particules_fines = document.getElementById('checkbox-particules-fines');
//let particules_fines_toggle = false

function clickCheckbox(checkbox){
    document.getElementById('chart').innerHTML = '';
    checkbox.src = checkbox_full;
    switch (checkbox.id){
        case 'checkbox-changement-climatique':
            checkbox_metaux.src = checkbox_empty
            checkbox_particules_fines.src = checkbox_empty
            return 'changement climatique'
        case 'checkbox-metaux':
            checkbox_changement_climatique.src = checkbox_empty
            checkbox_particules_fines.src = checkbox_empty
            return 'metaux'
        case 'checkbox-particules-fines':
            checkbox_changement_climatique.src = checkbox_empty
            checkbox_metaux.src = checkbox_empty
            return 'particules fines'
    }
}
checkbox_changement_climatique.addEventListener("click", () => {
    scenario_choisi = clickCheckbox(checkbox_changement_climatique)
    if (jv_toggle){
        //genereJeuVideo(jv_changementClimatique, jv_metaux, jv_particulesFines, contribution_choisie, scenario_choisi, marge)
    } else if (jds_toggle){
        //genereJeuDeSociete(jds_changementClimatique, contribution_choisie, marge)
    }
})
checkbox_metaux.addEventListener("click", () => {
    scenario_choisi = clickCheckbox(checkbox_metaux)
    if (jv_toggle){
        //genereJeuVideo(jv_changementClimatique, jv_metaux, jv_particulesFines, contribution_choisie, scenario_choisi, marge)
    } else if (jds_toggle){
        //genereJeuDeSociete(jds_changementClimatique, contribution_choisie, marge)
    }
})
checkbox_particules_fines.addEventListener("click", () => {
    scenario_choisi = clickCheckbox(checkbox_particules_fines)
    if (jv_toggle){
        //genereJeuVideo(jv_changementClimatique, jv_metaux, jv_particulesFines, contribution_choisie, scenario_choisi, marge)
    } else if (jds_toggle){
        //genereJeuDeSociete(jds_changementClimatique, contribution_choisie, marge)
    }
})
// Checkboxes pour la contribution
let checkbox_equipement = document.getElementById('checkbox-equipement');
let equipement_toggle = true;

let checkbox_cycle = document.getElementById('checkbox-cycle');
let cycle_toggle = false;

let contribution_choisie = "par équipement";

checkbox_equipement.addEventListener("click", function(){
    document.getElementById('chart').innerHTML = '';
    contribution_choisie = "par équipement";
    equipement_toggle = true;
    checkbox_equipement.src = checkbox_full;
    if (cycle_toggle){
        checkbox_cycle.src = checkbox_empty;
        cycle_toggle = false;
    }
    if (jv_toggle){
        //genereJeuVideo(jv_changementClimatique, jv_metaux, jv_particulesFines, contribution_choisie, scenario_choisi, marge)
    } else if (jds_toggle){
        //genereJeuDeSociete(jds_changementClimatique, contribution_choisie, marge)
    }
});

$.get(csvUrl, function(csvText) {
    // Parse CSV using PapaParse.
    const parsed = Papa.parse(csvText, { header: true });
    const allData = parsed.data;    

    const jv_data = allData.filter(d => d.treemap === "Jeu vidéo");
    const jds_data = allData.filter(d => d.treemap === "Jeu de société");

    // Données jeux vidéo
    const jv_changementClimatique = jv_data.filter(d => d.scenario === "Changement climatique");
    const jv_metaux = jv_data.filter(d => d.scenario === "Ressources minérales et métalliques");
    const jv_particulesFines = jv_data.filter(d => d.scenario === "Particules fines");

    //Données jeux de société
    const jds_changementClimatique = jds_data.filter(d => d.scenario === "Changement climatique");
    const jds_metaux = jds_data.filter(d => d.scenario === "Ressources minérales et métalliques");
    const jds_particulesFines = jds_data.filter(d => d.scenario === "Particules fines");

    // Conversion des données
    let convertedData = conversionDonnees(jv_changementClimatique, `Changement climatique - ${contribution_choisie}`);

    function conversionDonnees(data, title) {
        let root = { name: title, path: title, children: [] };
        
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

    document.getElementById('downloadBtn').addEventListener('click', function() {
        // Ensure converted data exists
        if (!convertedData) {
            alert("Data is not ready yet. Please wait for it to load.");
            return;
        }
    
        // Convert JSON object to a formatted string
        let dataStr = JSON.stringify(convertedData, null, 2);
        let blob = new Blob([dataStr], { type: "application/json" });
    
        // Create a temporary anchor element for download
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = "convertedData.json";
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    //generate treemap
    var container = document.getElementById('container');
    var myChart = echarts.init(container);

// Build the treemap using the converted data.
myChart.setOption({
  title: {
    text: 'Treemap Visualization',
    left: 'center'
  },
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

// Optional: Handle window resize.
window.addEventListener('resize', myChart.resize);

});