import { createContext,useReducer, useContext, useEffect } from "react";

const CartContext = createContext();

const getInitialCart = () => {
    try {
        const cartData = localStorage.getItem('cart');
        if(cartData && cartData !== 'null' && cartData  !== 'undefined') {
            return JSON.parse(cartData)
        }
    } catch (error) {
        console.log('Error persing cart data from local storage:', error);
    } 
    return [];   
}

const initialState = {
    cart: getInitialCart()
}


const cartReducer = (state, action) => {
    switch(action.type){
        case 'ADD ITEM': {
            const existinItem = state.cart.find(item => item.id === action.payload.id);
            let newCart;

            if(existinItem){
                newCart = state.cart.map(item =>
                    item.id === action.payload.id ?
                    {...item, quantity: item.quantity + 1} : item
                )
            }else {
                newCart = [...state.cart, {...action.payload, quantity: 1}]
            }
            return {...state, cart: newCart};
        }


        case 'REMOVE_ITEM': {
            const newCart = state.cart.filter(item => item.id !== action.payload.id);
            return {...state, cart: newCart}
        }


        case 'INCREMENT_ITEM': {
            const newCart = state.cart.map(item => item.id === action.payload.id ?
                {...item, quantity: item.quantity + 1} : item
            )
            return {...state, cart: newCart}
        }


        case 'DECREMENT_ITEM': {
            const newCart = state.cart.map(item => item.id === action.payload.id 
                && item.quantity > 1 ? {...item, quantity: item.quantity - 1} : item
            )
            return {...state, cart: newCart};
        }


        case 'CLEAR_CART': {
            return {...state, cart: []};
        }


        default:
            return state;
    }
}


export const CartProvider = ({children}) => {
    const [state, dispatch] = useReducer (cartReducer, initialState)

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(state.cart));
        }catch (error) {
            console.error ('Error saving cart to localStorage:', error)
        }
    }, [state.cart])

    return (
        <CartContext.Provider value={{cart: state.cart, dispatch}}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext);