# Daily Log

## 2026-03-16
- [Document] 新增 `requirements_spec.md` — 登入頁面 & 帳號管理頁面功能需求規格書。依據使用者測試後的最終原型（`index.html` / `app.js` / `style.css`）撰寫，涵蓋：術語定義、系統狀態模型（`isLoggedIn` / `loginMethod` / `linkedStores`）、登入頁面兩種方式（QR Code 掃碼登入 + OAuth 書店帳號登入）完整規格、帳號管理頁面三種狀態（書店帳號 / 裝置 / 未登入）的 UI 條件差異對照表、QR Code 共用元件規格（90 秒倒數 / 狀態訊息 / 重新整理）、頁面導航流程圖（Mermaid）、8 支後端 API 端點建議、非功能需求（瀏覽器支援 / 響應式 / 安全性 / 無障礙 / 動畫）。溝通對象為系統分析師與前後端工程師。
- [Feature] 在測試控制面板「重置所有狀態」按鈕旁新增「登入問題請點我」按鈕。修改 `index.html`（`.tester-controls` 新增按鈕，綁定 `app.showLoginHelp()`）、`app.js`（新增 `showLoginHelp()` 方法，點擊後以 `alert` 顯示登入常見 Q&A，包含登入方式說明、QR Code 過期處理、忘記密碼、多書店連結、掃碼無反應等 5 題）。
- [Enhancement] 帳號管理頁面 QR Code 直接顯示：單一書店登入狀態下，將原本的「掃描 QR Code 登入」按鈕改為直接在帳號管理頁面內嵌顯示 QR Code。修改 `index.html`（將 `row-device-auth` 從 `action-row` + 按鈕改為 `account-qr-section` + 內嵌 QR Code 區塊，含倒數計時、狀態訊息、模擬掃描按鈕）、`app.js`（新增 `accountQrTimerInterval`，`startQrTimer` 與 `handleSimulateScan` 支援 `account` context，`navigate()` 進入帳號頁時自動啟動計時器）、`style.css`（新增 `.account-qr-section` 與 `.account-qr-wrapper` 樣式）。說明文字從「使用書紐 eXross App 掃碼驗證」調整為「開啟書紐 eXross App 掃描下方 QR Code」。

## 2026-03-13
- [Feature] 書櫃首頁 header 右上角帳號管理按鈕旁顯示目前登入方式文字（如「三民書局登入」/「灰熊愛讀書登入」/「裝置登入」）。修改 `index.html`（在 `.user-menu` 內新增 `#login-method-label` span）、`style.css`（新增 `.login-method-label` 樣式，`.user-menu` 改為 flex 佈局）、`app.js`（在 `render()` 中根據 `loginMethod` 和 `linkedStores` 動態更新標籤文字）。
- [Enhancement] 登入介面扁平化：將「三民書局」和「灰熊愛讀書」兩個書店按鈕從次層（需先點「透過書店登入」再選擇）移至登入頁第一層直接顯示，中間加入「或」分隔線，下方放置「掃描 QR Code 登入」按鈕，減少使用者操作步驟。修改檔案：`index.html`（重組 `.login-card` 區塊）、`style.css`（新增 `.login-section`、`.store-login-grid`、`.login-divider`、`.btn-store-login` 樣式）、`app.js`（移除舊 `btn-login-single`/`btn-login-device` 事件，新增 `btn-store-sanmin`/`btn-store-grizzly`/`btn-login-qr` 首層事件綁定）。
- [Bugfix] 修正 OAuth 授權頁「取消並返回」按鈕的返回邏輯：原本從登入頁進入 OAuth 後點取消會跳到舊的「選擇授權書店」彈窗，改為直接返回 `sourceView`（登入頁或帳號管理頁），修改 `app.js` 中 `.btn-cancel-oauth` 的 navigate 目標。
- [Enhancement] QR Code 直接嵌入登入首頁：將 QR Code 圖示、倒數計時器、掃描狀態訊息和「模擬手機已掃描」按鈕直接內嵌於登入卡片，使用者不再需要點擊按鈕才能看到 QR Code。重構 `app.js` 中的 `startQrTimer` 為通用函式（支援 `modal`/`inline` 兩種模式），並抽出 `handleSimulateScan` 共用方法。`style.css` 新增 `.inline-qr-wrapper`、`.inline-qr-box`、`.inline-qr-info` 等排版樣式。
- [Enhancement] 登入首頁全面重新排版：調整左右面板比例為 2:3（品牌區較窄、登入卡片較寬），品牌區新增裝飾半透明圓圈和三色漸層，登入卡片改為淺灰背景 (`#f8f9fb`) 搭配置中內容區 (`max-width: 460px`)，書店按鈕改為白底帶細微陰影，QR Code 區段包裝於白底圓角卡片增加視覺層次，整體間距與字體大小微調以提升美觀與易用性。修改 `style.css` 與 `index.html`（新增 `.login-card-inner` 包裝層）。

## 2026-03-11
- [Initial] 建立專案基礎架構，包含 `index.html`, `style.css`, `app.js`，並設定單頁應用 (SPA) 路由邏輯。
- [Feature] 完成所有任務視圖 (外站、書紐登入、帳號管理、QR Code)，並綁定所有狀態管理 `app.js` 以支援 5 個任務情境的無限次循環測試，優化外站跳轉邏輯。
- [Enhancement] 依據反饋，排除任務一(外站首頁與跳轉)，並將預設頁面改為 eXross 登入頁。優化任務四為「多重書店綁定」，將狀態管理轉為陣列紀錄，並變更按鈕文案為「連結其他書店」。
- [Enhancement] 優化裝置驗證邏輯：單一書店登入後，若透過帳號管理進行「裝置驗證」，驗證完畢將登入狀態切換為「透過信任裝置登入」，並隱藏連結管理選項，僅保留解除信任連結按鈕。
- [Bugfix] 修復無法進入帳號管理頁面或按鈕無回應的問題 (包含修正 HTML 多餘標籤、強化 JS 陣列判斷及修復全域 `app` 的 `onclick` 取用問題)。
- [Enhancement] 調整單一圖書帳號登入時的狀態顯示，將「單一書店登入」根據所選書店動態變更為「透過 [特定書店] 帳號登入」。
- [Enhancement] 調整帳號管理連結顯示邏輯：單一書店帳號登入模式下隱藏「使用其他書店帳號連結」按鈕區塊，並將裝置驗證區域說明文案改為「一鍵同步多家書櫃」，加上宣傳下載 App 可快速整合書櫃的引導行銷文字。
- [Enhancement] 優化帳號管理頁面排版：針對 1280x800 解析度放大卡片內距、調整標題與內文字體大小，提升閱讀舒適度與操作體驗。
- [Feature] 新增「裝置登入」專屬顯示區塊：在帳號管理中，若狀態為透過信任裝置登入，下方將唯讀展開顯示該裝置已綁定的所有書店清單陣列，提供使用者預期。
- [Feature] 首頁動態書本標籤：書籍上方將根據使用者目前綁定授權的書店順序，動態貼上「書籍來源」的深色標籤，以明確給予受測者完成匯入的回饋。
- [Enhancement] 設定裝置登入預設情境：不論是在登入頁或帳號管理中掃描 QR Code，驗證完畢後系統皆會自動帶入「灰熊愛讀書、三民書局、讀冊、金石堂」四家書店作為 App 已連結的預設授權來源。
- [Enhancement] 調整裝置驗證跳轉流程：在「帳號管理」進行掃描 QR Code 驗證完畢後，不再停留於帳號管理頁，而是直接重導回「首頁（書櫃）」以展示同步成果。
- [Feature] 實作 QR Code 時效性設計：在 QR 掃描畫面加入 90 秒掃描倒數，一旦超時即會提示「QR Code 已失效」並停用掃描驗證按鈕；同時加入手動「重新整理」按鈕，允許受測者重啟新的一輪倒數，貼近真實資安情境。
