#!/usr/bin/env python3
"""Diff the current export against an earlier git revision of it.

Writes data/patch-changes.json, which powers the /changes page.

Usage:
    python3 scripts/diff-export.py [--base HEAD]
"""

import argparse
import json
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_DIR = os.path.join(ROOT, "export", "json")
OUT = os.path.join(ROOT, "data", "patch-changes.json")

# Only stat-bearing fields; image paths and string ids are noise in a changelog.
TRACKED = {
    "units": [
        "hp", "attack", "range", "min_range", "melee_armor", "pierce_armor",
        "line_of_sight", "speed", "reload_time", "accuracy_percent", "train_time",
        "cost_food", "cost_wood", "cost_gold", "cost_stone", "garrison_capacity",
    ],
    "buildings": [
        "hp", "attack", "range", "melee_armor", "pierce_armor", "line_of_sight",
        "garrison_capacity", "train_time", "cost_food", "cost_wood", "cost_gold",
        "cost_stone",
    ],
    "techs": ["research_time", "cost_food", "cost_wood", "cost_gold", "cost_stone"],
}

LABELS = {
    "hp": "HP",
    "attack": "attack",
    "range": "range",
    "min_range": "min range",
    "melee_armor": "melee armor",
    "pierce_armor": "pierce armor",
    "line_of_sight": "line of sight",
    "speed": "speed",
    "reload_time": "reload time",
    "accuracy_percent": "accuracy",
    "train_time": "train time",
    "garrison_capacity": "garrison",
    "research_time": "research time",
    "cost_food": "food cost",
    "cost_wood": "wood cost",
    "cost_gold": "gold cost",
    "cost_stone": "stone cost",
}


def read_jsonl(text):
    return [json.loads(line) for line in text.splitlines() if line.strip()]


def read_current(name):
    with open(os.path.join(JSON_DIR, f"{name}.json")) as fh:
        return read_jsonl(fh.read())


def read_base(base, name):
    try:
        out = subprocess.run(
            ["git", "show", f"{base}:export/json/{name}.json"],
            cwd=ROOT,
            capture_output=True,
            check=True,
            text=True,
        )
    except subprocess.CalledProcessError:
        return None
    return read_jsonl(out.stdout)


def entity_names(rows):
    return {row["entity_id"]: row["name"] for row in rows}


def diff_table(kind, base_rows, current_rows, names):
    base = {row["id"]: row for row in base_rows}
    current = {row["id"]: row for row in current_rows}

    added = [{"id": eid, "name": names.get(eid, current[eid]["internal_name"])} for eid in sorted(set(current) - set(base))]
    removed = [{"id": eid, "name": base[eid]["internal_name"]} for eid in sorted(set(base) - set(current))]

    changed = []
    for eid in sorted(set(base) & set(current)):
        fields = []
        for field in TRACKED[kind]:
            before, after = base[eid].get(field), current[eid].get(field)
            if before != after:
                fields.append(
                    {"field": LABELS.get(field, field), "before": before, "after": after}
                )
        if fields:
            changed.append(
                {"id": eid, "name": names.get(eid, current[eid]["internal_name"]), "fields": fields}
            )

    return {"added": added, "removed": removed, "changed": changed}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="HEAD", help="git revision to compare against")
    args = parser.parse_args()

    names_by_type = {"unit": {}, "building": {}, "tech": {}}
    for row in read_current("names"):
        names_by_type[row["entity_type"]][row["entity_id"]] = row["name"]

    result = {"base": args.base, "tables": {}}
    for kind, name_key in (("units", "unit"), ("buildings", "building"), ("techs", "tech")):
        base_rows = read_base(args.base, kind)
        if base_rows is None:
            print(f"no baseline for {kind}, skipping")
            continue
        result["tables"][kind] = diff_table(kind, base_rows, read_current(kind), names_by_type[name_key])

    base_civs = read_base(args.base, "civilizations")
    if base_civs is not None:
        current_civs = {row["name"] for row in read_current("civilizations")}
        previous_civs = {row["name"] for row in base_civs}
        result["civilizations"] = {
            "added": sorted(current_civs - previous_civs),
            "removed": sorted(previous_civs - current_civs),
        }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fh:
        json.dump(result, fh, indent=2)
        fh.write("\n")

    totals = {kind: len(table["changed"]) for kind, table in result["tables"].items()}
    print(f"wrote {OUT}: {totals}")


if __name__ == "__main__":
    main()
