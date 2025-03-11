export function createBarChart(){
    const data = [
        { label: "Genève-New York en avion", carbon: 1770, impact: 444.5 },
        { label: "ordinateur portable",    carbon: 193,  impact: 48.47 },
        { label: "steak de boeuf",           carbon: 130,  impact: 32.65 },
        { label: "téléphone",                carbon: 85.9, impact: 21.57 },
        { label: "jeu de société expert",   carbon: 4.08, impact: 1.02 },
        { label: "jeu vidéo sur console",    carbon: 3.982, impact: 1 }
    ];
    const barScale = 0.2;
    const baseLineY = 700;
    const baseLineX = 700
    const barWidth = 50;

    data.forEach((d, i) =>{
        const barHeight = d.carbon * barScale;
        const xPos = baseLineX + i * (barWidth + 100);
        const yPos = baseLineY - barHeight;

        let bar = add([
            rect(barWidth, 0),
            pos(xPos, yPos)
        ])

        tween(
            bar.height,
            vec2(barWidth, barHeight),
            1.5,
            (val) => {
                bar.height = val
            },
            easings.easeInQuad
        )

        add([
            text(d.label, {
                font: "pixel",
                size: 36
            }),
            pos(xPos + barWidth / 2, baseLineY + 10),
            anchor("center")
        ])
    });
}
