# Bài TH02 – Thời tiết 8 thành phố Việt Nam

React + TypeScript + Vite, dữ liệu từ [Open-Meteo](https://open-meteo.com/en/docs) (không cần API key).

## Chạy thử
```bash
npm install
npm run dev
```

## Tính năng
- YC1: 8 thành phố, thành phố đang chọn được làm nổi bật
- YC2: Thời tiết hiện tại (nhiệt độ, độ ẩm, gió, weather_code, thời điểm cập nhật)
- YC3: Dự báo 7 ngày (biểu tượng, cao nhất, thấp nhất)
- YC4: Trạng thái loading / lỗi có nút "Thử lại"
- YC5: Đổi °C/°F không gọi lại API
- YC6: Responsive (≤ 768px xếp dọc)
- Nâng cao: lưu thành phố đã chọn vào localStorage, viết bằng TypeScript
