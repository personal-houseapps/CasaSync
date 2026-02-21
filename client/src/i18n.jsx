import { useState, createContext, useContext } from 'react';

const en = {
  // Auth
  logIn: 'Log In',
  signUp: 'Sign Up',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm password',
  loggingIn: 'Logging in...',
  signingUp: 'Signing up...',
  passwordsMismatch: 'Passwords do not match',
  authError: 'Authentication failed. Please try again.',
  checkEmail: 'Check your email to confirm your account!',

  // Household
  householdSetupSubtitle: 'Create or join a household to get started',
  createHousehold: 'Create Household',
  joinHousehold: 'Join Household',
  householdName: 'Household name...',
  displayName: 'Your name...',
  enterJoinCode: 'Enter join code...',
  pickColor: 'Pick your color',
  join: 'Join',
  invalidCode: 'Invalid join code. Please check and try again.',
  confirm: 'Confirm',

  // Member Picker / PIN
  whoAreYou: 'Who are you?',
  enterPin: 'Enter PIN',
  wrongPin: 'Wrong PIN. Try again.',
  pinSetup: 'Profile PIN',
  pinDescription: 'Set a 4-digit PIN to protect your profile on this device.',
  pinHint: 'Leave empty to remove PIN.',
  setPin: 'Set PIN',
  changePin: 'Change PIN',

  // Settings
  settings: 'Settings',
  members: 'Members',
  owner: 'Owner',
  you: 'you',
  removeMember: 'Remove',
  removeMemberConfirm: 'Remove this member from the household?',
  editProfile: 'Edit Profile',
  logOut: 'Log Out',
  copyCode: 'Copy',
  codeCopied: 'Copied!',
  shareCode: 'Share this code so others can join:',

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
  description: 'Add description...',
  dueAt: 'Set deadline...',
  assignTo: 'Assign to...',
  everyone: 'Everyone',
  unassign: 'Unassign',
  assignedTo: (name) => `assigned to ${name}`,
  filterAll: 'All',
  filterMine: 'Mine',
  overdue: 'Overdue',

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
  // Auth
  logIn: 'Entrar',
  signUp: 'Criar Conta',
  email: 'Email',
  password: 'Palavra-passe',
  confirmPassword: 'Confirmar palavra-passe',
  loggingIn: 'A entrar...',
  signingUp: 'A criar conta...',
  passwordsMismatch: 'As palavras-passe não coincidem',
  authError: 'Autenticação falhou. Tenta novamente.',
  checkEmail: 'Verifica o teu email para confirmar a conta!',

  // Household
  householdSetupSubtitle: 'Cria ou junta-te a uma casa para começar',
  createHousehold: 'Criar Casa',
  joinHousehold: 'Juntar-se',
  householdName: 'Nome da casa...',
  displayName: 'O teu nome...',
  enterJoinCode: 'Introduzir código...',
  pickColor: 'Escolhe a tua cor',
  join: 'Juntar',
  invalidCode: 'Código inválido. Verifica e tenta novamente.',
  confirm: 'Confirmar',

  // Member Picker / PIN
  whoAreYou: 'Quem és tu?',
  enterPin: 'Introduzir PIN',
  wrongPin: 'PIN errado. Tenta novamente.',
  pinSetup: 'PIN do Perfil',
  pinDescription: 'Define um PIN de 4 dígitos para proteger o teu perfil neste dispositivo.',
  pinHint: 'Deixa vazio para remover o PIN.',
  setPin: 'Definir PIN',
  changePin: 'Alterar PIN',

  // Settings
  settings: 'Definições',
  members: 'Membros',
  owner: 'Dono',
  you: 'tu',
  removeMember: 'Remover',
  removeMemberConfirm: 'Remover este membro da casa?',
  editProfile: 'Editar Perfil',
  logOut: 'Sair',
  copyCode: 'Copiar',
  codeCopied: 'Copiado!',
  shareCode: 'Partilha este código para outros se juntarem:',

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
  description: 'Adicionar descrição...',
  dueAt: 'Definir prazo...',
  assignTo: 'Atribuir a...',
  everyone: 'Todos',
  unassign: 'Desatribuir',
  assignedTo: (name) => `atribuído a ${name}`,
  filterAll: 'Todos',
  filterMine: 'Meus',
  overdue: 'Atrasado',

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
