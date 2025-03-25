export function callBetty() {
    destroyAll("betty")
    let backgroundRectangle = add([
        rect(width(), height()),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0.4),
        "betty"
    ])
    let betty = add([
        sprite("betty", {anim : "idle_active"}),
        pos(1990, 800),
        scale(4),
        area(),
        anchor("bot"),
        rotate(0),
        "betty"
    ])
    let quest_marker = betty.add([
        sprite("quest"),
        pos(0, -40),
        anchor("bot"),
        "betty"
    ])
    betty.onClick(() => {
        quest_marker.destroy()
        tween(
            betty.pos.x,
            betty.pos.x - 90,
            1,
            (val) => {
                betty.pos.x = val
            },
            easings.easeInOutQuad
        )
        tween(
            betty.angle,
            betty.angle + 20,
            0.5,
            (val) => {
                betty.angle = val
            },
            easings.easeInOutQuad
        )
        bettyExplication()   
    })
    betty.flipX = true
    wait(0.5, () => {
        tween(
            betty.pos.x,
            betty.pos.x - 60,
            1,
            (val) => {
                betty.pos.x = val
            },
            easings.easeInOutQuad
        )
        tween(
            betty.angle,
            betty.angle - 20,
            1,
            (val) => {
                betty.angle = val
            },
            easings.easeInOutQuad
        )
    })
}

function bettyExplication(){
    let bulle = add([])
}