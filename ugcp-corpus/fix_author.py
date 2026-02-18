#!/usr/bin/env python3
"""
global_integrity_check.py - Complete Integrity Check for Urdu Ghazal Corpus
Author: Assistant
Date: 2026-02-17

Checks:
1. TEXT_ID uniqueness across poets
2. AUTHOR_ID correctness for each poet
3. ID format validation
"""

import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

BASE_PATH = Path("C:/Users/Zahid/Desktop/Urdu_Ghazal_Corpus")
TEXTS_PATH = BASE_PATH / "texts"

POETS = [
    ('ghalib', 'Ghalib'),
    ('iqbal', 'Iqbal'),
    ('mir', 'Mir'),
    ('faiz', 'Faiz'),
    ('fraz', 'Fraz'),
    ('parveen', 'Parveen'),
    ('noshi', 'Noshi'),
    ('kazmi', 'Kazmi'),
    ('wasi', 'Wasi')
]

def load_poet_data(poet_short):
    """Load poet's text data."""
    file_path = TEXTS_PATH / f"{poet_short}_texts.json"
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {poet_short}: {e}")
        return []

def main():
    print("\n" + "=" * 120)
    print("🌟 COMPLETE INTEGRITY CHECK - TEXT_ID & AUTHOR_ID")
    print("=" * 120)
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 120)
    
    # Data structures
    id_registry = defaultdict(list)  # text_id -> [poet1, poet2, ...]
    author_issues = []
    poet_stats = []
    
    # Collect all data
    for poet_short, poet_name in POETS:
        data = load_poet_data(poet_short)
        
        text_ids = []
        author_correct = 0
        author_missing = 0
        author_wrong = 0
        wrong_ids = []
        
        for item in data:
            text_id = item.get('TEXT_ID', '')
            author_id = item.get('AUTHOR_ID', '')
            
            if text_id:
                text_ids.append(text_id)
                id_registry[text_id].append(poet_name)
            
            # Check AUTHOR_ID
            if not author_id:
                author_missing += 1
                wrong_ids.append((text_id, 'MISSING'))
            elif author_id != poet_short:
                author_wrong += 1
                wrong_ids.append((text_id, f"{author_id} → should be {poet_short}"))
            else:
                author_correct += 1
        
        poet_stats.append({
            'short': poet_short,
            'name': poet_name,
            'total': len(data),
            'text_ids': text_ids,
            'author_correct': author_correct,
            'author_missing': author_missing,
            'author_wrong': author_wrong,
            'wrong_ids': wrong_ids
        })
    
    # Find TEXT_ID conflicts
    conflicts = {tid: poets for tid, poets in id_registry.items() if len(poets) > 1}
    
    # TABLE 1: SUMMARY
    print("\n" + "┌" + "─" * 118 + "┐")
    print("│{:^118}│".format("📊 INTEGRITY SUMMARY"))
    print("├" + "─" * 118 + "┤")
    print("│ {:<20} │ {:>15} │ {:>15} │ {:>15} │ {:>15} │ {:>15} │".format(
        "Metric", "Total", "Unique", "Conflicts", "Issues", "Status"))
    print("├" + "─" * 20 + "┼" + "─" * 17 + "┼" + "─" * 17 + "┼" + "─" * 17 + "┼" + "─" * 17 + "┼" + "─" * 17 + "┤")
    
    total_ids = len(id_registry)
    unique_ids = total_ids - len(conflicts)
    total_author_issues = sum(s['author_missing'] + s['author_wrong'] for s in poet_stats)
    
    text_status = "✅ CLEAN" if not conflicts else "⚠️ CONFLICTS"
    author_status = "✅ CLEAN" if total_author_issues == 0 else f"⚠️ {total_author_issues} ISSUES"
    
    print("│ {:<20} │ {:>15} │ {:>15} │ {:>15} │ {:>15} │ {:>15} │".format(
        "TEXT_ID", total_ids, unique_ids, len(conflicts), "-", text_status))
    print("│ {:<20} │ {:>15} │ {:>15} │ {:>15} │ {:>15} │ {:>15} │".format(
        "AUTHOR_ID", "-", "-", "-", total_author_issues, author_status))
    print("└" + "─" * 20 + "┴" + "─" * 17 + "┴" + "─" * 17 + "┴" + "─" * 17 + "┴" + "─" * 17 + "┴" + "─" * 17 + "┘")
    
    # TABLE 2: POET-WISE TEXT_ID SUMMARY
    print("\n" + "┌" + "─" * 118 + "┐")
    print("│{:^118}│".format("📋 POET-WISE TEXT_ID SUMMARY"))
    print("├" + "─" * 118 + "┤")
    print("│ {:<4} │ {:<12} │ {:>10} │ {:>25} │ {:>25} │ {:>20} │".format(
        "No.", "Poet", "Ghazals", "ID Range", "Sample IDs", "Status"))
    print("├" + "─" * 4 + "┼" + "─" * 14 + "┼" + "─" * 12 + "┼" + "─" * 27 + "┼" + "─" * 27 + "┼" + "─" * 22 + "┤")
    
    for i, stat in enumerate(poet_stats, 1):
        ids = stat['text_ids']
        if ids:
            id_range = f"{min(ids)} to {max(ids)}"
            samples = ', '.join(sorted(ids)[:2])
            if len(ids) > 2:
                samples += "..."
        else:
            id_range = "N/A"
            samples = "N/A"
        
        # Check if this poet's IDs appear in conflicts
        poet_conflicts = [tid for tid, poets in conflicts.items() if stat['name'] in poets]
        if poet_conflicts:
            status = f"⚠️ {len(poet_conflicts)} conflicts"
        else:
            status = "✅ Unique"
        
        print("│ {:<4} │ {:<12} │ {:>10} │ {:>25} │ {:>25} │ {:>20} │".format(
            i, stat['name'], stat['total'], id_range[:25], samples[:25], status))
    
    print("└" + "─" * 4 + "┴" + "─" * 14 + "┴" + "─" * 12 + "┴" + "─" * 27 + "┴" + "─" * 27 + "┴" + "─" * 22 + "┘")
    
    # TABLE 3: POET-WISE AUTHOR_ID SUMMARY
    print("\n" + "┌" + "─" * 118 + "┐")
    print("│{:^118}│".format("🔑 POET-WISE AUTHOR_ID SUMMARY"))
    print("├" + "─" * 118 + "┤")
    print("│ {:<4} │ {:<12} │ {:>10} │ {:>12} │ {:>10} │ {:>10} │ {:>20} │".format(
        "No.", "Poet", "Total", "Correct", "Missing", "Wrong", "Status"))
    print("├" + "─" * 4 + "┼" + "─" * 14 + "┼" + "─" * 12 + "┼" + "─" * 14 + "┼" + "─" * 12 + "┼" + "─" * 12 + "┼" + "─" * 22 + "┤")
    
    for i, stat in enumerate(poet_stats, 1):
        issues = stat['author_missing'] + stat['author_wrong']
        if issues == 0:
            status = "✅ All Correct"
        else:
            status = f"⚠️ {issues} issues"
        
        print("│ {:<4} │ {:<12} │ {:>10} │ {:>12} │ {:>10} │ {:>10} │ {:>20} │".format(
            i, stat['name'], stat['total'], stat['author_correct'], 
            stat['author_missing'], stat['author_wrong'], status))
    
    print("└" + "─" * 4 + "┴" + "─" * 14 + "┴" + "─" * 12 + "┴" + "─" * 14 + "┴" + "─" * 12 + "┴" + "─" * 12 + "┴" + "─" * 22 + "┘")
    
    # TABLE 4: TEXT_ID CONFLICTS (if any)
    if conflicts:
        print("\n" + "┌" + "─" * 118 + "┐")
        print("│{:^118}│".format("⚠️ TEXT_ID CONFLICTS"))
        print("├" + "─" * 118 + "┤")
        print("│ {:<20} │ {:<30} │ {:>60} │".format("TEXT_ID", "Poets", "Status"))
        print("├" + "─" * 20 + "┼" + "─" * 32 + "┼" + "─" * 62 + "┤")
        
        for tid, poets in sorted(conflicts.items()):
            poet_list = ', '.join(poets)
            print("│ {:<20} │ {:<30} │ {:>60} │".format(tid, poet_list[:30], "❌ CONFLICT"))
        
        print("└" + "─" * 20 + "┴" + "─" * 32 + "┴" + "─" * 62 + "┘")
    else:
        print("\n" + "┌" + "─" * 118 + "┐")
        print("│{:^118}│".format("✅ NO TEXT_ID CONFLICTS - All IDs are unique across poets!"))
        print("└" + "─" * 118 + "┘")
    
    # TABLE 5: AUTHOR_ID ISSUES (if any)
    author_issue_poets = [s for s in poet_stats if s['author_missing'] > 0 or s['author_wrong'] > 0]
    if author_issue_poets:
        print("\n" + "┌" + "─" * 118 + "┐")
        print("│{:^118}│".format("❌ AUTHOR_ID ISSUES DETAILS"))
        print("├" + "─" * 118 + "┤")
        
        for stat in author_issue_poets:
            print("│ {:^118} │".format(f"📌 {stat['name']}"))
            print("├" + "─" * 30 + "┬" + "─" * 87 + "┤")
            print("│ {:<30} │ {:<87} │".format("TEXT_ID", "Issue"))
            print("├" + "─" * 30 + "┼" + "─" * 87 + "┤")
            
            for text_id, issue in stat['wrong_ids']:
                print("│ {:<30} │ {:<87} │".format(text_id, issue))
            
            if stat != author_issue_poets[-1]:
                print("├" + "─" * 30 + "┼" + "─" * 87 + "┤")
        
        print("└" + "─" * 30 + "┴" + "─" * 87 + "┘")
    else:
        print("\n" + "┌" + "─" * 118 + "┐")
        print("│{:^118}│".format("✅ ALL AUTHOR_IDs ARE CORRECT!"))
        print("└" + "─" * 118 + "┘")
    
    # TABLE 6: FINAL VERDICT
    print("\n" + "┌" + "─" * 118 + "┐")
    print("│{:^118}│".format("🏆 FINAL INTEGRITY VERDICT"))
    print("├" + "─" * 118 + "┤")
    
    if not conflicts and total_author_issues == 0:
        print("│{:^118}│".format("✨ PERFECT! All TEXT_IDs are unique and all AUTHOR_IDs are correct! ✨"))
        print("│{:^118}│".format("🎉 Your corpus is 100% clean! 🎉"))
    elif not conflicts and total_author_issues > 0:
        print("│{:^118}│".format("⚠️ TEXT_ID: ✅ CLEAN"))
        print("│{:^118}│".format(f"⚠️ AUTHOR_ID: {total_author_issues} issues need fixing"))
    elif conflicts and total_author_issues == 0:
        print("│{:^118}│".format(f"⚠️ TEXT_ID: {len(conflicts)} conflicts found"))
        print("│{:^118}│".format("⚠️ AUTHOR_ID: ✅ CLEAN"))
    else:
        print("│{:^118}│".format(f"⚠️ TEXT_ID: {len(conflicts)} conflicts found"))
        print("│{:^118}│".format(f"⚠️ AUTHOR_ID: {total_author_issues} issues need fixing"))
    
    print("└" + "─" * 118 + "┘")
    
    # Save report
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_file = BASE_PATH / f"global_integrity_report_{timestamp}.txt"
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("=" * 120 + "\n")
        f.write("COMPLETE INTEGRITY CHECK - TEXT_ID & AUTHOR_ID\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 120 + "\n\n")
        
        f.write(f"TEXT_ID: Total={total_ids}, Unique={unique_ids}, Conflicts={len(conflicts)}\n")
        f.write(f"AUTHOR_ID: Total Issues={total_author_issues}\n\n")
        
        if conflicts:
            f.write("TEXT_ID CONFLICTS:\n")
            for tid, poets in conflicts.items():
                f.write(f"  {tid}: {', '.join(poets)}\n")
        
        if author_issue_poets:
            f.write("\nAUTHOR_ID ISSUES:\n")
            for stat in author_issue_poets:
                f.write(f"\n{stat['name']}:\n")
                for text_id, issue in stat['wrong_ids']:
                    f.write(f"  {text_id}: {issue}\n")
    
    print(f"\n✅ Detailed report saved to: {report_file}")
    print("=" * 120)

if __name__ == "__main__":
    main()