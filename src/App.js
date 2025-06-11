import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set, update, get } from 'firebase/database';
import './App.css';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMJ2OJuQ1xbNjtbP48CB9EsWqjDI8CAqk",
  authDomain: "daily-tracker-priti.firebaseapp.com",
  databaseURL: "https://daily-tracker-priti-default-rtdb.firebaseio.com",
  projectId: "daily-tracker-priti",
  storageBucket: "daily-tracker-priti.firebasestorage.app",
  messagingSenderId: "438275738510",
  appId: "1:438275738510:web:81bac753ff28cdc37d32df",
  measurementId: "G-ZK806ECXVN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  const [standardTodos, setStandardTodos] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [newTodo, setNewTodo] = useState('');
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch standard todo list
  const fetchStandardTodos = useCallback(async () => {
    const standardTodosRef = ref(database, 'standardTodos');
    onValue(standardTodosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todosArray = Object.entries(data).map(([id, todo]) => ({
          _id: id,
          text: todo.text
        }));
        setStandardTodos(todosArray);
      }
    });
  }, []);

  // Fetch daily progress
  const fetchDailyProgress = useCallback(() => {
    const progressRef = ref(database, `progress/${currentDate}`);
    onValue(progressRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDailyProgress(data);
    });
  }, [currentDate]);

  useEffect(() => {
    fetchStandardTodos();
    fetchDailyProgress();
  }, [fetchStandardTodos, fetchDailyProgress]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const standardTodosRef = ref(database, 'standardTodos');
      const newTodoRef = push(standardTodosRef);
      await set(newTodoRef, {
        text: newTodo
      });
      setNewTodo('');
      setIsPopupOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Error adding todo');
    }
  };

  const handleToggle = async (todoId, user) => {
    try {
      const progressRef = ref(database, `progress/${currentDate}/${todoId}`);
      const currentProgress = dailyProgress[todoId] || {};
      const updates = {
        ...currentProgress,
        [`${user}Completed`]: !currentProgress[`${user}Completed`]
      };
      await set(progressRef, updates);
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError('Error updating todo');
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Daily Todo Tracker</h1>
        <h2>{currentDate}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <button className="add-todo-button" onClick={() => setIsPopupOpen(true)}>
          Add New Todo
        </button>

        {isPopupOpen && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>Add New Todo Item</h3>
              <form onSubmit={handleAddTodo}>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Enter new todo item"
                />
                <div className="popup-buttons">
                  <button type="submit">Add</button>
                  <button type="button" onClick={() => setIsPopupOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="todo-list">
          <div className="todo-header">
            <span className="todo-text">Task</span>
            <div className="todo-users">
              <span>Prreeee</span>
              <span>Mihiir</span>
            </div>
          </div>
          {standardTodos.map((todo) => (
            <div key={todo._id} className="todo-item">
              <span className="todo-text">{todo.text}</span>
              <div className="todo-checkboxes">
                <input
                  type="checkbox"
                  checked={dailyProgress[todo._id]?.user1Completed || false}
                  onChange={() => handleToggle(todo._id, 'user1')}
                />
                <input
                  type="checkbox"
                  checked={dailyProgress[todo._id]?.user2Completed || false}
                  onChange={() => handleToggle(todo._id, 'user2')}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
