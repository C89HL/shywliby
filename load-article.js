// 获取当前网页的文件名
let currentFile = window.location.pathname.split('/').pop();

// 把 .html 换成 .txt
let textFile = currentFile.replace('.html', '.txt');

// 读取对应的txt文件
fetch(textFile)
    .then(response => response.text())
    .then(content => {
        // 找到id为"content"的元素
        let contentDiv = document.getElementById('content');
        if (contentDiv) {
            contentDiv.innerText = content;
        }
    })
    .catch(error => {
        console.log('文章加载失败:', error);
    });