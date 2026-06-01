import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const PLAY_AREA_SIZE = 320;
const TARGET_SIZE = 70;
const GAME_SECONDS = 10;

function getRandomPosition() {
  const max = PLAY_AREA_SIZE - TARGET_SIZE;
  return {
    left: Math.max(0, Math.floor(Math.random() * max)),
    top: Math.max(0, Math.floor(Math.random() * max)),
  };
}

export default function MiniGameScreen() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [running, setRunning] = useState(false);
  const [targetPosition, setTargetPosition] = useState(getRandomPosition());

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTimeLeft((current) => {
          if (current <= 1) {
            setRunning(false);
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running]);

  useEffect(() => {
    if (!running && timeLeft === 0) {
      setTargetPosition({ left: -9999, top: -9999 });
    }
  }, [running, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setTargetPosition(getRandomPosition());
    setRunning(true);
  };

  const handleHit = () => {
    if (!running) return;
    setScore((current) => current + 1);
    setTargetPosition(getRandomPosition());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniGame</Text>
      <Text style={styles.subtitle}>
        Tap the moving target as many times as you can in {GAME_SECONDS}{" "}
        seconds.
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={styles.statValue}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.playArea}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleHit}
          style={[styles.target, targetPosition]}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, running && styles.buttonDisabled]}
        onPress={startGame}
        disabled={running}
      >
        <Text style={styles.buttonText}>
          {running ? "Game running" : "Start game"}
        </Text>
      </TouchableOpacity>

      {!running && timeLeft === 0 ? (
        <Text style={styles.finishText}>Game over! Your score is {score}.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#444",
    marginBottom: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  playArea: {
    width: PLAY_AREA_SIZE,
    height: PLAY_AREA_SIZE,
    borderRadius: 16,
    backgroundColor: "#eef5df",
    borderColor: "#d5e7b5",
    borderWidth: 2,
    alignSelf: "center",
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  target: {
    position: "absolute",
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: "#86BC25",
    borderWidth: 3,
    borderColor: "#fff",
  },
  button: {
    backgroundColor: "#86BC25",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  finishText: {
    marginTop: 16,
    fontSize: 16,
    color: "#444",
    textAlign: "center",
  },
});
