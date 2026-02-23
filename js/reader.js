// ========== 阅读器核心模块 ==========

// 全局变量
let BOOKS = {};
let currentBook = null;
let currentChapterIndex = 0;
let fontSize = 16;

// ========== DOM 元素 ==========
const chapterList = document.getElementById('chapterList');
const chapterTitle = document.getElementById('chapterTitle');
const contentDiv = document.getElementById('content');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const prevBtn = document.getElementById('prevChapterBtn');
const nextBtn = document.getElementById('nextChapterBtn');
const chapterIndicator = document.getElementById('chapterIndicator');
const themeToggle = document.getElementById('themeToggleReader');
const mobileSelect = document.getElementById('mobileChapterDropdown');

// ========== 初始化 ==========
async function init() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const bookParam = urlParams.get('book');
    
    // 先加载小说数据
    await loadBooks();
    updateAuthorLink(); 
    
    // 读取保存的设置
    loadSettings();
    
    // 根据参数选择小说
    const bookNames = Object.keys(BOOKS);
    if (bookParam && BOOKS[bookParam]) {
        currentBook = bookParam;
    } else if (bookNames.length > 0) {
        currentBook = bookNames[0];
    }
    //更新作者主页链接
     updateAuthorLink();
    if (currentBook) {
        updateBookTitle();
        renderChapterList();
        if (BOOKS[currentBook].chapters.length > 0) {
            loadChapter(0);
        }
    }
    
    // 绑定事件
    bindEvents();
    updateThemeIcon();
}

// ========== 加载小说数据 ==========
async function loadBooks() {
    try {
        const response = await fetch('../js/books.json');
        BOOKS = await response.json();
    } catch (error) {
        console.error('加载小说列表失败:', error);
        if (contentDiv) {
            contentDiv.innerHTML = '<p style="color:red;">加载小说列表失败，请刷新重试</p>';
        }
    }
}

// ========== 更新作者主页链接 ==========
function updateAuthorLink() {
    const authorLink = document.getElementById('authorHomeLink');
    if (authorLink && currentBook && BOOKS[currentBook]?.authorPage) {
        authorLink.href = BOOKS[currentBook].authorPage;
    }
}

// ========== 加载设置 ==========
function loadSettings() {
    // 字体大小
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        fontSize = parseInt(savedFontSize);
        document.body.style.fontSize = fontSize + 'px';
        if (fontSizeDisplay) fontSizeDisplay.textContent = fontSize + 'px';
    }
    
    // 主题
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// ========== 渲染章节列表 ==========
function renderChapterList() {
    if (!chapterList || !currentBook) return;
    
    const chapters = BOOKS[currentBook].chapters;
    chapterList.innerHTML = '';
    
    // 电脑端侧边栏列表
    chapters.forEach((ch, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = ch.title;
        a.className = 'chapter-link';
        a.addEventListener('click', (e) => {
            e.preventDefault();
            currentChapterIndex = index;
            loadChapter(index);
        });
        li.appendChild(a);
        chapterList.appendChild(li);
    });
    
    // 手机端下拉框
    if (mobileSelect) {
        mobileSelect.innerHTML = '<option value="">请选择章节</option>';
        chapters.forEach((ch, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = ch.title;
            mobileSelect.appendChild(option);
        });
    }
}

// ========== 加载章节 ==========
async function loadChapter(index) {
    if (!currentBook) return;
    if (index < 0 || index >= BOOKS[currentBook].chapters.length) return;
    
    const chapter = BOOKS[currentBook].chapters[index];
    currentChapterIndex = index;
    
    // 更新标题
    if (chapterTitle) chapterTitle.textContent = chapter.title;
    
    // 高亮当前章节
    document.querySelectorAll('.chapter-link').forEach((link, i) => {
        link.classList.toggle('active', i === index);
    });
    
    // 更新手机下拉框
    if (mobileSelect) mobileSelect.value = index;
    
    // 更新翻页指示器
    if (chapterIndicator) {
        chapterIndicator.textContent = `${index + 1}/${BOOKS[currentBook].chapters.length}`;
    }
    
    // 加载内容
    try {
        // 拼接路径：小说文件夹 + 文件名
        const filePath = BOOKS[currentBook].path + chapter.file;
        const response = await fetch(filePath);
        const text = await response.text();
        
        // 按段落分割并包装
        const paragraphs = text.split('\n').filter(p => p.trim());
        contentDiv.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        // 滚动到顶部
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('加载章节失败:', error);
        contentDiv.innerHTML = '<p style="color:red;">加载失败，请重试</p>';
    }
        // 更新按钮状态
    updateChapterButtons();
}
   

// ========== 字体控制 ==========
function changeFontSize(action) {
    if (action === '+') {
        fontSize = Math.min(24, fontSize + 2);
    } else {
        fontSize = Math.max(12, fontSize - 2);
    }
    
    document.body.style.fontSize = fontSize + 'px';
    if (fontSizeDisplay) fontSizeDisplay.textContent = fontSize + 'px';
    
    // 保存设置
    localStorage.setItem('fontSize', fontSize);
}

// ========== 翻页 ==========
function goPrevChapter() {
    if (!currentBook) return;
    if (currentChapterIndex > 0) {
        loadChapter(currentChapterIndex - 1);
    }
    // 首章时什么都不做，按钮已经变灰不可点
}

function goNextChapter() {
    if (!currentBook) return;
    if (currentChapterIndex < BOOKS[currentBook].chapters.length - 1) {
        loadChapter(currentChapterIndex + 1);
    }
    // 尾章时什么都不做，按钮已经变灰不可点
}

// ========== 主题切换 ==========
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    // 更新图标
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? '☾' : '☀';
    }
}

// ========== 初始化时设置图标 ==========
function updateThemeIcon() {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        const isDark = document.body.classList.contains('dark-theme');
        themeIcon.textContent = isDark ? '☾' : '☀';
    }
}

// ========== 绑定事件 ==========
function bindEvents() {
    // 目录按钮
    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
    // 字体按钮
    document.getElementById('fontDecrease')?.addEventListener('click', () => changeFontSize('-'));
    document.getElementById('fontIncrease')?.addEventListener('click', () => changeFontSize('+'));
    
    // 翻页按钮
    prevBtn?.addEventListener('click', goPrevChapter);
    nextBtn?.addEventListener('click', goNextChapter);
    
    // 主题切换
    themeToggle?.addEventListener('click', toggleTheme);
    
    // 手机下拉框
    mobileSelect?.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        if (!isNaN(index)) {
            currentChapterIndex = index;
            loadChapter(index);
        }
        // 主题切换监听
document.getElementById('themeToggleReader')?.addEventListener('click', toggleTheme);
    });
    // 关闭目录按钮
document.getElementById('closeDrawer')?.addEventListener('click', toggleSidebar);
    // 点击遮罩层关闭
document.getElementById('drawerOverlay')?.addEventListener('click', toggleSidebar);
}

// ========== 启动 ==========
document.addEventListener('DOMContentLoaded', init);


// ========== 底部栏控制 ==========
function updateChapterButtons() {
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    
    if (!currentBook) return;
    
    const totalChapters = BOOKS[currentBook].chapters.length;
    
    // 上一章按钮状态
    if (currentChapterIndex === 0) {
        prevBtn?.classList.add('disabled');
        prevBtn?.setAttribute('disabled', 'disabled');
    } else {
        prevBtn?.classList.remove('disabled');
        prevBtn?.removeAttribute('disabled');
    }
    
    // 下一章按钮状态
    if (currentChapterIndex === totalChapters - 1) {
        nextBtn?.classList.add('disabled');
        nextBtn?.setAttribute('disabled', 'disabled');
    } else {
        nextBtn?.classList.remove('disabled');
        nextBtn?.removeAttribute('disabled');
    }
}

// ========== 目录切换 ==========
function toggleSidebar() {
    const drawer = document.getElementById('chapterDrawer');
    const overlay = document.getElementById('drawerOverlay');
    
    drawer.classList.toggle('show');
    overlay.classList.toggle('show');
    
    // 防止背景滚动
    if (drawer.classList.contains('show')) {
        document.body.classList.add('drawer-open');
    } else {
        document.body.classList.remove('drawer-open');
    }
}

// ========== 回到顶部 ==========
const backToTop = document.getElementById('backToTop');

// 监听滚动事件
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
});

// 点击回到顶部
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========== 更新书名 ==========
function updateBookTitle() {
    const titleEl = document.getElementById('bookTitleDisplay');
    if (titleEl && currentBook) {
        titleEl.textContent = currentBook;
    }
}