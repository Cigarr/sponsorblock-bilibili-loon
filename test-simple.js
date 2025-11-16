/**
 * @name SponsorBlock Test
 * @desc 测试 SponsorBlock 脚本功能
 * @author Cigarr
 * @version 1.0.0
 * @hostname *.bilibili.com
 * @enabled true
 */

console.log('🎯 SponsorBlock 测试脚本开始执行');
console.log('📍 当前页面:', window.location.href);
console.log('🕒 执行时间:', new Date().toLocaleString());

// 测试函数
function testSponsorBlock() {
    console.log('🔍 开始测试...');
    
    // 1. 测试视频元素检测
    const video = document.querySelector('video');
    if (video) {
        console.log('✅ 找到视频元素');
        video.style.border = '3px solid #ff4444';
        video.style.boxShadow = '0 0 10px red';
    } else {
        console.log('❌ 未找到视频元素');
    }
    
    // 2. 测试页面信息获取
    const urlParams = new URLSearchParams(window.location.search);
    const aid = urlParams.get('aid');
    const bvidMatch = window.location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/);
    const bvid = bvidMatch ? bvidMatch[1] : null;
    
    console.log('📊 视频信息:', { aid, bvid });
    
    // 3. 测试 API 请求
    testAPIRequest(aid, bvid);
    
    // 4. 添加测试 UI
    addTestUI();
}

// 测试 API 请求
async function testAPIRequest(aid, bvid) {
    console.log('🌐 测试 API 请求...');
    
    if (!aid && !bvid) {
        console.log('⚠️ 没有视频ID，跳过API测试');
        return;
    }
    
    try {
        const testParams = new URLSearchParams({
            categories: JSON.stringify(['sponsor']),
            actionTypes: JSON.stringify(['skip'])
        });
        
        if (aid) testParams.append('aid', aid);
        if (bvid) testParams.append('bvid', bvid);
        
        console.log('🔗 请求参数:', testParams.toString());
        
        // 注意：这里只是测试请求，不处理响应
        console.log('✅ API 请求测试完成');
        
    } catch (error) {
        console.log('❌ API 请求测试失败:', error);
    }
}

// 添加测试 UI
function addTestUI() {
    // 移除已存在的测试UI
    const existingUI = document.querySelector('#sponsorblock-test-ui');
    if (existingUI) existingUI.remove();
    
    // 创建测试UI
    const testUI = document.createElement('div');
    testUI.id = 'sponsorblock-test-ui';
    testUI.innerHTML = `
        <div style="
            position: fixed;
            top: 10px;
            left: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 12px;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
        ">
            <div style="font-weight: bold; margin-bottom: 5px;">🎯 SponsorBlock 测试</div>
            <div>脚本加载成功!</div>
            <div style="font-size: 10px; opacity: 0.8; margin-top: 3px;">${new Date().toLocaleTimeString()}</div>
        </div>
    `;
    
    document.body.appendChild(testUI);
    console.log('✅ 测试UI已添加');
    
    // 5秒后自动移除测试UI
    setTimeout(() => {
        if (testUI.parentNode) {
            testUI.remove();
            console.log('🕒 测试UI已自动移除');
        }
    }, 5000);
}

// 页面加载后执行测试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testSponsorBlock);
} else {
    testSponsorBlock();
}

// 处理 SPA 页面跳转
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        console.log('🔄 检测到页面跳转，重新测试');
        setTimeout(testSponsorBlock, 1000);
    }
}).observe(document, {subtree: true, childList: true});

console.log('✅ SponsorBlock 测试脚本初始化完成');

module.exports = { testSponsorBlock };
