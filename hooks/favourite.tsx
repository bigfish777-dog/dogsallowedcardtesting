import { createContext, ReactNode, useContext, useReducer } from 'react';

type FavouritesState = string[];

type Action =
  | { type: 'TOGGLE'; id: string }
  | { type: 'SET'; ids: string[] };

const FavouritesContext = createContext<{
  favs: FavouritesState;
  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;
  setFavs: (ids: string[]) => void;
} | null>(null);

function favouritesReducer(state: FavouritesState, action: Action): FavouritesState {
  switch (action.type) {
    case 'TOGGLE':
      return state.includes(action.id)
        ? state.filter((fav) => fav !== action.id)
        : [...state, action.id];
    case 'SET':
      return [...new Set(action.ids)];
    default:
      return state;
  }
}

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const [favs, dispatch] = useReducer(favouritesReducer, []);

  const toggleFav = (id: string) => dispatch({ type: 'TOGGLE', id });
  const setFavs = (ids: string[]) => dispatch({ type: 'SET', ids });
  const isFav = (id: string) => favs.includes(String(id));

  return (
    <FavouritesContext.Provider value={{ favs, toggleFav, isFav, setFavs }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error('useFavourites must be used within a FavouritesProvider');
  return ctx;
};