const AppState = {
    isLoggedIn: false,
    loginMethod: null, // "single", "device", or null
    linkedStores: [], // 支持多重書店連結
    currentView: "view-exross-login",
    sourceView: null // 記錄從哪裡來的
};

const app = {
    state: { ...AppState },
    
    init() {
        this.loadState();
        this.bindEvents();
        this.render();
    },

    loadState() {
        const saved = localStorage.getItem('exross_state');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        } else {
            this.navigate('view-exross-login');
        }
    },

    saveState() {
        localStorage.setItem('exross_state', JSON.stringify(this.state));
        this.render();
    },

    resetState() {
        this.state = { ...AppState };
        this.saveState();
        this.navigate('view-exross-login');
    },

    navigate(viewId, origin = null) {
        if(origin) {
            this.state.sourceView = origin;
        }

        document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
        
        // Modal overlay handling (keep background view visible)
        if (viewId === 'view-store-selector' || viewId === 'view-oauth-login' || viewId === 'view-qr-scan') {
            const bgViewId = this.state.sourceView || 'view-exross-login';
            document.getElementById(bgViewId).classList.remove('hidden');
        }

        const targetView = document.getElementById(viewId);
        if(targetView) targetView.classList.remove('hidden');
        
        this.state.currentView = viewId;
        this.saveState();
    },

    bindEvents() {
        // --- 登入頁面 ---
        document.getElementById('btn-login-single').addEventListener('click', () => {
            this.navigate('view-store-selector', 'view-exross-login');
        });

        document.getElementById('btn-login-device').addEventListener('click', () => {
            this.navigate('view-qr-scan', 'view-exross-login');
        });

        // --- 書店選擇 ---
        document.querySelectorAll('.btn-store').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.state.selectedAuthStore = e.target.dataset.store; // 準備授權的書店
                document.getElementById('oauth-store-name').innerText = `${this.state.selectedAuthStore} 授權登入`;
                this.navigate('view-oauth-login', this.state.sourceView);
            });
        });

        document.querySelector('.btn-cancel-selector').addEventListener('click', () => {
             this.navigate(this.state.sourceView || 'view-exross-login');
        });

        // --- 書店授權登入 ---
        document.getElementById('btn-oauth-submit').addEventListener('click', () => {
            this.state.isLoggedIn = true;
            this.state.loginMethod = "single";
            if (!this.state.linkedStores.includes(this.state.selectedAuthStore)) {
                this.state.linkedStores.push(this.state.selectedAuthStore);
            }
            this.saveState();
            // 登入後回到書櫃
            this.navigate('view-bookshelf');
        });

        document.querySelector('.btn-cancel-oauth').addEventListener('click', () => {
             this.navigate('view-store-selector', this.state.sourceView);
        });

        // --- QR Code 掃描 ---
        document.getElementById('btn-simulate-scan').addEventListener('click', () => {
            const msgEl = document.querySelector('.status-msg');
            msgEl.innerText = "掃描成功！驗證裝置授權中...";
            msgEl.style.color = "var(--primary)";
            
            setTimeout(() => {
                // 如果是登入情境
                if (!this.state.isLoggedIn) {
                    this.state.isLoggedIn = true;
                    this.state.loginMethod = "device";
                    this.state.linkedStores = []; 
                    this.saveState();
                    this.navigate('view-bookshelf');
                } else {
                    // 如果是驗證情境 (透過帳號管理)
                    this.state.loginMethod = "device"; // 需求 1: 轉為裝置登入狀態
                    this.saveState();
                    alert('裝置驗證成功！此裝置已設為信任裝置。');
                    this.navigate('view-account');
                }
                msgEl.innerText = "等待掃描中...";
                msgEl.style.color = "var(--text-light)";
            }, 1200);
        });

        document.querySelectorAll('.btn-cancel-qr').forEach(btn => {
            btn.addEventListener('click', () => {
                this.navigate(this.state.sourceView || 'view-exross-login');
            });
        });

        // --- 首頁 (書櫃) ---
        document.getElementById('user-menu-btn').addEventListener('click', () => {
            this.navigate('view-account');
        });

        // --- 帳號管理 ---
        // 切換書店
        document.getElementById('btn-acc-switch-store').addEventListener('click', () => {
            // Task 4: 優化進入選擇器邏輯 (連結其他書店)
            document.getElementById('store-selector-title').innerText = "連結其他書店";
            this.navigate('view-store-selector', 'view-account'); 
        });

        // 裝置驗證
        document.getElementById('btn-acc-device-auth').addEventListener('click', () => {
            this.navigate('view-qr-scan', 'view-account');
        });

        // 登出 / 解除連結
        document.getElementById('btn-acc-logout').addEventListener('click', () => {
            if(confirm("確定要安全登出您的帳號嗎？")) {
                this.state.isLoggedIn = false;
                this.state.loginMethod = null;
                this.state.linkedStores = [];
                this.saveState();
                this.navigate('view-exross-login');
            }
        });

        document.getElementById('btn-acc-unlink').addEventListener('click', () => {
            if(confirm("確定要解除此裝置的信任連結嗎？解除後需重新登入。")) {
                this.state.isLoggedIn = false;
                this.state.loginMethod = null;
                this.state.linkedStores = [];
                this.saveState();
                this.navigate('view-exross-login');
            }
        });
    },

    render() {
        // --- 1. 更新帳號管理 UI ---
        const statusText = document.getElementById('account-status-text');
        const linkedStoreText = document.getElementById('linked-store-name');
        
        const btnLogout = document.getElementById('btn-acc-logout');
        const btnUnlink = document.getElementById('btn-acc-unlink');
        const dangerZone = document.getElementById('danger-zone');
        const accountActions = document.querySelector('.account-actions'); // 需求 2: 隱藏連結管理
        
        if (this.state.isLoggedIn) {
            dangerZone.classList.remove('hidden');
            
            if (this.state.loginMethod === 'device') {
                statusText.innerText = `透過信任裝置登入`;
                linkedStoreText.innerText = `未直接連結書店`;
                btnLogout.classList.add('hidden');
                btnUnlink.classList.remove('hidden');
                accountActions.classList.add('hidden'); // 隱藏所有連結與驗證按鈕
            } else {
                const stores = Array.isArray(this.state.linkedStores) ? this.state.linkedStores : [];
                statusText.innerText = `單一書店登入`;
                linkedStoreText.innerText = `已連結: ${stores.length > 0 ? stores.join('、') : '無紀錄'}`;
                btnLogout.classList.remove('hidden');
                btnUnlink.classList.add('hidden');
                accountActions.classList.remove('hidden'); // 顯示連結與驗證按鈕
            }
        } else {
            statusText.innerText = "未登入";
            linkedStoreText.innerText = `尚未連結任何書店`;
            dangerZone.classList.add('hidden');
            accountActions.classList.remove('hidden');
        }

        // --- 2. 更新目前顯示的 View ---
        // render 時若 currentView 需要顯示 overlay 就要連帶顯示 background
        if (this.state.currentView) {
             document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
             
             if (this.state.currentView === 'view-store-selector' || this.state.currentView === 'view-oauth-login' || this.state.currentView === 'view-qr-scan') {
                const bgViewId = this.state.sourceView || 'view-exross-login';
                const bgView = document.getElementById(bgViewId);
                if(bgView) bgView.classList.remove('hidden');
            }
             
            const target = document.getElementById(this.state.currentView);
            if(target) target.classList.remove('hidden');
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.app = app;
    app.init();
});
