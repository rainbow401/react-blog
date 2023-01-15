declare type RootState = ReturnType<typeof import('@/store').getState>
declare interface Window{
  __REDUX_DEVTOOLS_EXTENSION__: function;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: function;
}