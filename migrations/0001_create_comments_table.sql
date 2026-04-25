-- Migration number: 0001 	 2024-12-27T22:04:18.794Z
CREATE TABLE IF NOT EXISTS love_notes (
    id INTEGER PRIMARY KEY NOT NULL,
    reason TEXT NOT NULL,
    icon TEXT NOT NULL
);

INSERT INTO love_notes (reason, icon)
VALUES
    ('Your smile can turn my worst day into the best one', '🌸'),
    ('The way you laugh — it is the best sound in the world', '✨'),
    ('How deeply you care for everyone around you', '💝'),
    ('You make ordinary moments feel magical', '🌙'),
    ('Your kindness and warmth are unlike anyone I have ever known', '🌺'),
    ('The way you challenge me to be a better person every single day', '⭐'),
    ('How you always know exactly what to say', '💌'),
    ('Your strength and resilience inspire me endlessly', '🦋'),
    ('The little things you do that you do not even notice', '🌹'),
    ('Simply being you — perfectly, wonderfully you', '❤️')
;
