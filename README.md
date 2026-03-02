# Products Management System

## Cài đặt và chạy

```bash
npm install
npm start
```

Mở trình duyệt: http://localhost:3000

## Tính năng

- Tự động tìm kiếm products khi nhập (title, slug, minPrice, maxPrice)
- Tự động tìm kiếm theo ID (products, categories, users)
- Thông báo nhẹ nhàng khi không tìm thấy sản phẩm (hiện sau 1 giây)
- Giao diện responsive với tabs
- Reset để xóa tất cả filters

## API Endpoints

- GET /products
- GET /products/:id
- GET /categories
- GET /categories/:id
- GET /users
- GET /users/:id
