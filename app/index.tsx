import { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView
} from 'react-native';
import { addDoc, analyticsService, collection, deleteDoc, getDocs, login, logout, onAuthStateChanged, orderBy, query, register, User, where } from './firebase';

interface Todo {
  id: string;
  text: string;
  userId: string;
  completed: boolean;
  createdAt: Date;
}

export default function Index() {
  const [email, setEmail] = useState<string>(Platform.OS === 'web' ? 'wasi@orchid.co.nz' : Platform.OS === 'ios' ? 'wasisadman.cse@gmail.com' : 'guitorioadar@gmail.com');
  const [password, setPassword] = useState<string>('123456');
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => setUser(user));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      login(email, password)
        .then(() => {
          fetchTodos();
          analyticsService.logEvents('login', { email, password });
        })
        .catch((error: any) => {
          console.error('Login error:', error);
          alert(error.message);
        });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async () => {
    register(email, password)
      .then(() => {
        handleLogin();
      })
      .catch((error: any) => {
        console.error('Register error:', error);
        alert(error.message);
      });
    analyticsService.logEvents('register', { email, password });
  };

  const handleLogout = async () => {
    try {
      logout()
        .then(() => {
          analyticsService.logEvents('logout');
        })
        .catch((error: Error) => {
          console.error('Logout error:', error);
          alert(error.message);
          analyticsService.logEvents('logout', { error: error.message });
        });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addTodo = async () => {
    if (!newTodo) {
      alert('Todo text is required');
      return;
    }
    try {
      addDoc('todos', {
        text: newTodo,
        userId: user?.uid,
        completed: false,
        createdAt: new Date()
      });
      analyticsService.logEvents('add_todo', { text: newTodo });
      setNewTodo('');
      fetchTodos();
    } catch (error) {
      console.error('Add todo error:', error);
    }
  };

  const fetchTodos = async () => {
    console.log('fetchTodos', Date());
    console.log('user', user);
    console.log('user.uid', user?.uid);
    if (!user) return;
    getDocs(query(
      collection('todos'),
      where('userId', '==', user.uid),
      orderBy('text', 'asc'),
    )).then((snapshot) => {
      console.log('getDocs snapshot', snapshot);
      if (snapshot.empty) {
        console.log('getDocs snapshot empty');
        setTodos([]);
        return;
      };
      const todos = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      console.log('getDocs todos', Date(), todos);
      setTodos(todos);
    });
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteDoc('todos', id);
    analyticsService.logEvents('delete_todo', { id, userId: user?.uid, text: todos.find(todo => todo.id === id)?.text });
    fetchTodos();
  };

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user.email}!</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.todoInput}>
        <TextInput
          style={styles.input}
          placeholder="New Todo"
          value={newTodo}
          onSubmitEditing={addTodo}
          onChangeText={setNewTodo}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.todoList}>
        {todos && todos?.map((todo) => (
          <View key={todo.id} style={styles.todoItem}>
            <Text>{todo.text}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTodo(todo.id)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: Platform.OS === 'web' ? 0 : 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  welcome: {
    fontSize: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  todoInput: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
  },
  todoList: {
    // flex: 1,
    // backgroundColor: 'green',
  },
  todoItem: {
    // padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // flex: 1,
  },
});