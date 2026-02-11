"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLLIElement | null>(null);

  // LocalStorage から読み込み
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedTodos) setTodos(JSON.parse(savedTodos));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    setIsLoaded(true);
  }, []);

  // LocalStorage に保存
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode, isLoaded]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos([...todos, { id: Date.now(), text: trimmed, completed: false }]);
    setInput("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // ドラッグ&ドロップ
  const handleDragStart = useCallback(
    (index: number, e: React.DragEvent<HTMLLIElement>) => {
      setDragIndex(index);
      dragNode.current = e.currentTarget;
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (index: number, e: React.DragEvent<HTMLLIElement>) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;
      setDragOverIndex(index);
    },
    [dragIndex]
  );

  const handleDrop = useCallback(
    (index: number) => {
      if (dragIndex === null || dragIndex === index) return;
      const updated = [...todos];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      setTodos(updated);
      setDragIndex(null);
      setDragOverIndex(null);
    },
    [dragIndex, todos]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  // フィルター
  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const filterButtons: { key: Filter; label: string }[] = [
    { key: "all", label: "すべて" },
    { key: "active", label: "未完了" },
    { key: "completed", label: "完了済み" },
  ];

  // 初回読み込み前はちらつき防止
  if (!isLoaded) return null;

  return (
    <div
      className={`min-h-screen py-12 px-4 transition-colors duration-300 ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="mx-auto max-w-lg">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <h1
            className={`text-3xl font-bold ${
              darkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Todo App
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`rounded-full p-2 text-xl transition-colors ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label="ダークモード切り替え"
          >
            {darkMode ? "\u2600\ufe0f" : "\u{1f319}"}
          </button>
        </div>

        {/* 入力エリア */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="新しいタスクを入力..."
            className={`flex-1 rounded-lg border px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              darkMode
                ? "border-gray-600 bg-gray-800 text-gray-100 placeholder-gray-500"
                : "border-gray-300 bg-white text-gray-800 placeholder-gray-400"
            }`}
          />
          <button
            onClick={addTodo}
            className="rounded-lg bg-blue-500 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-600"
          >
            追加
          </button>
        </div>

        {/* フィルターボタン */}
        <div className="mb-4 flex gap-1 rounded-lg bg-opacity-50 p-1">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-blue-500 text-white"
                  : darkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* タスク一覧 */}
        {filteredTodos.length === 0 ? (
          <p
            className={`text-center ${darkMode ? "text-gray-500" : "text-gray-400"}`}
          >
            {todos.length === 0
              ? "タスクがありません。上から追加してみましょう！"
              : "該当するタスクがありません。"}
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredTodos.map((todo, index) => (
              <li
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex cursor-grab items-center gap-3 rounded-lg p-4 shadow-sm transition-all active:cursor-grabbing ${
                  dragOverIndex === index
                    ? "border-2 border-blue-400"
                    : "border-2 border-transparent"
                } ${
                  dragIndex === index ? "opacity-50" : "opacity-100"
                } ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-750"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <span
                  className={`text-sm ${darkMode ? "text-gray-600" : "text-gray-300"}`}
                >
                  &#x2630;
                </span>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="h-5 w-5 cursor-pointer rounded accent-blue-500"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? darkMode
                        ? "text-gray-600 line-through"
                        : "text-gray-400 line-through"
                      : darkMode
                        ? "text-gray-100"
                        : "text-gray-800"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className={`rounded px-2 py-1 text-sm transition-colors ${
                    darkMode
                      ? "text-red-400 hover:bg-red-900/30 hover:text-red-300"
                      : "text-red-400 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* フッター情報 */}
        {todos.length > 0 && (
          <p
            className={`mt-4 text-center text-sm ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}
          >
            全 {todos.length} 件 / 完了{" "}
            {todos.filter((t) => t.completed).length} 件
          </p>
        )}
      </div>
    </div>
  );
}
