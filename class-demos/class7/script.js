window.onload = () => {
    let newSpan = document.createElement("span");

    newSpan.classList.add("text-body");
    newSpan.innerHTML = "this is a new span";
    document.body.appendChild(newSpan);
    
    // Updating clock every 1 second
    let oneSpan = document.getElementsByClassName("text-body");
    setInterval(()=>{
        let date = new Date();
        oneSpan[0].innerHTML = date.toLocaleTimeString();
        console.log("Happens");
    }, 1000)
}