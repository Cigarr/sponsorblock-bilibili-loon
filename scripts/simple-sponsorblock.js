// ==Loon==
// ==/Loon==

console.log('🔧 SponsorBlock 简化版已加载');

// 简单的初始化函数
function simpleInit() {
    console.log('🔧 开始初始化...');
    
    // 查找视频元素
    const video = document.querySelector('video');
    if (video) {
        console.log('✅ 找到视频元素:', video);
        video.style.border = '2px solid red'; // 添加红色边框便于识别
    } else {
        console.log('❌ 未找到视频元素');
    }
    
    // 检查页面信息
    console.log('🔧 当前URL:', window.location.href);
    console.log('🔧 页面标题:', document.title);
}

// 延迟初始化，确保页面加载完成
setTimeout(simpleInit, 2000);

module.exports = simpleInit;
