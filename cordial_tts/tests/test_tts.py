import unittest
import yaml
import sys
import os
from cordial_tts import CoRDialTTS


class TestCoRDialTTS(unittest.TestCase):
    def setUp(self):
        self.tts = CoRDialTTS()

    def test_extract_behaviors(self):
        with open("script.txt", 'r') as script, open("expected/phrases.yaml", 'r') as expected:
            expected = yaml.load(expected)
            for line in script:
                content = line.strip() 
                tokens = content.split(']')
                phraseID = tokens[0].strip("[")
                content = tokens[1].strip()
                phrase, behaviors = self.tts.extract_behaviors(content)
                self.assertMultiLineEqual('"' + phrase + '"', expected[phraseID]['text'])
                self.assertListEqual(behaviors, expected[phraseID]['behaviors'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
