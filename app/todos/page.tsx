"use client";

import MainLayout from '@/components/layout/MainLayout';
import TodoCelebration from '@/components/todos/TodoCelebration';
import TodoHeader from '@/components/todos/TodoHeader';
import TodoInput from '@/components/todos/TodoInput';
import TodoItem from '@/components/todos/TodoItem';
import {
  Todo,
  useAddTodoMutation,
  useDeleteTodoMutation,
  useGetTodosQuery,
  useUpdateTodoMutation
} from '@/features/todos/todosApi';
import {
  AlertCircle,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Loading from '../../components/Loading/Loading';

export default function TodosPage() {
  const { data: todos = [], isLoading } = useGetTodosQuery(undefined);
  const [addTodo, { isLoading: isAdding }] = useAddTodoMutation();
  const [updateTodo, { isLoading: isUpdating }] = useUpdateTodoMutation();
  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation();

  const [inputValue, setInputValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTodoId, setActiveTodoId] = useState<string | null>(null);
  const prevProgressRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { completedCount, progress } = useMemo(() => {
    const completed = todos.filter((t: Todo) => t.completed).length;
    const prog = todos.length > 0 ? (completed / todos.length) * 100 : 0;
    return { completedCount: completed, progress: prog };
  }, [todos]);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (progress === 100 && todos.length > 0 && prevProgressRef.current < 100) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }
      prevProgressRef.current = progress;
    }
  }, [progress, todos.length, isLoading, mounted]);

  const handleAddTodo = useCallback(async () => {
    if (!inputValue.trim()) return;
    try {
      await addTodo({ task: inputValue.trim() }).unwrap();
      setInputValue('');
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  }, [inputValue, addTodo]);

  const handleToggleTodo = useCallback(async (id: string, completed: boolean) => {
    try {
      setActiveTodoId(id);
      await updateTodo({ id, completed: !completed }).unwrap();
    } catch (err) {
      console.error('Failed to update todo:', err);
    } finally {
      setActiveTodoId(null);
    }
  }, [updateTodo]);

  const handleDeleteTodo = useCallback(async (id: string) => {
    try {
      setActiveTodoId(id);
      await deleteTodo(id).unwrap();
    } catch (err) {
      console.error('Failed to delete todo:', err);
    } finally {
      setActiveTodoId(null);
    }
  }, [deleteTodo]);

  const handleClearCompleted = useCallback(async () => {
    const completedTodos = todos.filter((t: Todo) => t.completed);
    for (const todo of completedTodos) {
      try {
        await deleteTodo(todo._id).unwrap();
      } catch (err) {
        console.error('Failed to clear todo:', err);
      }
    }
  }, [todos, deleteTodo]);

  if (!mounted) return null;

  return (
    <MainLayout>
      <div className="space-y-5">
        <TodoCelebration show={showCelebration} />

        <TodoHeader progress={progress} />

        <TodoInput
          value={inputValue}
          onChange={setInputValue}
          onAdd={handleAddTodo}
          isLoading={isAdding}
        />

        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between px-4">
            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                disabled={isDeleting}
                className="text-sm cursor-pointer font-semibold text-loss/60 hover:text-loss transition-colors flex items-center disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCcw className="w-3 h-3 mr-1" />}
                Clear Completed
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <Loading />
            ) : todos.length === 0 ? (
              <div className="p-6 rounded-xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="p-6 rounded-full bg-accent/20">
                  <AlertCircle className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-xl font-normal">No Active Missions</h4>
                  <p className="text-sm font-normal italic">A blank list is a wasted opportunity. Add something.</p>
                </div>
              </div>
            ) : (
              todos.map((todo: Todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                  isToggling={isUpdating && activeTodoId === todo._id}
                  isDeleting={isDeleting && activeTodoId === todo._id}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
