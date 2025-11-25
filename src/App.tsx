import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Trash2,
  Save,
  Edit2,
  ShoppingBag,
  Image as ImageIcon,
  ArrowLeft,
  X,
  ChevronDown,
  ArrowUpDown,
  User,
  Calendar,
  TrendingDown,
  Activity,
  Search,
  Upload,
  LogOut,
  LogIn,
  Loader,
  AlertTriangle,
  Globe,
  Heart,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';

// --- CONFIGURATIE ---
const firebaseConfig = {
  apiKey: 'AIzaSyCQfT9wr3iQZusoPxLUV-kt_ZPd_newSTQ',
  authDomain: 'mealplanner-database.firebaseapp.com',
  projectId: 'mealplanner-database',
  storageBucket: 'mealplanner-database.firebasestorage.app',
  messagingSenderId: '442859727528',
  appId: '1:442859727528:web:2c3fcd840c4960b540709d',
  measurementId: 'G-Q7WB2MTYM3',
};

// --- INITIALISATIE ---
let auth: any = null;
let db: any = null;
let firebaseError: string | null = null;

const isFirebaseConfigured =
  firebaseConfig.apiKey && firebaseConfig.apiKey.length > 0;

try {
  if (typeof window !== 'undefined' && isFirebaseConfigured) {
    const app =
      getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err: any) {
  firebaseError = err.message;
  console.error('Firebase init fout:', err);
}

// --- TYPES ---
type Language = 'nl' | 'en';
interface Product {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  price: number;
  unit: string;
  image: string;
}
interface MealProduct {
  productId: string;
  amount: number;
}
interface Meal {
  id: string;
  title: string;
  category?: string;
  products: MealProduct[];
  isFavorite?: boolean;
}
interface PlannerItem extends Meal {
  instanceId: string;
}
interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: string;
  activity: number;
  targetKcal: number;
  targetProtein: number;
}
interface WeightEntry {
  date: string;
  weight: number;
}
interface PlannerData {
  [date: string]: { [key in Slot]: PlannerItem[] };
}
type Slot = 'ochtend' | 'middag' | 'avond' | 'snack';

// --- STANDAARD DATA ---
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Volkoren brood',
    kcal: 85,
    protein: 4,
    price: 0.15,
    unit: '1 snede',
    image: '',
  },
  {
    id: 'p2',
    name: 'Ei (groot)',
    kcal: 75,
    protein: 7,
    price: 0.25,
    unit: '1 stuk',
    image: '',
  },
  {
    id: 'p3',
    name: 'Kipfilet (beleg)',
    kcal: 15,
    protein: 3,
    price: 0.2,
    unit: '1 plakje',
    image: '',
  },
  {
    id: 'p10',
    name: 'Kwark (mager)',
    kcal: 50,
    protein: 9,
    price: 0.4,
    unit: '100 gram',
    image: '',
  },
];

const DEFAULT_MEALS: Meal[] = [
  {
    id: 'm1',
    title: 'Uitsmijter ham',
    isFavorite: true,
    products: [
      { productId: 'p1', amount: 3 },
      { productId: 'p2', amount: 3 },
    ],
    category: 'ochtend',
  },
  {
    id: 'm2',
    title: 'Kip chili broodje',
    products: [
      { productId: 'p1', amount: 4 },
      { productId: 'p3', amount: 5 },
    ],
    category: 'middag',
  },
];

const UNIT_TYPES = [
  'gram',
  'ml',
  'stuk',
  'snede',
  'plakje',
  'el',
  'tl',
  'glas',
  'bakje',
];

// --- VERTALINGEN ---
const TRANSLATIONS = {
  en: {
    planner: 'Planner',
    meals: 'Meals',
    products: 'Products',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    account_create: 'Create account',
    have_account: 'Login instead',
    no_account: 'Register new account',
    my_data: 'My data',
    gender: 'Gender',
    activity: 'Activity',
    age: 'Age',
    height: 'Height',
    goals: 'Goals',
    kcal_goal: 'Kcal goal',
    protein_goal: 'Protein goal',
    expectation: 'Expectation',
    weight_tracker: 'Weight tracker',
    current_weight: 'Current weight',
    log: 'Log',
    add_product: 'New product',
    edit_product: 'Edit product',
    name: 'Name',
    unit_amount: 'Amount',
    unit_type: 'Unit',
    price: 'Price',
    kcal: 'Kcal',
    protein: 'Protein',
    image: 'Image',
    add: 'Add',
    update: 'Update',
    cancel: 'Cancel',
    all_products: 'All products',
    search: 'Search...',
    my_meals: 'My meals',
    new_meal: 'New meal',
    edit_meal: 'Edit meal',
    category: 'Category',
    morning: 'Breakfast',
    afternoon: 'Lunch',
    evening: 'Dinner',
    snack: 'Snack',
    save: 'Save',
    ingredients: 'Ingredients',
    add_product_to_meal: 'Add ingredient',
    day_total: 'Daily total',
    choose: 'Select',
    sort_fav: 'Favorites first',
    week_prev: 'Previous',
    week_next: 'Next',
    today: 'Today',
    per_week: 'per week',
    per_month: 'per month',
    toggle_period: 'Change period',
    male: 'Male',
    female: 'Female',
    act_sedentary: 'Sedentary (Office)',
    act_light: 'Light (1-3x sport)',
    act_moderate: 'Moderate (3-5x)',
    act_active: 'Active (6-7x)',
    act_very_active: 'Very Active / Athlete',
    sort_name: 'Name (A-Z)',
    sort_protein: 'Protein (High)',
    sort_kcal: 'Kcal (High)',
    sort_price_low: 'Price (Low)',
    sort_price_high: 'Price (High)',
    tab_meals: 'Meals',
    tab_products: 'Products',
    add_to_planner: 'Add',
    // Slot namen voor weergave (gebruik unieke keys voor mapping indien nodig, maar hier gebruiken we de bestaande keys)
    slot_ochtend: 'Breakfast',
    slot_middag: 'Lunch',
    slot_avond: 'Dinner',
    slot_snack: 'Snack',
    no_data: 'No items found',
  },
  nl: {
    planner: 'Planner',
    meals: 'Maaltijden',
    products: 'Producten',
    profile: 'Profiel',
    login: 'Inloggen',
    register: 'Registreren',
    logout: 'Uitloggen',
    email: 'E-mail',
    password: 'Wachtwoord',
    account_create: 'Account maken',
    have_account: 'Heb je al een account? Log in',
    no_account: 'Nog geen account? Registreren',
    my_data: 'Mijn gegevens',
    gender: 'Geslacht',
    activity: 'Activiteit',
    age: 'Leeftijd',
    height: 'Lengte',
    goals: 'Doelen',
    kcal_goal: 'Kcal doel',
    protein_goal: 'Eiwit doel',
    expectation: 'Verwachting',
    weight_tracker: 'Gewichtsverloop',
    current_weight: 'Huidig gewicht',
    log: 'Opslaan',
    add_product: 'Nieuw product',
    edit_product: 'Product wijzigen',
    name: 'Naam',
    unit_amount: 'Aantal',
    unit_type: 'Eenheid',
    price: 'Prijs',
    kcal: 'Kcal',
    protein: 'Eiwit',
    image: 'Afbeelding',
    add: 'Toevoegen',
    update: 'Wijzigen',
    cancel: 'Annuleren',
    all_products: 'Alle producten',
    search: 'Zoeken...',
    my_meals: 'Mijn maaltijden',
    new_meal: 'Nieuwe maaltijd',
    edit_meal: 'Bewerk maaltijd',
    category: 'Categorie',
    morning: 'Ochtend',
    afternoon: 'Middag',
    evening: 'Avond',
    snack: 'Snack',
    save: 'Opslaan',
    ingredients: 'Ingrediënten',
    add_product_to_meal: 'Ingrediënt toevoegen',
    day_total: 'Dag totaal',
    choose: 'Kies',
    sort_fav: 'Favorieten eerst',
    week_prev: 'Vorige',
    week_next: 'Volgende',
    today: 'Vandaag',
    per_week: 'per week',
    per_month: 'per maand',
    toggle_period: 'Wijzig periode',
    male: 'Man',
    female: 'Vrouw',
    act_sedentary: 'Weinig (Kantoor)',
    act_light: 'Licht (1-3x sport)',
    act_moderate: 'Gemiddeld (3-5x)',
    act_active: 'Zwaar (6-7x)',
    act_very_active: 'Fysiek Werk / Atleet',
    sort_name: 'Naam (A-Z)',
    sort_protein: 'Eiwit (Hoog)',
    sort_kcal: 'Kcal (Hoog)',
    sort_price_low: 'Prijs (Laag)',
    sort_price_high: 'Prijs (Hoog)',
    tab_meals: 'Maaltijden',
    tab_products: 'Producten',
    add_to_planner: 'Toevoegen',
    slot_ochtend: 'Ochtend',
    slot_middag: 'Middag',
    slot_avond: 'Avond',
    slot_snack: 'Snack',
    no_data: 'Geen items gevonden',
  },
};

// --- HELPERS ---
const getISODate = (d: Date) => d.toISOString().split('T')[0];
const getDisplayDate = (d: Date, lang: string) =>
  d.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};
const getStartOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const calculateMealStats = (meal: Meal | null, products: Product[]) => {
  let s = { k: 0, p: 0, c: 0 };
  if (!meal?.products) return s;
  meal.products.forEach((i) => {
    const p = products.find((prod) => prod.id === i.productId);
    if (p) {
      s.k += p.kcal * i.amount;
      s.p += p.protein * i.amount;
      s.c += p.price * i.amount;
    }
  });
  return {
    k: Math.round(s.k),
    p: Math.round(s.p),
    c: parseFloat(s.c.toFixed(2)),
  };
};

const getDayStats = (
  daySelection: { [key in Slot]: PlannerItem[] } | undefined,
  products: Product[]
) => {
  let total = { kcal: 0, protein: 0, price: 0 };
  if (!daySelection) return total;
  Object.values(daySelection).forEach((items) => {
    if (Array.isArray(items)) {
      items.forEach((meal) => {
        const stats = calculateMealStats(meal, products);
        total.kcal += stats.k;
        total.protein += stats.p;
        total.price += stats.c;
      });
    }
  });
  return total;
};

const calculateTDEE = (
  weight: number,
  height: number,
  age: number,
  gender: string,
  activity: number
) => {
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += gender === 'man' ? 5 : -161;
  const multipliers: { [key: number]: number } = {
    1: 1.2,
    2: 1.375,
    3: 1.55,
    4: 1.725,
    5: 1.9,
  };
  return Math.round(bmr * (multipliers[activity] || 1.2));
};

// --- COMPONENTEN ---

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full p-2 border rounded-lg text-base bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-white placeholder:text-slate-400 ${
      props.className || ''
    }`}
    style={{ fontSize: '16px' }}
  />
);

const Option = ({
  value,
  children,
}: {
  value: string | number;
  children: React.ReactNode;
}) => (
  <option
    value={value}
    className="text-slate-900 bg-white dark:text-white dark:bg-slate-800"
  >
    {children}
  </option>
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full p-2 pr-8 border rounded-lg text-base bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-white ${
        props.className || ''
      }`}
      style={{ fontSize: '16px', backgroundImage: 'none' }}
    >
      {props.children}
    </select>
    <ChevronDown
      size={16}
      className="absolute right-2 top-3.5 text-slate-500 dark:text-white pointer-events-none"
    />
  </div>
);

// --- GRAFIEK COMPONENT ---
const WeightChart = ({ history }: { history: WeightEntry[] }) => {
  if (history.length < 2) return null;
  const sorted = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);
  const minW = Math.min(...sorted.map((x) => x.weight)) - 1;
  const maxW = Math.max(...sorted.map((x) => x.weight)) + 1;
  const range = maxW - minW;

  const points = sorted
    .map((entry, i) => {
      const x = (i / (sorted.length - 1)) * 100;
      const y = 100 - ((entry.weight - minW) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full h-32 mt-4 relative border-l border-b border-slate-200 dark:border-slate-600">
      <svg
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          points={points}
          vectorEffect="non-scaling-stroke"
        />
        {sorted.map((entry, i) => {
          const x = (i / (sorted.length - 1)) * 100;
          const y = 100 - ((entry.weight - minW) / range) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              className="fill-blue-600"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{sorted[0].date}</span>
        <span>{sorted[sorted.length - 1].date}</span>
      </div>
    </div>
  );
};

// --- AUTH MANAGER ---
const AuthManager = ({ user, lang }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const t = TRANSLATIONS[lang as Language];
  const handleAuth = async () => {
    setError('');
    try {
      if (isRegistering)
        await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };
  if (user)
    return (
      <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl mb-6 flex justify-between items-center border border-blue-100 dark:border-slate-700">
        <div>
          <h3 className="font-bold text-blue-900 dark:text-white">Ingelogd</h3>
          <p className="text-xs text-blue-700 dark:text-slate-400">
            {user.email}
          </p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="px-3 py-1.5 bg-white dark:bg-slate-700 border rounded text-xs font-bold dark:text-white"
        >
          {t.logout}
        </button>
      </div>
    );
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
      <h3 className="font-bold dark:text-white mb-3">
        {isRegistering ? t.account_create : t.login}
      </h3>
      <div className="space-y-3">
        <Input
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder={t.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-red-500">{error}</p>
        <button
          onClick={handleAuth}
          className="w-full py-2 bg-blue-600 text-white rounded font-bold"
        >
          {isRegistering ? t.register : t.login}
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-xs text-slate-500 underline"
        >
          {isRegistering ? t.have_account : t.no_account}
        </button>
      </div>
    </div>
  );
};

// --- PROFILE MANAGER ---
const ProfileManager = ({
  userProfile,
  setUserProfile,
  weightHistory,
  setWeightHistory,
  user,
  lang,
  darkMode,
}: any) => {
  const [newWeight, setNewWeight] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const tdee = calculateTDEE(
    userProfile.weight,
    userProfile.height,
    userProfile.age,
    userProfile.gender,
    userProfile.activity
  );
  const deficit = tdee - userProfile.targetKcal;
  const weeklyLoss = (deficit * 7) / 7700;
  const displayedLoss = period === 'week' ? weeklyLoss : weeklyLoss * 4.33;

  const t = TRANSLATIONS[lang as Language];

  const handleSaveWeight = () => {
    if (!newWeight) return;
    const w = parseFloat(newWeight);

    if (editingIndex !== null) {
      const updated = [...weightHistory];
      updated[editingIndex].weight = w;
      setWeightHistory(updated);
      if (editingIndex === 0) setUserProfile({ ...userProfile, weight: w });
      setEditingIndex(null);
    } else {
      const entry = {
        date: new Date().toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'short',
        }),
        weight: w,
      };
      setWeightHistory([entry, ...weightHistory]);
      setUserProfile({ ...userProfile, weight: w });
    }
    setNewWeight('');
  };

  const handleEdit = (index: number, val: number) => {
    setEditingIndex(index);
    setNewWeight(val.toString());
  };

  const handleDelete = (index: number) => {
    if (!confirm(lang === 'nl' ? 'Verwijderen?' : 'Delete?')) return;
    const updated = weightHistory.filter((_: any, i: number) => i !== index);
    setWeightHistory(updated);
    if (index === 0 && updated.length > 0)
      setUserProfile({ ...userProfile, weight: updated[0].weight });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <AuthManager user={user} lang={lang} />
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
          <User size={20} className="text-blue-500" /> {t.my_data}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              {t.gender}
            </label>
            <Select
              value={userProfile.gender}
              onChange={(e) =>
                setUserProfile({ ...userProfile, gender: e.target.value })
              }
            >
              <Option value="man">{t.male}</Option>
              <Option value="vrouw">{t.female}</Option>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              {t.activity}
            </label>
            <Select
              value={String(userProfile.activity)}
              onChange={(e) =>
                setUserProfile({ ...userProfile, activity: +e.target.value })
              }
            >
              <Option value="1">{t.act_sedentary}</Option>
              <Option value="2">{t.act_light}</Option>
              <Option value="3">{t.act_moderate}</Option>
              <Option value="4">{t.act_active}</Option>
              <Option value="5">{t.act_very_active}</Option>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              {t.age}
            </label>
            <Input
              type="number"
              value={userProfile.age}
              onChange={(e) =>
                setUserProfile({ ...userProfile, age: +e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
              {t.height}
            </label>
            <Input
              type="number"
              value={userProfile.height}
              onChange={(e) =>
                setUserProfile({ ...userProfile, height: +e.target.value })
              }
            />
          </div>
        </div>
        <div className="mt-4 border-t dark:border-slate-700 pt-4">
          <h3 className="font-bold text-sm mb-3 dark:text-white">{t.goals}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                {t.kcal_goal}
              </label>
              <Input
                type="number"
                value={userProfile.targetKcal}
                onChange={(e) =>
                  setUserProfile({
                    ...userProfile,
                    targetKcal: +e.target.value,
                  })
                }
                className="font-bold text-orange-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">
                {t.protein_goal}
              </label>
              <Input
                type="number"
                value={userProfile.targetProtein}
                onChange={(e) =>
                  setUserProfile({
                    ...userProfile,
                    targetProtein: +e.target.value,
                  })
                }
                className="font-bold text-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
        <div className="flex justify-between relative z-10">
          <div>
            <h3 className="font-bold flex items-center gap-2">
              <TrendingDown /> {t.expectation}
            </h3>
            <p className="text-blue-200 text-xs mt-1">
              {t.based_on} ({tdee})
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">
              {weeklyLoss > 0 ? '-' : '+'}
              {Math.abs(displayedLoss).toFixed(1)} kg
            </div>

            <button
              onClick={() => setPeriod(period === 'week' ? 'month' : 'week')}
              className="text-xs opacity-80 hover:opacity-100 uppercase font-bold bg-blue-700/50 px-2 py-1 rounded mt-1 flex items-center gap-1 ml-auto cursor-pointer"
            >
              {period === 'week' ? t.per_week : t.per_month}{' '}
              <RotateCcw size={10} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
          <Activity size={20} className="text-purple-500" /> {t.weight_tracker}
        </h2>
        <WeightChart history={weightHistory} />
        <div className="flex gap-2 mt-4 mb-2">
          <Input
            type="number"
            placeholder="kg"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          {editingIndex !== null && (
            <button
              onClick={() => {
                setEditingIndex(null);
                setNewWeight('');
              }}
              className="border border-slate-300 dark:border-slate-600 px-3 rounded-lg text-slate-500 dark:text-slate-400"
            >
              <X />
            </button>
          )}
          <button
            onClick={handleSaveWeight}
            className="bg-purple-600 text-white px-4 rounded-lg font-bold"
          >
            {editingIndex !== null ? t.update : t.log}
          </button>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {weightHistory.map((e: any, i: number) => (
            <div
              key={i}
              className={`flex justify-between items-center p-2 rounded-lg border ${
                editingIndex === i
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-300 text-sm">
                  {e.date}
                </span>
                <span className="font-bold dark:text-white">{e.weight} kg</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(i, e.weight)}
                  className="p-1 text-slate-400 hover:text-blue-500"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(i)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ITEM SELECTOR (Meals & Products) ---
const ItemSelector = ({
  isOpen,
  onClose,
  category,
  meals,
  products,
  onSelect,
  lang,
}: any) => {
  const [search, setSearch] = useState('');
  const [showFavs, setShowFavs] = useState(false);
  const [tab, setTab] = useState<'meals' | 'products'>('meals');
  const t = TRANSLATIONS[lang as Language];

  if (!isOpen) return null;

  let displayList: any[] = [];

  if (tab === 'meals') {
    displayList = meals;
    if (showFavs) displayList = displayList.filter((m: any) => m.isFavorite);
    if (search)
      displayList = displayList.filter((m: any) =>
        m.title.toLowerCase().includes(search.toLowerCase())
      );
  } else {
    displayList = products;
    if (search)
      displayList = displayList.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
  }

  displayList = displayList.sort((a: any, b: any) =>
    (a.title || a.name).localeCompare(b.title || b.name)
  );

  const handleItemClick = (item: any) => {
    if (tab === 'meals') {
      onSelect(item);
    } else {
      const mealWrapper: Meal = {
        id: `generated_${item.id}_${Date.now()}`,
        title: item.name,
        category: 'universeel',
        products: [{ productId: item.id, amount: 1 }],
      };
      onSelect(mealWrapper);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold dark:text-white">
            {t.choose} {t[('slot_' + category) as keyof typeof t]}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="dark:text-white" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b dark:border-slate-700">
          <button
            onClick={() => setTab('meals')}
            className={`flex-1 py-3 text-sm font-bold ${
              tab === 'meals'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.tab_meals}
          </button>
          <button
            onClick={() => setTab('products')}
            className={`flex-1 py-3 text-sm font-bold ${
              tab === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t.tab_products}
          </button>
        </div>

        <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2">
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {tab === 'meals' && (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowFavs(!showFavs)}
            >
              <div
                className={`w-4 h-4 border rounded ${
                  showFavs ? 'bg-red-500 border-red-500' : 'border-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {t.sort_fav}
              </span>
            </div>
          )}
        </div>
        <div className="overflow-y-auto p-4 space-y-2">
          {displayList.length === 0 && (
            <p className="text-center text-slate-400 text-sm">{t.no_data}</p>
          )}
          {displayList.map((item: any) => {
            let stats;
            if (tab === 'meals') {
              stats = calculateMealStats(item, products);
            } else {
              stats = { k: item.kcal, p: item.protein, c: item.price };
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="w-full text-left p-3 rounded-xl border dark:border-slate-700 hover:border-blue-500 bg-white dark:bg-slate-700"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold dark:text-white">
                    {item.title || item.name}
                  </span>
                  <span className="text-xs bg-slate-100 dark:bg-slate-600 px-1 rounded text-slate-500 dark:text-slate-300">
                    €{stats.c.toFixed(2)}
                  </span>
                </div>
                {tab === 'meals' && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate">
                    {item.products
                      .map((mp: any) => {
                        const p = products.find(
                          (prod: any) => prod.id === mp.productId
                        );
                        return p ? `${mp.amount}x ${p.name}` : '';
                      })
                      .join(', ')}
                  </div>
                )}
                <div className="flex gap-3 text-xs font-medium">
                  <span className="text-orange-600 dark:text-orange-400">
                    {stats.k} kcal
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {stats.p}g
                  </span>
                  {item.isFavorite && (
                    <Heart size={12} className="fill-red-500 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- PRODUCT DATABASE ---
const ProductDatabase = ({
  products,
  setProducts,
  meals,
  setMeals,
  lang,
  darkMode,
}: any) => {
  const [newP, setNewP] = useState<Product>({
    id: '',
    name: '',
    kcal: 0,
    protein: 0,
    price: 0,
    unit: '',
    image: '',
  });
  const [amt, setAmt] = useState('100');
  const [unitT, setUnitT] = useState('gram');
  const [sortType, setSortType] = useState('name');
  const [editingId, setEditingId] = useState<string | null>(null);
  const t = TRANSLATIONS[lang as Language];

  const handleSaveProduct = () => {
    if (!newP.name) return;
    const finalUnit = `${amt} ${unitT}`;
    const productData = {
      ...newP,
      kcal: Number(newP.kcal) || 0,
      protein: Number(newP.protein) || 0,
      price: Number(newP.price) || 0,
      unit: finalUnit,
    };

    if (editingId) {
      setProducts(
        products.map((p: any) =>
          p.id === editingId ? { ...productData, id: editingId } : p
        )
      );
      setEditingId(null);
    } else {
      setProducts([...products, { ...productData, id: 'p' + Date.now() }]);
    }

    setNewP({
      id: '',
      name: '',
      kcal: 0,
      protein: 0,
      price: 0,
      unit: '',
      image: '',
    });
    setAmt('100');
    setUnitT('gram');
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setNewP(p);
    const parts = p.unit.split(' ');
    if (parts.length >= 2) {
      setAmt(parts[0]);
      setUnitT(parts.slice(1).join(' '));
    } else {
      setAmt('');
      setUnitT(p.unit);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewP({
      id: '',
      name: '',
      kcal: 0,
      protein: 0,
      price: 0,
      unit: '',
      image: '',
    });
    setAmt('100');
    setUnitT('gram');
  };

  const delP = (id: string) => {
    if (!confirm('Verwijderen?')) return;
    setProducts(products.filter((p: any) => p.id !== id));
    setMeals(
      meals.map((m: any) => ({
        ...m,
        products: m.products.filter((i: any) => i.productId !== id),
      }))
    );
    if (editingId === id) cancelEditing();
  };

  const sortedProducts = [...products].sort((a: any, b: any) => {
    switch (sortType) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'protein-high':
        return b.protein - a.protein;
      case 'kcal-high':
        return b.kcal - a.kcal;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 transition-all ring-2 ring-transparent focus-within:ring-blue-500/20">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white">
          {editingId ? (
            <Edit2 size={20} className="text-blue-500" />
          ) : (
            <Plus size={20} className="text-blue-500" />
          )}
          {editingId ? t.edit_product : t.add_product}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {t.name}
            </label>
            <Input
              value={newP.name}
              onChange={(e) => setNewP({ ...newP, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {t.unit_amount}
            </label>
            <Input
              type="number"
              value={amt}
              onChange={(e) => setAmt(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {t.unit_type}
            </label>
            <Select value={unitT} onChange={(e) => setUnitT(e.target.value)}>
              {UNIT_TYPES.map((u) => (
                <Option key={u} value={u}>
                  {u}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {t.price}
            </label>
            <Input
              type="number"
              value={newP.price || ''}
              onChange={(e) => setNewP({ ...newP, price: +e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {t.kcal}
            </label>
            <Input
              type="number"
              value={newP.kcal || ''}
              onChange={(e) => setNewP({ ...newP, kcal: +e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              {t.protein}
            </label>
            <Input
              type="number"
              value={newP.protein || ''}
              onChange={(e) => setNewP({ ...newP, protein: +e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          {editingId && (
            <button
              onClick={cancelEditing}
              className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {t.cancel}
            </button>
          )}
          <button
            onClick={handleSaveProduct}
            className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            {editingId ? t.update : t.add}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end mb-2">
        <h3 className="font-bold text-slate-700 dark:text-slate-300">
          {t.all_products} ({products.length})
        </h3>
        <div className="relative w-40">
          <Select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <Option value="name">{t.sort_name}</Option>
            <Option value="price-low">{t.sort_price_low}</Option>
            <Option value="price-high">{t.sort_price_high}</Option>
            <Option value="protein-high">{t.sort_protein}</Option>
            <Option value="kcal-high">{t.sort_kcal}</Option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        {sortedProducts.map((p: any) => (
          <div
            key={p.id}
            className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition group"
          >
            <div className="flex-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {p.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  {p.kcal} kcal
                </span>
                <span className="mx-1">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {p.protein}g {lang === 'nl' ? 'eiwit' : 'protein'}
                </span>
                <span className="opacity-60 ml-1">/ {p.unit}</span>
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => startEditing(p)}
                className="p-2 text-slate-300 hover:text-blue-500 transition"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => delP(p.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MEAL MANAGER ---
const MealManager = ({ meals, setMeals, products, lang }: any) => {
  const [editor, setEditor] = useState<Meal | null>(null);
  const [search, setSearch] = useState('');
  const t = TRANSLATIONS[lang as Language];

  if (editor) {
    // EDITOR SUB-COMPONENT
    const isNew = !editor.id;
    const currentMeal = editor;
    const addProd = (pid: string) => {
      const exists = currentMeal.products.find((x) => x.productId === pid);
      const newProds = exists
        ? currentMeal.products.map((x) =>
            x.productId === pid ? { ...x, amount: x.amount + 1 } : x
          )
        : [...currentMeal.products, { productId: pid, amount: 1 }];
      setEditor({ ...currentMeal, products: newProds });
    };
    const updateAmt = (pid: string, val: number) => {
      const newProds =
        val <= 0
          ? currentMeal.products.filter((x) => x.productId !== pid)
          : currentMeal.products.map((x) =>
              x.productId === pid ? { ...x, amount: val } : x
            );
      setEditor({ ...currentMeal, products: newProds });
    };
    const save = () => {
      if (!currentMeal.title) return;
      const mealToSave = {
        ...currentMeal,
        id: currentMeal.id || 'm' + Date.now(),
      };
      if (isNew) setMeals([...meals, mealToSave]);
      else
        setMeals(
          meals.map((m: any) => (m.id === mealToSave.id ? mealToSave : m))
        );
      setEditor(null);
    };

    const stats = calculateMealStats(currentMeal, products);
    const filteredProds = products.filter((p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-8">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setEditor(null)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-xl dark:text-white">
            {isNew ? t.new_meal : t.edit_meal}
          </h2>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 space-y-4">
          <Input
            value={currentMeal.title}
            onChange={(e) =>
              setEditor({ ...currentMeal, title: e.target.value })
            }
            placeholder={t.name}
            className="font-bold"
          />
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() =>
              setEditor({ ...currentMeal, isFavorite: !currentMeal.isFavorite })
            }
          >
            <Heart
              size={20}
              className={
                currentMeal.isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-slate-400'
              }
            />
            <span className="text-sm dark:text-white">Favoriet</span>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border dark:border-slate-700">
          <h3 className="font-bold text-sm mb-2 dark:text-white">
            {t.ingredients}
          </h3>
          {currentMeal.products.map((item: any) => {
            const p = products.find((x: any) => x.id === item.productId);
            if (!p) return null;
            return (
              <div
                key={item.productId}
                className="flex justify-between items-center bg-white dark:bg-slate-700 p-2 rounded mb-2 shadow-sm"
              >
                <span className="text-sm font-medium dark:text-white">
                  {p.name}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-16 p-1 border rounded text-right dark:bg-slate-600 dark:text-white"
                    value={item.amount}
                    onChange={(e) => updateAmt(item.productId, +e.target.value)}
                  />
                  <span className="text-xs text-slate-500">x {p.unit}</span>
                </div>
              </div>
            );
          })}
          <div className="mt-2 text-right text-xs font-bold text-blue-600 dark:text-blue-400">
            Totaal: {stats.k} kcal | {stats.p}g
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-2 dark:text-white">
            {t.add_product_to_meal}
          </h3>
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {filteredProds.map((p: any) => (
              <button
                key={p.id}
                onClick={() => addProd(p.id)}
                className="text-left p-2 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded text-sm hover:border-blue-500"
              >
                <div className="font-bold truncate dark:text-white">
                  {p.name}
                </div>
                <div className="text-xs text-slate-500">{p.kcal} kcal</div>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={save}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-xl"
        >
          {t.save}
        </button>
      </div>
    );
  }

  // LIST MODE
  return (
    <div className="space-y-4 animate-in fade-in">
      <button
        onClick={() =>
          setEditor({
            id: '',
            title: '',
            category: 'universeel',
            products: [],
            isFavorite: false,
          } as any)
        }
        className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 font-bold hover:text-blue-500 flex justify-center gap-2"
      >
        <Plus /> {t.new_meal}
      </button>
      <div className="space-y-2">
        {meals.map((m: any) => {
          const s = calculateMealStats(m, products);
          return (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-700 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                    {m.title}
                    {m.isFavorite && (
                      <Heart size={14} className="fill-red-500 text-red-500" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {s.k} kcal | {s.p}g
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditor(m)}
                    className="p-2 text-slate-400 hover:text-blue-500"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Verwijderen?'))
                        setMeals(meals.filter((x: any) => x.id !== m.id));
                    }}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- PLANNER ---
const Planner = ({
  products,
  plannerData,
  setPlannerData,
  currentDayStr,
  setCurrentDayStr,
  meals,
  lang,
  darkMode,
}: any) => {
  const [selectorCat, setSelectorCat] = useState<string | null>(null);
  const t = TRANSLATIONS[lang as Language];

  // Helper: Date formatting
  const currentDate = new Date(currentDayStr);
  const weekStart = getStartOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    getISODate(addDays(weekStart, i))
  );

  const changeWeek = (dir: number) => {
    const newStart = addDays(currentDate, dir * 7);
    setCurrentDayStr(getISODate(newStart));
  };

  const slots = [
    {
      key: 'ochtend',
      label: t.morning,
      icon: <Coffee size={18} />,
      c: 'bg-yellow-500',
      l: 'bg-yellow-50',
    },
    {
      key: 'middag',
      label: t.afternoon,
      icon: <Sun size={18} />,
      c: 'bg-orange-500',
      l: 'bg-orange-50',
    },
    {
      key: 'avond',
      label: t.evening,
      icon: <Utensils size={18} />,
      c: 'bg-indigo-500',
      l: 'bg-indigo-50',
    },
    {
      key: 'snack',
      label: t.snack,
      icon: <Moon size={18} />,
      c: 'bg-purple-500',
      l: 'bg-purple-50',
    },
  ];

  const handleSelect = (meal: Meal) => {
    if (!selectorCat) return;
    const slot = selectorCat as Slot;
    const mealInstance: PlannerItem = {
      ...meal,
      instanceId: `inst_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };
    const currentItems = plannerData[currentDayStr]?.[slot] || [];
    const newDayData = {
      ...(plannerData[currentDayStr] || {}),
      [slot]: [...currentItems, mealInstance],
    };
    setPlannerData({ ...plannerData, [currentDayStr]: newDayData });
  };

  const removeItem = (slotKey: string, instanceId: string) => {
    const slot = slotKey as Slot;
    const currentItems = plannerData[currentDayStr]?.[slot] || [];
    const newItems = currentItems.filter(
      (item: PlannerItem) => item.instanceId !== instanceId
    );
    const newDayData = {
      ...(plannerData[currentDayStr] || {}),
      [slot]: newItems,
    };
    setPlannerData({ ...plannerData, [currentDayStr]: newDayData });
  };

  const dayData = plannerData[currentDayStr] || {};

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Date Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl border dark:border-slate-700 mb-4">
        <button
          onClick={() => changeWeek(-1)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full dark:text-white"
        >
          <ChevronLeft />
        </button>
        <div className="font-bold text-center dark:text-white">
          Week{' '}
          {Math.ceil((currentDate.getDate() + 6 - currentDate.getDay()) / 7)}
        </div>
        <button
          onClick={() => changeWeek(1)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full dark:text-white"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Days Scroll */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {weekDates.map((dStr) => {
          const d = new Date(dStr);
          const isSelected = dStr === currentDayStr;
          const isToday = dStr === getISODate(new Date());
          return (
            <button
              key={dStr}
              onClick={() => setCurrentDayStr(dStr)}
              className={`flex-shrink-0 flex flex-col items-center p-2 min-w-[60px] rounded-xl border transition ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className="text-xs font-bold uppercase">
                {d.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', {
                  weekday: 'short',
                })}
              </span>
              <span className="text-lg font-bold">{d.getDate()}</span>
              {isToday && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>

      <div className="text-center text-sm text-slate-500 mb-4 font-medium">
        {getDisplayDate(currentDate, lang)}
      </div>

      {slots.map((s) => {
        const items = dayData[s.key as Slot] || [];
        let slotKcal = 0;
        if (Array.isArray(items))
          items.forEach((m) => {
            slotKcal += calculateMealStats(m, products).k;
          });

        return (
          <div
            key={s.key}
            className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden shadow-sm"
          >
            <div
              className={`flex justify-between items-center p-3 border-b dark:border-slate-700 ${s.l} dark:bg-slate-700/30`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded text-white ${s.c}`}>
                  {s.icon}
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {s.label}
                </span>
              </div>
              {items.length > 0 && (
                <span className="text-xs font-mono bg-white/60 dark:bg-black/30 px-2 py-1 rounded dark:text-slate-300">
                  {slotKcal} kcal
                </span>
              )}
            </div>
            <div className="p-3 space-y-2">
              {Array.isArray(items) &&
                items.map((item, idx) => {
                  const st = calculateMealStats(item, products);
                  return (
                    <div
                      key={item.instanceId}
                      className="p-3 bg-blue-50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-blue-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300">
                          {st.k} kcal | {st.p}g
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(s.key, item.instanceId)}
                        className="text-blue-300 hover:text-red-500 p-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}

              {/* Add Button */}
              <button
                onClick={() => setSelectorCat(s.key)}
                className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 transition"
              >
                <Plus size={16} /> {t.add}
              </button>
            </div>
          </div>
        );
      })}

      <ItemSelector
        isOpen={!!selectorCat}
        onClose={() => setSelectorCat(null)}
        category={selectorCat}
        meals={meals}
        products={products}
        onSelect={handleSelect}
        lang={lang}
      />
    </div>
  );
};

// --- APP ---
const App = () => {
  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== 'undefined' &&
      (localStorage.getItem('theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [lang, setLang] = useState<Language>('nl');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState('planner');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS);
  const [plannerData, setPlannerData] = useState<PlannerData>({});
  const [currentDayStr, setCurrentDayStr] = useState<string>(
    getISODate(new Date())
  );
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weight: 105,
    height: 193,
    age: 22,
    gender: 'man',
    activity: 3,
    targetKcal: 2500,
    targetProtein: 215,
  });
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);

  useEffect(() => {
    if (auth) return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Data sync: Using version 8 keys to avoid data corruption
  useEffect(() => {
    if (user && db) {
      const u1 = onSnapshot(
        doc(db, 'users', user.uid, 'data', 'products'),
        (s) => s.exists() && setProducts(s.data().items)
      );
      const u2 = onSnapshot(
        doc(db, 'users', user.uid, 'data', 'meals'),
        (s) => s.exists() && setMeals(s.data().items)
      );
      const u3 = onSnapshot(
        doc(db, 'users', user.uid, 'data', 'planner_v8'),
        (s) => s.exists() && setPlannerData(s.data().items)
      );
      const u4 = onSnapshot(
        doc(db, 'users', user.uid, 'data', 'profile'),
        (s) => s.exists() && setUserProfile(s.data().info)
      );
      const u5 = onSnapshot(
        doc(db, 'users', user.uid, 'data', 'weight'),
        (s) => s.exists() && setWeightHistory(s.data().items)
      );
      return () => {
        u1();
        u2();
        u3();
        u4();
        u5();
      };
    } else {
      const ls = (k: string) => localStorage.getItem(k);
      try {
        if (ls('my_products_v8'))
          setProducts(JSON.parse(ls('my_products_v8')!));
        if (ls('my_meals_v8')) setMeals(JSON.parse(ls('my_meals_v8')!));
        if (ls('my_planner_v8'))
          setPlannerData(JSON.parse(ls('my_planner_v8')!));
        if (ls('my_profile_v8'))
          setUserProfile(JSON.parse(ls('my_profile_v8')!));
        if (ls('my_weight_v8'))
          setWeightHistory(JSON.parse(ls('my_weight_v8')!));
      } catch (e) {
        console.error('Local load err', e);
      }
    }
  }, [user]);

  const saveData = (type: string, data: any) => {
    let key = 'items';
    if (type === 'profile') key = 'info';
    if (user && db)
      setDoc(
        doc(db, 'users', user.uid, 'data', type),
        { [key]: data },
        { merge: true }
      );
    else localStorage.setItem(`my_${type}_v8`, JSON.stringify(data));
  };

  const updatePlanner = (d: PlannerData) => {
    setPlannerData(d);
    saveData('planner_v8', d);
  };
  const dayStats = getDayStats(plannerData[currentDayStr], products);
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h1 className="font-black text-xl tracking-tight dark:text-white">
              Meal<span className="text-blue-600">planner</span>
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-xs flex items-center gap-1"
              >
                <Globe size={14} /> {lang.toUpperCase()}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
          <div className="flex justify-between items-end text-xs mb-1 font-bold text-slate-500">
            <span>{t.day_total}</span>
            <span>€{dayStats.price.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  (dayStats.kcal / userProfile.targetKcal) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] mt-1 text-slate-400">
            <span>
              {dayStats.kcal} / {userProfile.targetKcal} kcal
            </span>
            <span>
              {dayStats.protein} / {userProfile.targetProtein} g
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {view === 'planner' && (
          <Planner
            products={products}
            plannerData={plannerData}
            setPlannerData={updatePlanner}
            currentDayStr={currentDayStr}
            setCurrentDayStr={setCurrentDayStr}
            meals={meals}
            lang={lang}
            darkMode={darkMode}
          />
        )}
        {view === 'manager' && (
          <MealManager
            meals={meals}
            setMeals={(d: any) => {
              setMeals(d);
              saveData('meals', d);
            }}
            products={products}
            updatePlannerForDeletedMeal={() => {}}
            lang={lang}
          />
        )}
        {view === 'database' && (
          <ProductDatabase
            products={products}
            setProducts={(d: any) => {
              setProducts(d);
              saveData('products', d);
            }}
            meals={meals}
            setMeals={(d: any) => {
              setMeals(d);
              saveData('meals', d);
            }}
            lang={lang}
            darkMode={darkMode}
          />
        )}
        {view === 'profile' && (
          <ProfileManager
            userProfile={userProfile}
            setUserProfile={(d: any) => {
              setUserProfile(d);
              saveData('profile', d);
            }}
            weightHistory={weightHistory}
            setWeightHistory={(d: any) => {
              setWeightHistory(d);
              saveData('weight', d);
            }}
            user={user}
            lang={lang}
            darkMode={darkMode}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 pb-safe z-50">
        <div className="max-w-3xl mx-auto grid grid-cols-4 pb-2 pt-2">
          {['planner', 'manager', 'database', 'profile'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex flex-col items-center p-2 gap-1 ${
                view === v
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400'
              }`}
            >
              {v === 'planner' && <Calendar size={20} />}
              {v === 'manager' && <Utensils size={20} />}
              {v === 'database' && <ShoppingBag size={20} />}
              {v === 'profile' && <User size={20} />}
              <span className="text-[9px] font-bold uppercase">
                {v === 'manager'
                  ? lang === 'nl'
                    ? 'Maaltijden'
                    : 'Meals'
                  : lang === 'nl' && v === 'database'
                  ? 'Producten'
                  : lang === 'nl' && v === 'profile'
                  ? 'Profiel'
                  : v}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
