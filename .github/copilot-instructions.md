# GitHub Copilot Instructions for Reservation System

## プロジェクト概要
- Next.js v15以上（App Router + page.tsx）
- TypeScript
- Tailwind CSS
- SQLiteで軽量予約システム
- `/admin` は管理画面
- `/monitor` はお客さん用モニター画面
- 客用画面は送信不要のSSEでリアルタイム表示
- `/` は未実装でOK

---

## ディレクトリ構成
- `app/admin/`  
  - 管理画面トップ  
  - `components/SettingsModal.tsx` … 予約枠・テーマ・Monitor用UI切替のモーダルコンポーネント
  - `components/AddReservationModal.tsx` … 予約追加用モーダル。時間枠を設定可能
- `app/monitor/`  
  - `1/` で直近1人の呼び出し番号表示
  - `2/` サービスエリア表示（待ち番号・呼び出し番号）  
- `app/api/reservations/`  
  - 待ち番号登録・次に呼ぶ番号API
- `app/api/stream/`  
  - SSEで現在の待ち番号・呼び出し番号を配信
- `lib/db.ts`  
  - SQLite接続

---

## ページ作成指示

### `/admin/page.tsx`
- 管理画面の主要操作を配置
  - 登録中の待ち人数表示
  - 呼び出し済み番号リスト表示
  - 次に呼ぶ番号表示
- 画面右上に歯車アイコンを常に固定表示
  - 歯車を押すと `SettingsModal` がモーダル表示
- 「予約追加」ボタンを用意
  - 押すと `AddReservationModal` がモーダル表示
  - モーダル内で番号と時間枠を設定可能
- モーダルはスクロール可能で閉じるボタンや背景クリックで閉じられる

### `SettingsModal` コンポーネント
- モーダルポップアップとして表示
- 設定項目は以下のタブやセクションで整理
  - 予約枠の調整（時間帯・人数）
  - UIテーマの変更（色・フォント・背景）
  - Monitor用UIの切替（サービスエリア表示 / 直近1人表示）
- 背景クリックや閉じるボタンで閉じる

### `AddReservationModal` コンポーネント
- モーダルポップアップとして表示
- 予約番号を入力
- 予約する時間枠を選択または設定可能
- 背景クリックや閉じるボタンで閉じる

### `/monitor/1/page.tsx`
- 直近1人の呼び出し番号を大きく表示
- 次に呼ばれる番号表示
- 待ち人数表示
- SSEでリアルタイム更新

### `/monitor/2/page.tsx`
- サービスエリア用表示
- 左: 待ってる番号リスト
- 右: 呼び出された番号
- SSEでリアルタイム更新

---

## API作成指示

### `/api/reservations/`
- `POST` で待ち番号を登録（AddReservationModalからの入力を反映）
- `PATCH` で次に呼ぶ番号を更新

### `/api/stream/`
- SSEで現在の待ち番号・呼び出し番号・次番号を配信
- クライアントからは送信不要

---

## UI要件
- 管理画面は操作しやすく直感的
- モニター画面は大きな文字で番号表示
- テーマや色は `SettingsModal` で変更可能
- 予約追加は `AddReservationModal` で時間枠を設定可能
- `/monitor/1` は直近1人にフォーカスした表示
- モニター画面は16：9比率を意識
- モーダル内はスクロール可能

---

## 注意点
- App Router + page.tsx形式を守る
- SSE受信専用、WebSocketは使わない
- SQLiteで軽量運用を意識
- `/` は未実装でOK
