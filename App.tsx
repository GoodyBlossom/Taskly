import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "done";

const STORAGE_KEY = "task-flow.tasks.v1";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let mounted = true;

    async function loadTasks() {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTasks && mounted) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch {
        if (Platform.OS === "web") {
          window.alert("Task Flow could not load saved tasks.");
        } else {
          Alert.alert("Storage issue", "Task Flow could not load saved tasks.");
        }
      } finally {
        if (mounted) {
          setIsReady(true);
        }
      }
    }

    loadTasks();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(() => {
      if (Platform.OS === "web") {
        window.alert("Task Flow could not save this change.");
      } else {
        Alert.alert("Storage issue", "Task Flow could not save this change.");
      }
    });
  }, [isReady, tasks]);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      completed,
      active: tasks.length - completed,
      progress: tasks.length ? completed / tasks.length : 0
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "active") {
      return tasks.filter((task) => !task.completed);
    }

    if (filter === "done") {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }, [filter, tasks]);

  function addTask() {
    const title = taskTitle.trim();

    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        completed: false,
        createdAt: Date.now()
      },
      ...currentTasks
    ]);
    setTaskTitle("");
  }

  function toggleTask(id: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.kicker}>Task Flow</Text>
              <Text style={styles.title}>Own your day.</Text>
            </View>
            <View style={styles.scoreTile}>
              <Text style={styles.scoreNumber}>{Math.round(stats.progress * 100)}%</Text>
              <Text style={styles.scoreLabel}>done</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stats.progress * 100}%` }]} />
          </View>

          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <Text style={styles.inputPrefix}>+</Text>
            <TextInput
              accessibilityLabel="Task title"
              onChangeText={setTaskTitle}
              onSubmitEditing={addTask}
              placeholder="What needs your energy?"
              placeholderTextColor="#8E98A8"
              returnKeyType="done"
              style={styles.input}
              value={taskTitle}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={!taskTitle.trim()}
            onPress={addTask}
            style={({ pressed }) => [
              styles.addButton,
              !taskTitle.trim() && styles.addButtonDisabled,
              pressed && styles.pressed
            ]}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.filterGroup}>
            {(["all", "active", "done"] as Filter[]).map((option) => (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => setFilter(option)}
                style={[styles.filterButton, filter === option && styles.filterButtonActive]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filter === option && styles.filterButtonTextActive
                  ]}
                >
                  {option === "all" ? "All" : option === "active" ? "Active" : "Done"}
                </Text>
              </Pressable>
            ))}
          </View>
          {stats.completed > 0 ? (
            <Pressable accessibilityRole="button" onPress={clearCompleted} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <FlatList
          contentContainerStyle={visibleTasks.length ? styles.list : styles.emptyList}
          data={visibleTasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {tasks.length ? "Nothing here" : "Fresh slate"}
              </Text>
              <Text style={styles.emptyCopy}>
                {tasks.length ? "Switch filters or add a new task." : "Add one focused task to begin."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.taskCard, item.completed && styles.taskCardDone]}>
              <Pressable
                accessibilityLabel={item.completed ? "Mark task active" : "Mark task complete"}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.completed }}
                onPress={() => toggleTask(item.id)}
                style={({ pressed }) => [
                  styles.checkButton,
                  item.completed && styles.checkButtonDone,
                  pressed && styles.pressed
                ]}
              >
                <Text style={[styles.checkMark, item.completed && styles.checkMarkDone]}>
                  {item.completed ? "OK" : ""}
                </Text>
              </Pressable>
              <Pressable onPress={() => toggleTask(item.id)} style={styles.taskBody}>
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>
                  {item.title}
                </Text>
                <Text style={styles.taskMeta}>{item.completed ? "Wrapped up" : "In motion"}</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Delete task"
                accessibilityRole="button"
                onPress={() => deleteTask(item.id)}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E9EEF6"
  },
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center"
  },
  hero: {
    borderRadius: 8,
    backgroundColor: "#111827",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#111827",
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16
  },
  kicker: {
    color: "#7DD3FC",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40
  },
  scoreTile: {
    minWidth: 78,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  scoreNumber: {
    color: "#111827",
    fontSize: 23,
    fontWeight: "800"
  },
  scoreLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#334155",
    overflow: "hidden",
    marginTop: 22,
    marginBottom: 18
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#2DD4BF"
  },
  statRow: {
    flexDirection: "row",
    gap: 10
  },
  statItem: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#1F2937",
    padding: 12
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800"
  },
  statLabel: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14
  },
  inputWrap: {
    flex: 1,
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D5DCE8",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#334155",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  inputPrefix: {
    color: "#2DD4BF",
    fontSize: 22,
    fontWeight: "900",
    marginRight: 8
  },
  input: {
    flex: 1,
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    minHeight: 54
  },
  addButton: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: "#F97316",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F97316",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  addButtonDisabled: {
    backgroundColor: "#B8C1D1",
    shadowOpacity: 0
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10
  },
  filterGroup: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: "#DDE5F0",
    flexDirection: "row",
    padding: 4
  },
  filterButton: {
    flex: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  filterButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#334155",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1
  },
  filterButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800"
  },
  filterButtonTextActive: {
    color: "#111827"
  },
  clearButton: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: "#FFE4E6",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  clearButtonText: {
    color: "#BE123C",
    fontSize: 13,
    fontWeight: "700"
  },
  list: {
    paddingTop: 6,
    paddingBottom: 28,
    gap: 10
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 44
  },
  emptyState: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D5DCE8",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingVertical: 34
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#64748B",
    fontSize: 16,
    textAlign: "center"
  },
  taskCard: {
    minHeight: 78,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E8F0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#334155",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  taskCardDone: {
    backgroundColor: "#F8FAFC"
  },
  checkButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center"
  },
  checkButtonDone: {
    backgroundColor: "#2DD4BF",
    borderColor: "#2DD4BF"
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 13
  },
  checkMarkDone: {
    color: "#083B3A"
  },
  taskBody: {
    flex: 1,
    minHeight: 48,
    justifyContent: "center"
  },
  taskTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 4
  },
  taskTitleDone: {
    color: "#8A94A6",
    textDecorationLine: "line-through"
  },
  taskMeta: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700"
  },
  deleteButton: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteButtonText: {
    color: "#E11D48",
    fontSize: 13,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  }
});
