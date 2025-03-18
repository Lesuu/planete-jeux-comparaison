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