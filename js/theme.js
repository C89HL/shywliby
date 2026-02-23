// 检查本地存储的主题设置
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// 切换主题函数
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    // 保存当前主题
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

// 监听开关点击
document.getElementById('themeSwitch')?.addEventListener('click', toggleTheme);

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {  // 如果用户没有手动设置
        if (e.matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
});