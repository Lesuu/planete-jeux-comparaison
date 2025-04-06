import { getTranslation, langue } from "./main.js"

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
        color(39, 0, 216),
        stay(),
        "window"
    ])
    windowsBar.add([
        text("data.exe", {
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
    // Top
    let treemapWindow = add([
        rect(1510, 30),
        pos(384, 70),
        color(180, 180, 180),
        stay(),
        "window"
    ])
    // Ligne bleue
    treemapWindow.add([
        rect(1507, 24),
        pos(3, 3),
        color(39, 0, 216),
    ])
    // Caption
    treemapWindow.add([
        text("treemap.exe", {
            font: "pixel",
            size: 18
        }),
        pos(10, 5),
        stay()
    ])
    // Left
    treemapWindow.add([
        rect(3, 760),
        color(180,180,180),
        stay()
    ])
    // Right
    treemapWindow.add([
        rect(3, 760),
        pos(1510, 0),
        color(180,180,180),
        stay()
    ])
    // Bottom
    treemapWindow.add([
        rect(1513, 3),
        pos(0, 760),
        color(180,180,180),
        stay()
    ])
}
//#endregion