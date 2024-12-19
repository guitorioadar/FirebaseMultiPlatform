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
import { BatchType, addDoc, analytics, logEvent, collection, deleteDoc, getDocs, login, logout, onAuthStateChanged, orderBy, query, register, User, where, getDoc, doc, firestore, splittableBatch, SplittableBatch, WriteBatch, writeBatch } from './firebase';
import { onSnapshot } from './firebase';
import StorageExample from './components/StorageExample';
// import { DocumentData, DocumentReference, onSnapshot } from 'firebase/firestore';
interface Todo {
  id: string;
  text: string;
  userId: string;
  completed: boolean;
  createdAt: Date;
}

interface ServerInfo {
  androidBuildAvailable: number;
  androidBuildRequired: number;
  iosBuildAvailable: number;
  iosBuildRequired: number;
  underMaintenance: boolean;
  webBuildAvailable: number;
  webBuildRequired: number;
}

export default function Index() {
  const [email, setEmail] = useState<string>(Platform.OS === 'web' ? 'wasi@orchid.co.nz' : Platform.OS === 'ios' ? 'wasisadman.cse@gmail.com' : 'guitorioadar@gmail.com');
  const [password, setPassword] = useState<string>('123456');
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [serverInfoOnSnapshot, setServerInfoOnSnapshot] = useState<ServerInfo>();
  const [serverInfoOnSnapshotQuery, setServerInfoOnSnapshotQuery] = useState<any>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => setUser(user));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      login(email, password)
        .then(() => {
          fetchTodos();
          logEvent(analytics, 'login', { email, password });
        })
        .catch((error: Error) => {
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
      .catch((error: Error) => {
        console.error('Register error:', error);
        alert(error.message);
      });
    logEvent(analytics, 'register', { email, password });
  };

  const handleLogout = async () => {
    try {
      logout()
        .then(() => {
          logEvent(analytics, 'logout');
        })
        .catch((error: Error) => {
          console.error('Logout error:', error);
          alert(error.message);
          logEvent(analytics, 'logout', { error: error.message });
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
      logEvent(analytics, 'add_todo', { text: newTodo });
      setNewTodo('');
      fetchTodos();
    } catch (error) {
      console.error('Add todo error:', error);
    }
  };

  const fetchTodos = async () => {
    if (!user) return;
    getDocs(query(
      collection(firestore, 'todos'),
      where('userId', '==', user.uid),
      orderBy('text', 'asc'),
    )).then((snapshot) => {
      if (snapshot.empty) {
        setTodos([]);
        return;
      };
      const todos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTodos(todos as Todo[]);
    });
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteDoc('todos', id);
    logEvent(analytics, 'delete_todo', { id, userId: user?.uid, text: todos.find(todo => todo.id === id)?.text });
    fetchTodos();
  };

  const addBatchOperations = async () => {
    try {
      const batch = splittableBatch(firestore, 1);
      const timestamp = new Date();
      const platformLabel = Platform.OS === 'web' ? 'Web' : Platform.OS === 'ios' ? 'iOS' : 'Android';

      batch.set(doc(firestore, 'test', `doc1_${Platform.OS}`), {
        name: `Test 1 from ${platformLabel}`,
        email: Platform.OS === 'web'
          ? 'wasi@orchid.co.nz'
          : Platform.OS === 'ios'
            ? 'wasisadman.cse@gmail.com'
            : 'guitorioadar@gmail.com',
        platform: Platform.OS,
        timestamp
      });

      batch.set(doc(firestore, 'test', `doc2_${Platform.OS}`), {
        name: `Test 2 from ${platformLabel}`,
        platform: Platform.OS,
        deviceType: Platform.OS === 'web'
          ? 'Browser'
          : Platform.OS === 'ios'
            ? 'iPhone'
            : 'Android Phone',
        timestamp
      });

      batch.set(doc(firestore, 'test', `doc3_${Platform.OS}`), {
        name: `Test 3 from ${platformLabel}`,
        platform: Platform.OS,
        testType: 'Batch Operation',
        timestamp
      });

      batch.set(doc(firestore, 'test', `doc4_${Platform.OS}`), {
        name: `Test 4 from ${platformLabel}`,
        platform: Platform.OS,
        mergeTest: true,
        timestamp
      }, { merge: true });

      const todosRef = doc(collection(firestore, 'todos'))
      console.log('todosRef doc with collection', todosRef.path);

      console.log(`Number of batches (${platformLabel}):`, batch.getBatches().length);
      console.log(`Starting batch commit for ${platformLabel}...`);

      await batch.commit();
      console.log(`Batch operations completed successfully on ${platformLabel}`);

    } catch (error) {
      console.error(`Batch operation failed on ${Platform.OS}:`, error);
    }
  };

  const deleteBatchOperations = async () => {
    try {
      const batch = splittableBatch(firestore) as SplittableBatch;
      batch.delete(doc(firestore, 'test', `doc1_${Platform.OS}`));
      batch.delete(doc(firestore, 'test', `doc2_${Platform.OS}`));
      batch.delete(doc(firestore, 'test', `doc3_${Platform.OS}`));
      batch.delete(doc(firestore, 'test', `doc4_${Platform.OS}`));
      console.log(`Number of batches (${Platform.OS}):`, batch.getBatches().length);
      await batch.commit();
      console.log(`Batch operations deleted successfully on ${Platform.OS}`);
    } catch (error) {
      console.error(`Batch operation failed on ${Platform.OS}:`, error);
    }
  };

  const addWriteBatchOperationsWithDoc = async (
    batch: WriteBatch | SplittableBatch,
    platformLabel: string
  ) => {
    batch.set(
      doc(firestore, 'testWriteBatch', `doc1_${Platform.OS}`),
      {
        name: `Test 1 from ${platformLabel}`,
        email: Platform.OS === 'web'
          ? 'wasi@orchid.co.nz'
          : Platform.OS === 'ios'
            ? 'wasisadman.cse@gmail.com'
            : 'guitorioadar@gmail.com',
      },
      { merge: true }
    );
    try {
      await batch.commit();
      console.log(`WriteBatch commit successful for ${platformLabel}`);
    } catch (error) {
      console.error(`WriteBatch commit failed for ${platformLabel}:`, error);
    }
  }

  const onAddWriteBatchOperationsWithDoc = async () => {
    const batch = writeBatch(firestore);
    console.log('batch', batch);
    addWriteBatchOperationsWithDoc(batch, Platform.OS);
  }

  useEffect(() => {
    if (user) {
      fetchTodos();

      // Listen to server info changes
      const unsubscribeServerInfo = onSnapshot(
        doc(firestore, 'global', 'serverInfo'),
        (snapshot) => {
          console.log('onSnapshot updated', Date(), snapshot?.data());
          setServerInfoOnSnapshot(snapshot?.data() as ServerInfo);
        }
      );

      const unsubscribeServerInfoQuery = onSnapshot(
        query(
          collection(firestore, 'todos'),
          where('userId', '==', user.uid),
          orderBy('text', 'asc'),
        ),
        (snap) => {
          console.log('onSnapshot query updated', Date(), snap);
          setServerInfoOnSnapshotQuery(snap?.docs);
          snap?.docs.forEach((doc: any) => {
            console.log('query doc', doc.id, doc.data());
          });
        }, (error) => {
          // This should be very rare
          console.log('onSnapshot query error', error);
        }
      );

      return () => {
        unsubscribeServerInfo();
        unsubscribeServerInfoQuery();
      };
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

      <ScrollView style={styles.todoList}>

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

        {todos && todos?.map((todo) => (
          <View key={todo.id} style={styles.todoItem}>
            <Text>{todo.text}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTodo(todo.id)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.batchOperationsContainer}>
          <Text style={styles.batchOperationsTitle}>Batch Operations</Text>
          <TouchableOpacity style={styles.testBatchOperationsButton} onPress={addBatchOperations}>
            <Text style={styles.buttonText}>Add Splittable Batch Operations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBatchOperationsButton} onPress={deleteBatchOperations}>
            <Text style={styles.buttonText}>Delete Splittable Batch Operations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testBatchOperationsButton} onPress={onAddWriteBatchOperationsWithDoc}>
            <Text style={styles.buttonText}>Add Write Batch Operations</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.serverInfo}>
          <Text style={styles.serverInfoTitle}>Server Info With OnSnapshot (Document Reference)</Text>
          {
            Object.entries(serverInfoOnSnapshot || {}).map(([key, value]) => (
              <Text key={key}>{key}: {value + ''}</Text>
            ))
          }
        </View>
        <View style={styles.serverInfo}>
          <Text style={styles.serverInfoTitle}>Server Info With OnSnapshot (Query Reference)</Text>
          {
            serverInfoOnSnapshotQuery?.map((doc: any) => {
              console.log('doc', doc.id, doc.data());
              return (
                <Text key={doc.id}>{doc.data().text}</Text>
              )
            })
          }
        </View>
        <View style={styles.storageExample}>
          <StorageExample />
        </View>
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
  batchOperationsTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  batchOperationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    flexWrap: 'wrap',
  },
  testBatchOperationsButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    margin: 5
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
  serverInfo: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  serverInfoTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  storageExample: {
    marginTop: 20,
  }
});
