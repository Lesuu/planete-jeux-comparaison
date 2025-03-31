import { currentTreemapExplanation } from "./global.js"

let bettyEngaged = false
let betty
let quest_marker
let backgroundRectangle
let timer = 0.5
let betty_highlight
let bettyPeaking = false
let nothingToSay = false
let curTween;
let canJump = false

export function initializeBetty() {
    bettyEngaged = false;
    bettyPeaking = false;
    nothingToSay = false;
    timer = 0.5;
}

function createTreemapOverlay() {
    let treemapOverlay = document.createElement("div");
    treemapOverlay.id = "treemapOverlay";
    treemapOverlay.style.position = "absolute";
    treemapOverlay.style.top = "100px";
    treemapOverlay.style.left = "387px";
    treemapOverlay.style.right = "220px";
    treemapOverlay.style.bottom = "5px";
    treemapOverlay.style.width = "1507px";
    treemapOverlay.style.height = "730px";
    treemapOverlay.style.display = "flex";
    treemapOverlay.style.justifyContent = "center";
    treemapOverlay.style.alignItems = "center";
    treemapOverlay.style.zIndex = "20"; 
    treemapOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    treemapContainer.style.pointerEvents = "none"
    document.body.appendChild(treemapOverlay);

    return treemapOverlay
}

export function callBetty() {
    let treemapContainer = document.getElementById("treemapContainer")
    let isTalking = false
    if (currentTreemapExplanation == ""){
        nothingToSay = true
    } else{
        nothingToSay = false
    }
    if (nothingToSay) return
    bettyAppears()
    betty.onClick(() => {
        if (isTalking||nothingToSay)return
        if (!bettyEngaged){
            betty_highlight.opacity = 0
            tween(
                betty.pos.x,
                betty.pos.x - 90,
                0.5,
                (val) => {
                    betty.pos.x = val
                    // betty_highlight.pos.x = val
                },
                easings.easeInOutQuad
            )
            wait(() => console.log(betty.pos))
            if (curTween) {
                curTween.cancel(); 
                betty.angle = -20;
            };
            curTween = tween(
                betty.angle,
                betty.angle + 20,
                0.3,
                (val) => {
                    betty.angle = val
                    // betty_highlight.angle = val
                },
                easings.easeInOutQuad
            )
            bettyEngaged = true
            timer = 0
        }
        quest_marker.opacity = 0
        backgroundRectangle.opacity = 0.5
        let treemapOverlay = createTreemapOverlay()
        isTalking = true
        wait(timer, () => {
            bettyExplication(betty) 
        })  
    })
    document.addEventListener('mousedown', function onClicked(){
        if (!isTalking) return
        if (speechBubble){
            speechBubble.remove()
        }
        betty.play("idle")
        betty_highlight.play("white")
        document.getElementById("treemapOverlay").remove()
        backgroundRectangle.opacity = 0
        //document.removeEventListener('mousedown', onClicked)
        treemapContainer.style.pointerEvents = "auto"
        wait(0.1, () => {
            isTalking = false
        })
    })
    
}

function bettyAppears(){
    if (bettyEngaged || bettyPeaking) {
        quest_marker.opacity = 1;  
        betty.play("idle_active"); 
        betty_highlight.opacity = 1;
        setGravity(1200);
        if (canJump){
            betty.jump(400);
            canJump = false;
        }
        if (betty_highlight){
            betty_highlight.play("white");
        }; 
        return;
    };
    destroyAll("betty")
    bettyPeaking = true
    backgroundRectangle = add([
        rect(width(), height()),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0),
        z(1),
        "betty"
    ])
    betty = add([
        sprite("betty", {anim : "idle_active"}),
        pos(1990, 1020),
        scale(4),
        area(),
        anchor("bot"),
        rotate(0),
        move(0),
        body(),
        z(2),
        "betty"
    ])
    betty.flipX = true
    let betty_platform = add([
        rect(width(), 10),
        pos(0, 1040),
        area(),
        opacity(0),
        body({isStatic: true}),
        "platform"
    ])
    quest_marker = betty.add([
        sprite("quest"),
        pos(0, -45),
        anchor("bot"),
        opacity(1),
        "betty"
    ])
    betty_highlight = add([
        sprite("betty", {anim : "white"}),
        pos(betty.pos.x, betty.pos.y + 5),
        scale(4.3),
        anchor("bot"),
        z(-5),
        color(255, 255, 0),
        opacity(1),
        "betty"
    ])
    onUpdate(() => {
        betty_highlight.pos = vec2(betty.pos.x, betty.pos.y + 5);
        betty_highlight.angle = betty.angle;
    });
    betty.onCollide("platform", () => {
        console.log("collide")
        canJump = true;
    });
    betty_highlight.flipX = true
    wait(0.5, () => {
        tween(
            betty.pos.x,
            betty.pos.x - 60,
            1,
            (val) => {
                betty.pos.x = val
                // betty_highlight.pos.x = val
            },
            easings.easeInOutQuad
        )
        console.log(betty.angle)

        curTween = tween(
            betty.angle,
            betty.angle - 20,
            1,
            (val) => {
                betty.angle = val
                // betty_highlight.angle = val
            },
            easings.easeInOutQuad
        )
    })
}

async function bettyExplication(betty){
    betty.play("talk")
    betty_highlight.opacity = 0
    // Création de la bulle
    let speechBubble = document.createElement("div")
    speechBubble.id = "speechBubble"
    await document.body.appendChild(speechBubble)

    // Création du paragraphe
    let speechText = document.createElement("p")
    speechText.id = "speechText"
    speechText.innerHTML = currentTreemapExplanation
    speechBubble.appendChild(speechText)
}