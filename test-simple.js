/**
 * @name SponsorBlock Test
 * @desc 测试脚本
 * @author Cigarr
 * @version 1.0.0
 * @hostname *.bilibili.com
 * @enabled true
 */

console.log('✅ SponsorBlock 测试脚本已加载');

// 简单的视频检测
const video = document.querySelector('video');
if (video) {
    console.log('✅ 找到视频元素');
    video.style.border = '3px solid red';
} else {
    console.log('❌ 未找到视频元素');
}

module.exports = {};
