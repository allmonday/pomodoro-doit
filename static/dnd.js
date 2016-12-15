window.addEventListener('load', onLoadFn)

function onLoadFn() {
    console.log("loda'")
    var clock = document.querySelector('#clock');
    var icon = new Image();
    icon.src = "/cat.jpg";

    function displayTime() {
        var now = new Date();
        var hrs = now.getHours(),
            mins = now.getMinutes();
        if (mins < 10) mins = "0" + mins;
        clock.innerHTML = hrs + ":" + mins;
        setTimeout(displayTime, 60000);
    }
    displayTime();

    clock.draggable = true;

    clock.ondragstart = function (event) {
        var event = event || window.event;
        var dt = event.dataTransfer;
        // dt.setData('text', Date() + "\n");
        dt.setData('text/html', "hello <a>welcome</a>");
        if (dt.setDragImage) dt.setDragImage(icon, 0, 0);
    };
}
