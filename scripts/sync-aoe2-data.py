#!/usr/bin/env python3
"""Regenerate export/json, export/parquet and export/img from aoe2techtree upstream.

Source: https://github.com/SiegeEngineers/aoe2techtree (data/data.json + data/trees/*.json + img/).

Usage:
    python3 scripts/sync-aoe2-data.py [--cache-dir DIR] [--skip-images]

Requires: duckdb CLI, cwebp (webp tools), Pillow only if verifying images manually.
"""

import argparse
import concurrent.futures
import json
import os
import shutil
import subprocess
import sys
import urllib.request

RAW = "https://raw.githubusercontent.com/SiegeEngineers/aoe2techtree/master"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_DIR = os.path.join(ROOT, "export", "json")
PARQUET_DIR = os.path.join(ROOT, "export", "parquet")
IMG_DIR = os.path.join(ROOT, "export", "img")


# Units whose icon has no tech tree node upstream; reuse a companion unit's picture.
ICON_ALIASES = {
    42: 331,  # unpacked Trebuchet -> packed Trebuchet
    1252: 1225,  # dismounted Konnik -> Konnik
    1253: 1227,  # dismounted Elite Konnik -> Elite Konnik
    1738: 1759,  # Ratha (other mode)
    1740: 1761,  # Elite Ratha (other mode)
    1980: 1962,  # War Chariot (duplicate id)
}

# Entities with no tech tree node at all, so no upstream name either.
NAME_OVERRIDES = {
    "Unit": {
        42: "Trebuchet",
        1252: "Konnik (Dismounted)",
        1253: "Elite Konnik (Dismounted)",
        1570: "Aztec Raider",
        1738: "Ratha",
        1740: "Elite Ratha",
        1980: "War Chariot",
    },
    "Building": {
        71: "Town Center",
    },
}

MISSING_IMAGE = "img/missing.webp"


def fetch(url, dest):
    if not os.path.exists(dest):
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        urllib.request.urlretrieve(url, dest)
    return dest


def download_source(cache):
    data = json.load(open(fetch(f"{RAW}/data/data.json", f"{cache}/data.json")))
    civs = sorted(data["civs"])
    with concurrent.futures.ThreadPoolExecutor(10) as pool:
        list(
            pool.map(
                lambda c: fetch(
                    f"{RAW}/data/trees/{c.upper()}.json", f"{cache}/trees/{c.upper()}.json"
                ),
                civs,
            )
        )
    strings = json.load(
        open(fetch(f"{RAW}/data/locales/en/strings.json", f"{cache}/strings.json"))
    )
    trees = {c: json.load(open(f"{cache}/trees/{c.upper()}.json")) for c in civs}
    return data, trees, strings


def write_jsonl(name, rows):
    path = os.path.join(JSON_DIR, name)
    with open(path, "w") as fh:
        for row in rows:
            fh.write(json.dumps(row) + "\n")
    return len(rows)


def cost(entry, key):
    return entry.get("Cost", {}).get(key, 0)


def help_id(tree_help_string_id):
    """Tech tree help strings are 100000-offset; the export stores the 21000-offset form."""
    if tree_help_string_id is None:
        return None
    return tree_help_string_id - 79000 if tree_help_string_id >= 100000 else tree_help_string_id


def build_entity_rows(entries, img_folder, picture_index, extra_fields):
    rows = []
    for entry in sorted(entries.values(), key=lambda e: e["ID"]):
        eid = entry["ID"]
        row = {
            "id": eid,
            "internal_name": entry.get("internal_name"),
            "hp": entry.get("HP"),
            "attack": entry.get("Attack"),
            "range": entry.get("Range"),
            "min_range": entry.get("MinRange"),
            "melee_armor": entry.get("MeleeArmor"),
            "pierce_armor": entry.get("PierceArmor"),
            "garrison_capacity": entry.get("GarrisonCapacity"),
            "line_of_sight": entry.get("LineOfSight"),
        }
        for field in extra_fields:
            row[field[0]] = entry.get(field[1])
        row.update(
            {
                "train_time": entry.get("TrainTime"),
                "cost_food": cost(entry, "Food"),
                "cost_wood": cost(entry, "Wood"),
                "cost_gold": cost(entry, "Gold"),
                "cost_stone": cost(entry, "Stone"),
                "language_name_id": entry.get("LanguageNameId"),
                "language_help_id": None,  # filled from the tech tree help string ids
                "image_path": (
                    f"img/{img_folder}/{eid}.webp" if eid in picture_index else MISSING_IMAGE
                ),
            }
        )
        rows.append((row, picture_index.get(eid)))
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache-dir", default=os.path.join(ROOT, ".aoe2-cache"))
    parser.add_argument("--skip-images", action="store_true")
    parser.add_argument("--out-dir", help="write export/ elsewhere (for diffing a dry run)")
    args = parser.parse_args()

    if args.out_dir:
        global JSON_DIR, PARQUET_DIR, IMG_DIR
        JSON_DIR = os.path.join(args.out_dir, "json")
        PARQUET_DIR = os.path.join(args.out_dir, "parquet")
        IMG_DIR = os.path.join(args.out_dir, "img")
        for path in (JSON_DIR, PARQUET_DIR, IMG_DIR):
            os.makedirs(path, exist_ok=True)
        shutil.copy(
            os.path.join(ROOT, "export", "parquet", "schema.sql"),
            os.path.join(PARQUET_DIR, "schema.sql"),
        )

    data, trees, strings = download_source(args.cache_dir)
    entities = data["data"]

    # ---- picture indexes + help ids + node types, collected from the per-civ trees
    picture = {"Unit": {}, "Tech": {}, "Building": {}}
    help_ids = {"Unit": {}, "Tech": {}, "Building": {}}
    node_types = {"Unit": {}, "Building": {}, "Tech": {}}
    node_buildings = {"Unit": {}, "Building": {}, "Tech": {}}
    node_links = {"Unit": {}, "Building": {}, "Tech": {}}
    tree_names = {"Unit": {}, "Building": {}, "Tech": {}}
    monk_suffix = {}
    for civ, tree in trees.items():
        nodes = tree["units_techs"] + tree["buildings"]
        for node in nodes:
            kind = node["use_type"]
            nid = node["node_id"]
            picture[kind].setdefault(nid, node["picture_index"])
            help_ids[kind].setdefault(nid, node["help_string_id"])
            node_types[kind].setdefault(nid, node["node_type"])
            node_buildings[kind].setdefault(nid, node["building_id"])
            if node.get("link_id") is not None and node["link_node_type"] != "BuildingTech":
                node_links[kind].setdefault(nid, node["link_id"])
            tree_names[kind].setdefault(nid, node["name"])
            if kind == "Unit" and nid == 125:
                monk_suffix[civ] = f"_{node['picture_index']}"

    for target, source in ICON_ALIASES.items():
        if target not in picture["Unit"] and source in picture["Unit"]:
            picture["Unit"][target] = picture["Unit"][source]

    # ---- core entity tables
    unit_extra = [
        ("speed", "Speed"),
        ("reload_time", "ReloadTime"),
        ("accuracy_percent", "AccuracyPercent"),
        ("frame_delay", "FrameDelay"),
        ("attack_delay_seconds", "AttackDelaySeconds"),
        ("blast_width", "BlastWidth"),
        ("max_charge", "MaxCharge"),
        ("recharge_rate", "RechargeRate"),
        ("recharge_duration", "RechargeDuration"),
        ("charge_event", "ChargeEvent"),
        ("charge_type", "ChargeType"),
        ("trait", "Trait"),
        ("trait_piece", "TraitPiece"),
    ]
    unit_rows = build_entity_rows(entities["Unit"], "Units", picture["Unit"], unit_extra)
    building_rows = build_entity_rows(
        entities["Building"],
        "Buildings",
        picture["Building"],
        [("reload_time", "ReloadTime"), ("accuracy_percent", "AccuracyPercent")],
    )

    def order_unit(row):
        keys = [
            "id", "internal_name", "hp", "attack", "range", "min_range", "melee_armor",
            "pierce_armor", "garrison_capacity", "line_of_sight", "speed", "reload_time",
            "accuracy_percent", "frame_delay", "attack_delay_seconds", "train_time",
            "blast_width", "max_charge", "recharge_rate", "recharge_duration",
            "charge_event", "charge_type", "trait", "trait_piece", "cost_food",
            "cost_wood", "cost_gold", "cost_stone", "language_name_id",
            "language_help_id", "image_path",
        ]
        return {k: row[k] for k in keys}

    def order_building(row):
        keys = [
            "id", "internal_name", "hp", "attack", "range", "min_range", "melee_armor",
            "pierce_armor", "garrison_capacity", "line_of_sight", "reload_time",
            "accuracy_percent", "train_time", "cost_food", "cost_wood", "cost_gold",
            "cost_stone", "language_name_id", "language_help_id", "image_path",
        ]
        return {k: row[k] for k in keys}

    for kind, rows in (("Unit", unit_rows), ("Building", building_rows)):
        for row, _ in rows:
            row["language_help_id"] = help_id(help_ids[kind].get(row["id"]))

    write_jsonl("units.json", [order_unit(r) for r, _ in unit_rows])
    write_jsonl("buildings.json", [order_building(r) for r, _ in building_rows])

    tech_rows = []
    for tech in sorted(entities["Tech"].values(), key=lambda t: t["ID"]):
        tid = tech["ID"]
        tech_rows.append(
            {
                "id": tid,
                "internal_name": tech.get("internal_name"),
                "research_time": tech.get("ResearchTime"),
                "repeatable": bool(tech.get("Repeatable", False)),
                "cost_food": cost(tech, "Food"),
                "cost_wood": cost(tech, "Wood"),
                "cost_gold": cost(tech, "Gold"),
                "cost_stone": cost(tech, "Stone"),
                "language_name_id": tech.get("LanguageNameId"),
                "language_help_id": help_id(help_ids["Tech"].get(tid)),
                "image_path": (
                    f"img/Techs/{tid}.webp" if tid in picture["Tech"] else MISSING_IMAGE
                ),
            }
        )
    write_jsonl("techs.json", tech_rows)

    # ---- attacks / armours
    def combat(kind, key, id_field):
        rows = []
        for entry in sorted(entities[kind].values(), key=lambda e: e["ID"]):
            for item in entry.get(key + "s", []) or []:
                rows.append(
                    {
                        id_field: entry["ID"],
                        f"{key.lower()}_class": item["Class"],
                        "amount": item["Amount"],
                    }
                )
        return rows

    write_jsonl("unit_attacks.json", combat("Unit", "Attack", "unit_id"))
    write_jsonl("unit_armours.json", combat("Unit", "Armour", "unit_id"))
    write_jsonl("building_attacks.json", combat("Building", "Attack", "building_id"))
    write_jsonl("building_armours.json", combat("Building", "Armour", "building_id"))

    # ---- unit upgrades
    upgrade_rows = []
    for unit_id, upgrade in sorted(
        entities["unit_upgrades"].items(), key=lambda kv: int(kv[0])
    ):
        upgrade_rows.append(
            {
                "unit_id": int(unit_id),
                "tech_id": upgrade["ID"],
                "internal_name": upgrade.get("internal_name"),
                "research_time": upgrade.get("ResearchTime"),
                "cost_food": cost(upgrade, "Food"),
                "cost_wood": cost(upgrade, "Wood"),
                "cost_gold": cost(upgrade, "Gold"),
                "cost_stone": cost(upgrade, "Stone"),
            }
        )
    write_jsonl("unit_upgrades.json", upgrade_rows)

    # ---- civ tables
    civ_names, civ_helptexts, civilizations = [], [], []
    civ_units, civ_buildings, civ_techs, civ_uniques = [], [], [], []
    for civ in sorted(data["civs"]):
        meta = data["civs"][civ]
        civ_names.append({"name": civ, "string_id": meta["name_string_id"]})
        civ_helptexts.append({"name": civ, "string_id": meta["help_string_id"]})
        civilizations.append(
            {
                "name": civ,
                "monk_suffix": monk_suffix.get(civ, "_33"),
                "image_path": f"img/Civs/{civ.lower()}.webp",
            }
        )
        tree = trees[civ]
        ages = {}
        for node in tree["units_techs"] + tree["buildings"]:
            ages.setdefault((node["use_type"], node["node_id"]), node["age_id"])
        for unit_id in sorted(meta["Unit"]):
            civ_units.append(
                {"civ_name": civ, "unit_id": unit_id, "age": ages.get(("Unit", unit_id), 1)}
            )
        for building_id in sorted(meta["Building"]):
            civ_buildings.append(
                {
                    "civ_name": civ,
                    "building_id": building_id,
                    "age": ages.get(("Building", building_id), 1),
                }
            )
        for tech_id in sorted(meta["Tech"]):
            civ_techs.append(
                {"civ_name": civ, "tech_id": tech_id, "age": ages.get(("Tech", tech_id), 1)}
            )

        castle_nodes = [n for n in tree["units_techs"] if n["building_id"] == 82]
        unique_units = [n for n in castle_nodes if n["node_type"] == "UniqueUnit"]
        castle_uu = next((n["node_id"] for n in unique_units if n["age_id"] == 3), None)
        imperial_uu = next(
            (n["node_id"] for n in unique_units if n["link_id"] == castle_uu), None
        )
        researches = [n for n in castle_nodes if n["use_type"] == "Tech"]
        castle_ut = next((n["node_id"] for n in researches if n["age_id"] == 3), None)
        imperial_ut = next(
            (n["node_id"] for n in researches if n["age_id"] == 4 and n["row"] == 6), None
        )
        civ_uniques.append(
            {
                "civ_name": civ,
                "castle_age_unique_unit": castle_uu,
                "imperial_age_unique_unit": imperial_uu,
                "castle_age_unique_tech": castle_ut,
                "imperial_age_unique_tech": imperial_ut,
            }
        )

    write_jsonl("civ_names.json", civ_names)
    write_jsonl("civ_helptexts.json", civ_helptexts)
    write_jsonl("civilizations.json", civilizations)
    write_jsonl("civ_units.json", civ_units)
    write_jsonl("civ_buildings.json", civ_buildings)
    write_jsonl("civ_techs.json", civ_techs)
    write_jsonl("civ_uniques.json", civ_uniques)

    age_rows = [
        {"name": strings.get(sid, sid), "string_id": int(sid)}
        for sid in data["age_names"]["base"]
    ]
    write_jsonl("age_names.json", sorted(age_rows, key=lambda r: r["name"]))

    node_rows = []
    for kind in ("Building", "Tech", "Unit"):
        for entity_id, node_type in sorted(node_types[kind].items()):
            node_rows.append(
                {
                    "entity_type": kind.lower(),
                    "entity_id": entity_id,
                    "node_type": node_type,
                    "building_id": node_buildings[kind].get(entity_id),
                    "upgrades_from_id": node_links[kind].get(entity_id),
                }
            )
    write_jsonl("node_types.json", node_rows)

    # ---- display names: the per-civ tree nodes are the only English source
    name_rows = []
    for kind, table in (("Unit", "Unit"), ("Building", "Building"), ("Tech", "Tech")):
        for entity_id in sorted(int(k) for k in entities[table]):
            name = NAME_OVERRIDES.get(kind, {}).get(entity_id) or tree_names[kind].get(entity_id)
            if not name:
                name = entities[table][str(entity_id)].get("internal_name")
            name_rows.append(
                {"entity_type": kind.lower(), "entity_id": entity_id, "name": name}
            )
    write_jsonl("names.json", name_rows)

    # ---- localized strings, the source of every help text
    write_jsonl(
        "strings.json",
        [{"id": int(sid), "text": text} for sid, text in sorted(strings.items(), key=lambda kv: int(kv[0]))],
    )

    if not args.skip_images:
        sync_images(args.cache_dir, picture, monk_suffix, sorted(data["civs"]))

    build_parquet()
    print("done")


def to_webp(src_png, dest_webp):
    os.makedirs(os.path.dirname(dest_webp), exist_ok=True)
    subprocess.run(
        ["cwebp", "-quiet", "-lossless", src_png, "-o", dest_webp], check=True
    )


def sync_images(cache, picture, monk_suffix, civs):
    jobs = []
    for kind, folder in (("Unit", "Units"), ("Tech", "Techs"), ("Building", "Buildings")):
        for entity_id, pic in picture[kind].items():
            jobs.append(
                (f"{RAW}/img/{kind}/{pic}.png", f"{cache}/img/{kind}/{pic}.png",
                 os.path.join(IMG_DIR, folder, f"{entity_id}.webp"))
            )
    for suffix in set(monk_suffix.values()):
        pic = suffix.lstrip("_")
        jobs.append(
            (f"{RAW}/img/Unit/{pic}.png", f"{cache}/img/Unit/{pic}.png",
             os.path.join(IMG_DIR, "Units", f"125{suffix}.webp"))
        )
    for civ in civs:
        jobs.append(
            (f"{RAW}/img/Civs/{civ.lower()}.png", f"{cache}/img/Civs/{civ.lower()}.png",
             os.path.join(IMG_DIR, "Civs", f"{civ.lower()}.webp"))
        )

    def run(job):
        url, cached, dest = job
        if os.path.exists(dest):
            return None
        try:
            fetch(url, cached)
        except Exception as exc:  # missing upstream asset
            return f"missing {url}: {exc}"
        to_webp(cached, dest)
        return None

    with concurrent.futures.ThreadPoolExecutor(10) as pool:
        for problem in pool.map(run, jobs):
            if problem:
                print(problem, file=sys.stderr)

    # public/img is a git-tracked copy of export/img (export/img is gitignored)
    public_img = os.path.join(ROOT, "public", "img")
    if os.path.isdir(public_img) and IMG_DIR == os.path.join(ROOT, "export", "img"):
        shutil.copytree(IMG_DIR, public_img, dirs_exist_ok=True)


def build_parquet():
    if not shutil.which("duckdb"):
        print("duckdb CLI not found, skipping parquet build", file=sys.stderr)
        return
    schema = open(os.path.join(PARQUET_DIR, "schema.sql")).read().replace(";;", ";")
    tables = [
        line.split("CREATE TABLE ")[1].split("(")[0].strip().strip('"')
        for line in schema.splitlines()
        if line.startswith("CREATE TABLE")
    ]
    sql = [schema]
    for table in tables:
        src = os.path.join(JSON_DIR, f"{table}.json")
        sql.append(
            f"INSERT INTO \"{table}\" BY NAME SELECT * FROM read_json_auto('{src}', format='newline_delimited');"
        )
        dest = os.path.join(PARQUET_DIR, f"{table}.parquet")
        sql.append(f"COPY \"{table}\" TO '{dest}' (FORMAT PARQUET);")
    subprocess.run(["duckdb", "-c", "\n".join(sql)], check=True)


if __name__ == "__main__":
    main()
