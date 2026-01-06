import { Type } from './ActionType';

export const initialState = {
  basket: [],
  user: null
};

export const reducer = (state, action) => {
  switch (action.type) {

    case Type.ADD_TO_BASKET: {
      const existingItem = state.basket.find(
        item => item.id === action.item.id
      );

      if (existingItem) {
        return {
          ...state,
          basket: state.basket.map(item =>
            item.id === action.item.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        ...state,
        basket: [...state.basket, { ...action.item, quantity: 1 }]
      };
    }

    case Type.DECREASE_QUANTITY:
      return {
        ...state,
        basket: state.basket
          .map(item =>
            item.id === action.id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter(item => item.quantity > 0)
      };
    
    case Type.SET_USER:
      return {
        ...state,
        user:action.user
      }
    case Type.EMPTY_BASKET:
      return {
        ...state,
        basket: []
      }
    
    default:
      return state;
  }
};
