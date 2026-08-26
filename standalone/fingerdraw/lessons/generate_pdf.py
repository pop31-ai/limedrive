"""
Generate PDF of 6 lessons.
Run: python lessons/generate_pdf.py
"""

import os
from fpdf import FPDF

LESSONS_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PDF = os.path.join(LESSONS_DIR, "FingerDraw_Lessons.pdf")

lesson_files = sorted([f for f in os.listdir(LESSONS_DIR)
                       if f.endswith('.md') and f != 'README.md'])

FONT_DIR = "C:/Windows/Fonts"
FONT_REGULAR = os.path.join(FONT_DIR, "segoeui.ttf")
FONT_BOLD = os.path.join(FONT_DIR, "segoeuib.ttf")
if not os.path.exists(FONT_REGULAR):
    FONT_REGULAR = os.path.join(FONT_DIR, "arial.ttf")
    FONT_BOLD = os.path.join(FONT_DIR, "arialbd.ttf")
if not os.path.exists(FONT_BOLD):
    FONT_BOLD = FONT_REGULAR

pdf = FPDF()
pdf.set_auto_page_break(auto=True, margin=20)
pdf.add_font("Rg", "", FONT_REGULAR)
pdf.add_font("Bd", "", FONT_BOLD)

def write(txt, style='Rg', size=10, color=(50,50,50)):
    pdf.set_font(style, '', size)
    pdf.set_text_color(*color)
    pdf.set_x(pdf.l_margin)
    pdf.multi_cell(w=0, h=size * 0.5 + 2, text=txt)

def add_lesson_content(content):
    for line in content.split('\n'):
        line = line.rstrip()
        if not line:
            pdf.ln(2)
        elif line.startswith('# '):
            write(line[2:], 'Bd', 18, (233, 69, 96))
            pdf.ln(3)
        elif line.startswith('## '):
            write(line[3:], 'Bd', 14, (26, 26, 46))
            pdf.ln(2)
        elif line.startswith('### '):
            write(line[4:], 'Bd', 12, (22, 33, 62))
            pdf.ln(1)
        elif line.startswith('- '):
            pdf.set_x(pdf.l_margin + 6)
            pdf.set_font("Rg", '', 10)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(w=0, h=5, text=line[2:])
            pdf.set_x(pdf.l_margin)
        elif line.startswith('| ') or line.startswith('|---'):
            pass
        elif line.startswith('```'):
            pass
        else:
            write(line)

pdf.add_page()
pdf.ln(50)
write("FingerDraw", 'Bd', 36, (233, 69, 96))
write("6 Lessons for Tablet Artists", 'Rg', 18, (100, 100, 100))
pdf.ln(15)
write("Professional finger drawing app for tablets", 'Rg', 11, (150, 150, 150))
write("FingerDraw v1.0", 'Rg', 11, (150, 150, 150))

for lf in lesson_files:
    pdf.add_page()
    with open(os.path.join(LESSONS_DIR, lf), 'r', encoding='utf-8') as f:
        add_lesson_content(f.read())

pdf.output(OUTPUT_PDF)
print(f"PDF: {OUTPUT_PDF} ({os.path.getsize(OUTPUT_PDF) // 1024} KB)")
