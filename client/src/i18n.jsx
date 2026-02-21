import { useState, useEffect, createContext, useContext } from 'react';

const en = {
  // NameSelect
  whoAreYou: 'Who are you?',

  // Header
  switchUser: 'Switch',
  back: '← Back',

  // Dashboard
  recentActivity: 'Recent Activity',
  dailyTasks: 'Daily Tasks',
  yourLists: 'Your Lists',
  addTask: 'Add Task',
  noActivity: 'No recent activity.',
  noDailyTasks: 'No daily tasks yet.',
  notDoneToday: 'Not done',
  doneToday: 'Done today',
  unmarkDaily: 'Remove daily',

  // Activity Feed
  addedTasks: (name, count, listName) =>
    `${name} added ${count} task${count !== 1 ? 's' : ''} to ${listName}`,
  newTaskIn: (listName, text) => `New task in ${listName}: ${text}`,

  // ListSelector
  newList: 'New List',
  createNewList: 'Create New List',
  editList: 'Edit List',
  listName: 'List name...',
  cancel: 'Cancel',
  create: 'Create',
  save: 'Save',
  deleteListConfirm: 'Delete this list and all its items?',

  // TaskList
  addNewItem: 'Add new item...',
  add: 'Add',
  daily: 'Daily',
  pending: (n) => `${n} pending`,
  done: (n) => `${n} done`,
  noItems: 'No items yet. Add something!',
  clearCompleted: (n) => `Clear ${n} completed item${n !== 1 ? 's' : ''}`,

  // TaskItem
  doneBy: (name, time) => `done by ${name} at ${time}`,
  addedAt: (time) => `added at ${time}`,

  // QuickAdd
  selectList: 'Select list...',
  general: 'General',

  // Common
  delete: 'Delete',
  clearAll: 'Clear all',
};

const pt = {
  // NameSelect
  whoAreYou: 'Quem és tu?',

  // Header
  switchUser: 'Trocar',
  back: '← Voltar',

  // Dashboard
  recentActivity: 'Atividade Recente',
  dailyTasks: 'Tarefas Diárias',
  yourLists: 'As Tuas Listas',
  addTask: 'Adicionar Tarefa',
  noActivity: 'Sem atividade recente.',
  noDailyTasks: 'Sem tarefas diárias.',
  notDoneToday: 'Por fazer',
  doneToday: 'Feito hoje',
  unmarkDaily: 'Remover diária',

  // Activity Feed
  addedTasks: (name, count, listName) =>
    `${name} adicionou ${count} tarefa${count !== 1 ? 's' : ''} em ${listName}`,
  newTaskIn: (listName, text) => `Nova tarefa em ${listName}: ${text}`,

  // ListSelector
  newList: 'Nova Lista',
  createNewList: 'Criar Nova Lista',
  editList: 'Editar Lista',
  listName: 'Nome da lista...',
  cancel: 'Cancelar',
  create: 'Criar',
  save: 'Guardar',
  deleteListConfirm: 'Apagar esta lista e todos os seus itens?',

  // TaskList
  addNewItem: 'Adicionar item...',
  add: 'Adicionar',
  daily: 'Diária',
  pending: (n) => `${n} pendente${n !== 1 ? 's' : ''}`,
  done: (n) => `${n} feito${n !== 1 ? 's' : ''}`,
  noItems: 'Ainda sem itens. Adiciona algo!',
  clearCompleted: (n) => `Limpar ${n} item${n !== 1 ? ' feitos' : ' feito'}`,

  // TaskItem
  doneBy: (name, time) => `feito por ${name} às ${time}`,
  addedAt: (time) => `adicionado às ${time}`,

  // QuickAdd
  selectList: 'Escolher lista...',
  general: 'Geral',

  // Common
  delete: 'Apagar',
  clearAll: 'Limpar tudo',
};

const languages = { en, pt };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('casasync-lang') || 'en');

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'pt' : 'en';
    localStorage.setItem('casasync-lang', newLang);
    setLang(newLang);
  };

  const t = languages[lang];

  return (
    <LanguageContext.Provider value={{ t, lang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
