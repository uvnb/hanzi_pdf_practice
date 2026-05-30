import json

files = ['frontend/messages/en.json', 'frontend/messages/zh.json']

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update keys
    if 'Landing' in data:
        data['Landing']['pricingTitle'] = 'Upgrade Account' if 'en' in fpath else '升级账户'
        data['Landing']['tierFree'] = 'Trial' if 'en' in fpath else '体验'
        data['Landing']['tierFreePrice'] = '6.000VND' if 'en' in fpath else '6,000越南盾'
        data['Landing']['tierFreePeriod'] = 'week' if 'en' in fpath else '周'
        
        data['Landing']['tierPro'] = 'Regular' if 'en' in fpath else '经常'
        data['Landing']['tierProPrice'] = '26.000VND' if 'en' in fpath else '26,000越南盾'
        data['Landing']['tierProPeriod'] = 'month' if 'en' in fpath else '月'
        
        data['Landing']['tierMaster'] = 'Lifetime' if 'en' in fpath else '永久'
        data['Landing']['tierMasterPrice'] = '266k' if 'en' in fpath else '266千'
        data['Landing']['tierMasterPeriod'] = ''
        
        if 'tierPeriod' in data['Landing']:
            del data['Landing']['tierPeriod']

    with open(fpath, 'w', encoding='utf-8') as f:
        # To maintain the 1-line-per-key formatting similar to original, we can just use compact json
        json.dump(data, f, ensure_ascii=False, indent=2)

