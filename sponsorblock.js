// ==Loon==
// @Name SponsorBlock for Bilibili
// @Desc 自动跳过B站视频中的赞助商片段
// @Author Cigarr
// @Version 0.11.2
// @Date 2024-01-01
// @Icon https://raw.githubusercontent.com/Cigarr/sponsorblock-bilibili-loon/main/icons/IconSponsorBlocker64px.png
// @Category Bilibili
// @UpdateInterval 86400
// ==/Loon==

const CONFIG = {
    apiServer: "http://api.bsbsb.top",
    categories: ["sponsor", "selfpromo", "interaction", "intro", "outro", "preview", "music_offtopic"],
    skipThreshold: 0.5,
    enable: true
};

class SponsorBlock {
    constructor() {
        this.video = null;
        this.segments = [];
        this.currentSegment = null;
        this.initialized = false;
        this.init();
    }

    init() {
        console.log('🎯 SponsorBlock for Bilibili 初始化');
        this.setupMutationObserver();
        this.tryFindVideo();
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            if (!this.video || !document.contains(this.video)) {
                this.video = null;
                this.tryFindVideo();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    tryFindVideo() {
        if (this.initialized) return;
        
        const video = document.querySelector('video');
        if (video && !video.dataset.sponsorblockInit) {
            this.video = video;
            this.setupVideo();
        } else {
            setTimeout(() => this.tryFindVideo(), 1000);
        }
    }

    setupVideo() {
        this.video.dataset.sponsorblockInit = 'true';
        this.initialized = true;
        
        const videoInfo = this.getVideoInfo();
        if (videoInfo.aid || videoInfo.bvid) {
            this.fetchSegments(videoInfo).then(segments => {
                this.segments = segments || [];
                if (this.segments.length > 0) {
                    console.log(`🎯 找到 ${this.segments.length} 个待跳过片段`);
                    this.setupSkipHandler();
                    this.setupUI();
                }
            });
        }
    }

    getVideoInfo() {
        const urlParams = new URLSearchParams(window.location.search);
        const aid = urlParams.get('aid');
        
        const bvidMatch = window.location.pathname.match(/\/video\/(BV[0-9A-Za-z]+)/);
        const bvid = bvidMatch ? bvidMatch[1] : null;
        
        const pageData = window.__INITIAL_STATE__ || {};
        return {
            aid: aid || pageData?.videoData?.aid,
            bvid: bvid || pageData?.videoData?.bvid
        };
    }

    async fetchSegments(videoInfo) {
        if (!CONFIG.enable) return null;
        
        try {
            const params = new URLSearchParams({
                categories: JSON.stringify(CONFIG.categories),
                actionTypes: JSON.stringify(['skip', 'mute'])
            });
            
            if (videoInfo.aid) params.append('aid', videoInfo.aid);
            if (videoInfo.bvid) params.append('bvid', videoInfo.bvid);
            
            console.log('🔍 请求分段信息:', videoInfo);
            const response = await fetch(`${CONFIG.apiServer}/api/skipSegments?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 获取到分段信息:', data);
                return Array.isArray(data) ? data : null;
            } else {
                console.log('❌ API响应异常:', response.status);
            }
        } catch (error) {
            console.warn('❌ SponsorBlock: 获取分段信息失败', error);
        }
        return null;
    }

    setupSkipHandler() {
        if (!this.video || this.segments.length === 0) return;
        
        this.video.addEventListener('timeupdate', () => {
            if (!this.video) return;
            
            const currentTime = this.video.currentTime;
            const segment = this.findCurrentSegment(currentTime);
            
            if (segment && (!this.currentSegment || this.currentSegment.uuid !== segment.uuid)) {
                this.currentSegment = segment;
                this.skipSegment(segment);
            } else if (!segment) {
                this.currentSegment = null;
            }
        });
    }

    findCurrentSegment(currentTime) {
        return this.segments.find(segment => 
            currentTime >= segment.segment[0] && 
            currentTime <= segment.segment[1] &&
            segment.segment[1] - segment.segment[0] > CONFIG.skipThreshold
        );
    }

    skipSegment(segment) {
        if (!this.video) return;
        
        console.log(`⏭️ SponsorBlock: 跳过 ${segment.category} 片段`, segment.segment);
        this.video.currentTime = segment.segment[1];
        this.showSkipNotification(segment);
    }

    showSkipNotification(segment) {
        const existing = document.querySelector('.sponsorblock-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'sponsorblock-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 10000;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
            ">
                🎯 已跳过 ${this.getCategoryName(segment.category)} 片段
                <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">
                    ${this.formatTime(segment.segment[0])} - ${this.formatTime(segment.segment[1])}
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3500);
    }

    getCategoryName(category) {
        const names = {
            'sponsor': '赞助商',
            'selfpromo': '自我推广', 
            'interaction': '互动求三连',
            'intro': '开场',
            'outro': '结尾',
            'preview': '预告片',
            'music_offtopic': '非主题音乐'
        };
        return names[category] || category;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    setupUI() {
        const player = document.querySelector('.bpx-player-video-wrap, .bilibili-player-video');
        if (player && !document.querySelector('.sponsorblock-badge')) {
            const badge = document.createElement('div');
            badge.className = 'sponsorblock-badge';
            badge.innerHTML = `
                <div style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,0,0,0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    z-index: 999;
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255,255,255,0.2);
                ">
                    🎯 ${this.segments.length} segments
                </div>
            `;
            player.appendChild(badge);
        }
    }
}

// 初始化
if (typeof module !== 'undefined') {
    module.exports = new SponsorBlock();
} else {
    new SponsorBlock();
}
