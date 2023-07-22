const initialState = {
    data: null,
    userId:null,
    download:null,
    CheckDownload:null
  };
  
  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_DATA':
        return {
          ...state,
          data: action.payload,
        };
        case 'SET_USERID':
          return{
            ...state,
            userId: action.payload,
          }
          case 'SET_DOWN_CHECK':
            return{
              ...state,
              CheckDownload: action.payload,
            }
          case 'SET_DOWNLOAD':
            return{
              ...state,
              download: action.payload,
            }
      default:
        return state;
    }
  };
  
  export default reducer;