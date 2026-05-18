import { create } from "zustand";
import {
  addToCart,
  getOrCreateCart,
  removeFromCart,
  updateCartItem,
  clearCart,
} from "@/actions/store.actions";
import { v4 as uuidv4 } from "uuid";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: any;
}

interface Cart {
  id: string;
  sessionId: string;
  items: CartItem[];
  subtotal: number;
}

interface CartStore {
  cart: Cart | null;
  sessionId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  initializeCart: () => Promise<void>;
  addItem: (
    productId: string,
    quantity: number,
    price: number,
  ) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  clearUserCart: () => Promise<void>;

  // Local state
  setCart: (cart: Cart) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const STORAGE_KEY = "store_session_id";

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  sessionId: null,
  loading: false,
  error: null,

  initializeCart: async () => {
    try {
      set({ loading: true, error: null });

      // Get or create session ID
      let sessionId = localStorage.getItem(STORAGE_KEY);
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem(STORAGE_KEY, sessionId);
      }

      set({ sessionId });

      // Fetch cart from server
      const response = await getOrCreateCart(sessionId);
      if (response.success && response.data) {
        set({ cart: response.data });
      } else {
        set({ error: response.message || "Error loading cart" });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId: string, quantity: number, price: number) => {
    try {
      set({ loading: true, error: null });

      const { sessionId } = get();
      if (!sessionId) throw new Error("Session not initialized");

      const response = await addToCart({
        sessionId,
        productId,
        quantity,
      });

      if (response.success) {
        // Refetch cart
        await get().initializeCart();
      } else {
        set({ error: response.message || "Error adding item" });
        throw new Error(response.message);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (cartItemId: string) => {
    try {
      set({ loading: true, error: null });

      const response = await removeFromCart(cartItemId);

      if (response.success) {
        // Refetch cart
        await get().initializeCart();
      } else {
        set({ error: response.message || "Error removing item" });
        throw new Error(response.message);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (cartItemId: string, quantity: number) => {
    try {
      set({ loading: true, error: null });

      const response = await updateCartItem({
        cartItemId,
        quantity,
      });

      if (response.success) {
        // Refetch cart
        await get().initializeCart();
      } else {
        set({ error: response.message || "Error updating item" });
        throw new Error(response.message);
      }
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearUserCart: async () => {
    try {
      set({ loading: true, error: null });

      const { cart } = get();
      if (!cart) throw new Error("Cart not found");

      await clearCart(cart.id);
      set({ cart: { ...cart, items: [], subtotal: 0 } });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setCart: (cart: Cart) => set({ cart }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));
