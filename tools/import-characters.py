# -*- coding: utf-8 -*-
"""立绘导入流水线（幂等，可重复执行）：

1. 把 E:/otherproject/dhmmr立绘 中已收录角色的立绘复制到
   public/images/characters/<id>/，主立绘 -> full.webp，换装 -> skin-NN.webp，
   并删除中间态 .png；
2. 把有立绘但档案未收录的角色补录进 characters.json（仅名字+立绘，未知字段留空）；
3. 同步更新 fullArt / skins 引用为 .webp（保持 CRLF 与键序）。
"""
import json
import os
import re
import shutil

from PIL import Image

SRC = r'E:/otherproject/dhmmr立绘'
ROOT = r'E:/otherproject/bigeye'
JSON = os.path.join(ROOT, 'src', 'data', 'characters.json')
IMG = os.path.join(ROOT, 'public', 'images', 'characters')

# 有立绘但尚未收录档案的角色：文件夹名 -> (id, codename, name)
NEW_CHARS = {
    '风行赫尔墨斯':    ('hermes-fengxing', '风行', '赫尔墨斯'),
    '隐夜伊里伽尔':    ('ereshkigal-yinye', '隐夜', '伊里伽尔'),
    '锻玉武罗':        ('wuluo-duanyu', '锻玉', '武罗'),
    '逆潮利维坦':      ('leviathan-nichao', '逆潮', '利维坦'),
    '荒獠金固':        ('kingu-huangliao', '荒獠', '金固'),
    '硝芒埃克什瓦':    ('aikeshiwa-xiaomang', '硝芒', '埃克什瓦'),
    '狂狮塞赫麦特':    ('sekhmet-kuangshi', '狂狮', '塞赫麦特'),
    '潜蛇瓦吉特':      ('wadjet-qianshe', '潜蛇', '瓦吉特'),
    '流转之洋欧申纳斯': ('oceanus-liuzhuanzhiyang', '流转之洋', '欧申纳斯'),
    '流萤岚雾休':      ('shu-liuyinglanwu', '流萤岚雾', '休'),
    '沐风恩利尔':      ('enlil-mufeng', '沐风', '恩利尔'),
    '昭阳金乌':        ('jinwu-zhaoyang', '昭阳', '金乌'),
    '悼亡之蝶海拉':    ('hela-daowangzhidie', '悼亡之蝶', '海拉'),
    '怀阳羲和':        ('xihe-huaiyang', '怀阳', '羲和'),
}

WEBP_QUALITY = 90
WEBP_METHOD = 5


def to_webp(png_path):
    """PNG -> WebP（保留 RGBA），删除原 PNG，返回相对 public/ 的路径。"""
    webp_path = png_path.rsplit('.', 1)[0] + '.webp'
    Image.open(png_path).convert('RGBA').save(
        webp_path, 'WEBP', quality=WEBP_QUALITY, method=WEBP_METHOD)
    os.remove(png_path)
    return os.path.relpath(webp_path, os.path.join(ROOT, 'public')).replace('\\', '/')


with open(JSON, encoding='utf-8') as f:
    raw = f.read()
data = json.loads(raw)
chars = data['characters']
by_full = {c['fullName'].replace('·', ''): c for c in chars}

# 1) 补录缺失角色（幂等：已存在则跳过）
added = 0
for folder, (cid, codename, name) in NEW_CHARS.items():
    if folder in by_full:
        continue
    chars.append({
        'id': cid,
        'name': name,
        'codename': codename,
        'fullName': f'{codename}·{name}',
        'rarity': '',
        'element': '',
        'weapon': '',
        'faction': '',
        'releaseVersion': '',
        'releaseDate': '',
        'portrait': f'images/characters/{cid}/portrait.png',
        'fullArt': f'images/characters/{cid}/full.webp',
    })
    by_full[folder] = chars[-1]
    added += 1
print(f'new characters added: {added}')

# 2) 复制 + 转 WebP
copied = 0
skinned = 0
for folder in sorted(os.listdir(SRC)):
    c = by_full.get(folder)
    if not c:
        continue
    cid = c['id']
    src_dir = os.path.join(SRC, folder)
    dst_dir = os.path.join(IMG, cid)
    os.makedirs(dst_dir, exist_ok=True)
    files = sorted(f for f in os.listdir(src_dir) if f.endswith('.png'))
    main = folder + '.png'
    assert main in files, f'{folder}: missing main image'

    # 主立绘 -> full.webp
    dst_png = os.path.join(dst_dir, 'full.png')
    shutil.copy2(os.path.join(src_dir, main), dst_png)
    rel = to_webp(dst_png)
    c['fullArt'] = rel
    copied += 1

    # 换装 -> skin-NN.webp
    new_skins = []
    for i, f in enumerate((f for f in files if f != main), start=1):
        dst_png = os.path.join(dst_dir, f'skin-{i:02d}.png')
        shutil.copy2(os.path.join(src_dir, f), dst_png)
        rel = to_webp(dst_png)
        new_skins.append({'name': os.path.splitext(f)[0], 'fullArt': rel})
        copied += 1
    if new_skins:
        def is_auto(s):
            p = s.get('fullArt', '')
            return bool(re.match(r'images/characters/[^/]+/skin-\d+\.(?:png|webp)$', p))
        existing = [s for s in (c.get('skins') or []) if isinstance(s, dict) and not is_auto(s)]
        c['skins'] = existing + new_skins
        skinned += 1
print(f'files converted to webp: {copied}')
print(f'characters with skins: {skinned}')

# 3) 键序：skins 插到 fullArt 之后
for i, c in enumerate(chars):
    if 'skins' in c:
        skins = c.pop('skins')
        new = {}
        for k, v in c.items():
            new[k] = v
            if k == 'fullArt':
                new['skins'] = skins
        chars[i] = new

out = json.dumps(data, ensure_ascii=False, indent=2).replace('\n', '\r\n')
with open(JSON, 'w', encoding='utf-8', newline='') as f:
    f.write(out)

print(f'total characters: {len(chars)}')
