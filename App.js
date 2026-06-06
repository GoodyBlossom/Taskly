import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

const STORAGE_KEY = "task-flow.tasks.v1";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [entry, setEntry] = useState("");
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setTasks(JSON.parse(saved));
        }
      } catch (error) {
        Alert.alert("Task Flow", "Saved tasks could not be loaded.");
      } finally {
        setLoaded(true);
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(() => {
      Alert.alert("Task Flow", "Tasks could not be saved on this device.");
    });
  }, [loaded, tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const visibleTasks = useMemo(() => {
    if (filter === "active") {
      return tasks.filter((task) => !task.completed);
    }

    if (filter === "completed") {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }, [filter, tasks]);

  function addTask() {
    const title = entry.trim();
    if (!title) {
      return;
    }

    setTasks((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        completed: false,
        createdAt: Date.now()
      },
      ...current
    ]);
    setEntry("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.eyebrow}>Task Flow</Text>
                <Text style={styles.title}>Task Flow</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreNumber}>{progress}%</Text>
                <Text style={styles.scoreLabel}>done</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <View style={styles.stats}>
              <Stat label="Active" value={activeCount} />
              <Stat label="Completed" value={completedCount} />
              <Stat label="Total" value={tasks.length} />
            </View>
          </View>

          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Task title"
              onChangeText={setEntry}
              onSubmitEditing={addTask}
              placeholder="Add a task"
              placeholderTextColor="#8995a8"
              returnKeyType="done"
              style={styles.input}
              value={entry}
            />
            <Pressable onPress={addTask} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.filters}>
            {["all", "active", "completed"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[styles.filterButton, filter === item && styles.filterButtonActive]}
              >
                <Text
                  style={[styles.filterText, filter === item && styles.filterTextActive]}
                >
                  {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.list}>
            {visibleTasks.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {tasks.length ? "Nothing here" : "Fresh slate"}
                </Text>
                <Text style={styles.emptyText}>
                  {tasks.length ? "Switch filters or add a new task." : "Add one focused task to begin."}
                </Text>
              </View>
            ) : (
              visibleTasks.map((task) => (
                <View key={task.id} style={[styles.taskCard, task.completed && styles.taskDone]}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: task.completed }}
                    onPress={() => toggleTask(task.id)}
                    style={[styles.check, task.completed && styles.checkDone]}
                  >
                    <Text style={styles.checkText}>{task.completed ? "OK" : ""}</Text>
                  </Pressable>
                  <Pressable onPress={() => toggleTask(task.id)} style={styles.taskBody}>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {task.completed ? "Completed" : "Active"}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => deleteTask(task.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef2f7"
  },
  keyboardView: {
    flex: 1
  },
  content: {
    padding: 18,
    paddingBottom: 32
  },
  hero: {
    backgroundColor: "#172033",
    borderRadius: 8,
    padding: 18,
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 7
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between"
  },
  eyebrow: {
    color: "#67e8f9",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase"
  },
  title: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38
  },
  scoreCard: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    minWidth: 78,
    padding: 12
  },
  scoreNumber: {
    color: "#111827",
    fontSize: 23,
    fontWeight: "900"
  },
  scoreLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  progressTrack: {
    backgroundColor: "#37445c",
    borderRadius: 8,
    height: 8,
    marginBottom: 18,
    marginTop: 22,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: "#2dd4bf",
    borderRadius: 8,
    height: 8
  },
  stats: {
    flexDirection: "row",
    gap: 10
  },
  stat: {
    backgroundColor: "#243149",
    borderRadius: 8,
    flex: 1,
    padding: 12
  },
  statValue: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900"
  },
  statLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800"
  },
  composer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    marginTop: 16
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d5dce8",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    minHeight: 58,
    paddingHorizontal: 14
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#f97316",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 20
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  filters: {
    backgroundColor: "#dde5f0",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    marginBottom: 10,
    padding: 4
  },
  filterButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    minHeight: 38,
    justifyContent: "center"
  },
  filterButtonActive: {
    backgroundColor: "#ffffff"
  },
  filterText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "900"
  },
  filterTextActive: {
    color: "#111827"
  },
  list: {
    gap: 10,
    paddingBottom: 20,
    paddingTop: 6
  },
  taskCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e3e8f0",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    padding: 14
  },
  taskDone: {
    backgroundColor: "#f8fafc"
  },
  check: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderRadius: 8,
    borderWidth: 2,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  checkDone: {
    backgroundColor: "#2dd4bf",
    borderColor: "#2dd4bf"
  },
  checkText: {
    color: "#083b3a",
    fontSize: 11,
    fontWeight: "900"
  },
  taskBody: {
    flex: 1,
    minWidth: 0
  },
  taskTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900"
  },
  taskTitleDone: {
    color: "#8a94a6",
    textDecorationLine: "line-through"
  },
  taskMeta: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  deleteButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  deleteText: {
    color: "#e11d48",
    fontSize: 13,
    fontWeight: "900"
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#d5dce8",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 34
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center"
  }
});
