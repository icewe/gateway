# 状态管理模式

## React Context

```javascript
// 创建 Context
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用
function App() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

## 简单状态机

```javascript
const createMachine = (initial, states) => {
  let current = initial;
  const listeners = new Set();
  
  return {
    getState: () => current,
    transition(event) {
      const state = states[current];
      const next = state.on?.[event];
      if (next) {
        current = next;
        listeners.forEach(fn => fn(current));
      }
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
};

// 使用
const machine = createMachine('idle', {
  idle: { start: 'loading' },
  loading: { success: 'success', error: 'error' },
  success: { reset: 'idle' },
  error: { retry: 'loading' }
});
```

---

*状态管理 v1.0*
