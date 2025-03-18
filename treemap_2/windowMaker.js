//#region Main Window   
// Création de la fenêtre windows
export function createWindow(){
    let windowsBar = add([
        rect(width(), 60),
        pos(0,0),
        color(180, 180, 180),
        stay(),
        "window"
    ])
    windowsBar.add([
        rect(width()- 10, 50),
        pos(5, 5),
        color(0, 0, 255),
        "window"
    ])
    windowsBar.add([
        text("treemap.exe", {
            font: "pixel",
            size: 36
        }),
        pos(15, 9),
        stay(),
        "window"
    ])
    windowsBar.add([
        rect(5, height()),
        color(180,180,180),
        stay(),
        "window"
    ])
    windowsBar.add([
        rect(5, height()),
        pos(width() - 5, 0),
        color(180,180,180),
        stay(),
        "window"
    ])
    windowsBar.add([
        rect(width(), 5),
        pos(0, height()-5),
        color(180,180,180),
        stay(),
        "window"
    ])
}
//#endregion

//#region Treemap
export function windowsTreemapContainer(){
    let treemapWindow = add([
        rect(1700, 30),
        pos(200, 200),
        color(180, 180, 180),
        stay(),
        "window"
    ])
    treemapWindow.add([
        rect(1693, 24),
        pos(3, 3),
        color(0, 0, 255),
    ])
    treemapWindow.add([
        text("treemap.exe", {
            font: "pixel",
            size: 18
        }),
        pos(10, 5),
        stay()
    ])
    treemapWindow.add([
        rect(3, 860),
        color(180,180,180),
        stay()
    ])
    treemapWindow.add([
        rect(3, 860),
        pos(1697, 0),
        color(180,180,180),
        stay()
    ])
    treemapWindow.add([
        rect(1700, 3),
        pos(0, 860),
        color(180,180,180),
        stay()
    ])
}
//#endregion
// Fonction pour restart
export function windowButtons(restart, eng, fr){
    restart.onClick(()=>{
        location.reload()
    })
    eng.onClick(()=>{
        langue = "eng"
    })
    fr  .onClick(()=>{
        langue = "fr"
    })
}
//#region Buttons