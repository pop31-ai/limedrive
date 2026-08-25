#!/usr/bin/env python3
"""
Шаблон генератора печати. Скопируй вместе с template/ в папку игры,
переименуй в generate_print.py и заполни секции «ТВОЁ».

Запуск:  python generate_print.py
Даёт:    print/board.pdf, print/cards_materials.pdf, print/cards_events.pdf,
         print/pawns.pdf, print/dice.pdf, print/rules.pdf
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

OUT = "print"
os.makedirs(OUT, exist_ok=True)

# ---------- Настройки ----------
GAME = "ТВОЯ ИГРА"          # ТВОЁ: название
CELLS_PER_SECTOR = 8        # ТВОЁ: клеток на луч
SECTORS = 4                 # ТВОЁ: лучей (луч = свой старт)
MATERIALS = ["Кирпич", "Дерево", "Сталь", "Стекло"]  # ТВОЁ
EVENTS = ["+1 материал по выбору", "Обменяй 2 карты на 1 любую"]  # ТВОЁ
# Клетки в секторе: [0]=база, [1]=? ... 4=разгон, 6=спуск
TYPES = ["BASE", "MAT", "EVENT", "MAT", "FWD", "MAT", "BACK", "MAT"]

# ---------- Поле (A2) ----------
CX, CY, ROUT, RIN = 210, 320, 185, 120
FONT = "arial.ttf"


def verts():
    v = []
    for i in range(8):
        a = math.radians(90 - i * 45)
        r = ROUT if i % 2 == 0 else RIN
        v.append((CX + r * math.cos(a), CY - r * math.sin(a)))
    return v


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def cells():
    v = verts()
    out = []
    for s in range(SECTORS):
        va, vb, vc = v[2 * s], v[2 * s + 1], v[(2 * s + 2) % 8]
        pos = [va, lerp(va, vb, .27), lerp(va, vb, .50), lerp(va, vb, .73),
               vb, lerp(vb, vc, .27), lerp(vb, vc, .50), lerp(vb, vc, .73)]
        for k in range(CELLS_PER_SECTOR):
            out.append((s * CELLS_PER_SECTOR + k, pos[k][0], pos[k][1], TYPES[k]))
    return out


def draw_board():
    im = Image.new("RGB", (420, 594), "white")
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([10, 10, 410, 584], radius=12,
                        outline=(120, 120, 120), width=4)
    for idx, x, y, typ in cells():
        r = 20 if typ == "BASE" else 14.5
        color = {"BASE": (230, 220, 160), "MAT": (225, 235, 245),
                 "EVENT": (240, 225, 245), "FWD": (215, 245, 220),
                 "BACK": (248, 220, 220)}[typ]
        d.ellipse([x - r, y - r, x + r, y + r], fill=color,
                  outline=(90, 90, 90), width=2)
        d.text((x - 8, y - 6), str(idx % CELLS_PER_SECTOR), fill=(80, 80, 80))
    f = ImageFont.truetype(FONT, 28)
    d.text((CX - 100, CY - 14), GAME, fill=(60, 60, 60), font=f)
    im.save(f"{OUT}/board.png")
    return im


def card(i, w, h, fill, text, label):
    im = Image.new("RGB", (w, h), fill)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([2, 2, w - 3, h - 3], radius=14,
                        outline=(90, 90, 90), width=3)
    d.text((18, 14), label, fill=(40, 40, 40))
    d.text((18, 90), text, fill=(40, 40, 40))
    d.line([6, 8, 14, 8], fill=(200, 30, 30), width=4)  # линия резки-маркер
    return im


def sheet(cards_imgs, cols, rows, name):
    W, H = 1240, 1754
    cw, ch = 372, 545
    sheet = Image.new("RGB", (W, H), "white")
    for r in range(rows):
        for c in range(cols):
            i = r * cols + c
            if i < len(cards_imgs):
                sheet.paste(cards_imgs[i], (20 + c * (cw + 12), 20 + r * (ch + 12)))
    sheet.save(f"{OUT}/{name}.png")


def make_materials():
    colors = [(196, 60, 48), (170, 130, 60), (150, 160, 175), (120, 190, 220)]
    imgs = [card(i, 372, 545, colors[i], "Твоя карта материала", MATERIALS[i])
            for i in range(len(MATERIALS)) for _ in range(2)]
    sheet(imgs, 3, 3, "cards_materials")


def make_events():
    imgs = [card(i, 372, 545, (240, 225, 245), t, "СОБЫТИЕ") for i, t in enumerate(EVENTS)]
    sheet(imgs, 3, 3, "cards_events")


if __name__ == "__main__":
    draw_board()
    make_materials()
    make_events()
    print("Сгенерировано в", OUT)
