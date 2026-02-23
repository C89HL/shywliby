// 获取当前文件名
let currentFile = window.location.pathname.split('/').pop();
console.log('当前文件:', currentFile);

// 换成txt文件名
let textFile = currentFile.replace('.html', '.txt');
console.log('要读取的txt:', textFile);

// 读取txt
fetch(textFile)
    .then(response => {
        console.log('响应状态:', response.status);
        return response.text();
    })
    .then(content => {
        console.log('获取到的内容长度:', content.length);
        
        // 按换行分割成数组
        let paragraphs = content.split('\n');
        
        // 去掉空行，每段包上<p>标签
        let htmlContent = paragraphs
            .filter(p => p.trim() !== '')  // 去掉空行
            .map(p => `<p>${p}</p>`)       // 每段加<p>
            .join('');                       // 合并成字符串
        
        // 用innerHTML插入带<p>标签的内容
        let div = document.getElementById('content');
        div.innerHTML = htmlContent;
    })
    .catch(error => {
        console.error('错误:', error);
        document.getElementById('content').innerText = '加载失败: ' + error;
    });
   