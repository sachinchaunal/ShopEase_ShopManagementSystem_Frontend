import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          // If parsing succeeded but result is not an array, reset cart
          console.error('Invalid cart data format in localStorage');
          localStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Update localStorage and calculate totals whenever cart changes
  useEffect(() => {
    // Update localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Calculate cart total and count
    const { total, count } = cartItems.reduce(
      (acc, item) => {
        const itemTotal = item.price * item.quantity;
        return {
          total: acc.total + itemTotal,
          count: acc.count + item.quantity,
        };
      },
      { total: 0, count: 0 }
    );

    setCartTotal(total);
    setCartCount(count);
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product, quantity) => {
    if (!product || !product._id) {
      toast.error('Invalid product data');
      return;
    }
    
    const { _id, name, price, image, unit, maxQuantity, inStock } = product;
    
    // Validate product data
    if (!name || price === undefined || !unit) {
      toast.error('Invalid product data');
      return;
    }
    
    // Check if product is in stock
    if (!inStock) {
      toast.error(`${name} is out of stock`);
      return;
    }
    
    // Ensure quantity is a number and valid
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      toast.error('Please select a valid quantity');
      return;
    }
    
    // Check if quantity is valid
    if (parsedQuantity > maxQuantity) {
      toast.error(`Only ${maxQuantity} ${unit} available`);
      return;
    }
    
    // Check if item already exists in cart
    const existingItem = cartItems.find((item) => item._id === _id);
    
    if (existingItem) {
      // Calculate new quantity
      const newQuantity = existingItem.quantity + parsedQuantity;
      
      // Check if new quantity exceeds maxQuantity
      if (newQuantity > maxQuantity) {
        toast.error(`Cannot add more than ${maxQuantity} ${unit} of ${name}`);
        return;
      }
      
      // Update existing item
      setCartItems(
        cartItems.map((item) =>
          item._id === _id ? { ...item, quantity: newQuantity } : item
        )
      );
      
      toast.success(`Updated ${name} quantity to ${newQuantity}`);
    } else {
      // Add new item
      setCartItems([
        ...cartItems,
        { _id, name, price, image, unit, quantity: parsedQuantity, maxQuantity, inStock }
      ]);
      
      toast.success(`Added ${name} to cart`);
    }
  };

  // Update item quantity
  const updateQuantity = (_id, quantity) => {
    if (!_id) {
      toast.error('Invalid product ID');
      return;
    }
    
    const item = cartItems.find((item) => item._id === _id);
    
    if (!item) {
      toast.error('Item not found in cart');
      return;
    }
    
    // Ensure quantity is a number
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity)) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    // Check if quantity is valid
    if (parsedQuantity <= 0) {
      // Remove item if quantity is zero or negative
      removeFromCart(_id);
      return;
    }
    
    if (parsedQuantity > item.maxQuantity) {
      toast.error(`Cannot add more than ${item.maxQuantity} ${item.unit} of ${item.name}`);
      return;
    }
    
    // Update item quantity
    setCartItems(
      cartItems.map((item) =>
        item._id === _id ? { ...item, quantity: parsedQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (_id) => {
    if (!_id) return;
    
    const item = cartItems.find((item) => item._id === _id);
    if (item) {
      setCartItems(cartItems.filter((item) => item._id !== _id));
      toast.success(`Removed ${item.name} from cart`);
    }
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotal,
        cartCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 