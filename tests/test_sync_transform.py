"""Fixture tests for the export transform in scripts/sync-aoe2-data.py."""

import importlib.util
import os
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = importlib.util.spec_from_file_location(
    "sync_aoe2_data", os.path.join(ROOT, "scripts", "sync-aoe2-data.py")
)
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)


class HelpIdTest(unittest.TestCase):
    def test_tree_offset_is_removed(self):
        self.assertEqual(sync.help_id(105083), 26083)

    def test_already_offset_ids_pass_through(self):
        self.assertEqual(sync.help_id(26083), 26083)

    def test_missing_id(self):
        self.assertIsNone(sync.help_id(None))


class EntityRowTest(unittest.TestCase):
    entries = {
        "4": {"ID": 4, "internal_name": "ARCHR", "HP": 30, "Cost": {"Wood": 25, "Gold": 45}},
        "42": {"ID": 42, "internal_name": "TREBU", "HP": 150, "Cost": {}},
    }

    def test_image_path_points_at_the_entity_id(self):
        rows = sync.build_entity_rows(self.entries, "Units", {4: 17, 42: 5}, [])
        paths = {row["id"]: row["image_path"] for row, _ in rows}
        self.assertEqual(paths[4], "img/Units/4.webp")

    def test_entities_without_a_picture_fall_back_to_the_missing_icon(self):
        rows = sync.build_entity_rows(self.entries, "Units", {4: 17}, [])
        paths = {row["id"]: row["image_path"] for row, _ in rows}
        self.assertEqual(paths[42], sync.MISSING_IMAGE)

    def test_costs_default_to_zero(self):
        rows = sync.build_entity_rows(self.entries, "Units", {4: 17}, [])
        row = next(row for row, _ in rows if row["id"] == 4)
        self.assertEqual(row["cost_wood"], 25)
        self.assertEqual(row["cost_gold"], 45)
        self.assertEqual(row["cost_food"], 0)
        self.assertEqual(row["cost_stone"], 0)

    def test_extra_fields_are_pulled_through(self):
        rows = sync.build_entity_rows(
            self.entries, "Units", {4: 17}, [("speed", "Speed")]
        )
        row = next(row for row, _ in rows if row["id"] == 4)
        self.assertIn("speed", row)


class AliasTest(unittest.TestCase):
    def test_units_without_a_tree_node_borrow_a_companion_icon(self):
        # Packed trebuchet, dismounted Konnik and the alternate Ratha modes have
        # no node upstream, so they reuse the icon of their companion unit.
        self.assertEqual(sync.ICON_ALIASES[42], 331)
        self.assertEqual(sync.ICON_ALIASES[1252], 1225)

    def test_name_overrides_cover_the_nodeless_units(self):
        self.assertEqual(sync.NAME_OVERRIDES["Unit"][42], "Trebuchet")
        self.assertEqual(sync.NAME_OVERRIDES["Building"][71], "Town Center")


if __name__ == "__main__":
    unittest.main()
