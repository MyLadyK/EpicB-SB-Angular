CREATE TABLE IF NOT EXISTS battle_events (
    battle_result_id INT NOT NULL,
    target VARCHAR(20) NOT NULL,
    damage DOUBLE NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (battle_result_id) REFERENCES battleresult(idBattleResult) ON DELETE CASCADE
); 