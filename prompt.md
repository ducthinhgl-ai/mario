# PROMPT: Xây dựng game Platformer 2D kiểu Mario (Mario-like)

Tạo một game platformer 2D hoàn chỉnh lấy cảm hứng từ cơ chế của Super Mario Bros. Output phải chạy được ngay, không thiếu thành phần.

---

## 1. Mục tiêu
Xây dựng game chạy trực tiếp trên trình duyệt bằng:
- HTML
- CSS
- JavaScript thuần (KHÔNG framework, KHÔNG thư viện ngoài)

---

## 2. Core Gameplay (BẮT BUỘC)

### Nhân vật (Player)
- Có các trạng thái:
  - Idle
  - Run
  - Jump
  - Fall
- Điều khiển:
  - ← → di chuyển trái/phải
  - Space: nhảy
- Có trọng lực (gravity)
- Có vận tốc:
  - Horizontal velocity
  - Vertical velocity

---

### Physics (CỰC KỲ QUAN TRỌNG)
- Gravity kéo xuống liên tục
- Jump có lực ban đầu (jump force)
- Có:
  - Acceleration
  - Friction (giảm tốc khi không bấm phím)
- Collision detection:
  - Va chạm với nền (ground)
  - Va chạm cạnh (tường)
  - Va chạm trần

---

### Bản đồ (Level)
- Dạng tile-based (grid)
- Có các loại tile:
  - Ground (đứng được)
  - Platform (có thể đứng)
  - Empty
- Map dài hơn màn hình → cần camera follow

---

### Camera
- Camera theo player theo trục X
- Không để player đi ra khỏi khung nhìn

---

## 3. Gameplay Elements

### Platform
- Platform cố định
- Platform ở nhiều độ cao

### Obstacle
- Hố (fall → game over hoặc reset)
- Gai (nếu có)

### Enemy (cơ bản)
- Di chuyển qua lại
- Chạm vào player → chết / reset
- Có thể:
  - Nhảy lên đầu để tiêu diệt

---

### Collectible
- Coin / điểm
- Tăng score

---

## 4. Game State

- Start game
- Playing
- Game Over
- Restart

---

## 5. UI

Hiển thị:
- Score
- Lives (nếu có)
- Level

Có nút:
- Start
- Restart

---

## 6. Rendering

Chọn 1 trong 2:
- Canvas (khuyến khích)
- Hoặc DOM (div-based grid)

Yêu cầu:
- Render mượt
- Player chuyển động không giật
- Phân biệt rõ object (player, enemy, ground)

---

## 7. Kiến trúc code (BẮT BUỘC)

Tách rõ các module:

- Game Loop (requestAnimationFrame)
- Physics Engine (gravity, velocity)
- Collision System
- Input Handler
- Entity System:
  - Player
  - Enemy
- Level / Map System
- Renderer
- Camera System

Code phải:
- Có comment giải thích logic quan trọng
- Không viết dồn 1 file kiểu spaghetti
- Dễ đọc, dễ mở rộng

---

## 8. Nâng cao (ƯU TIÊN nếu làm được)

- Double jump (optional)
- Moving platform
- Animation sprite (frame-based)
- Sound (jump, coin, hit)
- Parallax background

---

## 9. Định dạng output (BẮT BUỘC)

Xuất code hoàn chỉnh theo 1 trong 2 dạng:

### Cách 1 (ưu tiên):
- index.html
- style.css
- script.js

### Hoặc:
- 1 file HTML duy nhất (inline CSS + JS)

---

## 10. Quy tắc output

- KHÔNG giải thích dài dòng
- KHÔNG bỏ sót file
- KHÔNG placeholder
- Code chạy được ngay khi mở file

---

## 11. Tiêu chí đánh giá

- Nhảy có cảm giác “đúng vật lý”
- Collision chính xác
- Camera mượt
- Không bug xuyên nền
- Gameplay tương tự Mario cơ bản

---

Thực thi ngay.