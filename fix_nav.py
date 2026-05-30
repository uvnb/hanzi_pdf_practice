import json

# Update vi.json
with open('frontend/messages/vi.json', 'r', encoding='utf-8') as f:
    vi_data = json.load(f)

vi_data['Landing'].update({
    'navHome': 'Trang chủ',
    'navFeatures': 'Lộ trình học',
    'navPricing': 'Bảng giá',
    'navLogin': 'Đăng nhập',
    'navRegister': 'Đăng ký',
    'sideHome': 'Trang chủ',
    'sideCourses': 'Khóa học',
    'sidePractice': 'Luyện tập',
    'sideCommunity': 'Cộng đồng',
    'sideAbout': 'Giới thiệu'
})

with open('frontend/messages/vi.json', 'w', encoding='utf-8') as f:
    json.dump(vi_data, f, ensure_ascii=False, indent=2)

# Update en.json
with open('frontend/messages/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

en_data['Landing'].update({
    'sideHome': 'Home',
    'sideCourses': 'Courses',
    'sidePractice': 'Practice',
    'sideCommunity': 'Community',
    'sideAbout': 'About'
})

with open('frontend/messages/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

