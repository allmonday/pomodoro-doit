function main() {
    var b = document.createElement('button');
    b.innerHTML = "click";
    b.onclick = function () {
        console.log('clicked');
    }

    var inner = document.getElementById('inner');
    inner.appendChild(b);
}

window.onload = main;