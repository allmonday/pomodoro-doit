function count() {
    postMessage(new Date());
    setTimeout(count, 1000);
}

count();