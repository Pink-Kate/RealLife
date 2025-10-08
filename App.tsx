import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, Modal, TextInput, Alert, Animated, Dimensions, Switch, Linking, Clipboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Theme Context (перенесено з окремого файлу)
export type ThemeType = 'light' | 'dark' | 'accent';

export interface ThemeColors {
  // Основные фоны
  background: string;
  surface: string;
  cardBackground: string;
  
  // Текст
  text: string;
  textSecondary: string;
  
  // Акцентные цвета
  primary: string;
  primaryGradient: string[];
  secondary: string;
  accent: string;
  
  // Элементы UI
  border: string;
  shadow: string;
  tabBarBackground: string;
  
  // Статусы
  success: string;
  error: string;
  warning: string;
  
  // Интерактивные элементы
  buttonBackground: string;
  buttonText: string;
  activeTab: string;
  inactiveTab: string;
}

export const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: '#F9F9F9',
    surface: '#FFFFFF',
    cardBackground: '#FFFFFF',
    text: '#212121',
    textSecondary: '#616161',
    primary: '#00BFA5',
    primaryGradient: ['#00BFA5', '#FFC107'],
    secondary: '#00BFA5',
    accent: '#00BFA5',
    border: '#E0E0E0',
    shadow: '#000000',
    tabBarBackground: '#FFFFFF',
    success: '#00BFA5',
    error: '#F44336',
    warning: '#FF9800',
    buttonBackground: '#00BFA5',
    buttonText: '#FFFFFF',
    activeTab: '#00BFA5',
    inactiveTab: '#BDBDBD',
  },
  dark: {
    background: '#E8E8E8',
    surface: '#F0F0F0',
    cardBackground: '#F5F5F5',
    text: '#333333',
    textSecondary: '#555555',
    primary: '#7C4DFF',
    primaryGradient: ['#7C4DFF', '#00BFA5'],
    secondary: '#7C4DFF',
    accent: '#7C4DFF',
    border: '#D0D0D0',
    shadow: '#000000',
    tabBarBackground: '#F0F0F0',
    success: '#00BFA5',
    error: '#F44336',
    warning: '#FF9800',
    buttonBackground: '#7C4DFF',
    buttonText: '#FFFFFF',
    activeTab: '#7C4DFF',
    inactiveTab: '#9E9E9E',
  },
  accent: {
    background: '#FFF8E1',
    surface: '#FFF3E0',
    cardBackground: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    primary: '#FF6F00',
    primaryGradient: ['#FFC107', '#FF6F00'],
    secondary: '#FF6F00',
    accent: '#FF6F00',
    border: '#E0E0E0',
    shadow: '#000000',
    tabBarBackground: '#FFF3E0',
    success: '#00BFA5',
    error: '#F44336',
    warning: '#FF6F00',
    buttonBackground: '#FF6F00',
    buttonText: '#FFFFFF',
    activeTab: '#FF6F00',
    inactiveTab: '#BDBDBD',
  },
};

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [themeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Анимация перехода темы
    setIsTransitioning(true);
    
    Animated.timing(themeAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      setIsTransitioning(false);
    });
  }, [theme]);

  const colors = themes[theme];

  const handleSetTheme = (newTheme: ThemeType) => {
    if (newTheme !== theme) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        colors, 
        setTheme: handleSetTheme, 
        isTransitioning 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const { width } = Dimensions.get('window');

// Надійний об'єкт для збереження даних (працює в браузері)
const Storage = {
  setItem: (key: string, value: string) => {
    try {
      // Зберігаємо в localStorage
      localStorage.setItem(key, value);
      
      // Додатково зберігаємо в sessionStorage як резервну копію
      sessionStorage.setItem(key + '_backup', value);
      
      // Зберігаємо timestamp останнього збереження
      localStorage.setItem(key + '_timestamp', Date.now().toString());
      
      console.log(`Дані збережено: ${key}`);
    } catch (error) {
      console.log('Помилка збереження:', error);
      // Спробуємо зберегти в sessionStorage якщо localStorage не працює
      try {
        sessionStorage.setItem(key, value);
        console.log(`Дані збережено в sessionStorage: ${key}`);
      } catch (sessionError) {
        console.log('Помилка збереження в sessionStorage:', sessionError);
      }
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      // Спочатку пробуємо localStorage
      let data = localStorage.getItem(key);
      
      if (data) {
        // Перевіряємо timestamp
        const timestamp = localStorage.getItem(key + '_timestamp');
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp);
          console.log(`Дані ${key} віком ${Math.round(age / 1000 / 60)} хвилин`);
        }
        return data;
      }
      
      // Якщо в localStorage немає, пробуємо sessionStorage
      data = sessionStorage.getItem(key);
      if (data) {
        console.log(`Дані відновлено з sessionStorage: ${key}`);
        return data;
      }
      
      // Пробуємо резервну копію
      data = sessionStorage.getItem(key + '_backup');
      if (data) {
        console.log(`Дані відновлено з резервної копії: ${key}`);
        return data;
      }
      
      return null;
    } catch (error) {
      console.log('Помилка завантаження:', error);
      return null;
    }
  },
  
};

const DetailedQuestsAppContent: React.FC = () => {
  const { colors, theme, setTheme } = useTheme();
  const [currentScreen, setCurrentScreen] = React.useState('home');
  const [userProfile, setUserProfile] = React.useState({
    name: 'Гравець',
    avatar: '🙂',
    totalXP: 0,
    level: 0,
    streak: 0,
    mood: '💪',
    moodText: 'У фокусі!',
  });
  const [selectedCharacter, setSelectedCharacter] = React.useState('🙂');
  const [showCharacterModal, setShowCharacterModal] = React.useState(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = React.useState(false);
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showQuestDetailsModal, setShowQuestDetailsModal] = React.useState(false);
  const [selectedQuest, setSelectedQuest] = React.useState<any>(null);
  const [completedQuests, setCompletedQuests] = React.useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [selectedDailyCategory, setSelectedDailyCategory] = React.useState<string>('all');
  const [lastResetDate, setLastResetDate] = React.useState<string>('');

  // Налаштування
  const [notifications, setNotifications] = React.useState(true);
  const [progressReminders, setProgressReminders] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [vibrationsEnabled, setVibrationsEnabled] = React.useState(true);
  const [animationsEnabled, setAnimationsEnabled] = React.useState(true);

  // ОРИГІНАЛЬНА ТАБЛИЦЯ РІВНІВ (100 рівнів)
  const levelTable = [
    500, 540, 583, 630, 680, 734, 793, 856, 924, 998,
    1079, 1166, 1259, 1359, 1468, 1585, 1712, 1849, 1997, 2157,
    2330, 2517, 2718, 2936, 3171, 3424, 3698, 3994, 4314, 4659,
    5032, 5434, 5869, 6338, 6845, 7393, 7984, 8623, 9313, 10058,
    10862, 11731, 12670, 13683, 14778, 15960, 17237, 18616, 20105, 21713,
    23450, 25326, 27352, 29540, 31903, 34455, 37211, 40188, 43403, 46875,
    50625, 54675, 59049, 63773, 68875, 74385, 80336, 86763, 93704, 101200,
    109296, 118040, 127483, 137682, 148696, 160592, 173439, 187314, 202299, 218483,
    235962, 254839, 275226, 297244, 321024, 346706, 374442, 404398, 436750, 471690,
    509425, 550180, 594194, 641730, 693068, 748514, 808395, 872667, 942480, 1017878
  ];

  // Функції для роботи з часом та скидання квестів
  const getKyivTime = () => {
    const now = new Date();
    const kyivTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Kiev"}));
    return kyivTime;
  };

  const getCurrentDateString = () => {
    const kyivTime = getKyivTime();
    return kyivTime.toISOString().split('T')[0]; // Формат YYYY-MM-DD
  };

  const shouldResetDailyQuests = () => {
    const currentDate = getCurrentDateString();
    const currentTime = getKyivTime();
    
    // Перевіряємо, чи минув день і чи настав час скидання (04:00)
    if (lastResetDate !== currentDate && currentTime.getHours() >= 4) {
      return true;
    }
    return false;
  };

  const resetDailyQuests = () => {
    setDailyQuests(prevQuests => 
      prevQuests.map(quest => ({ ...quest, completed: false }))
    );
    setLastResetDate(getCurrentDateString());
  };

  // Функція валідації даних
  const validateUserData = (data: any) => {
    if (!data || typeof data !== 'object') return false;
    
    // Перевіряємо основні поля
    const requiredFields = ['userProfile', 'dailyQuests', 'mainQuests'];
    for (const field of requiredFields) {
      if (!data[field]) return false;
    }
    
    // Перевіряємо структуру userProfile
    if (typeof data.userProfile.totalXP !== 'number') return false;
    
    return true;
  };

  // Функції для збереження та завантаження даних
  const saveUserData = () => {
    try {
      const userData = {
        userProfile,
        dailyQuests,
        mainQuests,
        completedQuests: Array.from(completedQuests),
        lastResetDate,
        selectedCharacter,
        notifications,
        progressReminders,
        soundEnabled,
        vibrationsEnabled,
        theme,
        animationsEnabled,
        version: '1.0.1', // Версія даних для майбутніх оновлень
        savedAt: new Date().toISOString()
      };
      
      // Валідуємо дані перед збереженням
      if (!validateUserData(userData)) {
        console.log('Помилка: Дані не пройшли валідацію');
        return;
      }
      
      Storage.setItem('userProgressData', JSON.stringify(userData));
      console.log('Дані збережено успішно:', userData.savedAt);
    } catch (error) {
      console.log('Помилка збереження даних:', error);
    }
  };

  const loadUserData = () => {
    try {
      const savedData = Storage.getItem('userProgressData');
      if (savedData) {
        const userData = JSON.parse(savedData);
        
        // Валідуємо завантажені дані
        if (!validateUserData(userData)) {
          console.log('Помилка: Завантажені дані не пройшли валідацію');
          return;
        }
        
        // Безпечно оновлюємо стан
        if (userData.userProfile) {
          setUserProfile(userData.userProfile);
          // Синхронізуємо аватар з selectedCharacter
          if (userData.userProfile.avatar) {
            setSelectedCharacter(userData.userProfile.avatar);
          }
        }
        if (userData.dailyQuests) setDailyQuests(userData.dailyQuests);
        if (userData.mainQuests) setMainQuests(userData.mainQuests);
        if (userData.completedQuests) setCompletedQuests(new Set(userData.completedQuests));
        if (userData.lastResetDate) setLastResetDate(userData.lastResetDate);
        // selectedCharacter тепер синхронізується з userProfile.avatar вище
        if (userData.notifications !== undefined) setNotifications(userData.notifications);
        if (userData.progressReminders !== undefined) setProgressReminders(userData.progressReminders);
        if (userData.soundEnabled !== undefined) setSoundEnabled(userData.soundEnabled);
        if (userData.vibrationsEnabled !== undefined) setVibrationsEnabled(userData.vibrationsEnabled);
        if (userData.theme) setTheme(userData.theme);
        if (userData.animationsEnabled !== undefined) setAnimationsEnabled(userData.animationsEnabled);
        
        console.log('Дані завантажено успішно:', userData.savedAt || 'без дати');
      } else {
        console.log('Збережених даних не знайдено');
      }
    } catch (error) {
      console.log('Помилка завантаження даних:', error);
    }
  };

  // ОРИГІНАЛЬНІ ФУНКЦІЇ РІВНІВ
  const getLevel = (xp: number) => {
    let totalXpNeeded = 0;
    for (let i = 0; i < levelTable.length; i++) {
      totalXpNeeded += levelTable[i];
      if (xp < totalXpNeeded) return i + 1;
    }
    return levelTable.length;
  };

  const getLevelProgress = (xp: number) => {
    const currentLevel = getLevel(xp);
    if (currentLevel >= 100) return 100;
    
    let totalXpForCurrentLevel = 0;
    for (let i = 0; i < currentLevel - 1; i++) {
      totalXpForCurrentLevel += levelTable[i];
    }
    
    const xpInCurrentLevel = xp - totalXpForCurrentLevel;
    const xpNeededForCurrentLevel = levelTable[currentLevel - 1];
    return Math.min(100, (xpInCurrentLevel / xpNeededForCurrentLevel) * 100);
  };

  const getXPInCurrentLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    let totalXpForCurrentLevel = 0;
    for (let i = 0; i < currentLevel - 1; i++) {
      totalXpForCurrentLevel += levelTable[i];
    }
    return xp - totalXpForCurrentLevel;
  };

  const getXPNeededForCurrentLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    if (currentLevel >= 100) return levelTable[99];
    return levelTable[currentLevel - 1];
  };

  const getXPToNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    if (currentLevel >= 100) return 0;
    const xpForNextLevel = levelTable[currentLevel];
    return xpForNextLevel - xp;
  };

  // ОРИГІНАЛЬНІ НАГОРОДИ ЗА РІВНІ
  const getLevelRewards = (level: number) => {
    const rewards = {
      1: { title: "Початок", reward: "Перша перемога", description: "Перший крок до успіху" },
      2: { title: "Учень", reward: "Плащ новачка", description: "Стильний плащ для початківця" },
      3: { title: "Практикант", reward: "Ремінь сили", description: "Ремінь, що збільшує силу" },
      4: { title: "Досвідчений", reward: "Перстень мудрості", description: "Магічний перстень" },
      5: { title: "Воїн", reward: "Міць рішучості", description: "Внутрішня сила для досягнення цілей" },
      6: { title: "Мисливець", reward: "Браслет удачі", description: "Браслет, що приносить удачу" },
      7: { title: "Мандрівник", reward: "Чоботи швидкості", description: "Чоботи для швидких подорожей" },
      8: { title: "Дослідник", reward: "Талісман знань", description: "Талісман для розширення знань" },
      9: { title: "Маг", reward: "Аура світіння", description: "Персонаж починає світитися" },
      10: { title: "Магістр", reward: "Мантія володаря", description: "Легендарна мантія" },
      15: { title: "Експерт", reward: "Корона досягнень", description: "Символ майстерності" },
      20: { title: "Майстер", reward: "Скіпетр влади", description: "Знак справжнього лідерства" },
      25: { title: "Грандмайстер", reward: "Аура легенди", description: "Ти стаєш легендою" },
      30: { title: "Архімаг", reward: "Мантія безсмертя", description: "Безсмертна мантія" },
      40: { title: "Титан", reward: "Броня богів", description: "Божественна захист" },
      50: { title: "Імперіал", reward: "Корона світу", description: "Правитель світу" },
      60: { title: "Божество", reward: "Скіпетр творця", description: "Сила створювати світи" },
      70: { title: "Творець", reward: "Корона всесвіту", description: "Володар всього" },
      80: { title: "Безмежний", reward: "Енергія вічності", description: "Безмежна сила" },
      90: { title: "Абсолют", reward: "Корона абсолюту", description: "Досягнення абсолюту" },
      100: { title: "Бог", reward: "Безмежна сила", description: "Ти став богом прогресу" }
    };
    
    let rewardLevel = 1;
    for (let i = level; i >= 1; i--) {
      if (rewards[i as keyof typeof rewards]) {
        rewardLevel = i;
        break;
      }
    }
    
    return rewards[rewardLevel as keyof typeof rewards] || { title: "Бог", reward: "Безмежна сила", description: "Ти досяг найвищих висот" };
  };

  const getMotivationalMessage = () => {
    const totalXP = userProfile.totalXP;
    const currentLevel = getLevel(totalXP);
    const xpToNext = getXPToNextLevel(totalXP);
    
    if (xpToNext <= 50 && currentLevel < 100) {
      return `Ще ${xpToNext} XP — і нова нагорода чекає 🚀`;
    } else if (currentLevel >= 50) {
      return `Ти справжній майстер! Продовжуй у тому ж дусі 💪`;
    } else if (currentLevel >= 25) {
      return `Відмінний прогрес! Ти на правильному шляху 🌟`;
    } else if (currentLevel >= 10) {
      return `Добре йдеш! Продовжуй розвиватися 🎯`;
    } else {
      return `Кожен крок наближає до мети! Продовжуй! 🌱`;
    }
  };

  // Розширена колекція персонажів
  const availableCharacters = [
    { emoji: '😈', name: 'Містичний', profession: 'Загадковий' },
    { emoji: '🤥', name: 'Хитрий', profession: 'Мисливець' },
    { emoji: '🥰', name: 'Романтичний', profession: 'Кохання' },
    { emoji: '😇', name: 'Ангельський', profession: 'Доброта' },
    { emoji: '😊', name: 'Класичний', profession: 'Універсальний' },
    { emoji: '🥹', name: 'Емоційний', profession: 'Відчувач' },
    { emoji: '😅', name: 'Веселий', profession: 'Оптиміст' },
    { emoji: '🥲', name: 'Солодкий', profession: 'Теплота' },
    { emoji: '🤣', name: 'Смішний', profession: 'Комік' },
    { emoji: '😭', name: 'Драматичний', profession: 'Актор' },
    { emoji: '🥶', name: 'Холодний', profession: 'Спокійний' },
    { emoji: '🥵', name: 'Гарячий', profession: 'Страстний' },
    { emoji: '🤯', name: 'Вражений', profession: 'Відкривач' },
    { emoji: '🤫', name: 'Тихій', profession: 'Спостерігач' },
    { emoji: '🫠', name: 'Розтоплений', profession: 'Мрійник' },
    { emoji: '😦', name: 'Здивований', profession: 'Дослідник' },
    { emoji: '😲', name: 'Шокований', profession: 'Відкривач' },
    { emoji: '🤐', name: 'Мовчазний', profession: 'Мудрець' },
    { emoji: '🤢', name: 'Блюзний', profession: 'Скептик' },
    { emoji: '🤡', name: 'Клоун', profession: 'Артист' },
    { emoji: '☠️', name: 'Пірат', profession: 'Авантюрист' },
    { emoji: '👻', name: 'Привид', profession: 'Містик' },
    { emoji: '👾', name: 'Інопланетянин', profession: 'Космонавт' },
    { emoji: '🤖', name: 'Робот', profession: 'Технік' },
    { emoji: '😺', name: 'Кіт', profession: 'Незалежний' },
    { emoji: '🐶', name: 'Пес', profession: 'Вірний' },
    { emoji: '🐱', name: 'Кішечка', profession: 'Грайливий' },
    { emoji: '🐭', name: 'Мишка', profession: 'Швидкий' },
    { emoji: '🐹', name: 'Хомяк', profession: 'Милий' },
    { emoji: '🐰', name: 'Кролик', profession: 'Стрибкий' },
    { emoji: '🦊', name: 'Лисиця', profession: 'Хитрий' },
    { emoji: '🐻', name: 'Ведмідь', profession: 'Сильний' },
    { emoji: '🐼', name: 'Панда', profession: 'Спокійний' },
    { emoji: '🐻', name: 'Полярний ведмідь', profession: 'Витривалий' },
    { emoji: '🐨', name: 'Коала', profession: 'Лінивий' },
    { emoji: '🐯', name: 'Тигр', profession: 'Хижий' },
    { emoji: '🦁', name: 'Лев', profession: 'Король' },
    { emoji: '🐮', name: 'Корова', profession: 'Терплячий' },
    { emoji: '🐷', name: 'Свиня', profession: 'Щасливий' },
    { emoji: '🐽', name: 'Носик', profession: 'Цікавий' },
    { emoji: '🐸', name: 'Жаба', profession: 'Стрибкий' },
    { emoji: '🐵', name: 'Мавпа', profession: 'Веселий' },
    { emoji: '🏃‍♀️', name: 'Бігунка', profession: 'Спортсмен' },
    { emoji: '🏃', name: 'Бігун', profession: 'Активний' },
    { emoji: '👨‍🚀', name: 'Астронавт', profession: 'Дослідник' },
    { emoji: '👩‍🚀', name: 'Космонавтка', profession: 'Смілива' },
    { emoji: '👨‍✈️', name: 'Пілот', profession: 'Лідер' },
    { emoji: '👩‍✈️', name: 'Пілотка', profession: 'Професіонал' },
    { emoji: '🤵‍♂️', name: 'Джентльмен', profession: 'Елегантний' },
    { emoji: '👰‍♀️', name: 'Наречена', profession: 'Романтична' },
    { emoji: '👩‍🔧', name: 'Механік', profession: 'Майстер' },
    { emoji: '👨‍🔧', name: 'Ремонтник', profession: 'Вправний' },
    { emoji: '👩‍🔬', name: 'Вчений', profession: 'Дослідник' },
    { emoji: '👨‍🔬', name: 'Науковець', profession: 'Розумний' },
    { emoji: '👩‍💻', name: 'Програмістка', profession: 'Креатор' },
    { emoji: '👨‍💻', name: 'Хакер', profession: 'Технік' },
    { emoji: '👩‍💼', name: 'Бізнес-леді', profession: 'Лідер' },
    { emoji: '👨‍💼', name: 'Бізнесмен', profession: 'Успішний' },
    { emoji: '👩‍🏭', name: 'Робітниця', profession: 'Трудяща' },
    { emoji: '👨‍🏭', name: 'Робітник', profession: 'Старанний' },
    { emoji: '👨‍🏫', name: 'Вчитель', profession: 'Мудрий' },
    { emoji: '👩‍🏫', name: 'Вчителька', profession: 'Знаюча' },
    { emoji: '👨‍🎤', name: 'Співак', profession: 'Артист' },
    { emoji: '👩‍🎤', name: 'Співачка', profession: 'Творча' },
    { emoji: '👨‍🎓', name: 'Випускник', profession: 'Освічений' },
    { emoji: '👨‍⚕️', name: 'Лікар', profession: 'Допоміжний' },
    { emoji: '👩‍⚕️', name: 'Медсестра', profession: 'Турботлива' },
    { emoji: '👩‍🍳', name: 'Кухарка', profession: 'Смачна' },
    { emoji: '👨‍🍳', name: 'Шеф-кухар', profession: 'Майстер' },
    { emoji: '👨‍🌾', name: 'Фермер', profession: 'Трудолюб' },
    { emoji: '👩‍🌾', name: 'Фермерка', profession: 'Природна' },
    { emoji: '👮‍♀️', name: 'Поліцейська', profession: 'Захисниця' },
    { emoji: '👮‍♂️', name: 'Поліцейський', profession: 'Захисник' },
    { emoji: '👷‍♀️', name: 'Будівельниця', profession: 'Створювач' },
    { emoji: '👷‍♂️', name: 'Будівельник', profession: 'Строїтель' },
  ];

  // ВСІ 64 ОРИГІНАЛЬНІ КВЕСТИ З 20 МІНІ-ЗАВДАННЯМИ
  const [mainQuests, setMainQuests] = React.useState([
    // 1️⃣ Кар'єра та освіта (1-10)
    {
      id: 'career-1',
      title: 'Закінчити університет',
      description: 'Повний шлях від вступу до диплома',
      icon: '🎓',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#3b82f6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c1-s${i+1}`,
        text: ['Обрати спеціальність', 'Подати документи', 'Пройти вступні іспити', 'Отримати студентський квиток', 'Пройти першу лекцію', 'Познайомитися з групою', 'Скласти перший модуль', 'Пройти першу сесію', 'Написати курсову', 'Пройти практику', 'Виступити на семінарі', 'Пройти другу сесію', 'Почати дипломну роботу', 'Провести дослідження', 'Написати диплом', 'Підготувати презентацію', 'Захистити диплом', 'Отримати диплом', 'Сфотографуватися у мантії 🎓', 'Відсвяткувати випуск'][i],
        completed: false
      }))
    },
    {
      id: 'career-2',
      title: 'Перша робота / підвищення',
      description: 'Шлях від резюме до кар\'єрного зростання',
      icon: '💼',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c2-s${i+1}`,
        text: ['Написати резюме', 'Створити профіль на LinkedIn', 'Подати на вакансії', 'Пройти першу співбесіду', 'Отримати відмову (і не здатися)', 'Подати на ще 5 вакансій', 'Пройти технічне завдання', 'Пройти другу співбесіду', 'Отримати оффер 🎉', 'Вийти на роботу', 'Пройти випробувальний термін', 'Виконати перший проект', 'Отримати відгук керівника', 'Взяти участь у корпоративі', 'Пройти навчання / сертифікацію', 'Отримати бонус', 'Підготувати власний проект', 'Отримати похвалу від клієнта', 'Підвищення зарплати', 'Новий рівень посади'][i],
        completed: false
      }))
    },
    {
      id: 'career-3',
      title: 'Відкрити бізнес',
      description: 'Від ідеї до успішного запуску',
      icon: '🏢',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c3-s${i+1}`,
        text: ['Вибрати нішу', 'Провести дослідження ринку', 'Створити бізнес-план', 'Знайти інвесторів', 'Зареєструвати компанію', 'Орендувати офіс', 'Найняти команду', 'Розробити продукт', 'Створити бренд', 'Запустити маркетинг', 'Знайти перших клієнтів', 'Оптимізувати процеси', 'Масштабувати бізнес', 'Відкрити філії', 'Виййти на міжнародний ринок', 'Отримати нагороди', 'Продати бізнес', 'Стати ментором', 'Написати книгу про досвід', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },
    {
      id: 'career-4',
      title: 'Створити додаток / програму',
      description: 'Від концепції до публікації',
      icon: '💻',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c4-s${i+1}`,
        text: ['Вибрати ідею', 'Створити прототип', 'Написати технічне завдання', 'Обрати технології', 'Налаштувати середовище', 'Написати код', 'Створити дизайн', 'Протестувати функції', 'Виправити баги', 'Оптимізувати продуктивність', 'Додати аналітику', 'Підготувати до публікації', 'Опублікувати в App Store', 'Запустити маркетинг', 'Зібрати відгуки', 'Оновити додаток', 'Додати нові функції', 'Досягти 1000 завантажень', 'Монетизувати', 'Стати популярним'][i],
        completed: false
      }))
    },
    {
      id: 'career-5',
      title: 'Пройти онлайн-курс',
      description: 'Систематичне навчання нових навичок',
      icon: '📚',
      xp: 500,
      category: 'career',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c5-s${i+1}`,
        text: ['Вибрати курс', 'Зареєструватися', 'Ознайомитися з планом', 'Пройти вступний модуль', 'Вивчити теорію', 'Виконати практичні завдання', 'Пройти тести', 'Здати перший проект', 'Пройти 25% курсу', 'Пройти 50% курсу', 'Пройти 75% курсу', 'Здати фінальний проект', 'Отримати сертифікат', 'Додати до резюме', 'Застосувати знання', 'Поділитися досвідом', 'Рекомендувати іншим', 'Продовжити навчання', 'Стати ментором', 'Відсвяткувати завершення'][i],
        completed: false
      }))
    },
    {
      id: 'career-6',
      title: 'Написати книгу',
      description: 'Від ідеї до публікації',
      icon: '📝',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c6-s${i+1}`,
        text: ['Вибрати тему', 'Створити план', 'Написати 1 розділ', 'Написати 2 розділ', 'Написати 3 розділ', 'Редагування', 'Написати ще 3 розділи', 'Зробити дослідження', 'Пройти критичний перегляд', 'Написати фінальний розділ', 'Зробити ілюстрації', 'Перевірити стиль', 'Віддати на редактуру', 'Підготувати до друку', 'Обрати видавця', 'Запустити друк', 'Отримати перший примірник', 'Провести презентацію', 'Опублікувати онлайн', 'Отримати перші відгуки'][i],
        completed: false
      }))
    },
    {
      id: 'career-7',
      title: 'Опублікувати статтю',
      description: 'Від ідеї до публікації в журналі',
      icon: '🧾',
      xp: 1200,
      category: 'career',
      progress: 0,
      color: '#3b82f6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c7-s${i+1}`,
        text: ['Вибрати тему', 'Провести дослідження', 'Створити план статті', 'Написати вступ', 'Написати основну частину', 'Написати висновки', 'Додати джерела', 'Перевірити факти', 'Редагувати текст', 'Отримати рецензію', 'Відправити в журнал', 'Отримати відгук', 'Внести правки', 'Підготувати до публікації', 'Опублікувати', 'Поділитися в соцмережах', 'Отримати коментарі', 'Відповісти на питання', 'Планувати наступну статтю', 'Відсвяткувати публікацію'][i],
        completed: false
      }))
    },
    {
      id: 'career-8',
      title: 'Пройти магістратуру / аспірантуру',
      description: 'Поглиблене навчання та дослідження',
      icon: '🏫',
      xp: 1000,
      category: 'career',
      progress: 5,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c8-s${i+1}`,
        text: ['Вибрати програму', 'Подати документи', 'Скласти вступні іспити', 'Отримати прийом', 'Ознайомитися з програмою', 'Пройти перший курс', 'Вибрати наукового керівника', 'Почати дослідження', 'Написати першу роботу', 'Виступити на конференції', 'Опублікувати статтю', 'Пройти всі курси', 'Скласти кваліфікаційний іспит', 'Написати дисертацію', 'Захистити дисертацію', 'Отримати диплом', 'Продовжити в аспірантурі', 'Завершити аспірантуру', 'Отримати ступінь', 'Почати викладацьку діяльність'][i],
        completed: false
      }))
    },
    {
      id: 'career-9',
      title: 'Вивчити нову мову програмування',
      description: 'Освоєння сучасних технологій',
      icon: '🖥️',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c9-s${i+1}`,
        text: ['Обрати мову', 'Встановити середовище', 'Вивчити синтаксис', 'Написати Hello World', 'Вивчити змінні', 'Вивчити цикли', 'Вивчити функції', 'Вивчити класи', 'Створити перший проект', 'Вивчити бібліотеки', 'Створити веб-додаток', 'Підключити базу даних', 'Додати авторизацію', 'Оптимізувати код', 'Написати тести', 'Розгорнути проект', 'Створити портфоліо', 'Подати на роботу', 'Пройти співбесіду', 'Отримати роботу'][i],
        completed: false
      }))
    },
    {
      id: 'career-10',
      title: 'Стати експертом у галузі',
      description: 'Досягнення професійного визнання',
      icon: '📊',
      xp: 1000,
      category: 'career',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `c10-s${i+1}`,
        text: ['Вибрати галузь', 'Вивчити літературу', 'Пройти курси', 'Отримати сертифікати', 'Працювати в галузі', 'Накопичити досвід', 'Опублікувати статті', 'Виступити на конференції', 'Створити блог', 'Стати ментором', 'Отримати нагороди', 'Відкрити бізнес', 'Написати книгу', 'Створити курс', 'Стати спікером', 'Отримати визнання', 'Стати експертом', 'Консультувати компанії', 'Навчати інших', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },

    // 2️⃣ Фінанси та інвестиції (11-20)
    {
      id: 'finance-1',
      title: 'Накопичити $10,000',
      description: 'Систематичне накопичення великої суми',
      icon: '💰',
      xp: 1000,
      category: 'finance',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f1-s${i+1}`,
        text: ['Відкрити рахунок', 'Скласти бюджет', 'Відкласти перші $100', 'Відкласти $500', 'Відкласти $1000', 'Вести таблицю', 'Зменшити витрати', 'Відкласти $2000', 'Відкласти $3000', 'Пройти курс з фінансів', 'Відкласти $4000', 'Зробити депозит', 'Відкласти $5000', 'Створити резервний фонд', 'Відкласти $7000', 'Інвестувати частину', 'Відкласти $8000', 'Відкласти $9000', 'Досягти $10,000', 'Відсвяткувати 🎉'][i],
        completed: false
      }))
    },
    {
      id: 'finance-2',
      title: 'Купити житло',
      description: 'Велика покупка та інвестиція в майбутнє',
      icon: '🏡',
      xp: 1000,
      category: 'finance',
      progress: 5,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f2-s${i+1}`,
        text: ['Вибрати район', 'Знайти агента', 'Оформити документи', 'Отримати кредит', 'Знайти варіанти', 'Подивитися квартири', 'Обрати квартиру', 'Перевірити документи', 'Оцінити вартість', 'Провести торги', 'Підписати договір', 'Оформити кредит', 'Сплатити перший внесок', 'Оформити страхування', 'Провести ремонт', 'Переїхати', 'Оформити прописку', 'Обставити меблями', 'Відсвяткувати новосілля', 'Насолоджуватися домом'][i],
        completed: false
      }))
    },
    {
      id: 'finance-3',
      title: 'Купити автомобіль',
      description: 'Мобільність та комфорт',
      icon: '🏎️',
      xp: 1000,
      category: 'finance',
      progress: 0,
      color: '#ef4444',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f3-s${i+1}`,
        text: ['Вибір моделі', 'Збір грошей', 'Оформлення документів', 'Тест-драйв', 'Перевірка технічного стану', 'Оцінка вартості', 'Торги з продавцем', 'Оформлення кредиту', 'Страхування', 'Реєстрація', 'Отримання номерів', 'Перша поїздка', 'Технічне обслуговування', 'Налаштування', 'Додаткове обладнання', 'Перша подорож', 'Навчання водінню', 'Отримання досвіду', 'Планування наступної машини', 'Насолодження водінням'][i],
        completed: false
      }))
    },
    {
      id: 'finance-4',
      title: 'Інвестувати',
      description: 'Розумне розміщення капіталу',
      icon: '📈',
      xp: 1000,
      category: 'finance',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f4-s${i+1}`,
        text: ['Вивчити базу', 'Купити акції/облігації', 'Відстежувати прибуток', 'Вивчити ринки', 'Відкрити брокерський рахунок', 'Створити портфель', 'Купити перші акції', 'Діверсифікувати', 'Відстежувати новини', 'Аналізувати звіти', 'Ребалансувати портфель', 'Купити облігації', 'Інвестувати в ETF', 'Вивчити криптовалюти', 'Купити криптовалюти', 'Інвестувати в нерухомість', 'Створити пасивний дохід', 'Оптимізувати податки', 'Досягти фінансової свободи', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },
    {
      id: 'finance-5',
      title: 'Інвестувати у нерухомість',
      description: 'Стабільні інвестиції в майно',
      icon: '🏘️',
      xp: 1000,
      category: 'finance',
      progress: 5,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f5-s${i+1}`,
        text: ['Вибрати об\'єкт', 'Перевірити документи', 'Купити', 'Оформити документи', 'Провести ремонт', 'Знайти орендаторів', 'Підписати договір оренди', 'Отримати перший дохід', 'Відстежувати прибуток', 'Оптимізувати витрати', 'Купити другий об\'єкт', 'Створити портфель', 'Рефінансувати', 'Продати з прибутком', 'Реінвестувати', 'Купити комерційну нерухомість', 'Розвинути бізнес', 'Створити REIT', 'Досягти мільйона', 'Стати експертом'][i],
        completed: false
      }))
    },
    {
      id: 'finance-6',
      title: 'Інвестувати в криптовалюту',
      description: 'Сучасні цифрові інвестиції',
      icon: '💹',
      xp: 1500,
      category: 'finance',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f6-s${i+1}`,
        text: ['Вивчити базу', 'Купити монети', 'Відстежувати динаміку', 'Вивчити блокчейн', 'Відкрити гаманець', 'Купити Bitcoin', 'Купити Ethereum', 'Вивчити DeFi', 'Створити портфель', 'Налаштувати стейкінг', 'Торгувати на біржі', 'Вивчити NFT', 'Купити NFT', 'Створити NFT', 'Вивчити метавсесвіт', 'Купити землю в метавсесвіті', 'Створити DAO', 'Запустити токен', 'Стати крипто-експертом', 'Відсвяткувати прибуток'][i],
        completed: false
      }))
    },
    {
      id: 'finance-7',
      title: 'Відкрити магазин / франшизу',
      description: 'Власний бізнес у торгівлі',
      icon: '🏪',
      xp: 1000,
      category: 'finance',
      progress: 8,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f7-s${i+1}`,
        text: ['Бізнес-план', 'Підбір локації', 'Запуск', 'Реєстрація бізнесу', 'Оренда приміщення', 'Ремонт', 'Закупівля товарів', 'Найм персоналу', 'Реклама', 'Відкриття', 'Перші клієнти', 'Оптимізація', 'Розширення асортименту', 'Відкриття філії', 'Франшиза', 'Масштабування', 'Вихід на онлайн', 'Міжнародна експансія', 'Продаж бізнесу', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },
    {
      id: 'finance-8',
      title: 'Створити пасивний дохід',
      description: 'Гроші працюють на вас',
      icon: '🪙',
      xp: 1000,
      category: 'finance',
      progress: 12,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f8-s${i+1}`,
        text: ['Обрати метод', 'Запустити', 'Відстежувати прибуток', 'Створити блог', 'Монетизувати контент', 'Створити онлайн-курс', 'Продавати цифрові продукти', 'Інвестувати в дивідендні акції', 'Купити облігації', 'Створити додаток', 'Орендувати нерухомість', 'Створити YouTube канал', 'Писати книги', 'Створити франшизу', 'Інвестувати в P2P', 'Створити інвестиційний клуб', 'Досягти $1000/місяць', 'Досягти $5000/місяць', 'Досягти фінансової свободи', 'Навчати інших'][i],
        completed: false
      }))
    },
    {
      id: 'finance-9',
      title: 'Вести бюджет 3 місяці',
      description: 'Контроль фінансів та витрат',
      icon: '🛍️',
      xp: 800,
      category: 'finance',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f9-s${i+1}`,
        text: ['Створити таблицю', 'Щоденний облік', 'Аналіз витрат', 'Встановити ліміти', 'Відстежувати доходи', 'Категорізувати витрати', 'Аналізувати тренди', 'Оптимізувати витрати', 'Створити резерв', 'Планувати великі покупки', 'Відстежувати кредити', 'Планувати інвестиції', 'Аналізувати ефективність', 'Корегувати бюджет', 'Досягти цілей', 'Створити довгостроковий план', 'Навчити сім\'ю', 'Автоматизувати процеси', 'Досягти фінансової дисципліни', 'Відсвяткувати контроль'][i],
        completed: false
      }))
    },
    {
      id: 'finance-10',
      title: 'Погасити кредит',
      description: 'Шлях до фінансової свободи',
      icon: '💳',
      xp: 1000,
      category: 'finance',
      progress: 0,
      color: '#ef4444',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `f10-s${i+1}`,
        text: ['Проаналізувати борги', 'Створити план погашення', 'Оптимізувати витрати', 'Знайти додатковий дохід', 'Рефінансувати кредит', 'Сплатити перший внесок', 'Сплатити 25%', 'Сплатити 50%', 'Сплатити 75%', 'Сплатити 90%', 'Сплатити останній платіж', 'Отримати документи', 'Перевірити кредитну історію', 'Відсвяткувати свободу', 'Створити резерв', 'Почати інвестувати', 'Допомогти іншим', 'Написати історію успіху', 'Стати фінансовим консультантом', 'Навчати фінансової грамотності'][i],
        completed: false
      }))
    },

    // 3️⃣ Здоров'я та спорт (21-30)
    {
      id: 'health-1',
      title: 'Пробігти марафон',
      description: '42.2 км витримки та сили волі',
      icon: '🏃',
      xp: 1500,
      category: 'health',
      progress: 0,
      color: '#ef4444',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h1-s${i+1}`,
        text: ['Купити бігові кросівки', 'Пройти медогляд', 'Пробігти перший кілометр', 'Скласти план тренувань', 'Пробігти 5 км', 'Пробігти 10 км', 'Пробігти півмарафон', 'Підвищити витривалість', 'Пробігти 30 км', 'Записатися на марафон', 'Отримати стартовий номер', 'Пробігти 35 км', 'Зробити останнє тренування', 'Виспатися перед забігом', 'З\'їсти правильний сніданок', 'Прийти на старт', 'Пробігти першу половину', 'Подолати стіну (32 км)', 'Фінішувати марафон', 'Отримати медаль 🏅'][i],
        completed: false
      }))
    },
    {
      id: 'health-2',
      title: 'Тренування 3 рази на тиждень',
      description: 'Регулярні фізичні навантаження',
      icon: '🏋️',
      xp: 800,
      category: 'health',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h2-s${i+1}`,
        text: ['Скласти план', 'Тренування 1 тиждень', 'Тренування 1 місяць', 'Купити абонемент', 'Знайти тренера', 'Скласти програму', 'Перше тренування', 'Тиждень тренувань', 'Місяць тренувань', 'Підвищити навантаження', 'Змінити програму', 'Додати кардіо', 'Додати силові', 'Додати розтяжку', 'Оптимізувати харчування', 'Відстежувати прогрес', 'Досягти цілей', 'Підтримувати форму', 'Навчити інших', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'health-3',
      title: 'Практикувати медитацію',
      description: 'Внутрішній спокій та баланс',
      icon: '🧘',
      xp: 700,
      category: 'health',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h3-s${i+1}`,
        text: ['5 хв/день', '10 хв/день', '20 хв/день', 'Вивчити техніки', 'Створити простір', 'Купити подушку', 'Завантажити додаток', 'Медитація тиждень', 'Медитація місяць', 'Вивчити мантри', 'Спробувати різні стилі', 'Медитація на природі', 'Групові сесії', 'Ретрит', 'Навчити інших', 'Створити практику', 'Досягти просвітлення', 'Ведення щоденника', 'Інтеграція в життя', 'Відсвяткувати спокій'][i],
        completed: false
      }))
    },
    {
      id: 'health-4',
      title: 'Здорове харчування',
      description: 'Правильне харчування для здорового життя',
      icon: '🌱',
      xp: 1200,
      category: 'health',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h4-s${i+1}`,
        text: ['План харчування', 'Приготувати 5 здорових страв', 'Дотримуватися 1 тиждень', 'Вивчити нутрієнти', 'Створити меню', 'Купити здорові продукти', 'Приготувати сніданок', 'Приготувати обід', 'Приготувати вечерю', 'Додати перекуси', 'Виключити шкідливе', 'Додати суперфуди', 'Планувати харчування', 'Готувати на тиждень', 'Експериментувати з рецептами', 'Відстежувати ефект', 'Оптимізувати раціон', 'Навчити сім\'ю', 'Створити кулінарну книгу', 'Відсвяткувати здоров\'я'][i],
        completed: false
      }))
    },
    {
      id: 'health-5',
      title: 'Стати чемпіоном у спорті',
      description: 'Досягнення найвищих результатів',
      icon: '🏹',
      xp: 1000,
      category: 'health',
      progress: 5,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h5-s${i+1}`,
        text: ['Обрати дисципліну', 'Тренування 1 місяць', 'Участь у змаганні', 'Знайти тренера', 'Скласти програму', 'Тренування 3 місяці', 'Перші змагання', 'Аналіз результатів', 'Корекція програми', 'Тренування 6 місяців', 'Регіональні змагання', 'Тренування 1 рік', 'Національні змагання', 'Тренування 2 роки', 'Міжнародні змагання', 'Тренування 3 роки', 'Чемпіонат світу', 'Отримати титул', 'Захистити титул', 'Стати легендою'][i],
        completed: false
      }))
    },
    {
      id: 'health-6',
      title: 'Освоїти новий вид спорту',
      description: 'Розширення спортивних горизонтів',
      icon: '🤸',
      xp: 1200,
      category: 'health',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h6-s${i+1}`,
        text: ['Вибрати спорт', 'Пройти уроки', 'Продемонструвати навички', 'Купити спорядження', 'Знайти клуб', 'Перші тренування', 'Вивчити правила', 'Практикувати основи', 'Підвищити рівень', 'Участь у змаганнях', 'Отримати розряд', 'Стати інструктором', 'Навчити інших', 'Створити команду', 'Організувати турнір', 'Стати суддею', 'Відкрити школу', 'Написати книгу', 'Стати експертом', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'health-7',
      title: 'Освоїти серфінг / кайтсерфінг',
      description: 'Екстремальні водні види спорту',
      icon: '🏄',
      xp: 1800,
      category: 'health',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h7-s${i+1}`,
        text: ['Навчитися основам', 'Перші вправи', 'Поїхати на море', 'Купити доску', 'Вивчити течії', 'Практикувати на хвилях', 'Освоїти стійку', 'Підвищити рівень', 'Спробувати різні дошки', 'Навчитися трюкам', 'Поїхати в серф-тур', 'Освоїти великі хвилі', 'Навчити інших', 'Стати інструктором', 'Відкрити школу', 'Організувати змагання', 'Стати професіоналом', 'Створити бренд', 'Написати автобіографію', 'Стати легендою серфінгу'][i],
        completed: false
      }))
    },
    {
      id: 'health-8',
      title: 'Досягти нового рівня в бойових мистецтвах',
      description: 'Фізична та духовна дисципліна',
      icon: '🥋',
      xp: 1500,
      category: 'health',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h8-s${i+1}`,
        text: ['Тренування', 'Скласти іспит', 'Отримати пояс', 'Вибрати стиль', 'Знайти школу', 'Перші тренування', 'Вивчити основи', 'Практикувати ката', 'Спарінги', 'Підвищити рівень', 'Отримати жовтий пояс', 'Отримати оранжевий пояс', 'Отримати зелений пояс', 'Отримати синій пояс', 'Отримати коричневий пояс', 'Отримати чорний пояс', 'Стати інструктором', 'Відкрити школу', 'Навчити учнів', 'Стати майстром'][i],
        completed: false
      }))
    },
    {
      id: 'health-9',
      title: 'Екстремальні види спорту',
      description: 'Адреналін та екстрим',
      icon: '🏔️',
      xp: 1000,
      category: 'health',
      progress: 8,
      color: '#ef4444',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h9-s${i+1}`,
        text: ['Підготувати спорядження', 'Пройти навчання', 'Виконати трюк', 'Вибрати вид спорту', 'Знайти інструктора', 'Купити спорядження', 'Перші тренування', 'Вивчити техніку безпеки', 'Практикувати основи', 'Підвищити рівень', 'Спробувати складніші трюки', 'Участь у змаганнях', 'Стати інструктором', 'Навчити інших', 'Організувати змагання', 'Створити команду', 'Стати професіоналом', 'Відкрити школу', 'Написати книгу', 'Стати експертом'][i],
        completed: false
      }))
    },
    {
      id: 'health-10',
      title: 'Виступити на TEDx / публічний виступ',
      description: 'Подолання страху та натхнення інших',
      icon: '🗣️',
      xp: 1000,
      category: 'health',
      progress: 0,
      color: '#3b82f6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h10-s${i+1}`,
        text: ['Підготувати ідею', 'Зробити презентацію', 'Виступити на сцені', 'Вибрати тему', 'Створити план', 'Написати текст', 'Практикувати виступ', 'Записати відео', 'Отримати відгуки', 'Покращити виступ', 'Подати заявку на TEDx', 'Пройти відбір', 'Підготуватися до виступу', 'Виступити на TEDx', 'Отримати відгуки', 'Розвинути тему', 'Написати книгу', 'Створити курс', 'Стати спікером', 'Натхнення мільйонів'][i],
        completed: false
      }))
    },

    // 4️⃣ Подорожі та пригоди (31-40)
    {
      id: 'travel-1',
      title: 'Подорож за кордон',
      description: 'Відкриття нових країн та культур',
      icon: '✈️',
      xp: 1200,
      category: 'travel',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t1-s${i+1}`,
        text: ['Вибрати країну', 'Забронювати квитки', 'Скласти маршрут', 'Отримати візу', 'Забронювати готель', 'Скласти список', 'Купити валюту', 'Підготувати документи', 'Спакувати валізу', 'Вилетіти', 'Прибути в країну', 'Заселитися в готель', 'Подивитися пам\'ятки', 'Спробувати місцеву кухню', 'Купити сувеніри', 'Зробити фото', 'Познайомитися з місцевими', 'Відвідати музеї', 'Повернутися додому', 'Поділитися враженнями'][i],
        completed: false
      }))
    },
    {
      id: 'travel-2',
      title: 'Організувати подорож з друзями',
      description: 'Спільні пригоди та спогади',
      icon: '🏖️',
      xp: 1500,
      category: 'travel',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t2-s${i+1}`,
        text: ['Вибрати місце', 'Бронювання', 'Відправитися', 'Зібрати команду', 'Обговорити бюджет', 'Вибрати дати', 'Забронювати житло', 'Скласти програму', 'Купити квитки', 'Підготувати спорядження', 'Зустрітися в аеропорту', 'Прибути на місце', 'Заселитися', 'Почати дослідження', 'Спробувати активності', 'Зробити групові фото', 'Відсвяткувати', 'Купити сувеніри', 'Повернутися', 'Планувати наступну'][i],
        completed: false
      }))
    },
    {
      id: 'travel-3',
      title: 'Кемпінг / ніч у наметі',
      description: 'Близькість до природи',
      icon: '⛺',
      xp: 800,
      category: 'travel',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t3-s${i+1}`,
        text: ['Вибрати місце', 'Підготувати спорядження', 'Ночівля', 'Купити намет', 'Купити спальник', 'Підготувати їжу', 'Знайти локацію', 'Прибути на місце', 'Розбити табір', 'Розпалити багаття', 'Приготувати вечерю', 'Посидіти біля вогню', 'Піти спати', 'Прокинутися рано', 'Приготувати сніданок', 'Зібрати табір', 'Піти в похід', 'Повернутися', 'Помити спорядження', 'Планувати наступний'][i],
        completed: false
      }))
    },
    {
      id: 'travel-4',
      title: 'Кемпінг у дикій природі',
      description: 'Екстремальний досвід виживання',
      icon: '🏕️',
      xp: 1200,
      category: 'travel',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t4-s${i+1}`,
        text: ['Підготувати спорядження', 'Приготувати їжу', 'Переночувати', 'Вивчити місцевість', 'Купити спеціальне спорядження', 'Підготувати аптечку', 'Вивчити правила безпеки', 'Прибути в дику природу', 'Знайти безпечне місце', 'Розбити табір', 'Розпалити вогонь', 'Приготувати їжу', 'Захиститися від тварин', 'Переночувати', 'Прокинутися', 'Продовжити дослідження', 'Знайти воду', 'Приготувати їжу', 'Повернутися цивілізацію', 'Поділитися досвідом'][i],
        completed: false
      }))
    },
    {
      id: 'travel-5',
      title: 'Рафтинг / каякінг',
      description: 'Водні пригоди та адреналін',
      icon: '🚣',
      xp: 1500,
      category: 'travel',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t5-s${i+1}`,
        text: ['Підготувати спорядження', 'Навчитися керувати', 'Сплавитися', 'Вибрати маршрут', 'Купити спорядження', 'Знайти інструктора', 'Вивчити техніку', 'Практикувати на спокійній воді', 'Спробувати легкий маршрут', 'Підвищити рівень', 'Спробувати складний маршрут', 'Освоїти трюки', 'Участь у змаганнях', 'Навчити інших', 'Організувати групу', 'Створити клуб', 'Стати інструктором', 'Відкрити школу', 'Написати книгу', 'Стати експертом'][i],
        completed: false
      }))
    },
    {
      id: 'travel-6',
      title: 'Експедиція в гори',
      description: 'Підкорення вершин та виклики',
      icon: '🗻',
      xp: 1000,
      category: 'travel',
      progress: 5,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t6-s${i+1}`,
        text: ['Підготовка', 'Тренування', 'Підйом на вершину', 'Вибрати маршрут', 'Купити спорядження', 'Підготувати команду', 'Вивчити маршрут', 'Тренування витривалості', 'Акліматизація', 'Почати підйом', 'Досягти базового табору', 'Піднятися вище', 'Досягти висотного табору', 'Штурм вершини', 'Досягти вершини', 'Сфотографуватися', 'Спуститися', 'Повернутися в базовий табір', 'Повернутися додому', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'travel-7',
      title: 'Спостерігати зорепад / астрономія',
      description: 'Космічні таємниці та краса всесвіту',
      icon: '🌌',
      xp: 800,
      category: 'travel',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t7-s${i+1}`,
        text: ['Вибрати локацію', 'Підготувати телескоп', 'Спостерігати', 'Вивчити астрономію', 'Купити телескоп', 'Знайти темне місце', 'Вивчити зірки', 'Спостерігати планети', 'Спостерігати зорепад', 'Сфотографувати небо', 'Вивчити сузір\'я', 'Спостерігати метеори', 'Вивчити місячні фази', 'Спостерігати затемнення', 'Приєднатися до клубу', 'Відвідати обсерваторію', 'Навчити інших', 'Створити блог', 'Написати книгу', 'Стати астрономом'][i],
        completed: false
      }))
    },
    {
      id: 'travel-8',
      title: 'Полювання на трофейні моменти / квести виживання',
      description: 'Екстремальні виклики та виживання',
      icon: '🏹',
      xp: 1800,
      category: 'travel',
      progress: 8,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t8-s${i+1}`,
        text: ['Підготовка', 'Тренування', 'Виконати квест у дикій місцевості', 'Вивчити навички виживання', 'Купити спорядження', 'Знайти інструктора', 'Вивчити техніки', 'Практикувати в безпечних умовах', 'Спробувати легкий квест', 'Підвищити рівень', 'Спробувати складний квест', 'Освоїти нові навички', 'Участь у змаганнях', 'Навчити інших', 'Організувати квест', 'Створити команду', 'Стати інструктором', 'Відкрити школу', 'Написати книгу', 'Стати експертом'][i],
        completed: false
      }))
    },
    {
      id: 'travel-9',
      title: 'Подорож на поїзді через країну',
      description: 'Романтика залізничних подорожей',
      icon: '🚂',
      xp: 1000,
      category: 'travel',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t9-s${i+1}`,
        text: ['Вибрати маршрут', 'Забронювати квитки', 'Здійснити подорож', 'Планувати зупинки', 'Купити квитки', 'Підготувати валізу', 'Прийти на вокзал', 'Сісти в поїзд', 'Знайти своє місце', 'Ознайомитися з сусідами', 'Насолодитися пейзажами', 'Зупинитися в містах', 'Спробувати місцеву кухню', 'Зробити фото', 'Вести щоденник', 'Познайомитися з людьми', 'Купити сувеніри', 'Досягти кінцевої станції', 'Повернутися додому', 'Поділитися враженнями'][i],
        completed: false
      }))
    },
    {
      id: 'travel-10',
      title: 'Кругосвітня подорож / навколосвітнє плавання',
      description: 'Найбільша пригода життя',
      icon: '🧭',
      xp: 1000,
      category: 'travel',
      progress: 2,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `t10-s${i+1}`,
        text: ['Планування маршруту', 'Фінанси', 'Відправлення', 'Створити детальний план', 'Накопичити гроші', 'Отримати документи', 'Купити квитки', 'Підготувати спорядження', 'Попрощатися з близькими', 'Вилетіти', 'Відвідати першу країну', 'Відвідати другу країну', 'Відвідати третю країну', 'Продовжити подорож', 'Відвідати всі континенти', 'Зробити тисячі фото', 'Вести блог', 'Повернутися додому', 'Написати книгу', 'Стати легендою'][i],
        completed: false
      }))
    },

    // 5️⃣ Відносини та соціальні зв'язки (41-50)
    {
      id: 'relationships-1',
      title: 'Серйозні стосунки',
      description: 'Знайти кохання та побудувати відносини',
      icon: '💖',
      xp: 1000,
      category: 'relationships',
      progress: 0,
      color: '#ec4899',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r1-s${i+1}`,
        text: ['Познайомитися з цікавою людиною', 'Піти на перше побачення', 'Провести романтичний вечір', 'Познайомити з друзями', 'Познайомити з родиною', 'Поїхати разом у подорож', 'Пережити першу сварку', 'Помиритися', 'Поговорити про майбутнє', 'Зробити пропозицію', 'Отримати згоду', 'Планувати весілля', 'Одружитися', 'Поїхати в медовий місяць', 'Купити спільне житло', 'Завести домашнього улюбленця', 'Планувати дітей', 'Народити першу дитину', 'Відсвяткувати річницю', 'Жити щасливо разом'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-2',
      title: 'Побудувати коло друзів',
      description: 'Якісні соціальні зв\'язки',
      icon: '👫',
      xp: 1200,
      category: 'relationships',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r2-s${i+1}`,
        text: ['Познайомитися з 3 новими людьми', 'Організувати зустріч', 'Підтримувати дружбу', 'Знайти спільні інтереси', 'Проводити час разом', 'Допомагати один одному', 'Святкувати разом', 'Подорожувати разом', 'Створити традиції', 'Підтримувати в складні часи', 'Розвиватися разом', 'Створити спільноту', 'Організувати вечірки', 'Планувати майбутнє', 'Допомагати в кар\'єрі', 'Створити бізнес разом', 'Навчати один одного', 'Стати сім\'єю', 'Відсвяткувати дружбу', 'Зберегти на все життя'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-3',
      title: 'Родинні відносини',
      description: 'Зміцнення сімейних зв\'язків',
      icon: '👨‍👩‍👧',
      xp: 1000,
      category: 'relationships',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r3-s${i+1}`,
        text: ['Провести час з сім\'єю', 'Допомогти', 'Організувати зустріч', 'Підтримати в складний час', 'Святкувати разом', 'Подорожувати разом', 'Створити традиції', 'Проводити свята', 'Допомагати в побуті', 'Підтримувати в кар\'єрі', 'Ділитися досвідом', 'Навчати молодших', 'Поважати старших', 'Створити сімейний альбом', 'Вести сімейну історію', 'Організувати сімейний бізнес', 'Створити сімейний фонд', 'Планувати майбутнє', 'Зберегти сімейні цінності', 'Передати наступним поколінням'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-4',
      title: 'Організувати клуб / спільноту',
      description: 'Створення соціальної групи',
      icon: '👫',
      xp: 1200,
      category: 'relationships',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r4-s${i+1}`,
        text: ['Вибрати тему', 'Знайти учасників', 'Провести першу зустріч', 'Створити правила', 'Обрати керівництво', 'Організувати діяльність', 'Проводити регулярні зустрічі', 'Розвивати спільноту', 'Організувати події', 'Залучити нових учасників', 'Створити онлайн-спільноту', 'Організувати змагання', 'Провести конференцію', 'Створити навчальні програми', 'Організувати благодійність', 'Створити партнерства', 'Розширити діяльність', 'Стати відомою спільнотою', 'Написати історію', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-5',
      title: 'Написати щоденний лист / повідомлення близьким',
      description: 'Підтримка зв\'язків на відстані',
      icon: '💌',
      xp: 500,
      category: 'relationships',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r5-s${i+1}`,
        text: ['Створити список', 'Написати 3 листи', 'Підтримувати контакт', 'Встановити регулярність', 'Вибрати формат', 'Написати перший лист', 'Надіслати лист', 'Отримати відповідь', 'Написати другий лист', 'Підтримувати діалог', 'Ділитися новинами', 'Підтримувати в складні часи', 'Святкувати разом', 'Планувати зустрічі', 'Створити традиції', 'Організувати сюрпризи', 'Вести листування роками', 'Створити архів', 'Написати книгу листів', 'Зберегти дружбу навіки'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-6',
      title: 'Влаштувати сімейний вікенд / поїздку',
      description: 'Якісний час з близькими',
      icon: '🏠',
      xp: 900,
      category: 'relationships',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r6-s${i+1}`,
        text: ['Планування', 'Організація', 'Провести захід', 'Вибрати дати', 'Обрати місце', 'Забронювати житло', 'Скласти програму', 'Підготувати розваги', 'Купити квитки', 'Підготувати спорядження', 'Зібрати сім\'ю', 'Прибути на місце', 'Заселитися', 'Почати програму', 'Насолодитися разом', 'Зробити фото', 'Створити спогади', 'Повернутися додому', 'Обговорити враження', 'Планувати наступну'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-7',
      title: 'Організувати благодійну подію',
      description: 'Допомога іншим та соціальна відповідальність',
      icon: '🎉',
      xp: 1500,
      category: 'relationships',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r7-s${i+1}`,
        text: ['Вибрати тему', 'Залучити людей', 'Провести подію', 'Знайти спонсорів', 'Створити команду', 'Планувати подію', 'Організувати місце', 'Підготувати програму', 'Залучити учасників', 'Провести рекламу', 'Підготувати матеріали', 'Провести подію', 'Зібрати кошти', 'Передати допомогу', 'Подякувати учасникам', 'Проаналізувати результати', 'Планувати наступну', 'Розширити діяльність', 'Створити фонд', 'Стати лідером'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-8',
      title: 'Допомогти другу / наставництво',
      description: 'Підтримка та розвиток інших',
      icon: '🫂',
      xp: 800,
      category: 'relationships',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r8-s${i+1}`,
        text: ['Виявити потребу', 'Допомогти поетапно', 'Отримати відгук', 'Проаналізувати ситуацію', 'Створити план допомоги', 'Почати підтримку', 'Надати ресурси', 'Навчити навичкам', 'Підтримати морально', 'Допомогти в кар\'єрі', 'Допомогти в особистому житті', 'Створити можливості', 'Відстежувати прогрес', 'Корегувати підхід', 'Святкувати успіхи', 'Підтримувати довгостроково', 'Стати наставником', 'Навчити інших', 'Створити програму', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-9',
      title: 'Благодійність',
      description: 'Допомога тим, хто потребує',
      icon: '🎗️',
      xp: 1200,
      category: 'relationships',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r9-s${i+1}`,
        text: ['Вибрати проект', 'Зібрати кошти', 'Віддати допомогу', 'Знайти організацію', 'Вивчити проблему', 'Створити план', 'Залучити людей', 'Організувати збір', 'Зібрати кошти', 'Купити необхідне', 'Доставити допомогу', 'Перевірити результати', 'Подякувати донорам', 'Проаналізувати вплив', 'Планувати наступну', 'Розширити діяльність', 'Створити фонд', 'Стати волонтером', 'Навчити інших', 'Змінити світ'][i],
        completed: false
      }))
    },
    {
      id: 'relationships-10',
      title: 'Стартап-проект',
      description: 'Спільне створення бізнесу',
      icon: '🚀',
      xp: 1000,
      category: 'relationships',
      progress: 8,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `r10-s${i+1}`,
        text: ['Вибрати ідею', 'Зробити MVP', 'Знайти інвесторів', 'Створити команду', 'Розробити продукт', 'Протестувати ринок', 'Запустити бета-версію', 'Зібрати відгуки', 'Покращити продукт', 'Запустити повну версію', 'Залучити клієнтів', 'Масштабувати', 'Знайти інвесторів', 'Розширити команду', 'Виййти на нові ринки', 'Оптимізувати процеси', 'Досягти прибутковості', 'Планувати екзит', 'Продати бізнес', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },

    // 6️⃣ Хобі та саморозвиток (51-64)
    {
      id: 'hobby-1',
      title: 'Створити арт-проект',
      description: 'Творчість та самовираження',
      icon: '🎨',
      xp: 900,
      category: 'hobby',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h1-s${i+1}`,
        text: ['Вибрати тему', 'Зробити прототип', 'Опублікувати', 'Вивчити техніки', 'Купити матеріали', 'Створити ескіз', 'Почати роботу', 'Додати деталі', 'Завершити проект', 'Сфотографувати', 'Опублікувати в соцмережах', 'Отримати відгуки', 'Покращити', 'Створити серію', 'Організувати виставку', 'Продати роботи', 'Навчити інших', 'Створити бренд', 'Написати книгу', 'Стати відомим художником'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-2',
      title: 'Навчитися грати на музичному інструменті',
      description: 'Музичний розвиток та творчість',
      icon: '🎸',
      xp: 1200,
      category: 'hobby',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h2-s${i+1}`,
        text: ['Вибрати інструмент', 'Пройти уроки', 'Зіграти твір', 'Купити інструмент', 'Знайти вчителя', 'Вивчити основи', 'Практикувати щодня', 'Вивчити перший твір', 'Виступити перед друзями', 'Вивчити складніший твір', 'Приєднатися до групи', 'Виступити на сцені', 'Записати демо', 'Створити власний твір', 'Опублікувати музику', 'Організувати концерт', 'Навчити інших', 'Створити альбом', 'Стати професіоналом', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-3',
      title: 'Навчитися новій навичці',
      description: 'Постійний розвиток та навчання',
      icon: '🎯',
      xp: 1000,
      category: 'hobby',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h3-s${i+1}`,
        text: ['Вибрати курс', 'Пройти 50%', 'Застосувати', 'Знайти ресурси', 'Створити план', 'Почати навчання', 'Практикувати', 'Пройти 25%', 'Пройти 50%', 'Пройти 75%', 'Завершити курс', 'Застосувати знання', 'Покращити навички', 'Навчити інших', 'Створити проект', 'Отримати сертифікат', 'Використовувати в роботі', 'Розвинути далі', 'Стати експертом', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-4',
      title: 'Вивчити мову',
      description: 'Розширення світогляду та можливостей',
      icon: '🗣️',
      xp: 1500,
      category: 'hobby',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h4-s${i+1}`,
        text: ['Вивчити 100 слів', 'Пройти курс', 'Спілкуватися з носіями', 'Вибрати мову', 'Знайти ресурси', 'Вивчити алфавіт', 'Вивчити основні слова', 'Вивчити граматику', 'Практикувати вимову', 'Читати прості тексти', 'Слухати пісні', 'Дивитися фільми', 'Спілкуватися онлайн', 'Поїхати в країну', 'Практикувати з носіями', 'Скласти іспит', 'Отримати сертифікат', 'Використовувати в роботі', 'Навчити інших', 'Стати білінгвом'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-5',
      title: 'Розробити настільну гру',
      description: 'Творчість та логіка в грі',
      icon: '🎮',
      xp: 1000,
      category: 'hobby',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h5-s${i+1}`,
        text: ['Вибрати концепт', 'Створити прототип', 'Протестувати', 'Придумати правила', 'Створити дизайн', 'Зробити картки', 'Зробити фішки', 'Створити поле', 'Написати інструкцію', 'Протестувати з друзями', 'Покращити правила', 'Створити фінальну версію', 'Зробити красивий дизайн', 'Виготовити тираж', 'Подати на конкурс', 'Опублікувати', 'Продати в магазинах', 'Організувати турнір', 'Створити розширення', 'Стати відомим дизайнером'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-6',
      title: 'Розв\'язати складну головоломку / квест',
      description: 'Розвиток логіки та мислення',
      icon: '🧩',
      xp: 800,
      category: 'hobby',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h6-s${i+1}`,
        text: ['Вибрати головоломку', 'Пройти 50%', 'Завершити', 'Вивчити правила', 'Почати розв\'язувати', 'Пройти 25%', 'Пройти 50%', 'Пройти 75%', 'Завершити', 'Спробувати складнішу', 'Розв\'язати за час', 'Створити власну', 'Опублікувати', 'Організувати змагання', 'Навчити інших', 'Створити клуб', 'Стати експертом', 'Написати книгу', 'Відкрити школу', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-7',
      title: 'Взяти участь у театральній постановці',
      description: 'Акторська майстерність та виступ',
      icon: '🎭',
      xp: 1200,
      category: 'hobby',
      progress: 0,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h7-s${i+1}`,
        text: ['Підготувати роль', 'Репетиція', 'Виступ', 'Знайти театр', 'Подати заявку', 'Пройти кастинг', 'Отримати роль', 'Вивчити текст', 'Відвідати репетиції', 'Практикувати з партнерами', 'Підготувати костюм', 'Репетиція на сцені', 'Генеральна репетиція', 'Прем\'єра', 'Виступити перед глядачами', 'Отримати відгуки', 'Покращити гру', 'Взяти участь у наступній', 'Стати постійним актором', 'Відсвяткувати успіх'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-8',
      title: 'Провести фотопроект / фотоквест',
      description: 'Творчість через об\'єктив',
      icon: '📷',
      xp: 900,
      category: 'hobby',
      progress: 0,
      color: '#06b6d4',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h8-s${i+1}`,
        text: ['Вибрати тему', 'Зробити серію фото', 'Опублікувати', 'Купити камеру', 'Вивчити техніку', 'Практикувати', 'Вибрати стиль', 'Створити концепцію', 'Зробити перші фото', 'Відібрати найкращі', 'Обробити фото', 'Створити серію', 'Опублікувати в соцмережах', 'Отримати відгуки', 'Покращити техніку', 'Організувати виставку', 'Продати фото', 'Навчити інших', 'Створити бренд', 'Стати відомим фотографом'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-9',
      title: 'Створити свій музичний трек / альбом',
      description: 'Музичне творчість та самовираження',
      icon: '🎵',
      xp: 1500,
      category: 'hobby',
      progress: 18,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h9-s${i+1}`,
        text: ['Обрати стиль', 'Записати демо', 'Випустити трек', 'Написати текст', 'Створити мелодію', 'Записати вокал', 'Додати інструменти', 'Зробити аранжування', 'Записати в студії', 'Зробити міксування', 'Мастеринг', 'Створити обкладинку', 'Опублікувати', 'Запустити рекламу', 'Отримати відгуки', 'Виступити наживо', 'Створити кліп', 'Опублікувати альбом', 'Організувати тур', 'Стати відомим музикантом'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-10',
      title: 'Зробити серію ілюстрацій / комікс',
      description: 'Візуальне оповідання та мистецтво',
      icon: '🖌️',
      xp: 1200,
      category: 'hobby',
      progress: 22,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h10-s${i+1}`,
        text: ['Обрати сюжет', 'Намалювати серію', 'Опублікувати', 'Створити персонажів', 'Написати сценарій', 'Зробити ескізи', 'Намалювати першу ілюстрацію', 'Намалювати другу', 'Намалювати третю', 'Створити серію', 'Додати текст', 'Оформити як комікс', 'Опублікувати онлайн', 'Отримати відгуки', 'Покращити стиль', 'Створити більшу серію', 'Опублікувати в журналі', 'Створити книгу', 'Організувати виставку', 'Стати відомим ілюстратором'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-11',
      title: 'Взяти участь у космічному туризмі',
      description: 'Найекстремальніша пригода',
      icon: '🚀',
      xp: 1000,
      category: 'hobby',
      progress: 1,
      color: '#8b5cf6',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h11-s${i+1}`,
        text: ['Підготовка', 'Тренування', 'Політ', 'Накопичити гроші', 'Подати заявку', 'Пройти медогляд', 'Підписати договір', 'Почати підготовку', 'Тренування витривалості', 'Тренування в невагомості', 'Психологічна підготовка', 'Отримати дозвіл', 'Підготуватися до польоту', 'Прибути на космодром', 'Одягнути скафандр', 'Сісти в корабель', 'Запуск', 'Політ в космос', 'Повернутися на Землю', 'Стати космічним туристом'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-12',
      title: 'Лазертаг / стратегічні квести',
      description: 'Командні ігри та стратегія',
      icon: '🏹',
      xp: 800,
      category: 'hobby',
      progress: 0,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h12-s${i+1}`,
        text: ['Підготувати команду', 'Пройти навчання', 'Зіграти гру', 'Знайти арену', 'Зібрати команду', 'Вивчити правила', 'Практикувати тактику', 'Зіграти першу гру', 'Аналізувати помилки', 'Покращити тактику', 'Зіграти турнір', 'Виграти гру', 'Стати капітаном', 'Навчити нових гравців', 'Організувати турнір', 'Створити клуб', 'Стати інструктором', 'Відкрити арену', 'Написати книгу', 'Стати експертом'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-13',
      title: 'Взяти участь у квесті на виживання / escape room',
      description: 'Логіка, командна робота та виживання',
      icon: '🎯',
      xp: 900,
      category: 'hobby',
      progress: 0,
      color: '#10b981',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h13-s${i+1}`,
        text: ['Вибрати гру', 'Підготувати команду', 'Пройти квест', 'Знайти локацію', 'Зібрати друзів', 'Вивчити правила', 'Практикувати логіку', 'Пройти перший квест', 'Аналізувати помилки', 'Покращити навички', 'Пройти складніший', 'Виграти за час', 'Стати експертом', 'Навчити інших', 'Організувати квест', 'Створити власний', 'Відкрити локацію', 'Написати книгу', 'Стати легендою', 'Відсвяткувати досягнення'][i],
        completed: false
      }))
    },
    {
      id: 'hobby-14',
      title: 'Взяти участь у чемпіонаті світу',
      description: 'Найвищий рівень змагань',
      icon: '🏆',
      xp: 1000,
      category: 'hobby',
      progress: 2,
      color: '#f59e0b',
      steps: Array.from({length: 20}, (_, i) => ({
        id: `h14-s${i+1}`,
        text: ['Вибрати дисципліну', 'Тренування', 'Участь', 'Знайти тренера', 'Скласти програму', 'Тренування 1 рік', 'Тренування 2 роки', 'Тренування 3 роки', 'Участь у регіональних', 'Участь у національних', 'Кваліфікація на світові', 'Підготовка до чемпіонату', 'Прибути на змагання', 'Пройти кваліфікацію', 'Участь у фіналі', 'Боротьба за медаль', 'Отримати медаль', 'Стати чемпіоном', 'Захистити титул', 'Стати легендою'][i],
        completed: false
      }))
    },

    // 🧘 Legendary Quest: Досягти внутрішнього балансу
    {
      id: 'legendary-balance',
      title: 'Досягти внутрішнього балансу',
      description: 'Повний шлях до духовного спокою та гармонії',
      icon: '🧘',
      xp: 4000,
      category: 'legendary',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'lb-s1', text: 'Почати практику медитації', completed: false },
        { id: 'lb-s2', text: 'Скласти ранкову рутину', completed: false },
        { id: 'lb-s3', text: 'Відмовитися від токсичного контенту', completed: false },
        { id: 'lb-s4', text: 'Навчитися контролювати емоції', completed: false },
        { id: 'lb-s5', text: 'Вести щоденник почуттів', completed: false },
        { id: 'lb-s6', text: 'Пробачити минулі образи', completed: false },
        { id: 'lb-s7', text: 'Визначити, що справді важливо', completed: false },
        { id: 'lb-s8', text: 'Провести день мовчання', completed: false },
        { id: 'lb-s9', text: 'Пройти ретрит або digital detox', completed: false },
        { id: 'lb-s10', text: 'Знайти хобі, що заспокоює', completed: false },
        { id: 'lb-s11', text: 'Навчитися говорити "ні"', completed: false },
        { id: 'lb-s12', text: 'Встановити здорові межі', completed: false },
        { id: 'lb-s13', text: 'Створити гармонійний простір вдома', completed: false },
        { id: 'lb-s14', text: 'Навчитися техніці дихання', completed: false },
        { id: 'lb-s15', text: 'Регулярно робити перерви', completed: false },
        { id: 'lb-s16', text: 'Знайти духовного наставника або вчителя', completed: false },
        { id: 'lb-s17', text: 'Зайнятися благодійністю', completed: false },
        { id: 'lb-s18', text: 'Зробити день подяки', completed: false },
        { id: 'lb-s19', text: 'Відчути спокій без гаджетів', completed: false },
        { id: 'lb-s20', text: 'Поділитися досвідом з іншими', completed: false }
      ]
    },

    // 🧱 Legendary Quest: Побудувати власний дім
    {
      id: 'legendary-home',
      title: 'Побудувати власний дім',
      description: 'Від ідеї до новосілля - повний цикл будівництва',
      icon: '🏠',
      xp: 9000,
      category: 'legendary',
      progress: 0,
      color: '#f59e0b',
      steps: [
        { id: 'lh-s1', text: 'Визначити локацію', completed: false },
        { id: 'lh-s2', text: 'Розробити бюджет', completed: false },
        { id: 'lh-s3', text: 'Знайти архітектора', completed: false },
        { id: 'lh-s4', text: 'Створити ескіз будинку', completed: false },
        { id: 'lh-s5', text: 'Затвердити план із будівельниками', completed: false },
        { id: 'lh-s6', text: 'Оформити документи', completed: false },
        { id: 'lh-s7', text: 'Підготувати ділянку', completed: false },
        { id: 'lh-s8', text: 'Залити фундамент', completed: false },
        { id: 'lh-s9', text: 'Звести стіни', completed: false },
        { id: 'lh-s10', text: 'Встановити дах', completed: false },
        { id: 'lh-s11', text: 'Провести електрику та воду', completed: false },
        { id: 'lh-s12', text: 'Зробити чорне оздоблення', completed: false },
        { id: 'lh-s13', text: 'Вибрати інтер\'єрний стиль', completed: false },
        { id: 'lh-s14', text: 'Придбати меблі', completed: false },
        { id: 'lh-s15', text: 'Озеленити територію', completed: false },
        { id: 'lh-s16', text: 'Поставити огорожу', completed: false },
        { id: 'lh-s17', text: 'Підключити інтернет', completed: false },
        { id: 'lh-s18', text: 'Провести фінальний огляд', completed: false },
        { id: 'lh-s19', text: 'Відсвяткувати новосілля', completed: false },
        { id: 'lh-s20', text: 'Заселитися та облаштувати дім', completed: false }
      ]
    },

    // 🌱 Особистісний ріст
    {
      id: 'growth-morning-routine',
      title: 'Створити ранкову рутину',
      description: 'Систематичний підхід до ранкових звичок',
      icon: '🌅',
      xp: 1000,
      category: 'growth',
      progress: 0,
      color: '#f59e0b',
      steps: [
        { id: 'mr-s1', text: 'Визначити час, коли ти будеш прокидатися', completed: false },
        { id: 'mr-s2', text: 'Встановити будильник на один і той же час щодня', completed: false },
        { id: 'mr-s3', text: 'Скласти список бажаних ранкових дій', completed: false },
        { id: 'mr-s4', text: 'Визначити пріоритет – що найважливіше зранку', completed: false },
        { id: 'mr-s5', text: 'Почати з 1-2 дій замість великої рутини', completed: false },
        { id: 'mr-s6', text: 'Додати фізичну активність (розтяжка, зарядка)', completed: false },
        { id: 'mr-s7', text: 'Включити час на водні процедури (душ, вмивання)', completed: false },
        { id: 'mr-s8', text: 'Виділити 5 хвилин на медитацію або дихальні практики', completed: false },
        { id: 'mr-s9', text: 'Планувати сніданок заздалегідь', completed: false },
        { id: 'mr-s10', text: 'Обмежити перевірку телефону в першу годину після пробудження', completed: false },
        { id: 'mr-s11', text: 'Додати запис у щоденник або планування дня', completed: false },
        { id: 'mr-s12', text: 'Слухати мотивуючу музику або подкаст', completed: false },
        { id: 'mr-s13', text: 'Встановити маленьку винагороду за дотримання рутини', completed: false },
        { id: 'mr-s14', text: 'Зробити рутину приємною (ароматна кава, світло)', completed: false },
        { id: 'mr-s15', text: 'Постійно відслідковувати успіх (звички, нотатки)', completed: false },
        { id: 'mr-s16', text: 'Аналізувати, що працює, а що ні', completed: false },
        { id: 'mr-s17', text: 'Додати нові елементи після місяця практики', completed: false },
        { id: 'mr-s18', text: 'Пробувати ранкову рутину у вихідні дні', completed: false },
        { id: 'mr-s19', text: 'Ділитися досягненнями з другом або групою підтримки', completed: false },
        { id: 'mr-s20', text: 'Постійно адаптувати рутину під себе', completed: false }
      ]
    },

    {
      id: 'growth-read-books',
      title: 'Прочитати 12 книг за рік',
      description: 'Систематичне читання для розвитку',
      icon: '📚',
      xp: 1000,
      category: 'growth',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'rb-s1', text: 'Визначити теми або жанри для читання', completed: false },
        { id: 'rb-s2', text: 'Скласти список із 12 книг', completed: false },
        { id: 'rb-s3', text: 'Розбити книги на місячні плани (1 книга на місяць)', completed: false },
        { id: 'rb-s4', text: 'Встановити конкретний час для читання щодня (20–30 хв)', completed: false },
        { id: 'rb-s5', text: 'Визначити комфортне місце для читання', completed: false },
        { id: 'rb-s6', text: 'Використовувати закладки, щоб відмічати важливе', completed: false },
        { id: 'rb-s7', text: 'Робити нотатки або короткі висновки', completed: false },
        { id: 'rb-s8', text: 'Обговорювати книги з друзями або онлайн', completed: false },
        { id: 'rb-s9', text: 'Використовувати аудіокниги, коли немає часу', completed: false },
        { id: 'rb-s10', text: 'Стежити за прогресом у щоденнику або додатку', completed: false },
        { id: 'rb-s11', text: 'Не боятися кинути книгу, якщо не цікава', completed: false },
        { id: 'rb-s12', text: 'Ділити великі книги на частини', completed: false },
        { id: 'rb-s13', text: 'Ставити мету закінчити кожну книгу до кінця місяця', completed: false },
        { id: 'rb-s14', text: 'Використовувати бібліотеку або онлайн-ресурси', completed: false },
        { id: 'rb-s15', text: 'Читати різні жанри для розширення кругозору', completed: false },
        { id: 'rb-s16', text: 'Робити паузи між книгами для осмислення', completed: false },
        { id: 'rb-s17', text: 'Перевіряти прочитане: що можна застосувати у житті', completed: false },
        { id: 'rb-s18', text: 'Використовувати правила Pomodoro для концентрації', completed: false },
        { id: 'rb-s19', text: 'Ділитися враженнями в соціальних мережах або блогах', completed: false },
        { id: 'rb-s20', text: 'Винагороджувати себе після завершення книги', completed: false }
      ]
    },

    {
      id: 'growth-course',
      title: 'Пройти курс саморозвитку',
      description: 'Систематичне навчання нових навичок',
      icon: '🎓',
      xp: 1000,
      category: 'growth',
      progress: 0,
      color: '#3b82f6',
      steps: [
        { id: 'gc-s1', text: 'Визначити сферу розвитку (лідерство, емоції, навички)', completed: false },
        { id: 'gc-s2', text: 'Знайти доступні курси онлайн або офлайн', completed: false },
        { id: 'gc-s3', text: 'Переглянути відгуки та рейтинг курсу', completed: false },
        { id: 'gc-s4', text: 'Вибрати курс із чітким планом уроків', completed: false },
        { id: 'gc-s5', text: 'Встановити дату початку', completed: false },
        { id: 'gc-s6', text: 'Придбати або зареєструватися на курс', completed: false },
        { id: 'gc-s7', text: 'Виділити час для занять у тижневому графіку', completed: false },
        { id: 'gc-s8', text: 'Підготувати необхідні матеріали (ноутбук, зошит)', completed: false },
        { id: 'gc-s9', text: 'Дотримуватися плану занять без пропусків', completed: false },
        { id: 'gc-s10', text: 'Робити нотатки після кожного уроку', completed: false },
        { id: 'gc-s11', text: 'Виконувати всі практичні завдання', completed: false },
        { id: 'gc-s12', text: 'Відстежувати прогрес щотижня', completed: false },
        { id: 'gc-s13', text: 'Долучитися до групи учасників для підтримки', completed: false },
        { id: 'gc-s14', text: 'Ставити питання викладачу при непорозумінні', completed: false },
        { id: 'gc-s15', text: 'Аналізувати, що застосовується у житті', completed: false },
        { id: 'gc-s16', text: 'Повторювати важливі моменти курсу', completed: false },
        { id: 'gc-s17', text: 'Робити короткі резюме по кожному модулю', completed: false },
        { id: 'gc-s18', text: 'Відзначати завершення кожного етапу', completed: false },
        { id: 'gc-s19', text: 'Планувати, як застосувати отримані знання', completed: false },
        { id: 'gc-s20', text: 'Підготувати фінальний звіт або самоперевірку', completed: false }
      ]
    },

    {
      id: 'growth-say-no',
      title: 'Навчитися говорити «ні»',
      description: 'Встановлення здоровых меж та пріоритетів',
      icon: '✋',
      xp: 1000,
      category: 'growth',
      progress: 0,
      color: '#ef4444',
      steps: [
        { id: 'sn-s1', text: 'Усвідомити, чому важко відмовляти', completed: false },
        { id: 'sn-s2', text: 'Визначити власні пріоритети та цінності', completed: false },
        { id: 'sn-s3', text: 'Почати з маленьких ситуацій, де можна сказати «ні»', completed: false },
        { id: 'sn-s4', text: 'Підготувати фрази для ввічливої відмови', completed: false },
        { id: 'sn-s5', text: 'Тренуватися перед дзеркалом', completed: false },
        { id: 'sn-s6', text: 'Почати відмовляти друзям у простих проханнях', completed: false },
        { id: 'sn-s7', text: 'Прийняти, що «ні» — це нормально', completed: false },
        { id: 'sn-s8', text: 'Визначати, коли говорити «ні» — критично', completed: false },
        { id: 'sn-s9', text: 'Аналізувати почуття після відмови', completed: false },
        { id: 'sn-s10', text: 'Вчитися не виправдовуватися надто довго', completed: false },
        { id: 'sn-s11', text: 'Використовувати короткі та чіткі формулювання', completed: false },
        { id: 'sn-s12', text: 'Робити паузу, перш ніж погоджуватися', completed: false },
        { id: 'sn-s13', text: 'Встановити межі в роботі та особистому житті', completed: false },
        { id: 'sn-s14', text: 'Не боятися відмовляти колегам або знайомим', completed: false },
        { id: 'sn-s15', text: 'Практикувати «ні» у рольових іграх', completed: false },
        { id: 'sn-s16', text: 'Ставити мету – одна відмова на день', completed: false },
        { id: 'sn-s17', text: 'Звертати увагу на власне самопочуття', completed: false },
        { id: 'sn-s18', text: 'Аналізувати, коли погодження призводить до стресу', completed: false },
        { id: 'sn-s19', text: 'Робити нотатки про успішні «ні»', completed: false },
        { id: 'sn-s20', text: 'Постійно закріплювати навичку в житті', completed: false }
      ]
    },

    {
      id: 'growth-new-habit',
      title: 'Виробити нову корисну звичку',
      description: 'Систематичне формування позитивних звичок',
      icon: '🌱',
      xp: 1000,
      category: 'growth',
      progress: 0,
      color: '#10b981',
      steps: [
        { id: 'nh-s1', text: 'Вибрати конкретну звичку (ранок, спорт, харчування)', completed: false },
        { id: 'nh-s2', text: 'Чітко визначити мету', completed: false },
        { id: 'nh-s3', text: 'Розділити звичку на маленькі кроки', completed: false },
        { id: 'nh-s4', text: 'Встановити тригер (що нагадуватиме про звичку)', completed: false },
        { id: 'nh-s5', text: 'Почати з маленького часу або обсягу', completed: false },
        { id: 'nh-s6', text: 'Вести щоденник прогресу', completed: false },
        { id: 'nh-s7', text: 'Використовувати нагадування на телефоні', completed: false },
        { id: 'nh-s8', text: 'Винагороджувати себе за виконання', completed: false },
        { id: 'nh-s9', text: 'Поступово збільшувати складність або тривалість', completed: false },
        { id: 'nh-s10', text: 'Повторювати щодня без винятків', completed: false },
        { id: 'nh-s11', text: 'Не карати себе за пропуск – почати наступного дня', completed: false },
        { id: 'nh-s12', text: 'Відстежувати емоційний стан під час практики', completed: false },
        { id: 'nh-s13', text: 'Ділитися успіхом із друзями', completed: false },
        { id: 'nh-s14', text: 'Вчитися на помилках і адаптувати процес', completed: false },
        { id: 'nh-s15', text: 'Знаходити підтримку серед інших людей', completed: false },
        { id: 'nh-s16', text: 'Робити звичку частиною рутини', completed: false },
        { id: 'nh-s17', text: 'Повторювати щонайменше 21 день для закріплення', completed: false },
        { id: 'nh-s18', text: 'Аналізувати користь і ефект звички', completed: false },
        { id: 'nh-s19', text: 'Визначити тригери для утримання довгостроково', completed: false },
        { id: 'nh-s20', text: 'Закріпити звичку в щоденному житті', completed: false }
      ]
    },

    {
      id: 'growth-break-habit',
      title: 'Відмовитися від шкідливої звички',
      description: 'Подолання негативних звичок та залежностей',
      icon: '🚫',
      xp: 1000,
      category: 'growth',
      progress: 0,
      color: '#ef4444',
      steps: [
        { id: 'bh-s1', text: 'Визначити, яка звичка шкідлива', completed: false },
        { id: 'bh-s2', text: 'Усвідомити негативні наслідки для здоров\'я або життя', completed: false },
        { id: 'bh-s3', text: 'Визначити мотив, чому потрібно відмовитися', completed: false },
        { id: 'bh-s4', text: 'Встановити чітку дату початку', completed: false },
        { id: 'bh-s5', text: 'Замість заборони придумати альтернативу', completed: false },
        { id: 'bh-s6', text: 'Почати з маленького скорочення (ступінчато)', completed: false },
        { id: 'bh-s7', text: 'Вести щоденник спокус та емоцій', completed: false },
        { id: 'bh-s8', text: 'Створити систему нагород за успіх', completed: false },
        { id: 'bh-s9', text: 'Змінити оточення, щоб зменшити спокусу', completed: false },
        { id: 'bh-s10', text: 'Попередити близьких про своє рішення', completed: false },
        { id: 'bh-s11', text: 'Використовувати техніки самоконтролю', completed: false },
        { id: 'bh-s12', text: 'Практикувати заміну шкідливої звички корисною', completed: false },
        { id: 'bh-s13', text: 'Аналізувати тригери і уникати їх', completed: false },
        { id: 'bh-s14', text: 'Не карати себе за зриви', completed: false },
        { id: 'bh-s15', text: 'Робити самоперевірку щотижня', completed: false },
        { id: 'bh-s16', text: 'Вчитися справлятися зі стресом без шкідливої звички', completed: false },
        { id: 'bh-s17', text: 'Відзначати кожен день без звички', completed: false },
        { id: 'bh-s18', text: 'Шукати підтримку серед однодумців', completed: false },
        { id: 'bh-s19', text: 'Застосовувати візуальні нагадування (стікери, записки)', completed: false },
        { id: 'bh-s20', text: 'Постійно відслідковувати прогрес і радіти змінам', completed: false }
      ]
    },

    // 🏠 Організація житла та кулінарія
    {
      id: 'home-deep-clean',
      title: 'Зробити генеральне прибирання',
      description: 'Повне очищення та організація житла',
      icon: '🧹',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#06b6d4',
      steps: [
        { id: 'dc-s1', text: 'Визначити дату для генерального прибирання', completed: false },
        { id: 'dc-s2', text: 'Підготувати всі миючі засоби та інструменти', completed: false },
        { id: 'dc-s3', text: 'Розділити кімнати на зони', completed: false },
        { id: 'dc-s4', text: 'Почати з найзавантаженішої кімнати', completed: false },
        { id: 'dc-s5', text: 'Виділити речі, що не використовуються, для сортування', completed: false },
        { id: 'dc-s6', text: 'Протерти всі поверхні від пилу', completed: false },
        { id: 'dc-s7', text: 'Помити вікна та дзеркала', completed: false },
        { id: 'dc-s8', text: 'Почистити килими або покривала', completed: false },
        { id: 'dc-s9', text: 'Пропилососити або помити підлогу', completed: false },
        { id: 'dc-s10', text: 'Витерти дрібні деталі та електроніку', completed: false },
        { id: 'dc-s11', text: 'Протерти плінтуси та дверні ручки', completed: false },
        { id: 'dc-s12', text: 'Перевірити кухню: холодильник, шафи, плиту', completed: false },
        { id: 'dc-s13', text: 'Перевірити ванну кімнату: сантехніка, плитка, дзеркала', completed: false },
        { id: 'dc-s14', text: 'Викинути або віддати старі/непотрібні речі', completed: false },
        { id: 'dc-s15', text: 'Відсортувати одяг і текстиль', completed: false },
        { id: 'dc-s16', text: 'Організувати робочий простір або робочий стіл', completed: false },
        { id: 'dc-s17', text: 'Провітрити приміщення після прибирання', completed: false },
        { id: 'dc-s18', text: 'Додати ароматизатори або свічки для затишку', completed: false },
        { id: 'dc-s19', text: 'Зробити фото «до» і «після» для мотивації', completed: false },
        { id: 'dc-s20', text: 'Встановити правило: підтримувати порядок щодня по 10–15 хвилин', completed: false }
      ]
    },

    {
      id: 'home-organize-wardrobe',
      title: 'Організувати гардероб',
      description: 'Систематизація та оптимізація одягу',
      icon: '👕',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'ow-s1', text: 'Витягнути весь одяг із шафи', completed: false },
        { id: 'ow-s2', text: 'Розділити на категорії (верх, низ, взуття, аксесуари)', completed: false },
        { id: 'ow-s3', text: 'Перевірити стан кожної речі', completed: false },
        { id: 'ow-s4', text: 'Викинути або віддати те, що не носиться', completed: false },
        { id: 'ow-s5', text: 'Відсортувати одяг за сезонами', completed: false },
        { id: 'ow-s6', text: 'Визначити базові кольори та стиль', completed: false },
        { id: 'ow-s7', text: 'Встановити систему зберігання (полиці, коробки, вішалки)', completed: false },
        { id: 'ow-s8', text: 'Використати органайзери для дрібниць', completed: false },
        { id: 'ow-s9', text: 'Позначити місця для сезонного одягу', completed: false },
        { id: 'ow-s10', text: 'Скласти речі за частотою використання', completed: false },
        { id: 'ow-s11', text: 'Повісити речі вертикально для зручності', completed: false },
        { id: 'ow-s12', text: 'Зберігати взуття у прозорих коробках або на стійках', completed: false },
        { id: 'ow-s13', text: 'Використовувати ароматизатори для шафи', completed: false },
        { id: 'ow-s14', text: 'Перевірити стан сумок та аксесуарів', completed: false },
        { id: 'ow-s15', text: 'Створити базовий гардероб на всі випадки життя', completed: false },
        { id: 'ow-s16', text: 'Відсортувати старі шкарпетки та білизну', completed: false },
        { id: 'ow-s17', text: 'Розробити правила «нове за старе» при покупці', completed: false },
        { id: 'ow-s18', text: 'Фотографувати свій гардероб для швидкого вибору', completed: false },
        { id: 'ow-s19', text: 'Регулярно робити ревізію раз на 3–6 місяців', completed: false },
        { id: 'ow-s20', text: 'Насолоджуватися легкістю та порядком', completed: false }
      ]
    },

    {
      id: 'home-minimize',
      title: 'Мінімізувати речі',
      description: 'Спрощення життя через зменшення кількості речей',
      icon: '📦',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#10b981',
      steps: [
        { id: 'hm-s1', text: 'Скласти список категорій речей', completed: false },
        { id: 'hm-s2', text: 'Визначити, що дійсно використовується', completed: false },
        { id: 'hm-s3', text: 'Відокремити все зайве', completed: false },
        { id: 'hm-s4', text: 'Прийняти правило «одне зайве – одне нове»', completed: false },
        { id: 'hm-s5', text: 'Викинути або віддати непотрібне', completed: false },
        { id: 'hm-s6', text: 'Продати або обміняти речі через онлайн-платформи', completed: false },
        { id: 'hm-s7', text: 'Зменшити кількість декоративних предметів', completed: false },
        { id: 'hm-s8', text: 'Застосувати принцип мінімалізму до меблів', completed: false },
        { id: 'hm-s9', text: 'Зберігати тільки улюблені речі', completed: false },
        { id: 'hm-s10', text: 'Встановити максимальну кількість предметів у кожній категорії', completed: false },
        { id: 'hm-s11', text: 'Впорядкувати книги та журнали', completed: false },
        { id: 'hm-s12', text: 'Зменшити кількість посуду та кухонного приладдя', completed: false },
        { id: 'hm-s13', text: 'Позбутися старої техніки, що не використовується', completed: false },
        { id: 'hm-s14', text: 'Скоротити косметику до необхідного мінімуму', completed: false },
        { id: 'hm-s15', text: 'Відмовитися від надлишкових аксесуарів', completed: false },
        { id: 'hm-s16', text: 'Створити «коробку сумнівів» на 1 місяць', completed: false },
        { id: 'hm-s17', text: 'Після місяця, якщо не потрібні – віддати', completed: false },
        { id: 'hm-s18', text: 'Вчитися цінувати якість більше за кількість', completed: false },
        { id: 'hm-s19', text: 'Робити щомісячну ревізію речей', completed: false },
        { id: 'hm-s20', text: 'Насолоджуватися вільним простором', completed: false }
      ]
    },

    {
      id: 'home-room-design',
      title: 'Оновити дизайн кімнати',
      description: 'Творчий підхід до оновлення інтер\'єру',
      icon: '🎨',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#ec4899',
      steps: [
        { id: 'rd-s1', text: 'Визначити стиль і кольорову палітру', completed: false },
        { id: 'rd-s2', text: 'Переглянути меблі та розташування', completed: false },
        { id: 'rd-s3', text: 'Визначити, що можна залишити, а що замінити', completed: false },
        { id: 'rd-s4', text: 'Замінити текстиль (штори, коврики, подушки)', completed: false },
        { id: 'rd-s5', text: 'Додати кілька декоративних елементів', completed: false },
        { id: 'rd-s6', text: 'Продумати освітлення (лампи, світильники)', completed: false },
        { id: 'rd-s7', text: 'Оновити настінні прикраси або картини', completed: false },
        { id: 'rd-s8', text: 'Додати живі рослини', completed: false },
        { id: 'rd-s9', text: 'Організувати простір для роботи та відпочинку', completed: false },
        { id: 'rd-s10', text: 'Позбутися зайвого захаращення', completed: false },
        { id: 'rd-s11', text: 'Використати дзеркала для візуального простору', completed: false },
        { id: 'rd-s12', text: 'Встановити стильні коробки та органайзери', completed: false },
        { id: 'rd-s13', text: 'Переглянути кольорові акценти', completed: false },
        { id: 'rd-s14', text: 'Встановити нові полички або стелажі', completed: false },
        { id: 'rd-s15', text: 'Переставити меблі для оптимізації простору', completed: false },
        { id: 'rd-s16', text: 'Додати елементи затишку (ковдри, свічки)', completed: false },
        { id: 'rd-s17', text: 'Створити зону для хобі чи читання', completed: false },
        { id: 'rd-s18', text: 'Відтворити візуальний баланс у кімнаті', completed: false },
        { id: 'rd-s19', text: 'Придбати невеликі декоративні деталі для завершення образу', completed: false },
        { id: 'rd-s20', text: 'Оцінити результат та насолоджуватися новим простором', completed: false }
      ]
    },

    {
      id: 'home-cozy-corner',
      title: 'Створити затишний куточок',
      description: 'Організація особистого простору для релаксації',
      icon: '🛋️',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#f59e0b',
      steps: [
        { id: 'cc-s1', text: 'Вибрати місце у кімнаті', completed: false },
        { id: 'cc-s2', text: 'Поставити зручне крісло або подушку', completed: false },
        { id: 'cc-s3', text: 'Додати маленький столик для книги або чашки', completed: false },
        { id: 'cc-s4', text: 'Використати м\'яке освітлення (лампи, гірлянди)', completed: false },
        { id: 'cc-s5', text: 'Додати текстиль: плед, подушки', completed: false },
        { id: 'cc-s6', text: 'Встановити ароматизатор або свічку', completed: false },
        { id: 'cc-s7', text: 'Додати рослину або квітку', completed: false },
        { id: 'cc-s8', text: 'Розташувати речі так, щоб було просторо', completed: false },
        { id: 'cc-s9', text: 'Використати килимок або маленький коврик', completed: false },
        { id: 'cc-s10', text: 'Додати полицю для книг чи журналів', completed: false },
        { id: 'cc-s11', text: 'Встановити аудіо (музика, подкасти)', completed: false },
        { id: 'cc-s12', text: 'Створити місце для творчості (блокнот, фарби)', completed: false },
        { id: 'cc-s13', text: 'Додати предмети, що приносять радість', completed: false },
        { id: 'cc-s14', text: 'Перевірити, щоб місце було чистим', completed: false },
        { id: 'cc-s15', text: 'Встановити правило: це місце лише для відпочинку', completed: false },
        { id: 'cc-s16', text: 'Використовувати зручну позу для сидіння', completed: false },
        { id: 'cc-s17', text: 'Придбати маленький аксесуар для затишку (підставка для напою)', completed: false },
        { id: 'cc-s18', text: 'Встановити звукові або ароматичні ритуали для релаксу', completed: false },
        { id: 'cc-s19', text: 'Використовувати куточок щодня для відпочинку 10–15 хв', completed: false },
        { id: 'cc-s20', text: 'Робити фотографії або нотатки про покращення атмосфери', completed: false }
      ]
    },

    {
      id: 'home-declutter',
      title: 'Викинути 50 непотрібних речей',
      description: 'Радикальне очищення простору від зайвого',
      icon: '🗑️',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#6b7280',
      steps: [
        { id: 'dl-s1', text: 'Взяти коробку або пакет для речей', completed: false },
        { id: 'dl-s2', text: 'Пройтись по кімнаті та позначити речі для викидання', completed: false },
        { id: 'dl-s3', text: 'Вирішити, що реально не використовується', completed: false },
        { id: 'dl-s4', text: 'Не шкодувати – це для простору та комфорту', completed: false },
        { id: 'dl-s5', text: 'Викинути старий одяг та взуття', completed: false },
        { id: 'dl-s6', text: 'Віддати непотрібні книги та журнали', completed: false },
        { id: 'dl-s7', text: 'Відсортувати дрібні речі (аксесуари, косметика)', completed: false },
        { id: 'dl-s8', text: 'Позбутися старої техніки та проводів', completed: false },
        { id: 'dl-s9', text: 'Перевірити предмети декору, що не використовуються', completed: false },
        { id: 'dl-s10', text: 'Позбутися одноразових або зайвих предметів', completed: false },
        { id: 'dl-s11', text: 'Сортувати речі на переробку, сміття або подарунок', completed: false },
        { id: 'dl-s12', text: 'Виконати по 5–10 предметів щодня', completed: false },
        { id: 'dl-s13', text: 'Підраховувати кількість викинутих речей', completed: false },
        { id: 'dl-s14', text: 'Перевірити шафи та ящики', completed: false },
        { id: 'dl-s15', text: 'Не брати речі назад після виділення', completed: false },
        { id: 'dl-s16', text: 'Повторювати процес поки не досягнеш 50 предметів', completed: false },
        { id: 'dl-s17', text: 'Відзначити досягнення у щоденнику', completed: false },
        { id: 'dl-s18', text: 'Використовувати правило «одна зайва річ – одна видалена»', completed: false },
        { id: 'dl-s19', text: 'Зробити фото «до» і «після»', completed: false },
        { id: 'dl-s20', text: 'Насолоджуватися легким та чистим простором', completed: false }
      ]
    },

    {
      id: 'home-cooking',
      title: 'Навчитися готувати 10 страв',
      description: 'Кулінарний розвиток та освоєння нових рецептів',
      icon: '🍳',
      xp: 1000,
      category: 'home',
      progress: 0,
      color: '#ef4444',
      steps: [
        { id: 'ck-s1', text: 'Скласти список з 10 бажаних страв', completed: false },
        { id: 'ck-s2', text: 'Визначити необхідні інгредієнти для кожної', completed: false },
        { id: 'ck-s3', text: 'Перевірити наявність кухонного приладдя', completed: false },
        { id: 'ck-s4', text: 'Почати з простих рецептів', completed: false },
        { id: 'ck-s5', text: 'Знайти покрокові інструкції або відеоуроки', completed: false },
        { id: 'ck-s6', text: 'Придбати свіжі продукти', completed: false },
        { id: 'ck-s7', text: 'Виділити конкретний час для приготування', completed: false },
        { id: 'ck-s8', text: 'Дотримуватися рецепту', completed: false },
        { id: 'ck-s9', text: 'Робити нотатки щодо смаку та пропорцій', completed: false },
        { id: 'ck-s10', text: 'Пробувати нові техніки (смаження, запікання, тушкування)', completed: false },
        { id: 'ck-s11', text: 'Готувати по одному рецепту за раз', completed: false },
        { id: 'ck-s12', text: 'Смакувати власноруч приготовану страву', completed: false },
        { id: 'ck-s13', text: 'Вносити покращення до рецепту', completed: false },
        { id: 'ck-s14', text: 'Ділитися стравою з друзями або сім\'єю', completed: false },
        { id: 'ck-s15', text: 'Вчитися сервіруванню та подачі', completed: false },
        { id: 'ck-s16', text: 'Робити фото для мотивації', completed: false },
        { id: 'ck-s17', text: 'Пробувати складніші рецепти після перших успіхів', completed: false },
        { id: 'ck-s18', text: 'Вчитися комбінувати інгредієнти', completed: false },
        { id: 'ck-s19', text: 'Практикувати регулярність (1–2 страви на тиждень)', completed: false },
        { id: 'ck-s20', text: 'Створити власну «кухонну книгу» з улюбленими рецептами', completed: false }
      ]
    },

    // 🧩 Мозок і мислення
    {
      id: 'brain-speed-reading',
      title: 'Пройти курс швидкочитання',
      description: 'Покращення швидкості та якості читання',
      icon: '📖',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#3b82f6',
      steps: [
        { id: 'sr-s1', text: 'Визначити мету: покращити швидкість читання чи розуміння тексту', completed: false },
        { id: 'sr-s2', text: 'Знайти онлайн або офлайн курс із хорошими відгуками', completed: false },
        { id: 'sr-s3', text: 'Переглянути зміст курсу та його тривалість', completed: false },
        { id: 'sr-s4', text: 'Встановити дату початку', completed: false },
        { id: 'sr-s5', text: 'Підготувати зручне місце для навчання', completed: false },
        { id: 'sr-s6', text: 'Придбати або підготувати необхідні матеріали (книги, текстові файли)', completed: false },
        { id: 'sr-s7', text: 'Виділити щодня 20–30 хвилин на уроки', completed: false },
        { id: 'sr-s8', text: 'Проходити курс по одному модулю за раз', completed: false },
        { id: 'sr-s9', text: 'Практикувати швидкочитання на коротких текстах', completed: false },
        { id: 'sr-s10', text: 'Використовувати таймер для тренування швидкості', completed: false },
        { id: 'sr-s11', text: 'Вести щоденник прогресу (слова/хвилину)', completed: false },
        { id: 'sr-s12', text: 'Робити вправи на концентрацію та фокусування', completed: false },
        { id: 'sr-s13', text: 'Перевіряти розуміння прочитаного після кожного уроку', completed: false },
        { id: 'sr-s14', text: 'Використовувати різні жанри текстів для тренування', completed: false },
        { id: 'sr-s15', text: 'Повторювати складні вправи кілька разів', completed: false },
        { id: 'sr-s16', text: 'Відзначати прогрес графіком або таблицею', completed: false },
        { id: 'sr-s17', text: 'Долучитися до групи учнів для підтримки', completed: false },
        { id: 'sr-s18', text: 'Впроваджувати швидкочитання у щоденні завдання', completed: false },
        { id: 'sr-s19', text: 'Аналізувати результати та визначати слабкі місця', completed: false },
        { id: 'sr-s20', text: 'Після завершення курсу скласти власну систему швидкочитання', completed: false }
      ]
    },

    {
      id: 'brain-logic-puzzles',
      title: 'Робити логічні завдання щодня',
      description: 'Систематичне тренування логічного мислення',
      icon: '🧩',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'lp-s1', text: 'Вибрати тип завдань (судоку, шахи, головоломки)', completed: false },
        { id: 'lp-s2', text: 'Встановити конкретний час для тренування (10–20 хв)', completed: false },
        { id: 'lp-s3', text: 'Починати з простих завдань, поступово ускладнюючи', completed: false },
        { id: 'lp-s4', text: 'Вести зошит або файл із завданнями та рішеннями', completed: false },
        { id: 'lp-s5', text: 'Перевіряти свої відповіді для аналізу помилок', completed: false },
        { id: 'lp-s6', text: 'Використовувати таймер для контролю швидкості', completed: false },
        { id: 'lp-s7', text: 'Тренувати мислення у різних форматах (математичні, вербальні, візуальні)', completed: false },
        { id: 'lp-s8', text: 'Робити короткий аналіз стратегії рішення', completed: false },
        { id: 'lp-s9', text: 'Використовувати онлайн-платформи або додатки', completed: false },
        { id: 'lp-s10', text: 'Долучати друга або родича для спільного вирішення завдань', completed: false },
        { id: 'lp-s11', text: 'Відслідковувати прогрес у швидкості та точності', completed: false },
        { id: 'lp-s12', text: 'Записувати цікаві прийоми для повторного використання', completed: false },
        { id: 'lp-s13', text: 'Робити вправи на креативне мислення (аналогії, асоціації)', completed: false },
        { id: 'lp-s14', text: 'Чергувати завдання на логіку та пам\'ять', completed: false },
        { id: 'lp-s15', text: 'Використовувати нагороди за виконання щодня', completed: false },
        { id: 'lp-s16', text: 'Аналізувати, які типи завдань даються легше, а які важче', completed: false },
        { id: 'lp-s17', text: 'Збільшувати складність поступово', completed: false },
        { id: 'lp-s18', text: 'Робити «вихідні завдання» – складніші раз на тиждень', completed: false },
        { id: 'lp-s19', text: 'Фіксувати час, який займає рішення кожного завдання', completed: false },
        { id: 'lp-s20', text: 'Впроваджувати знайдені стратегії у повсякденне мислення', completed: false }
      ]
    },

    {
      id: 'brain-strategic-planning',
      title: 'Навчитися планувати стратегічно',
      description: 'Розвиток навичок стратегічного мислення та планування',
      icon: '🎯',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#10b981',
      steps: [
        { id: 'sp-s1', text: 'Визначити ключові цілі на місяць, квартал, рік', completed: false },
        { id: 'sp-s2', text: 'Розбити великі цілі на підцілі', completed: false },
        { id: 'sp-s3', text: 'Використовувати методику SMART для цілей', completed: false },
        { id: 'sp-s4', text: 'Визначити ресурси для досягнення кожної цілі', completed: false },
        { id: 'sp-s5', text: 'Створити план дій із чіткими термінами', completed: false },
        { id: 'sp-s6', text: 'Використовувати календар або планувальник', completed: false },
        { id: 'sp-s7', text: 'Визначити пріоритети для щоденних завдань', completed: false },
        { id: 'sp-s8', text: 'Використовувати SWOT-аналіз для великих проектів', completed: false },
        { id: 'sp-s9', text: 'Робити мозкові карти для складних цілей', completed: false },
        { id: 'sp-s10', text: 'Відстежувати виконання на щотижневій основі', completed: false },
        { id: 'sp-s11', text: 'Робити коригування плану у разі потреби', completed: false },
        { id: 'sp-s12', text: 'Визначити можливі ризики та альтернативні шляхи', completed: false },
        { id: 'sp-s13', text: 'Використовувати техніку «Що важливе – не термінове»', completed: false },
        { id: 'sp-s14', text: 'Навчитися делегувати або оптимізувати завдання', completed: false },
        { id: 'sp-s15', text: 'Фіксувати ключові висновки після кожного етапу', completed: false },
        { id: 'sp-s16', text: 'Створювати чек-листи для повторюваних процесів', completed: false },
        { id: 'sp-s17', text: 'Відзначати досягнення та проміжні успіхи', completed: false },
        { id: 'sp-s18', text: 'Аналізувати помилки та уникати їх у майбутньому', completed: false },
        { id: 'sp-s19', text: 'Використовувати стратегічне планування у житті та роботі', completed: false },
        { id: 'sp-s20', text: 'Регулярно переглядати довгострокові цілі та коригувати їх', completed: false }
      ]
    },

    {
      id: 'brain-time-tracking',
      title: 'Вести тайм-менеджмент трекер',
      description: 'Систематичне відстеження та оптимізація часу',
      icon: '⏰',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#f59e0b',
      steps: [
        { id: 'tt-s1', text: 'Вибрати інструмент: додаток, зошит, таблиця', completed: false },
        { id: 'tt-s2', text: 'Записувати всі щоденні справи', completed: false },
        { id: 'tt-s3', text: 'Позначати час початку та завершення кожного завдання', completed: false },
        { id: 'tt-s4', text: 'Визначати пріоритети (високий, середній, низький)', completed: false },
        { id: 'tt-s5', text: 'Відслідковувати витрачений час на завдання', completed: false },
        { id: 'tt-s6', text: 'Робити аналіз продуктивності щовечора', completed: false },
        { id: 'tt-s7', text: 'Вносити корективи у план на наступний день', completed: false },
        { id: 'tt-s8', text: 'Використовувати техніку Pomodoro для концентрації', completed: false },
        { id: 'tt-s9', text: 'Встановлювати конкретні дедлайни', completed: false },
        { id: 'tt-s10', text: 'Відзначати виконані завдання для мотивації', completed: false },
        { id: 'tt-s11', text: 'Порівнювати запланований та фактичний час', completed: false },
        { id: 'tt-s12', text: 'Виявляти «поглиначі часу»', completed: false },
        { id: 'tt-s13', text: 'Використовувати кольори або символи для категорій', completed: false },
        { id: 'tt-s14', text: 'Встановлювати нагадування для важливих завдань', completed: false },
        { id: 'tt-s15', text: 'Робити щотижневий звіт продуктивності', completed: false },
        { id: 'tt-s16', text: 'Аналізувати, коли продуктивність найвища', completed: false },
        { id: 'tt-s17', text: 'Вчитися переносити непотрібні завдання', completed: false },
        { id: 'tt-s18', text: 'Виявляти, які завдання можна делегувати', completed: false },
        { id: 'tt-s19', text: 'Планувати час для відпочинку та відновлення', completed: false },
        { id: 'tt-s20', text: 'Постійно оптимізувати свій трекер', completed: false }
      ]
    },

    {
      id: 'brain-daily-reports',
      title: 'Писати щоденний звіт',
      description: 'Систематичне відстеження прогресу та рефлексія',
      icon: '📝',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#06b6d4',
      steps: [
        { id: 'dr-s1', text: 'Вибрати зручний формат (зошит, додаток, документ)', completed: false },
        { id: 'dr-s2', text: 'Записувати, що вдалося зробити за день', completed: false },
        { id: 'dr-s3', text: 'Включати кількість виконаних завдань та час', completed: false },
        { id: 'dr-s4', text: 'Фіксувати найважливіші досягнення', completed: false },
        { id: 'dr-s5', text: 'Вказувати проблеми та складнощі', completed: false },
        { id: 'dr-s6', text: 'Робити короткий аналіз: що можна покращити', completed: false },
        { id: 'dr-s7', text: 'Позначати пріоритетні завдання на завтра', completed: false },
        { id: 'dr-s8', text: 'Відзначати, що принесло задоволення', completed: false },
        { id: 'dr-s9', text: 'Використовувати систему оцінки (1–10)', completed: false },
        { id: 'dr-s10', text: 'Робити нотатки про нові ідеї', completed: false },
        { id: 'dr-s11', text: 'Записувати рівень енергії та концентрації', completed: false },
        { id: 'dr-s12', text: 'Фіксувати нові навички або знання', completed: false },
        { id: 'dr-s13', text: 'Використовувати кольори для легшого аналізу', completed: false },
        { id: 'dr-s14', text: 'Вести щотижневі підсумки', completed: false },
        { id: 'dr-s15', text: 'Робити щомісячний аналіз прогресу', completed: false },
        { id: 'dr-s16', text: 'Додавати позитивні висновки для мотивації', completed: false },
        { id: 'dr-s17', text: 'Вчитися коротко і чітко описувати події', completed: false },
        { id: 'dr-s18', text: 'Використовувати звіт для корекції планів', completed: false },
        { id: 'dr-s19', text: 'Перевіряти виконання стратегічних цілей', completed: false },
        { id: 'dr-s20', text: 'Робити це щодня, навіть якщо день був «не продуктивним»', completed: false }
      ]
    },

    {
      id: 'brain-energy-tracking',
      title: 'Відстежувати рівень енергії',
      description: 'Моніторинг та оптимізація енергетичного стану',
      icon: '⚡',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#ef4444',
      steps: [
        { id: 'et-s1', text: 'Вести щоденник відчуттів енергії', completed: false },
        { id: 'et-s2', text: 'Позначати час доби з найвищою продуктивністю', completed: false },
        { id: 'et-s3', text: 'Визначити фактори, що знижують енергію (їжа, сон, стрес)', completed: false },
        { id: 'et-s4', text: 'Записувати якість сну', completed: false },
        { id: 'et-s5', text: 'Відзначати фізичну активність', completed: false },
        { id: 'et-s6', text: 'Фіксувати харчування і воду', completed: false },
        { id: 'et-s7', text: 'Визначати пік концентрації та продуктивності', completed: false },
        { id: 'et-s8', text: 'Відслідковувати вплив відпочинку на енергію', completed: false },
        { id: 'et-s9', text: 'Робити аналіз щотижня', completed: false },
        { id: 'et-s10', text: 'Використовувати кольорову шкалу для оцінки енергії', completed: false },
        { id: 'et-s11', text: 'Виявляти, які завдання «з\'їдають» енергію', completed: false },
        { id: 'et-s12', text: 'Планувати складні завдання на піковий час', completed: false },
        { id: 'et-s13', text: 'Робити короткі паузи для відновлення', completed: false },
        { id: 'et-s14', text: 'Відзначати вплив стресових ситуацій', completed: false },
        { id: 'et-s15', text: 'Коригувати режим дня відповідно до рівня енергії', completed: false },
        { id: 'et-s16', text: 'Включати фізичні вправи для підтримки тонусу', completed: false },
        { id: 'et-s17', text: 'Використовувати дихальні практики для швидкого відновлення', completed: false },
        { id: 'et-s18', text: 'Аналізувати вплив продуктів і напоїв на енергію', completed: false },
        { id: 'et-s19', text: 'Вчитися розпізнавати ознаки втоми', completed: false },
        { id: 'et-s20', text: 'Постійно оптимізувати свій день для високої енергії', completed: false }
      ]
    },

    {
      id: 'brain-memory-training',
      title: 'Тренувати пам\'ять',
      description: 'Систематичне покращення пам\'яті та запам\'ятовування',
      icon: '🧠',
      xp: 1000,
      category: 'brain',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'mt-s1', text: 'Вибрати тип пам\'яті для тренування (краткострокова, довгострокова)', completed: false },
        { id: 'mt-s2', text: 'Почати з простих вправ (запам\'ятати 5–10 слів)', completed: false },
        { id: 'mt-s3', text: 'Використовувати асоціації та візуалізації', completed: false },
        { id: 'mt-s4', text: 'Створювати історії для запам\'ятовування фактів', completed: false },
        { id: 'mt-s5', text: 'Практикувати повторення через проміжки часу', completed: false },
        { id: 'mt-s6', text: 'Використовувати мнемонічні техніки', completed: false },
        { id: 'mt-s7', text: 'Робити вправи на концентрацію', completed: false },
        { id: 'mt-s8', text: 'Грати в ігри на пам\'ять (карти, шахи, головоломки)', completed: false },
        { id: 'mt-s9', text: 'Використовувати мобільні додатки для тренування', completed: false },
        { id: 'mt-s10', text: 'Запам\'ятовувати номери телефонів, адреси, слова іноземною', completed: false },
        { id: 'mt-s11', text: 'Робити вправи на слухову пам\'ять (повторення звуків)', completed: false },
        { id: 'mt-s12', text: 'Практикувати пам\'ять на обличчя та імена', completed: false },
        { id: 'mt-s13', text: 'Використовувати кольори та образи для асоціацій', completed: false },
        { id: 'mt-s14', text: 'Вести щоденник прогресу', completed: false },
        { id: 'mt-s15', text: 'Виконувати вправи щодня по 10–15 хв', completed: false },
        { id: 'mt-s16', text: 'Поєднувати тренування пам\'яті з фізичними вправами', completed: false },
        { id: 'mt-s17', text: 'Використовувати вправи на швидке запам\'ятовування списків', completed: false },
        { id: 'mt-s18', text: 'Вчитися планувати інформацію у «розумні схеми»', completed: false },
        { id: 'mt-s19', text: 'Аналізувати ефективність різних методів', completed: false },
        { id: 'mt-s20', text: 'Постійно ускладнювати завдання для тренування пам\'яті', completed: false }
      ]
    },

    // 🤝 Соціальні зв'язки та вплив
    {
      id: 'social-new-acquaintance',
      title: 'Завести нове знайомство',
      description: 'Розширення соціального кола та навичок комунікації',
      icon: '👋',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#3b82f6',
      steps: [
        { id: 'na-s1', text: 'Визначити сферу, де хочеш знайти нових людей (робота, хобі, навчання)', completed: false },
        { id: 'na-s2', text: 'Відвідати подію або захід, де збираються нові люди', completed: false },
        { id: 'na-s3', text: 'Підготувати коротку розповідь про себе', completed: false },
        { id: 'na-s4', text: 'Усміхатися та підтримувати відкриту мову тіла', completed: false },
        { id: 'na-s5', text: 'Почати розмову з компліменту або запитання', completed: false },
        { id: 'na-s6', text: 'Слухати співрозмовника уважно', completed: false },
        { id: 'na-s7', text: 'Задавати уточнюючі питання для продовження розмови', completed: false },
        { id: 'na-s8', text: 'Запам\'ятовувати імена нових людей', completed: false },
        { id: 'na-s9', text: 'Ділитися цікавими фактами або досвідом', completed: false },
        { id: 'na-s10', text: 'Використовувати спільні інтереси як точку контакту', completed: false },
        { id: 'na-s11', text: 'Пропонувати подальший контакт (соцмережі, email)', completed: false },
        { id: 'na-s12', text: 'Відстежувати свої емоції під час знайомства', completed: false },
        { id: 'na-s13', text: 'Вчитися долати страх відмови', completed: false },
        { id: 'na-s14', text: 'Розширювати мережу через знайомих нових людей', completed: false },
        { id: 'na-s15', text: 'Регулярно підтримувати контакт після знайомства', completed: false },
        { id: 'na-s16', text: 'Аналізувати, що працює у комунікації, а що ні', completed: false },
        { id: 'na-s17', text: 'Вчитися невимушено починати розмови в різних ситуаціях', completed: false },
        { id: 'na-s18', text: 'Практикувати активне слухання та уважність', completed: false },
        { id: 'na-s19', text: 'Використовувати кожну зустріч як практику навичок', completed: false },
        { id: 'na-s20', text: 'Робити щоденний або щотижневий звіт про нові знайомства', completed: false }
      ]
    },

    {
      id: 'social-host-event',
      title: 'Провести вечірку або зустріч',
      description: 'Організація соціальних подій та розвиток лідерських якостей',
      icon: '🎉',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#ec4899',
      steps: [
        { id: 'he-s1', text: 'Визначити мету та формат події', completed: false },
        { id: 'he-s2', text: 'Скласти список запрошених гостей', completed: false },
        { id: 'he-s3', text: 'Вибрати місце або платформу для зустрічі', completed: false },
        { id: 'he-s4', text: 'Встановити дату і час', completed: false },
        { id: 'he-s5', text: 'Продумати розважальну програму', completed: false },
        { id: 'he-s6', text: 'Підготувати їжу та напої', completed: false },
        { id: 'he-s7', text: 'Підготувати сценарій або план заходу', completed: false },
        { id: 'he-s8', text: 'Створити запрошення (фізичні або цифрові)', completed: false },
        { id: 'he-s9', text: 'Встановити правила участі та комфортні умови для всіх', completed: false },
        { id: 'he-s10', text: 'Додати елементи інтерактиву (ігри, конкурси)', completed: false },
        { id: 'he-s11', text: 'Прийняти на себе роль господаря і координатора', completed: false },
        { id: 'he-s12', text: 'Відзначати важливі моменти та знайомства', completed: false },
        { id: 'he-s13', text: 'Слідкувати за атмосферою і комфортом гостей', completed: false },
        { id: 'he-s14', text: 'Використовувати техніки залучення людей у розмову', completed: false },
        { id: 'he-s15', text: 'Підтримувати невимушену та дружню атмосферу', completed: false },
        { id: 'he-s16', text: 'Фотографувати або записувати моменти для пам\'яті', completed: false },
        { id: 'he-s17', text: 'Аналізувати, що спрацювало добре, а що можна покращити', completed: false },
        { id: 'he-s18', text: 'Вдячно завершити зустріч і подякувати гостям', completed: false },
        { id: 'he-s19', text: 'Продовжити комунікацію після події', completed: false },
        { id: 'he-s20', text: 'Використовувати досвід для організації наступних заходів', completed: false }
      ]
    },

    {
      id: 'social-active-listening',
      title: 'Навчитися слухати уважно',
      description: 'Розвиток навичок активного слухання та емпатії',
      icon: '👂',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#10b981',
      steps: [
        { id: 'al-s1', text: 'Усвідомити різницю між слуханням та просто почуттям', completed: false },
        { id: 'al-s2', text: 'Відкласти всі відволікаючі фактори під час розмови', completed: false },
        { id: 'al-s3', text: 'Підтримувати зоровий контакт', completed: false },
        { id: 'al-s4', text: 'Не перебивати співрозмовника', completed: false },
        { id: 'al-s5', text: 'Робити кивання або мінімальні реакції, щоб показати увагу', completed: false },
        { id: 'al-s6', text: 'Перефразовувати почуте, щоб переконатися у розумінні', completed: false },
        { id: 'al-s7', text: 'Задавати уточнюючі запитання', completed: false },
        { id: 'al-s8', text: 'Фокусуватися на емоціях співрозмовника', completed: false },
        { id: 'al-s9', text: 'Вести нотатки у складних або робочих розмовах', completed: false },
        { id: 'al-s10', text: 'Уникати підготовки відповіді під час слухання', completed: false },
        { id: 'al-s11', text: 'Практикувати паузу перед відповіддю', completed: false },
        { id: 'al-s12', text: 'Відстежувати власні емоції, щоб не відволікатися', completed: false },
        { id: 'al-s13', text: 'Слухати різних людей для практики', completed: false },
        { id: 'al-s14', text: 'Використовувати невербальні сигнали для розуміння', completed: false },
        { id: 'al-s15', text: 'Вчитися розпізнавати ключові меседжі', completed: false },
        { id: 'al-s16', text: 'Аналізувати власний прогрес у слуханні', completed: false },
        { id: 'al-s17', text: 'Впроваджувати уважне слухання у щоденну комунікацію', completed: false },
        { id: 'al-s18', text: 'Обговорювати з іншими ефективність спілкування', completed: false },
        { id: 'al-s19', text: 'Розвивати емпатію через активне слухання', completed: false },
        { id: 'al-s20', text: 'Робити звіт про власні успіхи та помилки у слуханні', completed: false }
      ]
    },

    {
      id: 'social-selfless-help',
      title: 'Допомогти комусь безкорисливо',
      description: 'Розвиток емпатії та альтруїстичних якостей',
      icon: '🤲',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#f59e0b',
      steps: [
        { id: 'sh-s1', text: 'Усвідомити власні ресурси для допомоги (час, знання, вміння)', completed: false },
        { id: 'sh-s2', text: 'Вибрати сферу, де можеш бути корисним', completed: false },
        { id: 'sh-s3', text: 'Почати з маленької дії допомоги', completed: false },
        { id: 'sh-s4', text: 'Ставити інтереси інших на перший план', completed: false },
        { id: 'sh-s5', text: 'Уникати очікування винагороди', completed: false },
        { id: 'sh-s6', text: 'Підтримувати щирість у діях', completed: false },
        { id: 'sh-s7', text: 'Пропонувати допомогу знайомим або незнайомим', completed: false },
        { id: 'sh-s8', text: 'Вчитися помічати потреби оточуючих', completed: false },
        { id: 'sh-s9', text: 'Ділитися знаннями та порадами', completed: false },
        { id: 'sh-s10', text: 'Вести щоденник добрих справ', completed: false },
        { id: 'sh-s11', text: 'Розвивати терпіння під час допомоги', completed: false },
        { id: 'sh-s12', text: 'Підтримувати постійний контакт, якщо це потрібно', completed: false },
        { id: 'sh-s13', text: 'Використовувати волонтерські можливості', completed: false },
        { id: 'sh-s14', text: 'Пам\'ятати про власні межі, щоб не вигоріти', completed: false },
        { id: 'sh-s15', text: 'Розвивати навичку слухати під час допомоги', completed: false },
        { id: 'sh-s16', text: 'Ділитися історіями добрих справ з іншими для мотивації', completed: false },
        { id: 'sh-s17', text: 'Аналізувати, що працює найкраще у допомозі', completed: false },
        { id: 'sh-s18', text: 'Розвивати здатність помічати тих, хто соромиться попросити', completed: false },
        { id: 'sh-s19', text: 'Робити допомогу регулярною звичкою', completed: false },
        { id: 'sh-s20', text: 'Оцінювати внутрішнє відчуття задоволення від дій', completed: false }
      ]
    },

    {
      id: 'social-public-speaking',
      title: 'Виступити публічно',
      description: 'Розвиток навичок публічних виступів та впевненості',
      icon: '🎤',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'ps-s1', text: 'Вибрати тему, яка тебе цікавить і зрозуміла', completed: false },
        { id: 'ps-s2', text: 'Підготувати короткий план виступу', completed: false },
        { id: 'ps-s3', text: 'Визначити формат: презентація, промова, лекція', completed: false },
        { id: 'ps-s4', text: 'Вчитися структурувати інформацію', completed: false },
        { id: 'ps-s5', text: 'Підготувати візуальні матеріали (слайди, графіки)', completed: false },
        { id: 'ps-s6', text: 'Практикувати промову перед дзеркалом', completed: false },
        { id: 'ps-s7', text: 'Відпрацювати мову тіла та жести', completed: false },
        { id: 'ps-s8', text: 'Робити запис свого виступу для аналізу', completed: false },
        { id: 'ps-s9', text: 'Почати з невеликої аудиторії друзів або колег', completed: false },
        { id: 'ps-s10', text: 'Вчитися контролювати дихання та темп мовлення', completed: false },
        { id: 'ps-s11', text: 'Використовувати історії та приклади для залучення уваги', completed: false },
        { id: 'ps-s12', text: 'Практикувати інтерактивні елементи', completed: false },
        { id: 'ps-s13', text: 'Вчитися відповідати на запитання слухачів', completed: false },
        { id: 'ps-s14', text: 'Аналізувати емоції аудиторії', completed: false },
        { id: 'ps-s15', text: 'Долати страх сцени через регулярну практику', completed: false },
        { id: 'ps-s16', text: 'Збирати фідбек після виступу', completed: false },
        { id: 'ps-s17', text: 'Коригувати стиль і подачу на основі відгуків', completed: false },
        { id: 'ps-s18', text: 'Використовувати техніки впевненості перед виходом', completed: false },
        { id: 'ps-s19', text: 'Підготувати заключну частину, яка залишає враження', completed: false },
        { id: 'ps-s20', text: 'Робити регулярні виступи для постійного розвитку', completed: false }
      ]
    },

    {
      id: 'social-team-project',
      title: 'Взяти участь у спільному проєкті',
      description: 'Розвиток навичок командної роботи та співпраці',
      icon: '👥',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#06b6d4',
      steps: [
        { id: 'tp-s1', text: 'Вибрати проєкт за інтересами або професійними цілями', completed: false },
        { id: 'tp-s2', text: 'Долучитися до команди або ініціативи', completed: false },
        { id: 'tp-s3', text: 'Ознайомитися з цілями та завданнями проєкту', completed: false },
        { id: 'tp-s4', text: 'Визначити свою роль та відповідальність', completed: false },
        { id: 'tp-s5', text: 'Розробити план власних дій', completed: false },
        { id: 'tp-s6', text: 'Встановити комунікаційні канали з командою', completed: false },
        { id: 'tp-s7', text: 'Виконувати завдання вчасно', completed: false },
        { id: 'tp-s8', text: 'Вносити пропозиції для покращення процесу', completed: false },
        { id: 'tp-s9', text: 'Підтримувати колег і ділитися знаннями', completed: false },
        { id: 'tp-s10', text: 'Фіксувати прогрес команди та власний', completed: false },
        { id: 'tp-s11', text: 'Брати участь у спільних нарадах або обговореннях', completed: false },
        { id: 'tp-s12', text: 'Вчитися делегувати та приймати допомогу', completed: false },
        { id: 'tp-s13', text: 'Аналізувати проблеми та шукати рішення', completed: false },
        { id: 'tp-s14', text: 'Збирати та враховувати зворотний зв\'язок', completed: false },
        { id: 'tp-s15', text: 'Використовувати інструменти організації (дошки, трекери)', completed: false },
        { id: 'tp-s16', text: 'Дотримуватися дедлайнів та термінів', completed: false },
        { id: 'tp-s17', text: 'Розвивати навички командної роботи та лідерства', completed: false },
        { id: 'tp-s18', text: 'Після завершення підготувати підсумки та звіт', completed: false },
        { id: 'tp-s19', text: 'Вдосконалювати процеси для наступного проєкту', completed: false },
        { id: 'tp-s20', text: 'Вчитися на помилках та успіхах для майбутніх командних задач', completed: false }
      ]
    },

    {
      id: 'social-find-mentor',
      title: 'Знайти ментора або наставника',
      description: 'Пошук наставництва та розвиток через досвід інших',
      icon: '👨‍🏫',
      xp: 1000,
      category: 'social',
      progress: 0,
      color: '#ef4444',
      steps: [
        { id: 'fm-s1', text: 'Визначити сферу, у якій потрібна допомога', completed: false },
        { id: 'fm-s2', text: 'Скласти список потенційних наставників', completed: false },
        { id: 'fm-s3', text: 'Дослідити їхні досягнення та досвід', completed: false },
        { id: 'fm-s4', text: 'Підготувати короткий запит на зустріч', completed: false },
        { id: 'fm-s5', text: 'Встановити контакт через email, соцмережі або знайомих', completed: false },
        { id: 'fm-s6', text: 'Ввічливо представитися та пояснити мету', completed: false },
        { id: 'fm-s7', text: 'Запропонувати конкретний формат спілкування (зустріч, дзвінок)', completed: false },
        { id: 'fm-s8', text: 'Підготувати список питань або тем для обговорення', completed: false },
        { id: 'fm-s9', text: 'Вести нотатки під час спілкування', completed: false },
        { id: 'fm-s10', text: 'Виконувати поради та завдання наставника', completed: false },
        { id: 'fm-s11', text: 'Вдячно реагувати на фідбек та підтримку', completed: false },
        { id: 'fm-s12', text: 'Поступово розширювати сферу питань', completed: false },
        { id: 'fm-s13', text: 'Встановити регулярність спілкування', completed: false },
        { id: 'fm-s14', text: 'Робити аналіз отриманих знань та прогресу', completed: false },
        { id: 'fm-s15', text: 'Використовувати наставництво для розвитку кар\'єри або особистості', completed: false },
        { id: 'fm-s16', text: 'Бути активним учасником у розмові, а не пасивним слухачем', completed: false },
        { id: 'fm-s17', text: 'Ділитися успіхами та труднощами відкрито', completed: false },
        { id: 'fm-s18', text: 'Прагнути отримати приклади з реального досвіду наставника', completed: false },
        { id: 'fm-s19', text: 'Підтримувати довгостроковий контакт', completed: false },
        { id: 'fm-s20', text: 'Використовувати отримані знання для власного розвитку та допомоги іншим', completed: false }
      ]
    },

    // 🎨 Творчість та мистецтво
    {
      id: 'creative-artbook',
      title: 'Почати малювати / вести артбук',
      description: 'Розвиток художніх навичок та творчого самовираження',
      icon: '🎨',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#ec4899',
      steps: [
        { id: 'ab-s1', text: 'Вибрати формат: блокнот, альбом або цифровий планшет', completed: false },
        { id: 'ab-s2', text: 'Придбати базові матеріали (олівці, фарби, ручки)', completed: false },
        { id: 'ab-s3', text: 'Визначити мету артбуку: щоденний скетч, експерименти, ідеї', completed: false },
        { id: 'ab-s4', text: 'Виділити час для малювання щодня (15–30 хв)', completed: false },
        { id: 'ab-s5', text: 'Почати з простих форм і ескізів', completed: false },
        { id: 'ab-s6', text: 'Практикувати різні стилі та техніки', completed: false },
        { id: 'ab-s7', text: 'Робити швидкі замальовки навколо себе', completed: false },
        { id: 'ab-s8', text: 'Додавати записи думок або ідей поряд із малюнками', completed: false },
        { id: 'ab-s9', text: 'Використовувати референси та фото для натхнення', completed: false },
        { id: 'ab-s10', text: 'Відстежувати прогрес, роблячи фото сторінок', completed: false },
        { id: 'ab-s11', text: 'Експериментувати з кольорами та композицією', completed: false },
        { id: 'ab-s12', text: 'Робити тематичні серії малюнків', completed: false },
        { id: 'ab-s13', text: 'Ділитися роботами з друзями або онлайн', completed: false },
        { id: 'ab-s14', text: 'Вчитися від інших художників через уроки або соцмережі', completed: false },
        { id: 'ab-s15', text: 'Використовувати артбук для збереження ідей', completed: false },
        { id: 'ab-s16', text: 'Впроваджувати власні ритуали перед малюванням для концентрації', completed: false },
        { id: 'ab-s17', text: 'Додавати елементи колажу або текстури', completed: false },
        { id: 'ab-s18', text: 'Робити аналіз своїх робіт раз на місяць', completed: false },
        { id: 'ab-s19', text: 'Використовувати артбук як творчий щоденник', completed: false },
        { id: 'ab-s20', text: 'Постійно поповнювати артбук новими ідеями та експериментами', completed: false }
      ]
    },

    {
      id: 'creative-music',
      title: 'Створити музику або трек',
      description: 'Освоєння музичного творчого процесу',
      icon: '🎵',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#8b5cf6',
      steps: [
        { id: 'cm-s1', text: 'Визначити жанр або стиль музики', completed: false },
        { id: 'cm-s2', text: 'Вибрати інструмент або програму для створення музики', completed: false },
        { id: 'cm-s3', text: 'Вчитися базовим технікам (ритм, мелодія, гармонія)', completed: false },
        { id: 'cm-s4', text: 'Скласти першу просту мелодію', completed: false },
        { id: 'cm-s5', text: 'Записати ідеї на смартфон чи нотатник', completed: false },
        { id: 'cm-s6', text: 'Додати ударні або ритм', completed: false },
        { id: 'cm-s7', text: 'Поступово будувати аранжування', completed: false },
        { id: 'cm-s8', text: 'Використовувати лупи та семпли для експериментів', completed: false },
        { id: 'cm-s9', text: 'Вчитися базовому мікшуванню звуку', completed: false },
        { id: 'cm-s10', text: 'Показати трек друзям для зворотного зв\'язку', completed: false },
        { id: 'cm-s11', text: 'Вносити зміни на основі відгуків', completed: false },
        { id: 'cm-s12', text: 'Додати ефекти для глибини та атмосфери', completed: false },
        { id: 'cm-s13', text: 'Практикувати запис вокалу або інструменту', completed: false },
        { id: 'cm-s14', text: 'Використовувати безкоштовні ресурси для натхнення', completed: false },
        { id: 'cm-s15', text: 'Створити демо версію треку', completed: false },
        { id: 'cm-s16', text: 'Аналізувати популярні треки у своєму жанрі', completed: false },
        { id: 'cm-s17', text: 'Вчитися структуруванню треку (куплет, приспів, бридж)', completed: false },
        { id: 'cm-s18', text: 'Робити завершену версію треку', completed: false },
        { id: 'cm-s19', text: 'Поширити трек онлайн або серед друзів', completed: false },
        { id: 'cm-s20', text: 'Використовувати досвід для наступних музичних експериментів', completed: false }
      ]
    },

    {
      id: 'creative-photography',
      title: 'Зробити фото-проєкт',
      description: 'Розвиток фотографічних навичок та творчого бачення',
      icon: '📸',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#3b82f6',
      steps: [
        { id: 'cp-s1', text: 'Визначити тему або концепцію', completed: false },
        { id: 'cp-s2', text: 'Обрати обладнання: камера або смартфон', completed: false },
        { id: 'cp-s3', text: 'Продумати стиль зйомки (кольори, композиція)', completed: false },
        { id: 'cp-s4', text: 'Вибрати локації для зйомки', completed: false },
        { id: 'cp-s5', text: 'Створити список кадрів або ракурсів', completed: false },
        { id: 'cp-s6', text: 'Встановити графік зйомок', completed: false },
        { id: 'cp-s7', text: 'Експериментувати з освітленням та фокусом', completed: false },
        { id: 'cp-s8', text: 'Робити серії фото для створення історії', completed: false },
        { id: 'cp-s9', text: 'Практикувати різні техніки (портрет, пейзаж, макро)', completed: false },
        { id: 'cp-s10', text: 'Вести щоденник ідей для фото', completed: false },
        { id: 'cp-s11', text: 'Редагувати знімки для покращення композиції', completed: false },
        { id: 'cp-s12', text: 'Додати підписи або короткі історії до фото', completed: false },
        { id: 'cp-s13', text: 'Вибрати найкращі знімки для проєкту', completed: false },
        { id: 'cp-s14', text: 'Створити альбом або онлайн-галерею', completed: false },
        { id: 'cp-s15', text: 'Просити фідбек від друзів або соцмереж', completed: false },
        { id: 'cp-s16', text: 'Вчитися на власних помилках та експериментах', completed: false },
        { id: 'cp-s17', text: 'Проводити тематичні фотосесії регулярно', completed: false },
        { id: 'cp-s18', text: 'Долучати реквізит або елементи для креативності', completed: false },
        { id: 'cp-s19', text: 'Підготувати фінальну презентацію фото-проєкту', completed: false },
        { id: 'cp-s20', text: 'Використовувати досвід для наступного творчого проєкту', completed: false }
      ]
    },

    {
      id: 'creative-blog',
      title: 'Відкрити креативний блог',
      description: 'Створення платформи для творчого самовираження',
      icon: '📝',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#10b981',
      steps: [
        { id: 'cb-s1', text: 'Визначити тему та формат блогу (текст, фото, відео)', completed: false },
        { id: 'cb-s2', text: 'Обрати платформу (Instagram, YouTube, TikTok, блог-сайт)', completed: false },
        { id: 'cb-s3', text: 'Створити акаунт та оформити профіль', completed: false },
        { id: 'cb-s4', text: 'Продумати концепцію контенту', completed: false },
        { id: 'cb-s5', text: 'Розробити контент-план на перший місяць', completed: false },
        { id: 'cb-s6', text: 'Створити перший пост або відео', completed: false },
        { id: 'cb-s7', text: 'Додавати креативні візуальні елементи', completed: false },
        { id: 'cb-s8', text: 'Використовувати історії або регулярні рубрики', completed: false },
        { id: 'cb-s9', text: 'Вчитися основам SEO або просування контенту', completed: false },
        { id: 'cb-s10', text: 'Публікувати регулярно (1–3 рази на тиждень)', completed: false },
        { id: 'cb-s11', text: 'Взаємодіяти з підписниками та коментарями', completed: false },
        { id: 'cb-s12', text: 'Аналізувати статистику переглядів і реакцій', completed: false },
        { id: 'cb-s13', text: 'Коригувати контент-план на основі фідбеку', completed: false },
        { id: 'cb-s14', text: 'Використовувати креативні виклики та тренди', completed: false },
        { id: 'cb-s15', text: 'Вчитися монтажу, обробці фото та відео', completed: false },
        { id: 'cb-s16', text: 'Долучати друзів або колег до спільних постів', completed: false },
        { id: 'cb-s17', text: 'Експериментувати з форматом та стилем', completed: false },
        { id: 'cb-s18', text: 'Робити тематичні серії постів', completed: false },
        { id: 'cb-s19', text: 'Вдосконалювати бренд та візуальний стиль', completed: false },
        { id: 'cb-s20', text: 'Використовувати блог як платформу для самовираження', completed: false }
      ]
    },

    {
      id: 'creative-screenplay',
      title: 'Написати короткий фільм або сценарій',
      description: 'Освоєння кіносценарію та візуального оповідання',
      icon: '🎬',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#f59e0b',
      steps: [
        { id: 'cs-s1', text: 'Визначити жанр та тему', completed: false },
        { id: 'cs-s2', text: 'Створити короткий синопсис історії', completed: false },
        { id: 'cs-s3', text: 'Продумати головних персонажів', completed: false },
        { id: 'cs-s4', text: 'Визначити конфлікт або сюжетний поворот', completed: false },
        { id: 'cs-s5', text: 'Розробити структуру сценарію (початок, середина, кінець)', completed: false },
        { id: 'cs-s6', text: 'Написати перший драфт сценарію', completed: false },
        { id: 'cs-s7', text: 'Відредагувати діалоги та описи сцен', completed: false },
        { id: 'cs-s8', text: 'Використовувати техніку «show, don\'t tell»', completed: false },
        { id: 'cs-s9', text: 'Перевірити логіку сюжету та послідовність подій', completed: false },
        { id: 'cs-s10', text: 'Отримати фідбек від друзів або колег', completed: false },
        { id: 'cs-s11', text: 'Внести корективи після отриманого відгуку', completed: false },
        { id: 'cs-s12', text: 'Продумати візуальні та аудіо ефекти', completed: false },
        { id: 'cs-s13', text: 'Підготувати розкадрування (storyboard)', completed: false },
        { id: 'cs-s14', text: 'Визначити локації та реквізит для зйомки', completed: false },
        { id: 'cs-s15', text: 'Підготувати акторів або друзів для виконання ролей', completed: false },
        { id: 'cs-s16', text: 'Робити пробні зйомки для тестування сцен', completed: false },
        { id: 'cs-s17', text: 'Проводити фінальну зйомку', completed: false },
        { id: 'cs-s18', text: 'Монтувати відео та додавати звук', completed: false },
        { id: 'cs-s19', text: 'Показати короткометражку аудиторії', completed: false },
        { id: 'cs-s20', text: 'Використовувати досвід для наступного сценарію', completed: false }
      ]
    },

    {
      id: 'creative-competition',
      title: 'Взяти участь у творчому конкурсі',
      description: 'Розвиток творчих навичок через змагальну діяльність',
      icon: '🏆',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#ef4444',
      steps: [
        { id: 'cc-s1', text: 'Знайти конкурси за своєю спеціалізацією', completed: false },
        { id: 'cc-s2', text: 'Перевірити умови участі та дедлайни', completed: false },
        { id: 'cc-s3', text: 'Вибрати проєкт або роботу для участі', completed: false },
        { id: 'cc-s4', text: 'Вдосконалити роботу відповідно до вимог', completed: false },
        { id: 'cc-s5', text: 'Створити опис або мотиваційний лист (якщо потрібно)', completed: false },
        { id: 'cc-s6', text: 'Відредагувати роботу для кращого ефекту', completed: false },
        { id: 'cc-s7', text: 'Перевірити технічні вимоги (розмір, формат, якість)', completed: false },
        { id: 'cc-s8', text: 'Зібрати необхідні документи або файли', completed: false },
        { id: 'cc-s9', text: 'Подати роботу до конкурсу', completed: false },
        { id: 'cc-s10', text: 'Зберігати підтвердження участі', completed: false },
        { id: 'cc-s11', text: 'Стежити за етапами оцінювання', completed: false },
        { id: 'cc-s12', text: 'Отримати зворотний зв\'язок (якщо надається)', completed: false },
        { id: 'cc-s13', text: 'Аналізувати результат конкурсу', completed: false },
        { id: 'cc-s14', text: 'Використати досвід для покращення майбутніх робіт', completed: false },
        { id: 'cc-s15', text: 'Публічно поділитися своєю участю для мотивації інших', completed: false },
        { id: 'cc-s16', text: 'Відзначити власні досягнення, навіть без призу', completed: false },
        { id: 'cc-s17', text: 'Планувати участь у наступних конкурсах', completed: false },
        { id: 'cc-s18', text: 'Створювати роботи спеціально під конкурси для практики', completed: false },
        { id: 'cc-s19', text: 'Вчитися презентувати свою роботу переконливо', completed: false },
        { id: 'cc-s20', text: 'Використовувати участь для розвитку навичок і мережі контактів', completed: false }
      ]
    },

    {
      id: 'creative-exhibition',
      title: 'Влаштувати власну виставку',
      description: 'Організація творчої виставки та презентація робіт',
      icon: '🖼️',
      xp: 1000,
      category: 'creative',
      progress: 0,
      color: '#06b6d4',
      steps: [
        { id: 'ce-s1', text: 'Визначити концепцію виставки', completed: false },
        { id: 'ce-s2', text: 'Вибрати роботи для демонстрації', completed: false },
        { id: 'ce-s3', text: 'Обрати місце проведення (галерея, кафе, онлайн)', completed: false },
        { id: 'ce-s4', text: 'Продумати розташування робіт у просторі', completed: false },
        { id: 'ce-s5', text: 'Підготувати опис або підписи до робіт', completed: false },
        { id: 'ce-s6', text: 'Встановити дату та тривалість виставки', completed: false },
        { id: 'ce-s7', text: 'Підготувати запрошення для гостей', completed: false },
        { id: 'ce-s8', text: 'Продумати оформлення простору (світло, декор)', completed: false },
        { id: 'ce-s9', text: 'Встановити роботи або підготувати онлайн-платформу', completed: false },
        { id: 'ce-s10', text: 'Організувати логістику доставки та монтажу робіт', completed: false },
        { id: 'ce-s11', text: 'Створити план відкриття та презентації', completed: false },
        { id: 'ce-s12', text: 'Практикувати розповідь про свої роботи', completed: false },
        { id: 'ce-s13', text: 'Провести репетицію заходу', completed: false },
        { id: 'ce-s14', text: 'Прийняти гостей та супроводжувати їх екскурсією', completed: false },
        { id: 'ce-s15', text: 'Збирати фідбек від відвідувачів', completed: false },
        { id: 'ce-s16', text: 'Фотографувати або знімати виставку для архіву', completed: false },
        { id: 'ce-s17', text: 'Вдячно завершити подію', completed: false },
        { id: 'ce-s18', text: 'Аналізувати сильні та слабкі сторони організації', completed: false },
        { id: 'ce-s19', text: 'Використати досвід для планування наступної виставки', completed: false },
        { id: 'ce-s20', text: 'Поширювати інформацію про виставку онлайн для залучення аудиторії', completed: false }
      ]
    }
  ]);

  // Щоденні квести
  const [dailyQuests, setDailyQuests] = React.useState([
    // ☕ Ранковий старт
    { id: 1, title: 'Не перевіряти телефон перші 30 хв після пробудження', xp: 100, completed: false, emoji: '📱', color: '#6b7280', category: 'morning' },
    { id: 2, title: 'Зробити легку розтяжку', xp: 80, completed: false, emoji: '🧘', color: '#8b5cf6', category: 'morning' },
    { id: 3, title: 'Посміхнутися собі в дзеркало', xp: 50, completed: false, emoji: '😄', color: '#f59e0b', category: 'morning' },
    { id: 4, title: 'Зробити каву або чай по-новому', xp: 80, completed: false, emoji: '☕', color: '#8b5cf6', category: 'morning' },
    { id: 5, title: 'Відкрити вікно — вдихнути свіже повітря', xp: 60, completed: false, emoji: '🌬️', color: '#06b6d4', category: 'morning' },
    { id: 6, title: 'Написати короткий план дня', xp: 100, completed: false, emoji: '✍️', color: '#3b82f6', category: 'morning' },
    { id: 7, title: 'Послухати 1 мотиваційне відео', xp: 80, completed: false, emoji: '🎬', color: '#8b5cf6', category: 'morning' },
    { id: 8, title: 'Зробити одну добру справу для себе', xp: 100, completed: false, emoji: '💝', color: '#ec4899', category: 'morning' },
    { id: 9, title: 'Послухати пісню, що піднімає настрій', xp: 60, completed: false, emoji: '🎵', color: '#3b82f6', category: 'morning' },
    { id: 10, title: 'Подякувати собі за вчорашній день', xp: 80, completed: false, emoji: '💫', color: '#f59e0b', category: 'morning' },

    // 💻 Розвиток і фокус
    { id: 11, title: 'Прочитати 1 корисну статтю', xp: 100, completed: false, emoji: '📖', color: '#8b5cf6', category: 'development' },
    { id: 12, title: 'Вивчити нове слово або факт', xp: 80, completed: false, emoji: '🎓', color: '#3b82f6', category: 'development' },
    { id: 13, title: 'Вимкнути сповіщення на годину', xp: 100, completed: false, emoji: '🔕', color: '#6b7280', category: 'development' },
    { id: 14, title: 'Виконати найважче завдання першим', xp: 150, completed: false, emoji: '✅', color: '#10b981', category: 'development' },
    { id: 15, title: 'Зробити 15-хвилинну перерву без екранів', xp: 100, completed: false, emoji: '☕', color: '#8b5cf6', category: 'development' },
    { id: 16, title: 'Навести лад у файлах / робочому столі', xp: 80, completed: false, emoji: '🗂️', color: '#8b5cf6', category: 'development' },
    { id: 17, title: 'Перевірити список цілей', xp: 100, completed: false, emoji: '🎯', color: '#ef4444', category: 'development' },
    { id: 18, title: 'Зробити нотатку про щось цікаве', xp: 80, completed: false, emoji: '💡', color: '#f59e0b', category: 'development' },
    { id: 19, title: 'Слухати спокійну музику під час роботи', xp: 60, completed: false, emoji: '🎵', color: '#3b82f6', category: 'development' },
    { id: 20, title: 'Виконати завдання без прокрастинації', xp: 150, completed: false, emoji: '⏳', color: '#ef4444', category: 'development' },

    // 🧘 Баланс і спокій
    { id: 21, title: 'Подихати 10 глибоких вдихів', xp: 80, completed: false, emoji: '🫁', color: '#06b6d4', category: 'balance' },
    { id: 22, title: 'Посидіти у тиші 5 хв', xp: 100, completed: false, emoji: '🤫', color: '#8b5cf6', category: 'balance' },
    { id: 23, title: 'Написати в щоденнику "як я почуваюся"', xp: 100, completed: false, emoji: '✍️', color: '#8b5cf6', category: 'balance' },
    { id: 24, title: 'Зробити коротку прогулянку', xp: 100, completed: false, emoji: '🚶', color: '#10b981', category: 'balance' },
    { id: 25, title: 'Не скролити соцмережі після 21:00', xp: 120, completed: false, emoji: '📵', color: '#6b7280', category: 'balance' },
    { id: 26, title: 'Провести вечір без телевізора', xp: 100, completed: false, emoji: '📺', color: '#6b7280', category: 'balance' },
    { id: 27, title: 'Відкласти телефон на 1 годину', xp: 120, completed: false, emoji: '📱', color: '#6b7280', category: 'balance' },
    { id: 28, title: 'Запалити свічку або ароматичну паличку', xp: 80, completed: false, emoji: '🕯️', color: '#f59e0b', category: 'balance' },
    { id: 29, title: 'Побути в моменті — без думок про роботу', xp: 100, completed: false, emoji: '🧘', color: '#8b5cf6', category: 'balance' },
    { id: 30, title: 'Медитація перед сном', xp: 120, completed: false, emoji: '🌙', color: '#8b5cf6', category: 'balance' },

    // 🍽 Побут і турбота
    { id: 31, title: 'Приготувати нову страву', xp: 150, completed: false, emoji: '🍲', color: '#ef4444', category: 'household' },
    { id: 32, title: 'Почистити холодильник', xp: 100, completed: false, emoji: '🧊', color: '#06b6d4', category: 'household' },
    { id: 33, title: 'Полити квіти', xp: 80, completed: false, emoji: '🌿', color: '#10b981', category: 'household' },
    { id: 34, title: 'Викинути 5 непотрібних речей', xp: 100, completed: false, emoji: '🗑️', color: '#6b7280', category: 'household' },
    { id: 35, title: 'Помити дзеркало або вікно', xp: 80, completed: false, emoji: '🪟', color: '#06b6d4', category: 'household' },
    { id: 36, title: 'Зробити "чисту годину" (музика + прибирання)', xp: 120, completed: false, emoji: '🎶', color: '#8b5cf6', category: 'household' },
    { id: 37, title: 'Приготувати обід на завтра', xp: 100, completed: false, emoji: '🍱', color: '#ef4444', category: 'household' },
    { id: 38, title: 'Переставити меблі / освіжити простір', xp: 120, completed: false, emoji: '🪑', color: '#8b5cf6', category: 'household' },
    { id: 39, title: 'Винести сміття без нагадувань', xp: 80, completed: false, emoji: '😅', color: '#6b7280', category: 'household' },
    { id: 40, title: 'Попрати білизну або постіль', xp: 100, completed: false, emoji: '👕', color: '#3b82f6', category: 'household' },

    // 💬 Соціальні міні-квести
    { id: 41, title: 'Відправити комусь мем', xp: 60, completed: false, emoji: '🤣', color: '#f59e0b', category: 'social' },
    { id: 42, title: 'Сказати "дякую" 3 людям сьогодні', xp: 100, completed: false, emoji: '🙏', color: '#f59e0b', category: 'social' },
    { id: 43, title: 'Написати приємне повідомлення', xp: 80, completed: false, emoji: '💌', color: '#ec4899', category: 'social' },
    { id: 44, title: 'Підтримати друга', xp: 100, completed: false, emoji: '🤝', color: '#10b981', category: 'social' },
    { id: 45, title: 'Не сперечатись сьогодні в інтернеті', xp: 100, completed: false, emoji: '🙃', color: '#6b7280', category: 'social' },
    { id: 46, title: 'Відповісти на всі повідомлення', xp: 80, completed: false, emoji: '📩', color: '#06b6d4', category: 'social' },
    { id: 47, title: 'Написати людині, з якою давно не говорив', xp: 100, completed: false, emoji: '👋', color: '#8b5cf6', category: 'social' },
    { id: 48, title: 'Вийти з чату, який не приносить радості', xp: 80, completed: false, emoji: '🚪', color: '#6b7280', category: 'social' },
    { id: 49, title: 'Зателефонувати рідним', xp: 100, completed: false, emoji: '☎️', color: '#06b6d4', category: 'social' },
    { id: 50, title: 'Подарувати комусь усмішку', xp: 60, completed: false, emoji: '😁', color: '#f59e0b', category: 'social' },

    // 💡 Мікро-продуктивність
    { id: 51, title: 'Скласти список покупок', xp: 60, completed: false, emoji: '🛒', color: '#10b981', category: 'productivity' },
    { id: 52, title: 'Виконати 1 задачу, яку відкладав', xp: 120, completed: false, emoji: '✅', color: '#10b981', category: 'productivity' },
    { id: 53, title: 'Розібрати 1 теку на комп\'ютері', xp: 100, completed: false, emoji: '📁', color: '#8b5cf6', category: 'productivity' },
    { id: 54, title: 'Зробити резервну копію фото', xp: 80, completed: false, emoji: '☁️', color: '#06b6d4', category: 'productivity' },
    { id: 55, title: 'Синхронізувати нотатки', xp: 80, completed: false, emoji: '📝', color: '#8b5cf6', category: 'productivity' },
    { id: 56, title: 'Написати "To-Do" на завтра', xp: 80, completed: false, emoji: '📋', color: '#3b82f6', category: 'productivity' },
    { id: 57, title: 'Підрахувати витрати за день', xp: 80, completed: false, emoji: '💵', color: '#10b981', category: 'productivity' },
    { id: 58, title: 'Запланувати 1 маленьку ціль', xp: 100, completed: false, emoji: '🎯', color: '#ef4444', category: 'productivity' },
    { id: 59, title: 'Змінити пароль, який забував', xp: 80, completed: false, emoji: '😅', color: '#6b7280', category: 'productivity' },
    { id: 60, title: 'Видалити непотрібний додаток', xp: 60, completed: false, emoji: '🗑️', color: '#6b7280', category: 'productivity' },

    // 🌙 Вечірній рефлекс
    { id: 61, title: 'Підбити підсумки дня', xp: 100, completed: false, emoji: '📊', color: '#3b82f6', category: 'evening' },
    { id: 62, title: 'Записати 3 вдячності', xp: 100, completed: false, emoji: '🙏', color: '#f59e0b', category: 'evening' },
    { id: 63, title: 'Зробити теплий чай перед сном', xp: 80, completed: false, emoji: '🍵', color: '#8b5cf6', category: 'evening' },
    { id: 64, title: 'Провітрити кімнату', xp: 60, completed: false, emoji: '🌬️', color: '#06b6d4', category: 'evening' },
    { id: 65, title: 'Вимкнути світло до 23:00', xp: 100, completed: false, emoji: '🌌', color: '#8b5cf6', category: 'evening' },
    { id: 66, title: 'Записати, що вдалося сьогодні', xp: 100, completed: false, emoji: '✍️', color: '#8b5cf6', category: 'evening' },
    { id: 67, title: 'Подумати, що зроблю завтра краще', xp: 80, completed: false, emoji: '💭', color: '#3b82f6', category: 'evening' },
    { id: 68, title: 'Відкласти телефон мінімум за 30 хв до сну', xp: 120, completed: false, emoji: '📱', color: '#6b7280', category: 'evening' },
    { id: 69, title: 'Подивитись зорі', xp: 80, completed: false, emoji: '✨', color: '#8b5cf6', category: 'evening' },
    { id: 70, title: 'Лягти спати з посмішкою', xp: 100, completed: false, emoji: '😴', color: '#8b5cf6', category: 'evening' },
  ]);

  // Досягнення
  const achievements = [
    // 🏅 Базові досягнення
    { id: 1, title: 'Перший крок', description: 'Завершити перший щоденний квест', icon: '👶', unlocked: true, color: '#f59e0b' },
    { id: 2, title: 'Перший рівень', description: 'Досягти 1 рівня', icon: '🏅', unlocked: true, color: '#f59e0b' },
    { id: 3, title: 'Перша ціль', description: 'Завершити першу велику ціль', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 4, title: 'Перші 100 XP', description: 'Заробити перші 100 XP', icon: '💯', unlocked: false, color: '#10b981' },

    // 🔥 Серії та streak
    { id: 5, title: '3 дні поспіль', description: 'Виконувати щоденні квести 3 дні поспіль', icon: '🔥', unlocked: false, color: '#ef4444' },
    { id: 6, title: '7 днів поспіль', description: 'Streak 7 днів', icon: '🔥', unlocked: false, color: '#ef4444' },
    { id: 7, title: '14 днів поспіль', description: 'Streak 14 днів', icon: '🔥', unlocked: false, color: '#ef4444' },
    { id: 8, title: '30 днів поспіль', description: 'Streak 30 днів', icon: '🔥', unlocked: false, color: '#ef4444' },
    { id: 9, title: '100 днів поспіль', description: 'Streak 100 днів', icon: '🔥', unlocked: false, color: '#ef4444' },

    // 🎯 Кількість квестів
    { id: 10, title: '10 квестів', description: 'Завершити 10 щоденних квестів', icon: '📝', unlocked: false, color: '#8b5cf6' },
    { id: 11, title: '50 квестів', description: 'Завершити 50 щоденних квестів', icon: '📝', unlocked: false, color: '#8b5cf6' },
    { id: 12, title: '100 квестів', description: 'Завершити 100 щоденних квестів', icon: '📝', unlocked: false, color: '#8b5cf6' },
    { id: 13, title: '250 квестів', description: 'Завершити 250 щоденних квестів', icon: '📝', unlocked: false, color: '#8b5cf6' },
    { id: 14, title: '500 квестів', description: 'Завершити 500 щоденних квестів', icon: '📝', unlocked: false, color: '#8b5cf6' },
    { id: 15, title: '1000 квестів', description: 'Завершити 1000 щоденних квестів', icon: '📝', unlocked: false, color: '#8b5cf6' },

    // 🎯 Великі цілі
    { id: 16, title: 'Перша велика ціль', description: 'Завершити першу велику ціль', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 17, title: '5 великих цілей', description: 'Завершити 5 великих цілей', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 18, title: '10 великих цілей', description: 'Завершити 10 великих цілей', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 19, title: '20 великих цілей', description: 'Завершити 20 великих цілей', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 20, title: 'Майстер цілей', description: 'Завершити 50 великих цілей', icon: '🎯', unlocked: false, color: '#3b82f6' },

    // 💎 Рівні
    { id: 21, title: 'Рівень 5', description: 'Досягти 5 рівня', icon: '⭐', unlocked: false, color: '#f59e0b' },
    { id: 22, title: 'Рівень 10', description: 'Досягти 10 рівня', icon: '⭐', unlocked: false, color: '#f59e0b' },
    { id: 23, title: 'Рівень 25', description: 'Досягти 25 рівня', icon: '⭐', unlocked: false, color: '#f59e0b' },
    { id: 24, title: 'Рівень 50', description: 'Досягти 50 рівня', icon: '⭐', unlocked: false, color: '#f59e0b' },
    { id: 25, title: 'Рівень 100', description: 'Досягти 100 рівня', icon: '⭐', unlocked: false, color: '#f59e0b' },

    // 💰 XP досягнення
    { id: 26, title: '500 XP', description: 'Заробити 500 XP', icon: '💰', unlocked: false, color: '#10b981' },
    { id: 27, title: '1000 XP', description: 'Заробити 1000 XP', icon: '💰', unlocked: false, color: '#10b981' },
    { id: 28, title: '5000 XP', description: 'Заробити 5000 XP', icon: '💰', unlocked: false, color: '#10b981' },
    { id: 29, title: '10000 XP', description: 'Заробити 10000 XP', icon: '💰', unlocked: false, color: '#10b981' },
    { id: 30, title: '50000 XP', description: 'Заробити 50000 XP', icon: '💰', unlocked: false, color: '#10b981' },
    { id: 31, title: '100000 XP', description: 'Заробити 100000 XP', icon: '💰', unlocked: false, color: '#10b981' },

    // 🎨 Категорії
    { id: 32, title: 'Кар\'єрист', description: 'Завершити 10 квестів кар\'єри', icon: '💼', unlocked: false, color: '#6b7280' },
    { id: 33, title: 'Фінансист', description: 'Завершити 10 квестів фінансів', icon: '💰', unlocked: false, color: '#10b981' },
    { id: 34, title: 'Здоров\'я', description: 'Завершити 10 квестів здоров\'я', icon: '💪', unlocked: false, color: '#ef4444' },
    { id: 35, title: 'Мандрівник', description: 'Завершити 10 квестів подорожей', icon: '✈️', unlocked: false, color: '#3b82f6' },
    { id: 36, title: 'Романтик', description: 'Завершити 10 квестів стосунків', icon: '💖', unlocked: false, color: '#ec4899' },
    { id: 37, title: 'Творець', description: 'Завершити 10 квестів хобі', icon: '🎨', unlocked: false, color: '#8b5cf6' },
    { id: 38, title: 'Легенда', description: 'Завершити легендарний квест', icon: '⭐', unlocked: false, color: '#f59e0b' },
    { id: 39, title: 'Розвиток', description: 'Завершити 10 квестів особистісного росту', icon: '🌱', unlocked: false, color: '#10b981' },
    { id: 40, title: 'Домовий', description: 'Завершити 10 квестів організації житла', icon: '🏠', unlocked: false, color: '#06b6d4' },
    { id: 41, title: 'Мислитель', description: 'Завершити 10 квестів мозку', icon: '🧩', unlocked: false, color: '#8b5cf6' },
    { id: 42, title: 'Соціальний', description: 'Завершити 10 квестів соціальних зв\'язків', icon: '🤝', unlocked: false, color: '#3b82f6' },
    { id: 43, title: 'Креатив', description: 'Завершити 10 квестів творчості', icon: '🎭', unlocked: false, color: '#ec4899' },

    // 🌅 Щоденні категорії
    { id: 44, title: 'Ранкова пташка', description: 'Завершити 20 ранкових квестів', icon: '🌅', unlocked: false, color: '#f59e0b' },
    { id: 45, title: 'Розвиток', description: 'Завершити 20 квестів розвитку', icon: '💻', unlocked: false, color: '#3b82f6' },
    { id: 46, title: 'Баланс', description: 'Завершити 20 квестів балансу', icon: '🧘', unlocked: false, color: '#8b5cf6' },
    { id: 47, title: 'Побут', description: 'Завершити 20 побутових квестів', icon: '🍽️', unlocked: false, color: '#10b981' },
    { id: 48, title: 'Соціальний', description: 'Завершити 20 соціальних квестів', icon: '💬', unlocked: false, color: '#06b6d4' },
    { id: 49, title: 'Продуктивність', description: 'Завершити 20 квестів продуктивності', icon: '💡', unlocked: false, color: '#f59e0b' },
    { id: 50, title: 'Вечірній', description: 'Завершити 20 вечірніх квестів', icon: '🌙', unlocked: false, color: '#8b5cf6' },

    // 🏆 Спеціальні досягнення
    { id: 51, title: 'Перфекціоніст', description: 'Завершити всі щоденні квести за день', icon: '💯', unlocked: false, color: '#10b981' },
    { id: 52, title: 'Швидкий', description: 'Завершити 10 квестів за 1 день', icon: '⚡', unlocked: false, color: '#f59e0b' },
    { id: 53, title: 'Витривалий', description: 'Завершити 50 квестів за тиждень', icon: '💪', unlocked: false, color: '#ef4444' },
    { id: 54, title: 'Майстер', description: 'Завершити 100 квестів за місяць', icon: '👑', unlocked: false, color: '#8b5cf6' },
    { id: 55, title: 'Легенда', description: 'Завершити 1000 квестів за рік', icon: '🏆', unlocked: false, color: '#f59e0b' },

    // 🎯 Комбо досягнення
    { id: 56, title: 'Дубль', description: 'Завершити 2 квести одночасно', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 57, title: 'Трійка', description: 'Завершити 3 квести одночасно', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 58, title: 'П\'ятірка', description: 'Завершити 5 квестів одночасно', icon: '🎯', unlocked: false, color: '#3b82f6' },
    { id: 59, title: 'Десятка', description: 'Завершити 10 квестів одночасно', icon: '🎯', unlocked: false, color: '#3b82f6' },

    // 🌟 Рідкісні досягнення
    { id: 60, title: 'Перший день', description: 'Використати додаток вперше', icon: '🌟', unlocked: true, color: '#f59e0b' },
    { id: 61, title: 'Тиждень', description: 'Використовувати додаток 7 днів', icon: '🌟', unlocked: false, color: '#8b5cf6' },
    { id: 62, title: 'Місяць', description: 'Використовувати додаток 30 днів', icon: '🌟', unlocked: false, color: '#8b5cf6' },
    { id: 63, title: 'Рік', description: 'Використовувати додаток 365 днів', icon: '🌟', unlocked: false, color: '#8b5cf6' },
    { id: 64, title: 'Ветеран', description: 'Використовувати додаток 1000 днів', icon: '🌟', unlocked: false, color: '#8b5cf6' },

    // 🎨 Творчі досягнення
    { id: 65, title: 'Художник', description: 'Завершити артбук квест', icon: '🎨', unlocked: false, color: '#ec4899' },
    { id: 66, title: 'Музикант', description: 'Завершити музичний квест', icon: '🎵', unlocked: false, color: '#8b5cf6' },
    { id: 67, title: 'Фотограф', description: 'Завершити фото квест', icon: '📸', unlocked: false, color: '#3b82f6' },
    { id: 68, title: 'Блогер', description: 'Завершити блог квест', icon: '📝', unlocked: false, color: '#10b981' },
    { id: 69, title: 'Сценарист', description: 'Завершити сценарій квест', icon: '🎬', unlocked: false, color: '#f59e0b' },
    { id: 70, title: 'Конкурсант', description: 'Завершити конкурс квест', icon: '🏆', unlocked: false, color: '#ef4444' },
    { id: 71, title: 'Куратор', description: 'Завершити виставку квест', icon: '🖼️', unlocked: false, color: '#06b6d4' },

    // 🎯 Фінальні досягнення
    { id: 72, title: 'Універсал', description: 'Завершити квест з кожної категорії', icon: '🎯', unlocked: false, color: '#8b5cf6' },
    { id: 73, title: 'Майстер всіх', description: 'Завершити 5 квестів з кожної категорії', icon: '👑', unlocked: false, color: '#f59e0b' },
    { id: 74, title: 'Легенда життя', description: 'Завершити всі великі цілі', icon: '🏆', unlocked: false, color: '#ef4444' },
    { id: 75, title: 'Бог прогресу', description: 'Досягти максимального рівня', icon: '👑', unlocked: false, color: '#8b5cf6' },
  ];

  const handleCharacterSelect = (character: any) => {
    setSelectedCharacter(character.emoji);
    setUserProfile(prev => ({ ...prev, avatar: character.emoji }));
    setShowCharacterModal(false);
  };

  const handleQuestComplete = (questId: number) => {
    setDailyQuests(prevQuests =>
      prevQuests.map(quest => {
        if (quest.id === questId && !quest.completed) {
          // Додаємо XP до загального рахунку
          setUserProfile(prev => ({ ...prev, totalXP: prev.totalXP + quest.xp }));
          Alert.alert('Квест завершено!', `Ви отримали +${quest.xp} XP за виконання завдання!`);
          
          return { ...quest, completed: true };
        }
        return quest;
      })
    );
  };

  const openQuestDetails = (quest: any) => {
    setSelectedQuest(quest);
    setShowQuestDetailsModal(true);
  };

  const toggleQuestStep = (questId: string, stepId: string) => {
    setMainQuests(prevQuests => 
      prevQuests.map(quest => {
        if (quest.id === questId) {
          const updatedSteps = quest.steps.map(step => 
            step.id === stepId && !step.completed
              ? { ...step, completed: true }
              : step
          );
          
          // Розраховуємо новий прогрес
          const completedSteps = updatedSteps.filter(step => step.completed).length;
          const progress = Math.round((completedSteps / quest.steps.length) * 100);
          
          // Додаємо XP за виконання завдання
          const step = quest.steps.find(s => s.id === stepId);
          if (step && !step.completed) {
            const stepXP = 30; // Фіксовано 30 XP за кожне міні-завдання
            setUserProfile(prev => ({ ...prev, totalXP: prev.totalXP + stepXP }));
            
            // Перевіряємо, чи квест повністю завершений
            // Використовуємо updatedSteps замість quest.steps
            const newCompletedSteps = updatedSteps.filter(step => step.completed).length;
            if (newCompletedSteps === quest.steps.length && !completedQuests.has(questId)) {
              // Додаємо бонус за повне проходження квесту
              setCompletedQuests(prev => new Set(prev).add(questId));
              setTimeout(() => {
                const questBonus = quest.xp || 1000; // Використовуємо фактичне значення XP квесту
                setUserProfile(prev => ({ ...prev, totalXP: prev.totalXP + questBonus }));
              }, 100); // Невелика затримка, щоб XP зарахувався окремо
            }
          }
          
          const updatedQuest = {
            ...quest,
            steps: updatedSteps,
            progress: progress
          };
          
          // Оновлюємо selectedQuest, якщо це поточний квест
          if (selectedQuest && selectedQuest.id === questId) {
            setSelectedQuest(updatedQuest);
          }
          
          return updatedQuest;
        }
        return quest;
      })
    );
  };

  // Функція для скидання всіх квестів
  const resetAllQuests = () => {
    setMainQuests(prev => prev.map(quest => ({
      ...quest,
      progress: 0,
      steps: quest.steps.map(step => ({ ...step, completed: false }))
    })));
    setCompletedQuests(new Set()); // Скидаємо стан завершених квестів
  };

  const getQuestProgress = (quest: any) => {
    const completedSteps = quest.steps.filter((step: any) => step.completed).length;
    return Math.round((completedSteps / quest.steps.length) * 100);
  };

  const getQuestTotalXP = (quest: any) => {
    // Показуємо бонус за завершення квесту
    // Міні-завдання дають XP окремо
    return quest.xp || 1000;
  };

  // Функція для фільтрації квестів за категорією
  const getFilteredQuests = () => {
    if (selectedCategory === 'all') {
      return mainQuests;
    }
    return mainQuests.filter(quest => quest.category === selectedCategory);
  };

  // Функція для отримання назви категорії
  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'all': 'Всі',
      'career': '💼 Кар\'єра',
      'finance': '💰 Фінанси',
      'health': '💪 Здоров\'я',
      'travel': '✈️ Подорожі',
      'relationships': '💖 Стосунки',
      'hobby': '🎨 Хобі',
      'legendary': '⭐ Легендарні',
      'growth': '🌱 Ріст',
      'home': '🏠 Дім',
      'brain': '🧩 Мозок',
      'social': '🤝 Соціальні',
      'creative': '🎭 Творчість'
    };
    return categoryNames[category] || category;
  };

  // Функція для фільтрації щоденних квестів за категорією
  const getFilteredDailyQuests = () => {
    if (selectedDailyCategory === 'all') {
      return dailyQuests;
    }
    return dailyQuests.filter(quest => quest.category === selectedDailyCategory);
  };

  // Функція для отримання назви категорії щоденних квестів
  const getDailyCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      'all': 'Всі квести',
      'morning': '☕ Ранковий старт',
      'development': '💻 Розвиток і фокус',
      'balance': '🧘 Баланс і спокій',
      'household': '🍽 Побут і турбота',
      'social': '💬 Соціальні міні-квести',
      'productivity': '💡 Мікро-продуктивність',
      'evening': '🌙 Вечірній рефлекс'
    };
    return categoryNames[category] || category;
  };


  const getThemeColors = () => {
    switch (theme) {
      case 'light':
        return {
          background: '#ffffff',
          cardBackground: '#f8fafc',
          text: '#1e293b',
          textSecondary: '#64748b',
          primary: '#3b82f6',
          primaryGradient: ['#60a5fa', '#06b6d4'],
          border: '#e2e8f0',
          shadow: 'rgba(0, 0, 0, 0.1)',
          glassBackground: 'rgba(255, 255, 255, 0.7)',
        };
      case 'dark':
        return {
          background: '#0f172a',
          cardBackground: '#1e293b',
          text: '#f1f5f9',
          textSecondary: '#94a3b8',
          primary: '#06b6d4',
          primaryGradient: ['#06b6d4', '#3b82f6'],
          border: '#334155',
          shadow: 'rgba(6, 182, 212, 0.2)',
          glassBackground: 'rgba(30, 41, 59, 0.7)',
        };
      default: // gray
        return {
          background: '#e5e7eb',
          cardBackground: '#f9fafb',
          text: '#1f2937',
          textSecondary: '#6b7280',
          primary: '#3b82f6',
          primaryGradient: ['#60a5fa', '#06b6d4'],
          border: '#d1d5db',
          shadow: 'rgba(0, 0, 0, 0.08)',
          glassBackground: 'rgba(255, 255, 255, 0.7)',
        };
    }
  };

  const themeColors = getThemeColors();

  const renderHomeScreen = () => (
    <ScrollView style={[styles.screen, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#f3f4f6', '#e5e7eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { backgroundColor: 'transparent' }]}
      >
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => setShowCharacterModal(true)}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.heroEmoji}>{selectedCharacter}</Text>
            <View style={[styles.levelRing, { borderColor: themeColors.primary }]}>
              <Text style={[styles.levelText, { color: themeColors.primary }]}>
                {getLevel(userProfile.totalXP)}
              </Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.heroName, { color: themeColors.text }]}>
              Привіт, {userProfile.name}! 👋
            </Text>
            <Text style={[styles.heroLevel, { color: themeColors.textSecondary }]}>
              Рівень {getLevel(userProfile.totalXP)} 🌟 — {getXPInCurrentLevel(userProfile.totalXP)} / {getXPNeededForCurrentLevel(userProfile.totalXP)} XP
            </Text>
            <Text style={[styles.moodText, { color: themeColors.textSecondary }]}>
              {userProfile.mood} {userProfile.moodText}
            </Text>
            <Text style={[styles.rewardText, { color: themeColors.primary }]}>
              {getLevelRewards(getLevel(userProfile.totalXP)).title} — {getLevelRewards(getLevel(userProfile.totalXP)).reward}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* XP Progress */}
        <View style={styles.xpSection}>
          <View style={[styles.xpProgressBar, { backgroundColor: themeColors.border }]}>
            <LinearGradient
              colors={themeColors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.xpProgressFill, { width: `${getLevelProgress(userProfile.totalXP)}%` }]}
            />
          </View>
          <Text style={[styles.motivationalMessage, { color: themeColors.textSecondary }]}>
            {getMotivationalMessage()}
          </Text>
        </View>

        {/* Achievements Button */}
        <TouchableOpacity 
          style={[styles.achievementsButton, { backgroundColor: themeColors.primary }]}
          onPress={() => setShowAchievementsModal(true)}
        >
          <Text style={[styles.achievementsButtonText, { color: '#ffffff' }]}>🏅 Досягнення</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Quests */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>🎯 Великі цілі</Text>
        
        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.categoryFilters}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {['all', 'career', 'finance', 'health', 'travel', 'relationships', 'hobby', 'legendary', 'growth', 'home', 'brain', 'social', 'creative'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilter,
                { 
                  backgroundColor: selectedCategory === category ? themeColors.primary : themeColors.background,
                  borderColor: themeColors.border
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryFilterText,
                { color: selectedCategory === category ? '#ffffff' : themeColors.text }
              ]}>
                {getCategoryName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {getFilteredQuests().map((quest) => {
          const progress = getQuestProgress(quest);
          const completedSteps = quest.steps.filter(step => step.completed).length;
          
          return (
            <TouchableOpacity
              key={quest.id}
              style={[styles.questCard, { backgroundColor: themeColors.background }]}
              onPress={() => openQuestDetails(quest)}
            >
              <View style={[styles.questIconContainer, { backgroundColor: quest.color }]}>
                <Text style={styles.questEmoji}>{quest.icon}</Text>
              </View>
              <View style={styles.questInfo}>
                <Text style={[styles.questTitle, { color: themeColors.text }]}>
                  {quest.title}
                  {progress === 100 ? ' 🎉' : ''}
                </Text>
                <Text style={[styles.questDescription, { color: themeColors.textSecondary }]}>{quest.description}</Text>
                <Text style={[styles.questProgressText, { color: themeColors.textSecondary }]}>
                  {completedSteps} / {quest.steps.length} завдань
                </Text>
                <View style={[styles.questProgressBar, { backgroundColor: themeColors.border }]}>
                  <View style={[styles.questProgressFill, { 
                    backgroundColor: quest.color, 
                    width: `${progress}%` 
                  }]} />
                </View>
              </View>
              <View style={[styles.questXP, { backgroundColor: quest.color }]}>
                <Text style={[styles.questXPText, { color: '#ffffff' }]}>+{quest.xp} XP</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderDailyQuestsScreen = () => (
    <ScrollView style={[styles.screen, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>Щоденні завдання 🌞</Text>
        <View style={[styles.dailyProgress, { backgroundColor: themeColors.primary }]}>
          <Text style={[styles.dailyProgressText, { color: '#ffffff' }]}>
            Прогрес сьогодні: 60%
          </Text>
        </View>
      </View>

      {/* Daily Quests */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>✅ Щоденні квести</Text>
        
        {/* Daily Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.categoryFilters}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {['all', 'morning', 'development', 'balance', 'household', 'social', 'productivity', 'evening'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilter,
                { 
                  backgroundColor: selectedDailyCategory === category ? themeColors.primary : themeColors.background,
                  borderColor: themeColors.border
                }
              ]}
              onPress={() => setSelectedDailyCategory(category)}
            >
              <Text style={[
                styles.categoryFilterText,
                { color: selectedDailyCategory === category ? '#ffffff' : themeColors.text }
              ]}>
                {getDailyCategoryName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {getFilteredDailyQuests().map((quest) => (
          <TouchableOpacity
            key={quest.id}
            style={[
              styles.dailyQuestCard, 
              { 
                backgroundColor: quest.completed ? themeColors.cardBackground : themeColors.background,
                opacity: quest.completed ? 0.7 : 1,
                transform: [{ scale: quest.completed ? 0.98 : 1 }]
              }
            ]}
            onPress={() => handleQuestComplete(quest.id)}
            disabled={quest.completed}
          >
            <View style={[
              styles.dailyQuestIconContainer, 
              { 
                backgroundColor: quest.completed ? '#10b981' : quest.color,
                opacity: quest.completed ? 0.8 : 1
              }
            ]}>
              <Text style={styles.dailyQuestEmoji}>{quest.emoji}</Text>
            </View>
            <View style={styles.dailyQuestInfo}>
              <Text style={[
                styles.dailyQuestTitle, 
                { 
                  color: quest.completed ? themeColors.textSecondary : themeColors.text,
                  textDecorationLine: quest.completed ? 'line-through' : 'none'
                }
              ]}>{quest.title}</Text>
            </View>
            <View style={[
              styles.dailyQuestXP, 
              { 
                backgroundColor: quest.completed ? '#10b981' : quest.color,
                opacity: quest.completed ? 0.8 : 1
              }
            ]}>
              <Text style={[styles.dailyQuestXPText, { color: '#ffffff' }]}>
                {quest.completed ? '✅' : `+${quest.xp} XP`}
              </Text>
            </View>
            <Text style={styles.dailyQuestStatus}>{quest.completed ? '✅' : '⏳'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderStatsScreen = () => (
    <ScrollView style={[styles.screen, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>📊 Статистика</Text>
      </View>

      {/* Stats Cards */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <View style={[styles.statCard, { backgroundColor: themeColors.background }]}>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{userProfile.totalXP}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Загальний XP</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.background }]}>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{userProfile.streak}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Днів поспіль</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: themeColors.background }]}>
          <Text style={[styles.statValue, { color: themeColors.primary }]}>{getLevel(userProfile.totalXP)}</Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Поточний рівень</Text>
        </View>
      </View>

      {/* Level Info */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>📈 Детальна інформація про рівень</Text>
        <View style={[styles.levelInfoCard, { backgroundColor: themeColors.background }]}>
          <Text style={[styles.levelInfoTitle, { color: themeColors.text }]}>
            Рівень {getLevel(userProfile.totalXP)} — {getLevelRewards(getLevel(userProfile.totalXP)).title}
          </Text>
          <Text style={[styles.levelInfoReward, { color: themeColors.primary }]}>
            Нагорода: {getLevelRewards(getLevel(userProfile.totalXP)).reward}
          </Text>
          <Text style={[styles.levelInfoDescription, { color: themeColors.textSecondary }]}>
            {getLevelRewards(getLevel(userProfile.totalXP)).description}
          </Text>
          <View style={[styles.levelInfoProgress, { backgroundColor: themeColors.border }]}>
            <View style={[styles.levelInfoProgressFill, { 
              backgroundColor: themeColors.primary, 
              width: `${getLevelProgress(userProfile.totalXP)}%` 
            }]} />
          </View>
          <Text style={[styles.levelInfoXP, { color: themeColors.textSecondary }]}>
            {getXPInCurrentLevel(userProfile.totalXP)} / {getXPNeededForCurrentLevel(userProfile.totalXP)} XP
          </Text>
        </View>
      </View>

      {/* Achievements */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>🏅 Досягнення</Text>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={[styles.achievementCard, { 
            backgroundColor: achievement.unlocked ? themeColors.background : themeColors.border 
          }]}>
            <View style={[styles.achievementIconContainer, { backgroundColor: achievement.color }]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[styles.achievementTitle, { 
                color: achievement.unlocked ? themeColors.text : themeColors.textSecondary 
              }]}>{achievement.title}</Text>
              <Text style={[styles.achievementDescription, { 
                color: achievement.unlocked ? themeColors.textSecondary : themeColors.textSecondary 
              }]}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSettingsScreen = () => (
    <ScrollView style={[styles.screen, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.cardBackground }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>⚙️ Налаштування</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Керуйте додатком та своїм прогресом</Text>
      </View>

      {/* Profile Section */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>👤 Профіль</Text>
        </View>
        
        <SettingsItem
          icon="✏️"
          title="Змінити ім'я"
          subtitle="Редагувати профіль"
          onPress={() => setShowProfileModal(true)}
          themeColors={themeColors}
        />
      </View>

      {/* Notifications Section */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>🔔 Сповіщення</Text>
        </View>
        
        <ToggleItem
          icon="🔔"
          title="Сповіщення"
          subtitle="Push повідомлення"
          value={notifications}
          onValueChange={(value) => {
            console.log('Зміна сповіщень:', value);
            setNotifications(value);
          }}
          themeColors={themeColors}
        />
        
        <ToggleItem
          icon="📊"
          title="Нагадування про прогрес"
          subtitle="Щоденні нагадування"
          value={progressReminders}
          onValueChange={(value) => {
            console.log('Зміна нагадувань про прогрес:', value);
            setProgressReminders(value);
          }}
          themeColors={themeColors}
        />
        
        <ToggleItem
          icon="🔊"
          title="Звук"
          subtitle="Звукові сповіщення"
          value={soundEnabled}
          onValueChange={(value) => {
            console.log('Зміна звуку:', value);
            setSoundEnabled(value);
          }}
          themeColors={themeColors}
        />
        
        <ToggleItem
          icon="📳"
          title="Вібрація"
          subtitle="Вібрація при сповіщеннях"
          value={vibrationsEnabled}
          onValueChange={(value) => {
            console.log('Зміна вібрації:', value);
            setVibrationsEnabled(value);
          }}
          themeColors={themeColors}
        />
      </View>

      {/* Design Section */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>🎨 Дизайн і тема</Text>
        </View>
        
        <SettingsItem
          icon="🎨"
          title="Тема додатку"
          subtitle="Сіра, світла, темна"
          onPress={() => setShowSettingsModal(true)}
          themeColors={themeColors}
        />
        
        <ToggleItem
          icon="✨"
          title="Анімації"
          subtitle="Мікроанімації та переходи"
          value={animationsEnabled}
          onValueChange={setAnimationsEnabled}
          themeColors={themeColors}
        />
      </View>

      {/* Data Management Section */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>💾 Управління даними</Text>
        </View>
        
        <SettingsItem
          icon="💾"
          title="Зберегти прогрес"
          subtitle="Зберегти всі дані локально"
          onPress={() => {
            saveUserData();
            Alert.alert('Збережено!', 'Ваш прогрес збережено успішно.');
          }}
          themeColors={themeColors}
        />
        
        <SettingsItem
          icon="📥"
          title="Завантажити прогрес"
          subtitle="Відновити збережені дані"
          onPress={() => {
            loadUserData();
            Alert.alert('Завантажено!', 'Ваш прогрес відновлено з останнього збереження.');
          }}
          themeColors={themeColors}
        />
      </View>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>📣 Про застосунок</Text>
        </View>
        
        <View style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemIcon}>ℹ️</Text>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: themeColors.text }]}>Версія: 1.0.1</Text>
              <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>Поточна версія додатку</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}>
          <View style={styles.itemLeft}>
            <Text style={styles.itemIcon}>💌</Text>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: themeColors.text }]}>Зворотний зв'язок / повідомити про помилку</Text>
              <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>program.real.life@gmail.com</Text>
            </View>
          </View>
        </View>
        
        <SettingsItem
          icon="⭐"
          title="Оцінити застосунок"
          subtitle="Підтримати нас у магазині"
          onPress={() => {
            Alert.alert(
              'Оцінити застосунок',
              'Ваша оцінка допоможе іншим користувачам знайти наш додаток!',
              [
                { text: 'Пізніше', style: 'cancel' },
                { 
                  text: '⭐ Оцінити', 
                  onPress: () => {
                    // В реальному додатку тут буде посилання на Google Play/App Store
                    Alert.alert('Дякуємо!', 'Оцінка буде доступна після публікації в магазині додатків.');
                  }
                }
              ]
            );
          }}
          themeColors={themeColors}
        />
      </View>

    </ScrollView>
  );

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'daily':
        return renderDailyQuestsScreen();
      case 'stats':
        return renderStatsScreen();
      case 'settings':
        return renderSettingsScreen();
      default:
        return renderHomeScreen();
    }
  };

  // Завантаження даних при запуску додатку
  React.useEffect(() => {
    // Завантажуємо дані користувача
    loadUserData();
    
    console.log('Додаток ініціалізовано з постійним збереженням даних');
  }, []);

  // Автоматичне збереження при змінах
  React.useEffect(() => {
    saveUserData();
  }, [userProfile, dailyQuests, mainQuests, completedQuests, selectedCharacter, notifications, progressReminders, soundEnabled, vibrationsEnabled, theme, animationsEnabled]);

  // Автоматичне скидання щоденних квестів о 04:00 київського часу
  React.useEffect(() => {
    // Ініціалізуємо дату останнього скидання при першому запуску
    if (!lastResetDate) {
      setLastResetDate(getCurrentDateString());
    }

    // Перевіряємо, чи потрібно скинути квести
    if (shouldResetDailyQuests()) {
      resetDailyQuests();
    }

    // Встановлюємо інтервал для перевірки кожну хвилину
    const interval = setInterval(() => {
      if (shouldResetDailyQuests()) {
        resetDailyQuests();
      }
    }, 60000); // 60 секунд

    // Очищуємо інтервал при розмонтуванні
    return () => clearInterval(interval);
  }, [lastResetDate]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Settings Button */}
      <TouchableOpacity 
        style={[styles.settingsButton, { backgroundColor: themeColors.glassBackground }]}
        onPress={() => setCurrentScreen('settings')}
      >
        <Text style={[styles.settingsButtonText, { color: themeColors.text }]}>⚙️</Text>
      </TouchableOpacity>
      
      {renderCurrentScreen()}
      
      {/* Bottom Navigation */}
      <View style={[styles.tabBar, { backgroundColor: themeColors.glassBackground }]}>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setCurrentScreen('home')}
        >
          <Text style={[
            styles.tabIcon, 
            { color: currentScreen === 'home' ? '#3b82f6' : themeColors.textSecondary }
          ]}>🏠</Text>
          <Text style={[
            styles.tabLabel, 
            { color: currentScreen === 'home' ? '#3b82f6' : themeColors.textSecondary }
          ]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setCurrentScreen('daily')}
        >
          <Text style={[
            styles.tabIcon, 
            { color: currentScreen === 'daily' ? '#10b981' : themeColors.textSecondary }
          ]}>✅</Text>
          <Text style={[
            styles.tabLabel, 
            { color: currentScreen === 'daily' ? '#10b981' : themeColors.textSecondary }
          ]}>Daily</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setCurrentScreen('stats')}
        >
          <Text style={[
            styles.tabIcon, 
            { color: currentScreen === 'stats' ? '#8b5cf6' : themeColors.textSecondary }
          ]}>📊</Text>
          <Text style={[
            styles.tabLabel, 
            { color: currentScreen === 'stats' ? '#8b5cf6' : themeColors.textSecondary }
          ]}>Stats</Text>
        </TouchableOpacity>
      </View>

      {/* Quest Details Modal */}
      <Modal
        visible={showQuestDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuestDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {selectedQuest?.icon} {selectedQuest?.title}
              {selectedQuest && getQuestProgress(selectedQuest) === 100 ? ' 🎉' : ''}
            </Text>
            <Text style={[styles.modalDescription, { color: themeColors.textSecondary }]}>
              {selectedQuest?.description}
            </Text>
            
            <Text style={[styles.modalXP, { color: themeColors.primary }]}>
              За міні-завдання: +30 XP кожне
            </Text>
            <Text style={[styles.modalXP, { color: themeColors.primary }]}>
              Бонус за завершення: +{selectedQuest ? getQuestTotalXP(selectedQuest) : 0} XP
            </Text>
            
            <View style={styles.modalProgress}>
              <Text style={[styles.modalProgressTitle, { color: themeColors.text }]}>Прогрес квесту:</Text>
              <View style={[styles.modalProgressBar, { backgroundColor: themeColors.border }]}>
                <View style={[styles.modalProgressFill, { 
                  backgroundColor: selectedQuest?.color || themeColors.primary,
                  width: `${selectedQuest ? getQuestProgress(selectedQuest) : 0}%` 
                }]} />
              </View>
              <Text style={[styles.modalProgressText, { color: themeColors.textSecondary }]}>
                {selectedQuest ? getQuestProgress(selectedQuest) : 0}% завершено
              </Text>
            </View>

            <ScrollView style={styles.questStepsList}>
              {selectedQuest?.steps.map((step: any) => (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.questStep, { 
                    backgroundColor: step.completed ? themeColors.primary : themeColors.background,
                    borderColor: step.completed ? themeColors.primary : themeColors.border,
                    transform: [{ scale: step.completed ? 1.02 : 1 }]
                  }]}
                  onPress={() => toggleQuestStep(selectedQuest.id, step.id)}
                  disabled={step.completed}
                >
                  <Text style={[styles.questStepText, { 
                    color: step.completed ? '#ffffff' : themeColors.text,
                    fontWeight: step.completed ? '600' : '400'
                  }]}>
                    {step.completed ? '✅' : '⏳'} {step.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowQuestDetailsModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: '#ffffff' }]}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Character Selection Modal */}
      <Modal
        visible={showCharacterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCharacterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Оберіть персонажа</Text>
            <ScrollView style={styles.charactersList}>
              {availableCharacters.map((character, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.characterOption, { backgroundColor: themeColors.background }]}
                  onPress={() => handleCharacterSelect(character)}
                >
                  <Text style={styles.characterOptionEmoji}>{character.emoji}</Text>
                  <View style={styles.characterOptionInfo}>
                    <Text style={[styles.characterOptionName, { color: themeColors.text }]}>
                      {character.name}
                    </Text>
                    <Text style={[styles.characterOptionProfession, { color: themeColors.textSecondary }]}>
                      {character.profession}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowCharacterModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: '#ffffff' }]}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>🎨 Тема оформлення</Text>
            
            {/* Reset All Quests */}
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: themeColors.text }]}>
                🔄 Скидання квестів
              </Text>
              <TouchableOpacity
                style={[styles.settingsButton, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                onPress={resetAllQuests}
              >
                <Text style={[styles.settingsButtonText, { color: themeColors.text }]}>
                  Скинути всі квести до нуля
                </Text>
              </TouchableOpacity>
            </View>

            {/* Theme Selection */}
            <View style={styles.themeSelection}>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton, 
                    { 
                      backgroundColor: theme === 'accent' ? themeColors.primary : themeColors.background,
                      borderColor: themeColors.border
                    }
                  ]}
                  onPress={() => setTheme('accent')}
                >
                  <Text style={[styles.themeButtonText, { 
                    color: theme === 'accent' ? '#ffffff' : themeColors.text 
                  }]}>Сіра (стандартна)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton, 
                    { 
                      backgroundColor: theme === 'light' ? themeColors.primary : themeColors.background,
                      borderColor: themeColors.border
                    }
                  ]}
                  onPress={() => setTheme('light')}
                >
                  <Text style={[styles.themeButtonText, { 
                    color: theme === 'light' ? '#ffffff' : themeColors.text 
                  }]}>Світла (пастельна)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton, 
                    { 
                      backgroundColor: theme === 'dark' ? themeColors.primary : themeColors.background,
                      borderColor: themeColors.border
                    }
                  ]}
                  onPress={() => setTheme('dark')}
                >
                  <Text style={[styles.themeButtonText, { 
                    color: theme === 'dark' ? '#ffffff' : themeColors.text 
                  }]}>Темна (неонова)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: '#ffffff' }]}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>👤 Редагування профілю</Text>
            
            <View style={styles.profileEditSection}>
              <Text style={[styles.profileEditLabel, { color: themeColors.text }]}>Ім'я:</Text>
              <TextInput
                style={[styles.profileEditInput, { 
                  backgroundColor: themeColors.background, 
                  color: themeColors.text,
                  borderColor: themeColors.border 
                }]}
                value={userProfile.name}
                onChangeText={(text) => setUserProfile(prev => ({ ...prev, name: text }))}
                placeholder="Введіть ваше ім'я"
                placeholderTextColor={themeColors.textSecondary}
              />
            </View>

            <View style={styles.profileEditSection}>
              <Text style={[styles.profileEditLabel, { color: themeColors.text }]}>Аватар:</Text>
              <TouchableOpacity
                style={[styles.avatarSelectButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  setShowProfileModal(false);
                  setShowCharacterModal(true);
                }}
              >
                <Text style={[styles.avatarSelectButtonText, { color: '#ffffff' }]}>
                  {selectedCharacter} Змінити аватар
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.border }]}
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: themeColors.text }]}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: themeColors.primary }]}
                onPress={() => {
                  setShowProfileModal(false);
                  Alert.alert('Профіль оновлено', 'Ваші зміни збережено!');
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>Зберегти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        visible={showAchievementsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAchievementsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>🏆 Досягнення</Text>
            <ScrollView style={styles.achievementsList}>
              {achievements.map((achievement) => (
                <View key={achievement.id} style={[styles.achievementModalCard, { 
                  backgroundColor: achievement.unlocked ? themeColors.background : themeColors.border 
                }]}>
                  <View style={[styles.achievementModalIconContainer, { backgroundColor: achievement.color }]}>
                    <Text style={styles.achievementModalIcon}>{achievement.icon}</Text>
                  </View>
                  <View style={styles.achievementModalInfo}>
                    <Text style={[styles.achievementModalTitle, { 
                      color: achievement.unlocked ? themeColors.text : themeColors.textSecondary 
                    }]}>{achievement.title}</Text>
                    <Text style={[styles.achievementModalDescription, { 
                      color: achievement.unlocked ? themeColors.textSecondary : themeColors.textSecondary 
                    }]}>{achievement.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowAchievementsModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: '#ffffff' }]}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// SettingsItem Component
interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
  themeColors: any;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon, title, subtitle, onPress, destructive, themeColors }) => {
  return (
    <TouchableOpacity 
      style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{icon}</Text>
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, destructive && styles.destructiveText, { color: themeColors.text }]}>
            {title}
          </Text>
          <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <Text style={[styles.chevron, { color: themeColors.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );
};

// ToggleItem Component
interface ToggleItemProps {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  themeColors: any;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ icon, title, subtitle, value, onValueChange, themeColors }) => {
  return (
    <View style={[styles.settingsItem, { borderBottomColor: themeColors.border }]}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{icon}</Text>
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemTitle, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.itemSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          console.log(`ToggleItem ${title}: ${value} -> ${newValue}`);
          onValueChange(newValue);
        }}
        trackColor={{ false: '#767577', true: themeColors.primary }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor={themeColors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  heroEmoji: {
    fontSize: 48,
  },
  levelRing: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  heroLevel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 3,
  },
  moodText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 3,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '500',
  },
  xpSection: {
    marginTop: 10,
  },
  xpProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  motivationalMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  achievementsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  achievementsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsButtonText: {
    fontSize: 18,
  },
  section: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  questIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questEmoji: {
    fontSize: 24,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  questProgressText: {
    fontSize: 12,
    marginBottom: 8,
  },
  questProgressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  questProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  questXP: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  questXPText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dailyProgress: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  dailyProgressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dailyQuestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dailyQuestIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dailyQuestEmoji: {
    fontSize: 20,
  },
  dailyQuestInfo: {
    flex: 1,
  },
  dailyQuestTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  dailyQuestXP: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  dailyQuestXPText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dailyQuestStatus: {
    fontSize: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  levelInfoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 10,
  },
  levelInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  levelInfoReward: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  levelInfoDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  levelInfoProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  levelInfoProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  levelInfoXP: {
    fontSize: 12,
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
  },
  // Settings styles
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
  },
  destructiveText: {
    color: '#ef4444',
  },
  chevron: {
    fontSize: 18,
    marginLeft: 12,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalXP: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalProgress: {
    marginBottom: 20,
  },
  modalProgressTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  questStepsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  questStep: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  questStepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  charactersList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  characterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  characterOptionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  characterOptionInfo: {
    flex: 1,
  },
  characterOptionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  characterOptionProfession: {
    fontSize: 12,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeSelection: {
    marginBottom: 20,
  },
  themeButtons: {
    flexDirection: 'column',
  },
  themeButton: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  achievementModalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  achievementModalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementModalIcon: {
    fontSize: 20,
  },
  achievementModalInfo: {
    flex: 1,
  },
  achievementModalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  achievementModalDescription: {
    fontSize: 12,
  },
  // Profile edit styles
  profileEditSection: {
    marginBottom: 20,
  },
  profileEditLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  profileEditInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  avatarSelectButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatarSelectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  // Category filters styles
        categoryFilters: {
          marginBottom: 16,
          paddingHorizontal: 4,
          maxHeight: 50,
        },
        categoryFilter: {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          marginRight: 6,
          borderWidth: 1,
          minWidth: 80,
        },
        categoryFilterText: {
          fontSize: 12,
          fontWeight: '500',
          textAlign: 'center',
        },
});

export default function App() {
  return (
    <ThemeProvider>
      <DetailedQuestsAppContent />
    </ThemeProvider>
  );
}
