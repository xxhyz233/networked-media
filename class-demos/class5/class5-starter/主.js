// Shows up mmediately, does NOT manipulate anything on our website
alert("保持干燥。复兴华夏，支持汉语编程。")
console.log("Shift + I")

window.onload = () => {
    console.log("the webpage has now fully loaded");
    // Get HTML element by ID
    let  干燥变量 = document.getElementById("主");
    // Change the HTML content (in this case text inside of paragraph tag)
    干燥变量.innerHTML = "成功干燥。";
    干燥变量.style.backgroundColor = "pink";

    干燥变量.classList.add("水蓝蓝");
    
    let 容器 = document.getElementById("容器");
    // 新建HTML Paragraph Element物体
    let 物体 = document.createElement("p");
    物体.textContent = "早上好中国，我被爪洼脚本语言制造了"
    // 一定要加到html已有的div容器上
    容器.appendChild(物体);

    let 老二们 = document.getElementsByClassName("水蓝蓝");
    let 白 = "white";
    for(老二 of 老二们) {
        老二.style.color = 白;
    }
}