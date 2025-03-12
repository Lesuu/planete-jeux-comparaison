export function createBarChart(langue){
    // Données du bar chart
    const data = [
        { label: "1 ordinateur portable",    carbon: 193,  impact: 48.47 },
        { label: "Manger un steak de boeuf",           carbon: 130,  impact: 32.65 },
        { label: "1 téléphone",                carbon: 85.9, impact: 21.57 },
        { label: "22 heures de jeu de société expert",   carbon: 4.08, impact: 1.02 },
        { label: "22 heures de jeu vidéo sur console",    carbon: 3.982, impact: 1 },
    ];
    let done = false
    // Constantes pour les positions/échelles du bar chart
    const barScale = 2;
    const baseLineY = 700;
    const baseLineX = 500;
    const barWidth = 80;
    let bars = []
    let tweens = []

    // On itère à travers les données pour créer les barres
    data.forEach((d, i) =>{
        const barHeight = d.carbon * barScale;
        const xPos = baseLineX + i * (barWidth + 150);
        const yPos = baseLineY;

        let bar = add([
            rect(barWidth, 0),
            pos(xPos, yPos),
            anchor("bot"),
            outline(2, rgb(56, 71, 74)),
            area()
        ]);

        // Animation de la barre qui se construit
        let barTween = tween(
            bar.height,
            barHeight,
            1.5,
            (val) => {
                bar.height = val
            },
            easings.easeInOutQuad
        )

        tweens.push(barTween)

        // Ajout du label de la barre & son ombre
        let shadow = add([
            text(d.label, {
                font: "pixel",
                size: 36,
                width : 200,
                align : "center"
            }),
            pos(xPos + 4, baseLineY + 10 + 3),
            anchor("top"),
            color(0,0,0),
            opacity(0.4)
        ])
        shadow.add([
            text(d.label, {
                font: "pixel",
                size: 36,
                width : 200,
                align : "center"
            }),
            pos(-4, -3),
            anchor("top")
        ])
        // On ajoute les barres dans un tableau pour les modifier plus tard
        bars.push({bars: bar, text: shadow})
    });
    let terminer_label
    let continue_label
    switch(langue){
        case "fr": 
            terminer_label = "TERMINER";
            continue_label = "Appuie pour continuer"
            break;
        case "eng": 
            terminer_label = "END"; 
            continue_label = "Press to continue"
            break;
    }
    // Prompt pour continuer
    let continue_prompt = add([
        text(continue_label, {
            font: "pixelthin",
            size: 54,
            width: 1070,
            align: "center",
            transform: (idx, ch) => ({
                pos: vec2(0, wave(-1, 1, time() * 3 + idx * 0.5)),
                angle: wave(-2, 2, time() * 3 + idx),
            }),
        }),
        pos(960, baseLineY + 200),
        color(150, 200, 150),
        z(110),
        anchor("center"),
        opacity(1),
    ])
    // Quand l'utilisateur clique, on rajoute la dernière barre (même logique)
    onClick(()=>{
        if (done) return
        done = true
        continue_prompt.destroy()
        tweens.forEach(tween => tween.finish());
        const finalData = { label: "1 aller-retour Genève-New York en avion", carbon: 1770, impact: 444.5 }
        // On recalcule la taille des barres existantes
        bars.forEach(({bars, text}) => { 
            tween(
                bars.height,
                bars.height * 0.1,
                1.5,
                (val) => {
                    bars.height = val
                },
                easings.easeInOutQuad
            )
            tween(
                bars.pos.x,
                bars.pos.x + (barWidth + 35),
                1.5,
                (val) => {
                    bars.pos.x = val
                    text.pos.x = val
                },
                easings.easeInOutQuad
            )
        })
        // On ajoute la barre finale
        wait(1.5, () => {
            let finalBar = add([
                rect(barWidth, 0),
                pos(385, baseLineY),
                anchor("bot"),
                outline(2, rgb(56, 71, 74))
            ]);
            tween(
                finalBar.height,
                finalData.carbon * 0.2,
                1.5,
                (val) => {
                    finalBar.height = val
                },
                easings.easeInOutQuad
            )
            let finalShadow = add([
                text(finalData.label, {
                    font: "pixel",
                    size: 36,
                    width : 200,
                    align : "center"
                }),
                pos(finalBar.pos.x + 4, baseLineY + 10 + 3),
                anchor("top"),
                color(25,82,64),
                opacity(0)
            ])
            let finalBarLabel = finalShadow.add([
                text(finalData.label, {
                    font: "pixel",
                    size: 36,
                    width : 200,
                    align : "center"
                }),
                pos(-4, -3),
                anchor("top"),
                opacity(0)
            ])
            tween(
                finalShadow.opacity,
                1,
                0.5,
                (val) => {
                    finalShadow.opacity = val 
                    finalBarLabel.opacity = val 
                },
                easings.easeInQuad
            )
            console.log(terminer_label)
            let suivant_bouton = add([
                sprite("button"),
                pos(width()/2, height()/1.1),
                scale(3.5),  
                anchor("center"),
                area(),
            ])
            let fin = add([
                text(terminer_label,{
                    font: "pixel",
                    size: 54,
                    align: "center",
                    letterSpacing : 6
                }),
                pos(suivant_bouton.pos),
                anchor("center"),
                z(20),
                "results_element"
            ])
    
            let fin_shadow = add([
                text(terminer_label,{
                    font: "pixel",
                    size: 54,
                    align: "center",
                    letterSpacing : 6
                }),
                color(93, 27, 27),
                pos(suivant_bouton.pos.x + 5, suivant_bouton.pos.y + 5),
                anchor("center"),
                "results_element"
            ])
    
            suivant_bouton.onClick(()=>{
                go("titleScreen")
            })
        })
    })
}
