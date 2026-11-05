import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isCustomer } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    shippingFee: 0,
    totalAmount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated || !isCustomer) {
      setCart({ items: [], itemCount: 0, subtotal: 0, tax: 0, shippingFee: 0, totalAmount: 0 });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, isCustomer]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please sign in to add items to your cart.');
    }
    const res = await api.post('/cart', { productId, quantity });
    if (res.data.success) {
      await fetchCart();
      return res.data;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    if (res.data.success) {
      await fetchCart();
      return res.data;
    }
  };

  const removeFromCart = async (itemId) => {
    const res = await api.delete(`/cart/${itemId}`);
    if (res.data.success) {
      await fetchCart();
      return res.data;
    }
  };

  const clearCart = async () => {
    const res = await api.delete('/cart');
    if (res.data.success) {
      setCart({ items: [], itemCount: 0, subtotal: 0, tax: 0, shippingFee: 0, totalAmount: 0 });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount: cart.itemCount || 0,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
