import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, query, orderBy, limit, 
  getDocs, doc, updateDoc, increment, where, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Confession, ReactionCounts, TabView, Category } from '../types';

// PRODUCTION FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBT-wEyud4W3H6kRQEWeB4RmXegjckF7gI",
  authDomain: "confession-stories.firebaseapp.com",
  projectId: "confession-stories",
  storageBucket: "confession-stories.firebasestorage.app",
  messagingSenderId: "800106667228",
  appId: "1:800106667228:web:a743faa009132071c42819",
  measurementId: "G-1X2BTWB73M"
};

// Initialize Firebase
let db: any;
let auth: any;
let isMockMode = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log("Firebase initialized in Production Mode");
} catch (e) {
  console.error("Firebase initialization failed. Falling back to offline mock mode.", e);
  isMockMode = true;
}

const STORAGE_KEY = 'confessions_local_mock_v4';

// --- Auth ---
export const authenticateUser = async (): Promise<string> => {
  if (isMockMode) {
    let uid = localStorage.getItem('mock_uid');
    if (!uid) {
      uid = 'anon_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mock_uid', uid);
    }
    return uid;
  }
  try {
    const userCred = await signInAnonymously(auth);
    return userCred.user.uid;
  } catch (error) {
    console.error("Auth error", error);
    isMockMode = true;
    let uid = localStorage.getItem('mock_uid') || 'anon_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('mock_uid', uid);
    return uid;
  }
};

// --- Rank System ---
export const getUserRank = (): { title: string, icon: string, totalShares: number } => {
  const shares = parseInt(localStorage.getItem('user_total_shares') || '0');
  
  if (shares >= 50) return { title: "Icon", icon: "👑", totalShares: shares };
  if (shares >= 20) return { title: "Influencer", icon: "💅", totalShares: shares };
  if (shares >= 10) return { title: "Trendsetter", icon: "🔥", totalShares: shares };
  if (shares >= 5) return { title: "Agent", icon: "🕶️", totalShares: shares };
  if (shares >= 1) return { title: "Scout", icon: "🕵️", totalShares: shares };
  return { title: "Ghost", icon: "👻", totalShares: shares };
};

// --- Firestore Operations ---

export const postConfession = async (text: string, authorId: string, category: Category = 'confession'): Promise<boolean> => {
  const newConfession = {
    text,
    authorId,
    category,
    createdAt: Date.now(),
    reactions: { love: 0, laugh: 0, shock: 0, fire: 0 },
    views: 0,
    shares: 0,
    maskId: Math.floor(Math.random() * 10) 
  };

  if (isMockMode) {
    try {
      const currentStr = localStorage.getItem(STORAGE_KEY);
      const current = currentStr ? JSON.parse(currentStr) : [];
      const id = 'id_' + Date.now() + Math.random().toString(36).substr(2, 4);
      current.unshift({ ...newConfession, id });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return true;
    } catch (e) {
      return false;
    }
  }

  try {
    await addDoc(collection(db, 'confessions'), {
      ...newConfession,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (e) {
    console.error("Post error", e);
    return false;
  }
};

export const getConfessions = async (
  tab: TabView, 
  userId: string,
  searchQuery: string = '', 
  categoryFilter: Category | 'all' = 'all'
): Promise<Confession[]> => {

  const filterInMemory = (list: Confession[]) => {
    return list.filter(c => {
        const matchesSearch = searchQuery 
            ? c.text.toLowerCase().includes(searchQuery.toLowerCase()) 
            : true;
        const matchesCategory = categoryFilter !== 'all' 
            ? c.category === categoryFilter 
            : true;
        return matchesSearch && matchesCategory;
    });
  };

  if (isMockMode) {
    const currentStr = localStorage.getItem(STORAGE_KEY);
    let all: any[] = currentStr ? JSON.parse(currentStr) : [];
    if (!Array.isArray(all)) all = [];

    let sanitizedAll: Confession[] = all.map(c => ({
      id: c.id || 'unknown_' + Math.random(),
      text: c.text || "",
      authorId: c.authorId || "anon",
      createdAt: typeof c.createdAt === 'number' ? c.createdAt : Date.now(),
      reactions: {
        love: c.reactions?.love || 0,
        laugh: c.reactions?.laugh || 0,
        shock: c.reactions?.shock || 0,
        fire: c.reactions?.fire || 0,
      },
      views: c.views || 0,
      shares: c.shares || 0,
      category: c.category || 'confession',
      theme: c.theme,
      maskId: c.maskId !== undefined ? c.maskId : Math.floor(Math.random() * 10)
    }));

    if (sanitizedAll.length === 0) {
      sanitizedAll.push({
        id: 'welcome_tutorial',
        text: "Welcome to Confession Stories! 🤫",
        authorId: 'system',
        createdAt: Date.now(),
        reactions: { love: 120, laugh: 45, shock: 12, fire: 89 },
        views: 1337,
        shares: 42,
        category: 'life-lesson',
        theme: 'light',
        maskId: 2 
      });
    }

    sanitizedAll = filterInMemory(sanitizedAll);

    if (tab === 'mine') {
      return sanitizedAll.filter(c => c.authorId === userId);
    } 
    if (tab === 'trending') {
      return [...sanitizedAll].sort((a, b) => {
        const scoreA = ((a.shares || 0) * 10) + (a.reactions.fire || 0);
        const scoreB = ((b.shares || 0) * 10) + (b.reactions.fire || 0);
        return scoreB - scoreA;
      });
    }
    return [...sanitizedAll].sort((a, b) => b.createdAt - a.createdAt);
  }

  try {
    const confessionsRef = collection(db, 'confessions');
    let q;
    
    if (tab === 'mine') {
      q = query(confessionsRef, where("authorId", "==", userId), orderBy("createdAt", "desc"), limit(50));
    } else if (tab === 'trending') {
      q = query(confessionsRef, orderBy("shares", "desc"), limit(50));
    } else {
      q = query(confessionsRef, orderBy("createdAt", "desc"), limit(50));
    }

    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        text: data.text || "",
        authorId: data.authorId || "",
        reactions: {
            love: data.reactions?.love || 0,
            laugh: data.reactions?.laugh || 0,
            shock: data.reactions?.shock || 0,
            fire: data.reactions?.fire || 0,
        },
        views: data.views || 0,
        shares: data.shares || 0,
        category: data.category || 'confession',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        maskId: data.maskId !== undefined ? data.maskId : Math.floor(Math.random() * 10)
      } as Confession;
    });

    return filterInMemory(results);

  } catch (e) {
    console.error("Fetch error", e);
    isMockMode = true; 
    return getConfessions(tab, userId, searchQuery, categoryFilter);
  }
};

export const getDailyConfession = async (): Promise<Confession | null> => {
  try {
    const trending = await getConfessions('trending', 'system');
    if (trending.length > 0) {
      const topPick = trending[0];
      return {
        ...topPick,
        reactions: { 
          ...topPick.reactions,
          fire: Math.max(topPick.reactions.fire, 400),
          love: Math.max(topPick.reactions.love, 200)
        }
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const reactToConfession = async (id: string, type: keyof ReactionCounts): Promise<void> => {
  if (isMockMode) {
    const currentStr = localStorage.getItem(STORAGE_KEY);
    const all: any[] = currentStr ? JSON.parse(currentStr) : [];
    const index = all.findIndex(c => c.id === id);
    if (index !== -1) {
      if (!all[index].reactions) all[index].reactions = { love: 0, laugh: 0, shock: 0, fire: 0 };
      all[index].reactions[type] = (all[index].reactions[type] || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    return;
  }

  try {
    const ref = doc(db, 'confessions', id);
    await updateDoc(ref, {
      [`reactions.${type}`]: increment(1)
    });
  } catch (e) {
    console.error("Reaction error", e);
  }
};

export const incrementView = async (id: string): Promise<void> => {
  if (isMockMode) {
    const currentStr = localStorage.getItem(STORAGE_KEY);
    const all: any[] = currentStr ? JSON.parse(currentStr) : [];
    const index = all.findIndex(c => c.id === id);
    if (index !== -1) {
      all[index].views = (all[index].views || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    return;
  }
  try {
    const ref = doc(db, 'confessions', id);
    await updateDoc(ref, { views: increment(1) });
  } catch (e) { /* ignore */ }
};

export const incrementShare = async (id: string): Promise<void> => {
  const currentShares = parseInt(localStorage.getItem('user_total_shares') || '0');
  localStorage.setItem('user_total_shares', (currentShares + 1).toString());

  if (isMockMode) {
    const currentStr = localStorage.getItem(STORAGE_KEY);
    const all: any[] = currentStr ? JSON.parse(currentStr) : [];
    const index = all.findIndex(c => c.id === id);
    if (index !== -1) {
      all[index].shares = (all[index].shares || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    return;
  }
  try {
    const ref = doc(db, 'confessions', id);
    await updateDoc(ref, { shares: increment(1) });
  } catch (e) { /* ignore */ }
};
