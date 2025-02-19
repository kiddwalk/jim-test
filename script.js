document.addEventListener('DOMContentLoaded', function() {
    // 页面切换逻辑
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            
            // 更新导航链接状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // 切换页面
            pages.forEach(page => {
                if (page.id === targetPage) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });

    // 聊天功能
    const chatHistory = document.getElementById('chatHistory');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    // 自动调整输入框高度
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // 发送消息
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, 'user');
        
        // 清空输入框
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 调用百度 AI API
        callBaiduAI(message);
    }

    // 调用百度 AI API
    async function callBaiduAI(message) {
        const API_URL = 'http://localhost:3000/api/chat';

        try {
            // 发送对话请求
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    temperature: 0.7,
                    top_p: 0.9,
                    penalty_score: 1.0
                })
            });

            const data = await response.json();
            console.log('API响应数据:', data);

            if (data && data.result) {
                addMessage(data.result, 'ai');
            } else if (data && data.error_msg) {
                console.error('API错误信息:', data.error_msg);
                addMessage(`抱歉，发生了错误: ${data.error_msg}`, 'ai');
            } else {
                console.error('API 响应:', data);
                addMessage('抱歉，我现在无法回答。请稍后再试。', 'ai');
            }
        } catch (error) {
            console.error('AI API 调用错误:', error);
            addMessage('抱歉，发生了一些错误。请稍后再试。', 'ai');
        }
    }

    // 添加消息到聊天历史
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        
        // 检查是否包含代码块
        if (text.includes('```')) {
            const parts = text.split('```');
            parts.forEach((part, index) => {
                if (index % 2 === 0) {
                    // 普通文本
                    if (part.trim()) {
                        const textNode = document.createElement('p');
                        textNode.textContent = part;
                        messageDiv.appendChild(textNode);
                    }
                } else {
                    // 代码块
                    const codeBlock = document.createElement('pre');
                    const code = document.createElement('code');
                    code.textContent = part.trim();
                    codeBlock.appendChild(code);
                    messageDiv.appendChild(codeBlock);
                    hljs.highlightElement(code);
                }
            });
        } else {
            messageDiv.textContent = text;
        }
        
        // 添加消息时的动画效果
        messageDiv.style.opacity = '0';
        chatHistory.appendChild(messageDiv);
        
        // 触发重排以启动动画
        messageDiv.offsetHeight;
        messageDiv.style.opacity = '1';
        
        // 滚动到底部
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);

    // 键盘快捷键
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 保存聊天记录
    function saveChat() {
        const messages = Array.from(chatHistory.children).map(msg => ({
            text: msg.textContent,
            type: msg.classList.contains('user') ? 'user' : 'ai'
        }));
        localStorage.setItem('chatHistory', JSON.stringify(messages));
    }

    // 加载聊天记录
    function loadChat() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            const messages = JSON.parse(saved);
            messages.forEach(msg => addMessage(msg.text, msg.type));
        } else {
            // 添加欢迎消息
            addMessage(`你好！我是秋爹2025的AI助手。我可以：

1. 回答关于编程的问题
2. 帮助解决代码问题
3. 提供技术建议
4. 讨论技术话题

请随时向我提问！`, 'ai');
        }
    }

    // 页面加载时恢复聊天记录
    loadChat();

    // 定期保存聊天记录
    setInterval(saveChat, 5000);

    // 轮播图功能
    initializeCarousel();
});

// 在DOMContentLoaded事件处理函数中添加轮播图功能
function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    const images = carousel.querySelectorAll('img');
    let currentIndex = 0;

    // 创建轮播图控制点
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
        controls.appendChild(dot);
    });
    carousel.appendChild(controls);

    function updateCarousel() {
        images.forEach((img, index) => {
            img.classList.toggle('active', index === currentIndex);
        });
        const dots = controls.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // 自动轮播
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    }, 5000);

    // 初始化显示
    updateCarousel();
} 