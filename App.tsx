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

const STORAGE_KEY = "task-flow.tasks.v1";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [isReady, setIsReady] = useState(false);

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
      active: tasks.length - completed
    };
  }, [tasks]);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Task Flow</Text>
            <Text style={styles.title}>Keep today moving.</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countNumber}>{stats.active}</Text>
            <Text style={styles.countLabel}>active</Text>
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel="Task title"
            onChangeText={setTaskTitle}
            onSubmitEditing={addTask}
            placeholder="Add a task"
            placeholderTextColor="#8792A2"
            returnKeyType="done"
            style={styles.input}
            value={taskTitle}
          />
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

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{tasks.length} total</Text>
          <Text style={styles.summaryText}>{stats.completed} completed</Text>
        </View>

        <FlatList
          contentContainerStyle={tasks.length ? styles.list : styles.emptyList}
          data={tasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyCopy}>Add your first task to start the flow.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
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
                  ✓
                </Text>
              </Pressable>
              <Pressable onPress={() => toggleTask(item.id)} style={styles.taskBody}>
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>
                  {item.title}
                </Text>
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
    backgroundColor: "#F6F8FB"
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24
  },
  kicker: {
    color: "#1D4ED8",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 39
  },
  countBadge: {
    minWidth: 78,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  countNumber: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800"
  },
  countLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8DEE8",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 16
  },
  addButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  addButtonDisabled: {
    backgroundColor: "#AFC1E8"
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 8
  },
  summaryText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700"
  },
  list: {
    paddingTop: 8,
    paddingBottom: 28,
    gap: 12
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 60
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#64748B",
    fontSize: 16,
    textAlign: "center"
  },
  taskCard: {
    minHeight: 72,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#A7B1C2",
    alignItems: "center",
    justifyContent: "center"
  },
  checkButtonDone: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A"
  },
  checkMark: {
    color: "transparent",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20
  },
  checkMarkDone: {
    color: "#FFFFFF"
  },
  taskBody: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center"
  },
  taskTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700"
  },
  taskTitleDone: {
    color: "#8A94A6",
    textDecorationLine: "line-through"
  },
  deleteButton: {
    minHeight: 42,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  }
});
