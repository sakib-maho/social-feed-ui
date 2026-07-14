import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class PostSchemaTests(unittest.TestCase):
    def test_posts_schema(self):
        data = json.loads((ROOT / "data" / "posts.json").read_text())
        self.assertGreaterEqual(len(data), 3)
        for post in data:
            self.assertIn("author", post)
            self.assertIn("content", post)
            self.assertIn("tags", post)
            self.assertIsInstance(post["tags"], list)

    def test_app_has_interactions(self):
        source = (ROOT / "assets" / "app.js").read_text()
        for token in ["localStorage", "likes", "comments", "createForm", "applyFilters"]:
            self.assertIn(token, source)


if __name__ == "__main__":
    unittest.main()
