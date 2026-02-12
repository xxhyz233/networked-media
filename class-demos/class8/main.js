let angle = 0;
let angleVelocity = 0;
let angleAcceleration = .05;

window.onload = () => {
    let rot = document.getElementById("rotate");

    // Rotate rot by 45 degree every 1 sec
    setInterval( () => {
        // acceleration & deceleration
        // console.log(angleVelocity)
        if (angleVelocity > 20) {
            angleAcceleration = -angleAcceleration;
        }
        else if (angleVelocity <= -20 && angleAcceleration < 0) {
            angleAcceleration = -angleAcceleration;
        }
        
        angleVelocity = angleVelocity + angleAcceleration;
        angle = angle + angleVelocity;
        
        // Plug in variable to Strings dynamically with backticks ``
        rot.style.transform = `rotate(${angle}deg)`
    }, 50/3);

    document.body.addEventListener("click", ()=>{
        // console.log("webpage clicked");
    })

    let btn = document.getElementById("button");
    // CSS style change on button click
    btn.addEventListener("click", () => {
        // if (btn.classList.contains('clicked')){
        //     btn.classList.remove('clicked');
        // }
        // else {
        //     btn.classList.add('clicked');
        // }
        // Short hand for the above control flow
        btn.classList.toggle("clicked")
    })
}



